/* ===== Save codes + cloud sync (Firebase Auth + Firestore over REST, no SDK) ===== */

// Filled in at build time from cloud-config.json ({ "apiKey": "...", "projectId": "..." }); null = cloud save not set up.
const CLOUD_CONFIG = window.SPROUT_CLOUD_CONFIG || null;

/* ---------- progress helpers ---------- */
function progressOf(d) {
  return { unlocked: d.unlocked, done: d.done.slice(), endlessBest: d.endlessBest, tutDone: !!d.tutDone, seenBugs: d.seenBugs.slice(), stars: Object.assign({}, d.stars || {}) };
}
// Never loses progress: keeps the best of both sides.
function mergeProgress(into, other) {
  if (!other) return false;
  const before = JSON.stringify(progressOf(into));
  into.unlocked = Math.min(LEVELS.length, Math.max(into.unlocked || 1, other.unlocked || 1));
  into.done = Array.from(new Set([...(into.done || []), ...(other.done || [])])).filter(i => i >= 0 && i < LEVELS.length).sort((a, b) => a - b);
  into.endlessBest = Math.max(into.endlessBest || 0, other.endlessBest || 0);
  into.tutDone = !!(into.tutDone || other.tutDone);
  into.seenBugs = Array.from(new Set([...(into.seenBugs || []), ...(other.seenBugs || [])])).filter(k => BUGS[k]);
  into.stars = Object.assign({}, into.stars || {});
  for (const k in (other.stars || {})) { const i = +k, n = +other.stars[k]; if (i >= 0 && i < LEVELS.length && n >= 1 && n <= 3) into.stars[i] = Math.max(into.stars[i] || 0, n); }
  return JSON.stringify(progressOf(into)) !== before;
}

/* ---------- save codes: short text that carries your progress to another device ---------- */
const SaveCode = {
  hash(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1679616; return h.toString(36).padStart(4, '0'); },
  make(d = Save.data) {
    let doneBits = 0n; for (const i of d.done) if (i >= 0 && i < 64) doneBits |= 1n << BigInt(i);
    let seen = 0; BUG_ORDER.forEach((k, i) => { if (d.seenBugs.includes(k)) seen |= 1 << i; });
    let starBits = 0n; for (const k in (d.stars || {})) { const i = +k; if (i >= 0 && i < 64) starBits |= BigInt(Math.min(3, d.stars[k]) & 3) << BigInt(i * 2); }
    const parts = [d.unlocked.toString(36), doneBits.toString(36), (d.endlessBest || 0).toString(36), seen.toString(36), d.tutDone ? '1' : '0'];
    if (starBits) parts.push(starBits.toString(36));
    const body = parts.join('.');
    return `SPRT-${body}-${this.hash(body)}`.toUpperCase();
  },
  read(code) {
    const m = String(code || '').trim().toUpperCase().replace(/\s+/g, '').match(/^SPRT-([0-9A-Z.]+)-([0-9A-Z]{4})$/);
    if (!m || this.hash(m[1].toLowerCase()).toUpperCase() !== m[2]) return null;
    const p = m[1].toLowerCase().split('.');
    if (p.length !== 5 && p.length !== 6) return null;
    const big36 = s => [...s].reduce((a, ch) => a * 36n + BigInt(parseInt(ch, 36)), 0n);
    const doneBits = big36(p[1]), done = [];
    for (let i = 0; i < LEVELS.length; i++) if ((doneBits >> BigInt(i)) & 1n) done.push(i);
    const seen = parseInt(p[3], 36), seenBugs = BUG_ORDER.filter((k, i) => seen & (1 << i));
    const stars = {};
    if (p[5]) { const sb = big36(p[5]); for (let i = 0; i < LEVELS.length; i++) { const n = Number((sb >> BigInt(i * 2)) & 3n); if (n) stars[i] = n; } }
    return { unlocked: parseInt(p[0], 36), done, endlessBest: parseInt(p[2], 36), seenBugs, tutDone: p[4] === '1', stars };
  }
};

/* ---------- save files: export / import a backup of your progress ---------- */
const SaveFile = {
  name() { return `sprout-siege-save-${new Date().toISOString().slice(0, 10)}.json`; },
  make() {
    const d = Save.data;
    return JSON.stringify({ game: 'sprout-siege', format: 1, exported: new Date().toISOString(), progress: progressOf(d),
      settings: { sfx: d.sfx, music: d.music, autoDew: d.autoDew, tips: d.tips }, loadout: d.loadout || [] }, null, 2);
  },
  // Accepts an exported file, or a text file that contains a save code. Returns true on success.
  load(text) {
    let j = null;
    try { j = JSON.parse(text); } catch (e) { j = null; }
    if (j && j.game === 'sprout-siege' && j.progress && typeof j.progress === 'object') {
      const p = j.progress;
      const clean = { unlocked: Math.max(1, parseInt(p.unlocked, 10) || 1), done: Array.isArray(p.done) ? p.done.map(Number).filter(Number.isInteger) : [],
        endlessBest: Math.max(0, parseInt(p.endlessBest, 10) || 0), tutDone: !!p.tutDone, seenBugs: Array.isArray(p.seenBugs) ? p.seenBugs.filter(k => BUGS[k]) : [], stars: p.stars && typeof p.stars === 'object' ? p.stars : {} };
      mergeProgress(Save.data, clean);
      if (Array.isArray(j.loadout)) Save.data.loadout = j.loadout.filter(k => PLANTS[k]).slice(0, 10);
      Save.write(); return true;
    }
    const m = String(text).match(/SPRT-[0-9A-Z.]+-[0-9A-Z]{4}/i);
    const code = m && SaveCode.read(m[0]);
    if (code) { mergeProgress(Save.data, code); Save.write(); return true; }
    return false;
  }
};

/* ---------- cloud sync ---------- */
const CLOUD_ERRORS = {
  EMAIL_EXISTS: 'That email already has an account. Tap Sign in instead.',
  EMAIL_NOT_FOUND: 'Wrong email or password.', INVALID_PASSWORD: 'Wrong email or password.', INVALID_LOGIN_CREDENTIALS: 'Wrong email or password.',
  INVALID_EMAIL: 'That email address doesn’t look right.', MISSING_PASSWORD: 'Type a password.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many tries. Wait a few minutes and try again.', USER_DISABLED: 'This account has been turned off.'
};
function cloudError(msg) {
  const key = String(msg || '').split(' ')[0].split(':')[0];
  if (key.startsWith('WEAK_PASSWORD')) return 'Use a password with at least 6 characters.';
  return CLOUD_ERRORS[key] || 'Something went wrong. Check your internet connection and try again.';
}
const Cloud = {
  KEY: 'sproutSiege.cloud.v1', s: null, busy: false, timer: null, lastSync: 0, status: '', lastTry: 0,
  enabled() { return !!(CLOUD_CONFIG && CLOUD_CONFIG.apiKey && CLOUD_CONFIG.projectId); },
  signedIn() { return !!(this.s && this.s.refreshToken); },
  load() { try { this.s = JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { this.s = null; } if (this.s) this.lastSync = this.s.lastSync || 0; },
  store() { try { if (this.s) localStorage.setItem(this.KEY, JSON.stringify(Object.assign(this.s, { lastSync: this.lastSync }))); else localStorage.removeItem(this.KEY); } catch (e) { /* ignore */ } },
  async post(url, body, form) {
    let r;
    try {
      r = await fetch(url, { method: 'POST', headers: { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json' }, body: form ? body : JSON.stringify(body) });
    } catch (e) { throw new Error('Can’t reach the cloud right now. Check your internet connection.'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(cloudError(j.error && (j.error.message || j.error)));
    return j;
  },
  authUrl(op) { return `https://identitytoolkit.googleapis.com/v1/accounts:${op}?key=${encodeURIComponent(CLOUD_CONFIG.apiKey)}`; },
  setSession(j) {
    this.s = { email: j.email, uid: j.localId, idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (parseInt(j.expiresIn, 10) - 60) * 1000 };
    this.store();
  },
  async signUp(email, password) { this.setSession(await this.post(this.authUrl('signUp'), { email, password, returnSecureToken: true })); return this.sync(); },
  async signIn(email, password) { this.setSession(await this.post(this.authUrl('signInWithPassword'), { email, password, returnSecureToken: true })); return this.sync(); },
  async resetPassword(email) { await this.post(this.authUrl('sendOobCode'), { requestType: 'PASSWORD_RESET', email }); },
  signOut() { this.s = null; this.lastSync = 0; this.status = ''; this.store(); },
  async token() {
    if (this.s.idToken && Date.now() < this.s.exp) return this.s.idToken;
    const j = await this.post(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(CLOUD_CONFIG.apiKey)}`,
      'grant_type=refresh_token&refresh_token=' + encodeURIComponent(this.s.refreshToken), true);
    this.s.idToken = j.id_token; this.s.refreshToken = j.refresh_token || this.s.refreshToken;
    this.s.exp = Date.now() + (parseInt(j.expires_in, 10) - 60) * 1000; this.store();
    return this.s.idToken;
  },
  docUrl() { return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(CLOUD_CONFIG.projectId)}/databases/(default)/documents/saves/${encodeURIComponent(this.s.uid)}`; },
  async request(method, body) {
    const t = await this.token();
    let r;
    try {
      r = await fetch(this.docUrl(), { method, headers: Object.assign({ Authorization: 'Bearer ' + t }, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined });
    } catch (e) { throw new Error('Can’t reach the cloud right now. Check your internet connection.'); }
    if (method === 'GET' && r.status === 404) return null;
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(r.status === 403 ? 'The cloud refused access. Check the Firestore rules.' : 'Cloud error. Try again in a moment.');
    return j;
  },
  async sync() {
    if (!this.enabled() || !this.signedIn() || this.busy) return;
    this.busy = true; this.lastTry = Date.now(); this.status = 'Syncing…';
    try {
      const doc = await this.request('GET');
      let cloud = null;
      if (doc && doc.fields && doc.fields.data) { try { cloud = JSON.parse(doc.fields.data.stringValue); } catch (e) { cloud = null; } }
      if (mergeProgress(Save.data, cloud)) Save.write(true);
      await this.request('PATCH', { fields: { data: { stringValue: JSON.stringify(progressOf(Save.data)) }, updated: { integerValue: String(Date.now()) } } });
      this.lastSync = Date.now(); this.status = 'Synced'; this.store();
    } catch (e) {
      this.status = e.message || 'Could not sync. Will try again later.';
      throw e;
    } finally { this.busy = false; }
  },
  schedule() {
    if (!this.enabled() || !this.signedIn() || Rec.active) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.sync().catch(() => {}), 3000);
  },
  init() {
    this.load();
    if (!this.enabled() || !this.signedIn()) return;
    this.sync().catch(() => {});
    window.addEventListener('online', () => this.sync().catch(() => {}));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - this.lastTry > 60000) this.sync().catch(() => {}); });
  }
};
function timeAgo(ms) {
  if (!ms) return 'never';
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ms).toLocaleDateString();
}

/* ---------- HTML dialog (text fields need real inputs, so this part is DOM, not canvas) ---------- */
const Modal = {
  el: null,
  open() {
    if (this.el) this.close();
    const el = document.createElement('div'); el.className = 'ss-modal';
    el.addEventListener('pointerdown', e => { if (e.target === el) this.close(); });
    document.body.appendChild(el); this.el = el;
    this.render();
  },
  close() { if (this.el) { this.el.remove(); this.el = null; } },
  isOpen() { return !!this.el; },
  msg(text, bad) { const m = this.el && this.el.querySelector('.ss-msg'); if (m) { m.textContent = text || ''; m.className = 'ss-msg' + (bad ? ' bad' : ''); } },
  render(note, bad) {
    const el = this.el; if (!el) return;
    const signed = Cloud.signedIn();
    let cloudHtml;
    if (!Cloud.enabled()) cloudHtml = '';
    else if (signed) cloudHtml = `<p>Signed in as <b>${escapeHtml(Cloud.s.email || '')}</b><br>Last synced: <b>${timeAgo(Cloud.lastSync)}</b></p>
      <div class="ss-row"><button class="ss-btn go" data-a="sync">Sync now</button><button class="ss-btn" data-a="signout">Sign out</button></div>`;
    else cloudHtml = `<p>Sign in to sync your progress between your phone, tablet and computer.</p>
      <label>Email<input id="ss-email" type="email" autocomplete="email" autocapitalize="off" spellcheck="false"></label>
      <label>Password<input id="ss-pass" type="password" autocomplete="current-password"></label>
      <div class="ss-row"><button class="ss-btn go" data-a="signin">Sign in</button><button class="ss-btn" data-a="signup">Create account</button></div>
      <button class="ss-link" data-a="forgot">Forgot password?</button>`;
    el.innerHTML = `<div class="ss-card" role="dialog" aria-label="Cloud save">
      <button class="ss-x" data-a="close" aria-label="Close">✕</button>
      <h2>${Cloud.enabled() ? 'Cloud Save' : 'Save Codes & Backups'}</h2>${cloudHtml}
      <div class="ss-msg"></div>
      <h3>Save code</h3>
      <p>Copy this code on one device and enter it on another to bring your progress along.</p>
      <div class="ss-row"><input id="ss-code" readonly value="${SaveCode.make()}"><button class="ss-btn" data-a="copy">Copy</button></div>
      <div class="ss-row"><input id="ss-in" placeholder="Enter a save code" autocapitalize="characters" spellcheck="false"><button class="ss-btn go" data-a="load">Load</button></div>
      <h3>Save file</h3>
      <p>Keep a backup of your progress as a file, or load a backup from another device.</p>
      <div class="ss-row"><button class="ss-btn" data-a="export">Export save file</button><button class="ss-btn" data-a="import">Import save file</button></div>
      <input id="ss-file" type="file" accept=".json,application/json,text/plain" hidden>
    </div>`;
    const fileIn = el.querySelector('#ss-file');
    fileIn.addEventListener('change', () => {
      const f = fileIn.files && fileIn.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        if (SaveFile.load(String(rd.result || ''))) { Snd.play('reward'); this.render(`Loaded ${f.name}. Your progress from the file has been added.`); }
        else { Snd.play('deny'); this.msg('That file isn\u2019t a Sprout Siege save.', true); }
      };
      rd.onerror = () => this.msg('Could not read that file.', true);
      rd.readAsText(f);
    });
    el.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => this.act(b.dataset.a)));
    if (note) this.msg(note, bad);
  },
  async act(a) {
    const v = id => (this.el.querySelector('#' + id) || {}).value || '';
    const busy = on => this.el && this.el.querySelectorAll('.ss-btn').forEach(b => (b.disabled = on));
    try {
      if (a === 'close') { this.close(); Snd.play('click'); return; }
      if (a === 'copy') {
        const inp = this.el.querySelector('#ss-code'); inp.select();
        try { await navigator.clipboard.writeText(inp.value); this.msg('Save code copied.'); } catch (e) { this.msg('Select the code and copy it.'); }
        return;
      }
      if (a === 'load') {
        const p = SaveCode.read(v('ss-in'));
        if (!p) { this.msg('That code isn’t valid. Check it and try again.', true); Snd.play('deny'); return; }
        mergeProgress(Save.data, p); Save.write(); Snd.play('reward');
        this.render('Progress loaded! Levels you finished on the other device are now unlocked here.');
        return;
      }
      if (a === 'export') {
        const name = SaveFile.name(), data = SaveFile.make();
        if (window.SproutAndroid && window.SproutAndroid.saveFile) {
          const ok = window.SproutAndroid.saveFile(name, data);
          this.msg(ok ? `Saved ${name} to your Downloads folder.` : 'Choose where to keep your save file.');
          return;
        }
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = name;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        this.msg(`Exported ${name}. If no file appeared, use the save code above instead.`);
        return;
      }
      if (a === 'import') { this.el.querySelector('#ss-file').click(); return; }
      if (a === 'signout') { Cloud.signOut(); this.render('Signed out. Your progress stays on this device.'); return; }
      busy(true);
      if (a === 'signin' || a === 'signup') {
        const email = v('ss-email').trim(), pass = v('ss-pass');
        if (!email || !pass) { this.msg('Type your email and a password.', true); busy(false); return; }
        this.msg(a === 'signin' ? 'Signing in…' : 'Creating your account…');
        await (a === 'signin' ? Cloud.signIn(email, pass) : Cloud.signUp(email, pass));
        Snd.play('reward'); this.render('All set! Your progress is synced.'); return;
      }
      if (a === 'sync') { this.msg('Syncing…'); await Cloud.sync(); this.render('Synced.'); return; }
      if (a === 'forgot') {
        const email = v('ss-email').trim();
        if (!email) { this.msg('Type your email first, then tap Forgot password.', true); busy(false); return; }
        await Cloud.resetPassword(email); this.msg('Check your email for a link to reset your password.'); busy(false); return;
      }
    } catch (e) { busy(false); this.msg(e.message || 'Something went wrong.', true); Snd.play('deny'); }
  }
};
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
