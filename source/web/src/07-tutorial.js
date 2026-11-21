/* ===== Tutorial coach, demo bot, How to Play book, video scripts ===== */

/* ---------- text wrapping into lines (for typed-out speech) ---------- */
function wrapLines(str, maxW, font) {
  ctx.font = font;
  const out = [];
  for (const para of str.split('\n')) {
    let cur = '';
    for (const w of para.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
    }
    out.push(cur);
  }
  return out;
}
function drawTyped(lines, x, y, lh, chars, font, color) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  let left = chars;
  for (let i = 0; i < lines.length && left > 0; i++) {
    ctx.fillText(lines[i].slice(0, Math.max(0, Math.floor(left))), x, y + i * lh);
    left -= lines[i].length + 1;
  }
}
function addRR(x, y, w, h, r) { // add a rounded rect to the current path (no beginPath)
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* ---------- Auto: scripted hand cursor + simulated taps (demo, autopilot, videos) ---------- */
const Auto = {
  hand: { x: W + 80, y: H * 0.6, vis: false, press: 0, ripple: -1, rx: 0, ry: 0 },
  runner: null, wait: 0, cond: null, tw: null,
  run(gen) { this.runner = gen; this.wait = 0; this.cond = null; },
  stop() { this.runner = null; this.tw = null; this.hand.vis = false; },
  active() { return !!this.runner; },
  update(dt) {
    const h = this.hand;
    h.press = Math.max(0, h.press - dt * 4);
    if (h.ripple >= 0) { h.ripple += dt * 2.2; if (h.ripple > 1) h.ripple = -1; }
    if (this.tw) {
      const w = this.tw; w.t += dt;
      const tgt = w.target();
      const k = ease(Math.min(1, w.t / w.dur));
      h.x = lerp(w.x0, tgt.x, k) + Math.sin(k * Math.PI) * w.arc; h.y = lerp(w.y0, tgt.y, k) - Math.sin(k * Math.PI) * w.arc * 0.6;
      if (w.t >= w.dur) { h.x = tgt.x; h.y = tgt.y; this.tw = null; }
    }
    if (!this.runner) return;
    if (this.wait > 0) { this.wait -= dt; return; }
    if (this.cond) { if (!this.cond()) return; this.cond = null; }
    for (let guard = 0; guard < 50; guard++) {
      const r = this.runner.next();
      if (r.done) { this.runner = null; return; }
      const v = r.value;
      if (typeof v === 'number') { this.wait = v; return; }
      if (typeof v === 'function') { if (!v()) { this.cond = v; return; } continue; }
      return;
    }
  },
  draw() {
    const h = this.hand;
    if (!h.vis) return;
    if (h.ripple >= 0) drawTapRipple(h.rx, h.ry, h.ripple);
    drawHand(h.x, h.y, 0.85, h.press);
  }
};
function simTap(x, y) {
  Input.sim = true;
  const ox = Input.x, oy = Input.y;
  Input.x = x; Input.y = y;
  const r = UI.hit(x, y);
  if (r) { if (r.onClick) r.onClick(); }
  else { sceneDown(x, y); sceneUp(x, y); }
  Input.x = ox; Input.y = oy;
  Input.sim = false;
}
function* moveHand(target, speed = 1) {
  const h = Auto.hand;
  const tf = typeof target === 'function' ? target : () => target;
  if (!h.vis) { h.vis = true; h.x = Math.min(W + 60, tf().x + 260); h.y = tf().y + 200; }
  const d = Math.hypot(tf().x - h.x, tf().y - h.y);
  Auto.tw = { x0: h.x, y0: h.y, target: tf, t: 0, dur: clamp(d / 900, 0.3, 0.9) / speed, arc: Math.min(40, d * 0.08) };
  yield () => !Auto.tw;
}
function* tapAt(x, y, speed = 1) {
  const target = typeof x === 'function' ? x : { x, y };
  yield* moveHand(target, speed);
  yield 0.1;
  const p = typeof target === 'function' ? target() : target;
  const h = Auto.hand; h.press = 1; h.ripple = 0; h.rx = p.x; h.ry = p.y;
  Snd.play('tick');
  simTap(p.x, p.y);
  yield 0.22;
}

/* ---------- Caption: subtitle bar used by the demo ---------- */
const Caption = {
  text: '', t: 0, dur: 0, lines: [],
  show(text, dur = 4.5) { this.text = text; this.t = 0; this.dur = dur; this.lines = null; Snd.play('pop'); },
  clear() { this.text = ''; },
  update(dt) { if (this.text) { this.t += dt; if (this.t > this.dur) this.text = ''; } },
  draw(t) {
    if (!this.text) return;
    const a = clamp(Math.min(this.t / 0.25, (this.dur - this.t) / 0.3), 0, 1);
    const font = `600 23px ${FONT_B}`;
    if (!this.lines) this.lines = wrapLines(this.text, 760, font);
    const h = 30 + this.lines.length * 30;
    const x = 150, y = H - 18 - h, w = 870;
    ctx.globalAlpha = a;
    rrect(x, y, w, h, 16); fs('rgba(255,250,235,.96)'); st(3.4);
    drawSprig(x - 50, y + h + 12, 0.62, t, 1);
    drawTyped(this.lines, x + 70, y + 16, 30, 9999, font, '#3b2a14');
    ctx.globalAlpha = 1;
  }
};

/* ---------- Coach: step-by-step tutorial with spotlight, hand and speech bubble ---------- */
const Coach = {
  steps: null, i: 0, t: 0, typed: 0, lines: null, onDone: null, nextRect: null, skipRect: null,
  start(steps, onDone) { this.steps = steps; this.i = -1; this.onDone = onDone || null; this.next(); },
  get step() { return this.steps ? this.steps[this.i] : null; },
  active() { return !!(this.steps && this.steps[this.i]); },
  pauses() { const s = this.step; return !!(s && s.pause); },
  next() {
    const prev = this.step; if (prev && prev.exit) prev.exit();
    if (!this.steps) return;
    this.i++; this.t = 0; this.typed = 0; this.lines = null;
    if (this.i >= this.steps.length) { const d = this.onDone; this.steps = null; this.onDone = null; if (d) d(); return; }
    const s = this.step; if (s.enter) s.enter();
    Snd.play('pop');
  },
  skip() {
    const s = this.steps; if (!s) return;
    for (let k = this.i; k < s.length; k++) if (s[k].exit) s[k].exit();
    const d = this.onDone; this.steps = null; this.onDone = null; if (d) d();
  },
  update(dt) {
    const s = this.step; if (!s) return;
    this.t += dt;
    const before = Math.floor(this.typed);
    this.typed = Math.min(s.text.length, this.typed + dt * 48);
    if (Math.floor(this.typed) !== before && Math.floor(this.typed) % 4 === 0) Snd.play('tick');
    if (s.until && s.until()) this.next();
  },
  targets() { const s = this.step; if (!s || !s.target) return []; const r = s.target(); return r ? (Array.isArray(r) ? r : [r]) : []; },
  draw(t) {
    const s = this.step; if (!s) return;
    const targets = this.targets();
    // dim everything except the spotlighted targets
    if (targets.length || s.pause) {
      P(); ctx.rect(0, 0, W, H);
      for (const r of targets) addRR(r.x - 6, r.y - 6, r.w + 12, r.h + 12, 12);
      ctx.fillStyle = `rgba(10,20,5,${targets.length ? 0.5 : 0.32})`; ctx.fill('evenodd');
      for (const r of targets) {
        rrect(r.x - 6, r.y - 6, r.w + 12, r.h + 12, 12);
        ctx.setLineDash([12, 8]); ctx.lineDashOffset = -t * 30; st(4, '#fff36b'); ctx.setLineDash([]);
      }
    }
    // pointing hand (hidden when the autopilot hand is showing)
    if (s.hand && !Auto.hand.vis) {
      const p = s.hand();
      if (p) {
        const cyc = (this.t % 1.4) / 1.4, press = cyc > 0.55 && cyc < 0.75 ? 1 : 0;
        if (cyc > 0.6 && cyc < 0.95) drawTapRipple(p.x, p.y, (cyc - 0.6) / 0.35);
        drawHand(p.x, p.y + Math.sin(this.t * 5) * 6 * (1 - press), 0.85, press);
      }
    }
    // speech bubble
    const top = s.pos ? s.pos === 'top' : targets.some(r => r.y + r.h > H - 180);
    const bx = 190, bw = 900, by = top ? 128 : H - 168, bh = 148;
    const font = `500 24px ${FONT_B}`;
    const tw = s.next ? bw - 250 : bw - 60;
    if (!this.lines) this.lines = wrapLines(s.text, tw, font);
    const pop = easeOutBack(Math.min(1, this.t / 0.3));
    ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
    rrect(bx, by + 6, bw, bh, 20); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
    rrect(bx, by, bw, bh, 20); fs('#fffaf0'); st(4);
    P(); ctx.moveTo(bx + 2, by + bh - 52); ctx.lineTo(bx - 34, by + bh - 20); ctx.lineTo(bx + 2, by + bh - 24); ctx.closePath(); fs('#fffaf0'); st(4);
    rrect(bx - 1, by + bh - 54, 6, 32, 2); fs('#fffaf0');
    if (s.title) text(s.title, bx + 30, by + 30, 28, { align: 'left', fill: '#2f7a2c', stroke: false });
    drawTyped(this.lines, bx + 30, by + (s.title ? 50 : 24), 31, this.typed, font, '#3b2a14');
    ctx.restore();
    drawSprig(bx - 92, by + bh + (top ? 30 : 10), 0.95, t, this.typed < s.text.length ? 1 : 0);
    // controls
    this.nextRect = null;
    if (s.next) {
      // tapping anywhere finishes the typing, then advances
      UI.next.push({ id: 'coachBlock', x: 0, y: 0, w: W, h: H, onClick: () => { if (this.typed < s.text.length) this.typed = s.text.length; else this.next(); } });
      this.nextRect = { x: bx + bw - 210, y: by + bh - 70, w: 190, h: 56 };
      plankBtn('coachNext', this.nextRect.x, this.nextRect.y, 190, 56, s.next, () => { if (this.typed < s.text.length) this.typed = s.text.length; else this.next(); }, { size: 26, color: '#5aa83a' });
    }
    if (!s.noSkip && this.steps.length > 1) {
      this.skipRect = { x: bx + bw - 214, y: by - 58, w: 214, h: 48 };
      plankBtn('coachSkip', this.skipRect.x, this.skipRect.y, 214, 48, 'Skip Tutorial', () => { Snd.play('click'); this.skip(); }, { size: 22, color: '#b0503a' });
      text(`Step ${this.i + 1} of ${this.steps.length}`, bx + 24, by - 20, 18, { align: 'left', fill: '#fff8e0', sw: 4 });
    }
  }
};

/* ---------- Level 1 guided tutorial ---------- */
const cellRect = (c, r) => ({ x: GX + c * CW, y: GY + r * CH, w: CW, h: CH });
const center = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
function hudProgressRect() { const tw = trowelRect(); const rx = tw.x + tw.w + 20; return { x: rx + 4, y: 82, w: 1262 - rx - 4, h: 28 }; }
function countPlants(type) { return G.plants.filter(p => p.type === type).length; }

function tutorialSteps() {
  return [
    { text: "Hi, I'm Sprig! Hungry zombies are heading for our greenhouse. Let's get the garden ready to stop them!", next: 'Next', pause: true },
    { text: 'This is your DEW. Every plant costs dew to grow. You start with 150.', target: () => ({ x: 12, y: 12, w: 96, h: 96 }), next: 'Got it', pause: true },
    { text: 'Tap the Dew Lily seed card to pick it up.', target: () => cardRect(0), hand: () => center(cardRect(0)), auto: () => center(cardRect(0)),
      until: () => G.sel === 'lily' || countPlants('lily') > 0, pause: true },
    { text: 'Now tap this square to plant it. Dew Lilies are best at the back, close to the greenhouse.', target: () => cellRect(0, 2), hand: () => center(cellRect(0, 2)), auto: () => center(cellRect(0, 2)),
      until: () => countPlants('lily') > 0, pause: true, enter: () => { if (!G.sel && countPlants('lily') === 0) G.sel = 'lily'; } },
    { text: 'Dew Lilies make extra dew. Dew also falls from the sky. Tap the falling drop to collect it!',
      enter: () => { G.tutCollected = false; G.tutDrop = spawnDrop(cellX(4), -30, false); G.tutDrop.ty = GY + CH * 2 + 40; G.tutDrop.life = 120; },
      target: () => { const d = G.tutDrop; return d && d.state !== 'fly' ? { x: d.x - 38, y: d.y - 56, w: 76, h: 80 } : null; },
      hand: () => { const d = G.tutDrop; return d && d.state !== 'fly' ? { x: d.x, y: d.y - 10 } : null; },
      auto: () => { const d = G.tutDrop; return d ? { x: d.x, y: d.y - 10 } : null; },
      until: () => G.tutCollected && G.tutDrop && !G.drops.includes(G.tutDrop), autoDelay: 2.4 },
    { text: 'Now pick up a Berry Blaster. It spits berries at zombies in its own row.', target: () => cardRect(1), hand: () => center(cardRect(1)), auto: () => center(cardRect(1)),
      enter: () => { if (G.dew < 100) { G.dew = 100; G.dewBump = 1; } G.cards.forEach(c => (c.cd = 0)); },
      until: () => G.sel === 'berry' || countPlants('berry') > 0, pause: true },
    { text: 'Plant it in the middle row, in front of your Dew Lily.', target: () => cellRect(2, 2), hand: () => center(cellRect(2, 2)), auto: () => center(cellRect(2, 2)),
      until: () => countPlants('berry') > 0, pause: true, enter: () => { if (!G.sel && countPlants('berry') === 0) G.sel = 'berry'; } },
    { text: "Here comes a zombie! Zombies walk in from the right. Your Berry Blaster only shoots at zombies in its own row, so watch it go!",
      enter: () => { G.tutBug = spawnBug('basic', 2, W + 10); if (!Save.data.seenBugs.includes('basic')) { Save.data.seenBugs.push('basic'); Save.write(); } },
      until: () => G.tutBug && G.tutBug.dying && !G.bugs.some(liveBug), pos: 'top' },
    { text: 'Squashed! If a zombie ever reaches the end of a row, its Zombie Zapper zaps every zombie in that row. But each zapper only works ONCE.',
      target: () => ({ x: 152, y: GY + CH, w: 60, h: CH * 3 }), next: 'Next', pause: true },
    { text: 'This bar shows how far through the level you are. Red flags mark big hordes of zombies.', target: () => hudProgressRect(), next: 'Next', pause: true },
    { text: 'Use the trowel to dig up a plant you no longer want. Up here you can mute the sound, fast-forward, or pause.',
      target: () => [trowelRect(), { x: 1077, y: 11, w: 190, h: 60 }], next: 'Next', pause: true },
    { text: 'Tip: plant lots of Dew Lilies early, then a Berry Blaster in every row. Hold a finger on any seed card to read what it does. Good luck!',
      next: "Let's go!", pause: true, exit: () => finishTutorial() }
  ];
}
function finishTutorial() {
  if (!G) return;
  G.tutorial = false; G.holdWaves = false; G.waveTimer = Math.min(G.waveTimer, 14); G.skyT = 3; G.sel = null;
  Save.data.tutDone = true; Save.write();
}
// Called each frame while a level is running
function levelCoachHooks() {
  if (!G || G.state !== 'play' || G.coachStarted) return;
  G.coachStarted = true;
  if (G.tutorial) { Coach.start(tutorialSteps()); return; }
  if (G.demo || G.endless) return;
  const fresh = PLANT_ORDER.find(k => UNLOCK_AT[k] === G.idx && G.idx > 0);
  if (fresh && !Save.data.done.includes(G.idx) && Save.data.tips !== false) {
    const d = PLANTS[fresh];
    Coach.start([{ title: `New plant: ${d.name}!`, text: d.desc + ' Hold a finger on its seed card (or hover with the mouse) to read about it any time.', next: 'Got it', pause: true, noSkip: true }]);
  }
}

/* ---------- new bug info card ---------- */
const BUG_TIPS = {
  basic: 'Any attack plant can handle these. Just make sure every row has one!',
  lid: 'The lid soaks up hits before the zombie gets hurt. Chestnut Lobbers throw right over it.',
  runner: 'Joggers dodge into the next lane the first time they are blocked, so keep shooters in neighbouring rows too.',
  barrel: 'When the barrel breaks it rolls into your first plant. Put a Stumpy out front to take the hit.',
  leaper: 'It flips over the first plant it meets. Put a cheap Stumpy or Spore Puff out front as bait.',
  brute: 'Its stomp makes nearby plants dizzy. Hold it far away with an Ivy Snare and finish it with a Boom Gourd.',
  scarecrow: 'Fire Peppers burn straw twice as hard. If a crow flies out, tap it before it steals your dew!',
  pumpkin: 'It spits seeds at your plants from a distance. Snapjaw can swallow it whole, pumpkin and all.',
  gardener: 'It heals every zombie near it. Take it out first with a Thorn Rose or a Boom Gourd.',
  mailman: 'Defeat it for a 50-dew bonus drop. Tap the drop quickly!',
  parka: 'Its snowballs freeze a plant for a moment. Spread your shooters out so one frozen plant is not a disaster.',
  skater: 'It races in until something hits it, so every row needs a shooter.',
  gnome: 'Gnomes come in threes but are very weak. Popcorn Pods and Sprinkler Blooms clear them in one go.',
  wheelbarrow: 'It buries the first plant it reaches. Break the barrow early, or let it bury a cheap plant.',
  beekeeper: 'Its bees stun plants near it while it eats. Knock its veil off and the bees fly away.',
  boss: 'A boss! It calls in helpers and stomps your plants dizzy. Snares, Snapjaws and bombs all help.'
};
function drawNewBugCard(t) {
  const k = G.newBug; if (!k) return;
  const b = BUGS[k];
  woodPanel(300, 70, 680, 580);
  text('New zombie spotted!', W / 2, 128, 50, { fill: '#a8503a', stroke: '#fff3d0', sw: 7 });
  ctx.save(); rrect(400, 160, 480, 220, 16); ctx.clip(); fs(lg(0, 160, 0, 380, ['#ffe0b8', '#c9e89a']));
  ctx.translate(W / 2 + 10, 366); shadow(2, 2, 40); const sc = k === 'brute' ? 0.95 : 1.3; ctx.scale(sc, sc);
  BUG_ART[k]({ walk: t * 5, eat: 0, armorFrac: 1 }); ctx.restore();
  rrect(400, 160, 480, 220, 16); st(3);
  text(b.name, W / 2, 410, 40, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 6 });
  wrapText(b.desc, 380, 436, 520, 21, 28, { fill: '#3b2a14', weight: '500' });
  rrect(370, 504, 540, 64, 12); fs('#e9f7d8'); ctx.lineWidth = 2; ctx.strokeStyle = '#5aa83a'; ctx.stroke();
  wrapText('Tip: ' + (BUG_TIPS[k] || ''), 386, 512, 510, 19, 25, { fill: '#2f5a1c', weight: '600' });
  plankBtn('nb_ok', 520, 582, 240, 60, 'Got it', () => { G.newBug = null; UI.overlay = null; Snd.play('click'); }, { size: 30, color: '#5aa83a' });
}

/* ---------- demo bot ---------- */
const SHOOTERS = ['berry', 'frost', 'thistle', 'rose', 'lobber'];
const DEMO_LEVEL = {
  name: 'Demo', sub: 'Watch and learn', rows: ALL_ROWS, waves: 5, flags: [3, 5], base: 1.5, grow: 0.55,
  pool: { basic: 3, lid: 2, runner: 1, barrel: 0.7 }, minWave: { lid: 2, runner: 3, barrel: 4 },
  first: 15, dew: 400, interval: 14, plants: ['lily', 'berry', 'stump', 'puff', 'frost', 'gourd']
};
function botPlan() {
  const card = t => G.cards.find(c => c.type === t);
  const ready = t => { const c = card(t); return c && c.cd <= 0 && G.dew >= PLANTS[t].cost; };
  const count = t => countPlants(t);
  const free = (c, r) => G.rows.includes(r) && !G.grid[r][c] && !G.blocked.has(c + ',' + r);
  const rows = G.rows.slice().sort((a, b) => Math.abs(a - 2) - Math.abs(b - 2));
  const threat = r => G.bugs.filter(b => !b.dying && b.row === r && b.x < W - 20);
  const has = (r, types) => G.grid[r].some(p => p && types.includes(p.type));
  const firstFree = (r, cols) => cols.find(c => free(c, r));
  if (ready('gourd')) {
    let best = null;
    for (const r of G.rows) for (let c = 3; c < COLS; c++) {
      if (!free(c, r)) continue;
      const n = G.bugs.filter(b => !b.dying && Math.abs(b.row - r) <= 1 && Math.abs(b.x - cellX(c)) < CW * 1.4).length;
      if (n >= 3 && (!best || n > best.n)) best = { n, c, r };
    }
    if (best) return { type: 'gourd', c: best.c, r: best.r, say: ['gourd', 'Lots of zombies bunched together: time for a Boom Gourd! It blasts a 3x3 area.'] };
  }
  for (const r of rows) if (threat(r).length && !has(r, SHOOTERS) && ready('berry')) { const c = firstFree(r, [1, 2, 3, 4]); if (c != null) return { type: 'berry', c, r, say: ['shoot', 'A zombie is in a row with no shooter, so the bot plants a Berry Blaster there.'] }; }
  const allCovered = rows.every(r => has(r, SHOOTERS));
  const lilyTarget = allCovered ? G.rows.length + 3 : 3;
  if (count('lily') < lilyTarget && ready('lily')) for (const c of [0, 1]) for (const r of rows) if (free(c, r)) return { type: 'lily', c, r, say: ['lily', 'First it plants Dew Lilies at the back. More lilies means more dew for later.'] };
  for (const r of rows) if (!has(r, SHOOTERS) && ready('berry')) { const c = firstFree(r, [2, 3]); if (c != null) return { type: 'berry', c, r, say: ['berry', 'Next, a Berry Blaster in every row so no zombie walks in unopposed.'] }; }
  for (const r of rows) if (threat(r).length >= 2 && G.grid[r].filter(p => p && SHOOTERS.includes(p.type)).length < 2 && ready('berry')) { const c = firstFree(r, [3, 2, 4]); if (c != null) return { type: 'berry', c, r, say: ['busy', 'This row is getting busy, so it adds a second shooter.'] }; }
  for (const r of rows) if (threat(r).some(b => b.armor > 0) && ready('frost') && count('frost') < 3) { const c = firstFree(r, [3, 4, 2]); if (c != null) return { type: 'frost', c, r, say: ['frost', 'Armored zombies coming. Frost Fern slows them down so the blasters get more hits in.'] }; }
  for (const r of rows) if (threat(r).length && !has(r, ['stump']) && ready('stump') && has(r, SHOOTERS)) { const c = firstFree(r, [6, 5]); if (c != null) return { type: 'stump', c, r, say: ['stump', 'A Stumpy out front makes zombies stop and chew while the blasters keep firing.'] }; }
  if (ready('puff')) for (const r of rows) { const b = threat(r).find(b => b.x > cellX(7) + 80); if (b && !has(r, ['puff']) && free(7, r)) return { type: 'puff', c: 7, r, say: ['puff', 'Spore Puff costs only 25. It arms after 12 seconds and bursts on the first zombie.'] }; }
  for (const r of rows) if (G.grid[r].filter(p => p && SHOOTERS.includes(p.type)).length < 2 && ready('berry')) { const c = firstFree(r, [3, 4]); if (c != null) return { type: 'berry', c, r, say: ['berry2', 'With dew to spare, it doubles up the shooters in each row.'] }; }
  return null;
}
function* botPlay(o = {}) {
  const said = new Set(o.said || []);
  const say = (k, text, dur = 5) => { if (o.captions && !said.has(k)) { said.add(k); Caption.show(text, dur); } };
  const t0 = App.t;
  while (G && App.scene === 'play') {
    if (o.until && o.until()) return;
    if (o.time && App.t - t0 > o.time) return;
    if (UI.overlay === 'newbug') { yield 2.2; if (UI.overlay === 'newbug') simTap(640, 612); continue; }
    if (UI.overlay) { yield 0.3; continue; }
    if (G.reward && !G.reward.taken) { say('win', 'Level cleared! Tap the prize to collect it.', 4); yield 1.2; yield* tapAt(() => ({ x: G.reward.x, y: G.reward.y })); yield 1; continue; }
    if (G.state !== 'play') { yield 0.3; continue; }
    if (G.bugs.some(liveBug)) say('zombies', 'Here they come! Zombies walk in from the right, and shooters only hit zombies in their own row.');
    if (G.msg && /horde/i.test(G.msg.text)) say('horde', 'A big horde is coming! The flags on the progress bar warn you ahead of time.');
    if (G.zapFx.length) say('zap', "A zombie reached the end of that row, so its zapper fired. It won't work again in that row!");
    const d = G.drops.find(d => d.state === 'rest' || (d.state === 'fall' && d.y > GY + 30) || (d.state === 'pop' && d.vy > 0));
    if (d) {
      say('dew', 'Tap dew drops whenever you see them. Each one is worth 25 dew.');
      yield* tapAt(() => ({ x: d.x, y: d.y - 8 }), 1.6);
      continue;
    }
    const plan = botPlan();
    if (plan) {
      if (plan.say) say(plan.say[0], plan.say[1]);
      const i = G.cards.findIndex(c => c.type === plan.type);
      const r = cardRect(i);
      yield* tapAt(r.x + r.w / 2, r.y + r.h / 2, 1.5);
      if (G.sel !== plan.type) { yield 0.2; continue; }
      yield* tapAt(cellX(plan.c), GY + plan.r * CH + CH / 2, 1.5);
      yield 0.3;
      continue;
    }
    yield 0.25;
  }
}
function startDemo(withBot = true) {
  Caption.clear();
  startLevel(0, false, { level: DEMO_LEVEL, demo: true });
  App.scene = 'play';
  if (withBot) { Auto.stop(); Auto.run(botPlay({ captions: true })); }
}

/* ---------- How to Play book ---------- */
function miniLawn(w, h, rows = 2, dusk = false) {
  const ch = h / rows, cw = 100;
  for (let r = 0; r < rows; r++) for (let c = 0; c * cw < w; c++) {
    ctx.fillStyle = dusk ? ((r + c) % 2 ? '#538d3d' : '#5d9a45') : ((r + c) % 2 ? '#76c44a' : '#86d356');
    ctx.fillRect(c * cw, r * ch, cw + 1, ch + 1);
  }
}
function miniGreenhouse(h) {
  ctx.fillStyle = '#cbeefa'; ctx.fillRect(0, 0, 62, h);
  ctx.strokeStyle = '#f6f6ef'; ctx.lineWidth = 6;
  for (let y = 0; y <= h; y += 70) { P(); ctx.moveTo(0, y); ctx.lineTo(62, y); ctx.stroke(); }
  P(); ctx.moveTo(31, 0); ctx.lineTo(31, h); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; P(); ctx.moveTo(8, 60); ctx.lineTo(28, 20); ctx.lineTo(38, 20); ctx.lineTo(18, 60); ctx.closePath(); ctx.fill();
}
function at(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); fn(); ctx.restore(); }
function walkerX(t, from, to, period) { return lerp(from, to, (t % period) / period); }
const HOWTO = [
  { title: 'Protect the greenhouse', text: 'Zombies march in from the right side of the garden. Your job is to stop them before they reach the greenhouse on the left.\n\nThe game is played on a grid of lawn squares. Every row is its own lane.',
    draw(w, h, t) {
      miniLawn(w, h, 3); miniGreenhouse(h);
      at(120, 120, 0.9, () => { shadow(0, 2, 30); PLANT_ART.lily({ t }); });
      at(230, 120, 0.9, () => { shadow(0, 2, 30); PLANT_ART.berry({ t, shoot: Math.max(0, 1 - ((t * 0.9) % 1) * 5) }); });
      const bx = walkerX(t, w + 40, 330, 7);
      at(bx, 120, 0.6, () => { shadow(2, 2, 28); BUG_ART.basic({ walk: t * 9 }); });
      const px = 260 + ((t * 0.9) % 1) * (bx - 300); berryBall(px, 76, 8);
      at(walkerX(t + 2, w + 60, 200, 9), 250, 0.6, () => { shadow(2, 2, 28); BUG_ART.lid({ walk: t * 9, armorFrac: 1 }); });
      at(300, 250, 0.9, () => { shadow(0, 2, 40); PLANT_ART.stump({ t, hpFrac: 1 }); });
      text('← zombies come this way', w - 150, 330, 24, { fill: '#fff8e0', sw: 5 });
    } },
  { title: 'Collect dew', text: 'Dew is what you spend to grow plants. Drops fall from the sky now and then: tap them to collect them before they dry up.\n\nEach drop is worth 25 dew. Your total is shown in the top-left corner.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      const lt = t % 4.2;
      rrect(14, 14, 90, 90, 12); fs(lg(0, 14, 0, 104, ['#4a2c12', '#6b4220'])); st(3);
      const got = lt > 3.0;
      drawDew(59, 48, 15, got ? 0.8 : 0.2);
      text(got ? '175' : '150', 59, 86, 26, { fill: '#fff8e0' });
      let dx = 330, dy;
      if (lt < 1.6) dy = lerp(-30, 230, lt / 1.6);
      else if (lt < 2.6) dy = 230 + Math.sin(lt * 4) * 2;
      else if (lt < 3.0) { const k = ease((lt - 2.6) / 0.4); dx = lerp(330, 59, k); dy = lerp(230, 48, k); }
      if (lt < 3.0) drawDew(dx, dy, 18, 0.6);
      if (lt > 1.5 && lt < 3.0) {
        const k = clamp((lt - 1.5) / 0.6, 0, 1), press = lt > 2.45 && lt < 2.65 ? 1 : 0;
        if (lt > 2.5) drawTapRipple(330, 222, (lt - 2.5) / 0.5);
        drawHand(lerp(w + 60, 330, ease(k)), lerp(h + 40, 222, ease(k)), 0.85, press);
      }
      if (got && lt < 3.8) text('+25', 59, 128 - (lt - 3) * 20, 24, { fill: '#bff3ff' });
    } },
  { title: 'Grow plants', text: 'Tap a seed card to pick it up, then tap an empty lawn square to plant it. You can also drag the card onto the lawn.\n\nAfter planting, the card needs a few seconds to recharge. Cards you cannot afford are greyed out.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      ctx.fillStyle = 'rgba(70,40,15,.85)'; rrect(10, 10, 170, 112, 12); ctx.fill();
      const lt = t % 5.5;
      const picked = lt > 1.0 && lt < 2.2, planted = lt > 2.2;
      const cd = planted ? clamp(1 - (lt - 2.2) / 3, 0, 1) : 0;
      drawCard(20, 18, 66, 96, 'lily', {});
      drawCard(96, 18, 66, 96, 'berry', { selected: picked, cd });
      const cx = 350, cy = 230;
      if (planted) { const s = easeOutBack(Math.min(1, (lt - 2.2) / 0.3)); at(cx, cy + 40, s, () => { shadow(0, 2, 30); PLANT_ART.berry({ t }); }); }
      else if (picked) { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(cx - 50, cy - 56, 100, 112); ctx.globalAlpha = 0.5; at(cx, cy + 40, 1, () => PLANT_ART.berry({ t })); ctx.globalAlpha = 1; }
      let hx, hy, press = 0;
      if (lt < 1.0) { const k = ease(lt / 0.8); hx = lerp(w, 129, k); hy = lerp(h, 70, k); press = lt > 0.85 ? 1 : 0; }
      else if (lt < 2.2) { const k = ease((lt - 1.2) / 0.8); hx = lerp(129, cx, k); hy = lerp(70, cy, k); press = lt > 2.0 ? 1 : 0; }
      else { const k = ease((lt - 2.4) / 0.8); hx = lerp(cx, w + 80, k); hy = lerp(cy, h + 60, k); }
      drawHand(hx, hy, 0.85, press);
    } },
  { title: 'Dew Lily: your dew factory', text: 'A Dew Lily makes a fresh dew drop every 24 seconds. It pays for itself after two drops.\n\nPlant several early, in the back columns, then spend the dew on fighters.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      const lt = t % 3;
      for (const [x, y] of [[100, 150], [210, 150], [100, 300], [210, 300]]) at(x, y, 1, () => { shadow(0, 2, 30); PLANT_ART.lily({ t: t + x, glow: clamp(lt / 2, 0, 1) }); });
      if (lt > 2) {
        const k = (lt - 2) / 1;
        drawDew(lerp(210, 330, k), 70 - Math.sin(k * Math.PI) * 70 + k * 120, 16, 0.6);
      }
      text('+25 dew every 24s', 420, 140, 26, { fill: '#fff8e0', sw: 5 });
    } },
  { title: 'Attack plants', text: 'Berry Blaster: steady damage down its row.\nTwin Thistle: two spines per volley.\nFrost Fern: ice shards slow zombies to half speed.\n\nShooters only fire at zombies in their own row, so cover every row.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      const rowsY = [110, 220, 330];
      const kinds = ['berry', 'thistle', 'frost'];
      kinds.forEach((k, i) => {
        const y = rowsY[i];
        at(90, y, 0.9, () => { shadow(0, 2, 30); PLANT_ART[k]({ t, shoot: Math.max(0, 1 - ((t * 1.2 + i * 0.3) % 1) * 5) }); });
        const bx = 470 + Math.sin(t * 0.7 + i) * 20;
        TINT = k === 'frost' ? 2 : 0;
        at(bx, y, 0.58, () => { shadow(2, 2, 28); BUG_ART.basic({ walk: t * (k === 'frost' ? 4 : 8) + i }); });
        TINT = 0;
        const ph = (t * 1.2 + i * 0.3) % 1, px = lerp(120, bx - 20, ph);
        if (k === 'berry') berryBall(px, y - 44, 8);
        else if (k === 'thistle') { for (const o of [0, 40]) { const xx = px - o; if (xx > 120) { P(); ctx.moveTo(xx - 12, y - 44); ctx.lineTo(xx + 10, y - 44); tube(3, '#7a3aa8'); } } }
        else { ctx.save(); ctx.translate(px, y - 48); P(); ctx.moveTo(12, 0); ctx.lineTo(0, -7); ctx.lineTo(-12, 0); ctx.lineTo(0, 7); ctx.closePath(); fs('#dff8ff'); st(2.4); ctx.restore(); }
      });
    } },
  { title: 'Blockers and traps', text: 'Stumpy: very tough. Zombies stop to chew on it for ages.\nSpore Puff: costs 25. Arms after 12 seconds, then bursts on the first zombie.\nThorn Carpet: zombies walk over it and get pricked.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      at(250, 110, 0.9, () => { shadow(0, 2, 40); PLANT_ART.stump({ t, hpFrac: 0.7 }); });
      at(320, 110, 0.6, () => { shadow(2, 2, 28); BUG_ART.basic({ eat: (t * 3) % 1 }); });
      const lt = t % 4;
      at(300, 230, 0.9, () => { shadow(0, 2, 30); PLANT_ART.puff({ t, armed: true }); });
      if (lt < 2.6) at(lerp(w + 40, 330, lt / 2.6), 230, 0.58, () => { shadow(2, 2, 28); BUG_ART.basic({ walk: t * 9 }); });
      else if (lt < 3.2) { const k = (lt - 2.6) / 0.6; circ(300, 200, 30 + k * 80); ctx.fillStyle = `rgba(212,226,106,${0.7 * (1 - k)})`; ctx.fill(); }
      at(300, 340, 1, () => { shadow(0, 2, 44); PLANT_ART.thorn({ t, attack: (Math.sin(t * 5) + 1) / 2 }); });
      at(walkerX(t, w + 40, -60, 8), 340, 0.56, () => { shadow(2, 2, 28); BUG_ART.lid({ walk: t * 9, armorFrac: 0.6 }); });
    } },
  { title: 'Emergency plants', text: 'Boom Gourd: explodes after a short fuse, hitting a 3x3 area.\nFire Pepper: burns every zombie in its row.\nSnapjaw: swallows one zombie whole, then chews for a while.\n\nSave these for big hordes!',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      const lt = t % 3;
      if (lt < 1.2) at(150, 120, 0.9, () => { shadow(0, 2, 30); PLANT_ART.gourd({ t, fuse: lt / 1.2 }); });
      else { const k = (lt - 1.2) / 1.8; circ(150, 80, 20 + k * 120); ctx.lineWidth = 12 * (1 - k); ctx.strokeStyle = `rgba(255,220,120,${1 - k})`; ctx.stroke(); circ(150, 80, 50 * (1 - k)); ctx.fillStyle = `rgba(255,140,40,${0.8 * (1 - k)})`; ctx.fill(); }
      const pt = t % 3.5;
      if (pt < 1) at(100, 240, 0.9, () => { shadow(0, 2, 30); PLANT_ART.pepper({ t, fuse: pt }); });
      else if (pt < 2.2) for (let x = 60; x < w; x += 30) { const fh = 50 * (1 - (pt - 1) / 1.2); P(); ctx.moveTo(x - 16, 240); ctx.quadraticCurveTo(x, 240 - fh * 1.6, x + 16, 240); ctx.fillStyle = 'rgba(255,130,30,.85)'; ctx.fill(); }
      const st_ = t % 4, mode = st_ < 1.2 ? 'idle' : st_ < 1.8 ? 'snap' : 'chew';
      at(130, 350, 0.9, () => { shadow(0, 2, 30); PLANT_ART.snap({ t, mode, p: (st_ - 1.2) / 0.6 }); });
      if (st_ < 1.7) at(lerp(w, 240, Math.min(1, st_ / 1.2)), 350, 0.56, () => { shadow(2, 2, 28); BUG_ART.runner({ walk: t * 12 }); });
    } },
  { title: 'Know your zombies', text: 'Farmhand: the everyday zombie.\nLid: hides behind a trash-can lid.\nJogger: fast, and dodges into the next lane once.\nBarrel: when the barrel breaks, it rolls into a plant.\nAcrobat: flips over the first plant.\nBrute: huge, and its stomp makes plants dizzy.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      ['basic', 'lid', 'runner', 'barrel', 'leaper', 'brute'].forEach((k, i) => {
        const x = 100 + (i % 3) * 200, y = 180 + Math.floor(i / 3) * 200;
        at(x, y, k === 'brute' ? 0.46 : 0.62, () => { shadow(2, 2, 28); BUG_ART[k]({ walk: t * 6 + i, armorFrac: 1 }); });
        text(BUGS[k].name.replace(' Zombie', ''), x, y + 24, 20, { fill: '#fff8e0', sw: 5 });
      });
    } },
  { title: 'More zombies', text: 'Scarecrow: burns easily; a crow steals your dew.\nPumpkin-head: spits seeds at your plants.\nGardener: heals nearby zombies.\nMailman: drops 50 bonus dew.\nParka: throws snowballs that freeze plants.\nSkater: fast until it gets hit.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      ['scarecrow', 'pumpkin', 'gardener', 'mailman', 'parka', 'skater'].forEach((k, i) => {
        const x = 100 + (i % 3) * 200, y = 180 + Math.floor(i / 3) * 200;
        at(x, y, k === 'brute' ? 0.46 : 0.62, () => { shadow(2, 2, 28); BUG_ART[k]({ walk: t * 6 + i, armorFrac: 1 }); });
        text(BUGS[k].name.replace(' Zombie', ''), x, y + 24, 20, { fill: '#fff8e0', sw: 5 });
      });
    } },
  { title: 'New plants', text: 'Thorn Rose: thorns pierce every zombie in the row.\nIvy Snare: holds the first zombie that steps on it.\nBreeze Bloom: gusts push zombies back.\nChestnut Lobber: lobs over shields.\n\nOnce you have more than 10 plants, you pick which ones to bring before each level.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      ['rose', 'snare', 'breeze', 'lobber'].forEach((k, i) => { const x = 110 + (i % 2) * 300, y = 170 + Math.floor(i / 2) * 200; at(x, y, 1, () => { shadow(0, 2, 30); PLANT_ART[k]({ t: t + i, shoot: Math.max(0, 1 - ((t + i * 0.3) % 1.5) * 4) }); }); text(PLANTS[k].name, x, y + 26, 20, { fill: '#fff8e0', sw: 5 }); });
    } },
  { title: 'Zombie tricks', text: 'Gnome: tiny, but always comes in threes.\nWheelbarrow: buries the first plant it reaches, then hurries on.\nBeekeeper: its bees sting nearby plants so they stop attacking.\n\nDizzy plants show spinning stars, and frozen plants sit in an ice block. Both wake up after a few seconds.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      ['gnome', 'wheelbarrow', 'beekeeper'].forEach((k, i) => {
        const x = 120 + i * 220, y = 190;
        at(x, y, 0.62 * zScale(k), () => { shadow(2, 2, 28); BUG_ART[k]({ walk: t * 6 + i, armorFrac: 1 }); });
        text(BUGS[k].name.replace(' Zombie', ''), x, y + 24, 20, { fill: '#fff8e0', sw: 5 });
      });
      at(200, 400, 0.8, () => { shadow(0, 2, 30); PLANT_ART.berry({ t }); });
      for (let k = 0; k < 3; k++) { const a = t * 4 + k * TAU / 3; star(200 + Math.cos(a) * 18, 400 - 74 + Math.sin(a) * 5, 6, '#ffe14a'); }
      at(440, 400, 0.8, () => { shadow(0, 2, 30); PLANT_ART.frost({ t }); });
      rrect(440 - 31, 400 - 78, 62, 80, 10); ctx.fillStyle = 'rgba(180,225,255,.45)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
    } },
  { title: 'The Compost Giant', text: 'At the end of every world, a Compost Giant joins the final horde. Watch its health bar at the top.\n\nIt calls in helper zombies and stomps nearby plants dizzy. Zappers only hurt it, so stop it before it reaches the greenhouse!\n\nSnapjaws, snares and bombs all help.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      at(w / 2 + 60, h - 40, 0.62, () => { shadow(0, 2, 60); BUG_ART.boss({ walk: t * 3, armorFrac: 1 }); });
      rrect(w / 2 - 170, 30, 340, 22, 11); ctx.fillStyle = 'rgba(40,20,10,.75)'; ctx.fill(); st(3);
      rrect(w / 2 - 166, 34, 332 * (0.55 + Math.sin(t) * 0.1), 14, 7); fs('#e0502e');
    } },
  { title: 'Late-game plants', text: 'Moon Mushroom: cheap, makes 15 dew every 15 seconds.\nPopcorn Pod: kernels bounce to 3 zombies.\nBramble Hedge: tough, and pricks anything that bites it.\nSprinkler Bloom: splashes every zombie in a 3x3 area.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      ['moonshroom', 'popcorn', 'hedge', 'sprinkler'].forEach((k, i) => { const x = 110 + (i % 2) * 300, y = 170 + Math.floor(i / 2) * 200; at(x, y, 1, () => { shadow(0, 2, 30); PLANT_ART[k]({ t: t + i, hpFrac: 1, shoot: Math.max(0, 1 - ((t + i * 0.3) % 1.5) * 4) }); }); text(PLANTS[k].name, x, y + 26, 20, { fill: '#fff8e0', sw: 5 }); });
    } },
  { title: 'Stars and the Daily Challenge', text: 'Every level gives up to three stars:\n★ for winning\n★ if no zapper was used\n★ if you lost two plants or fewer\n\nOnce you beat Level 1-3, the Daily Challenge opens: a new level each day, with its own plants and a twist.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      for (let i = 0; i < 3; i++) { const s = 1 + Math.sin(t * 3 + i) * 0.06; ctx.save(); ctx.translate(w / 2 + (i - 1) * 110, h / 2 - (i === 1 ? 20 : 0)); ctx.scale(s, s); star(0, 0, 44, '#ffd23a', 3); ctx.restore(); }
      text('Daily Challenge', w / 2, h - 70, 30, { fill: '#ffe14a', sw: 6 });
    } },
  { title: 'Six worlds', text: 'Backyard: where it all starts.\nAutumn Orchard: tap falling apples for 50 dew.\nMoonlit Garden: very little dew at night.\nFrosty Garden: icy lanes make zombies faster.\nSunny Beach: lots of dew, but it dries up fast.\nMushroom Grove: always raining, with thunder.\n\nSome levels bring rain (more dew, muddy lanes) or wind (gusts blow zombies toward you).',
    draw(w, h, t) {
      WORLDS.forEach((wd, i) => {
        const n = WORLDS.length, T = THEMES[wd.key], y = i * (h / n);
        ctx.fillStyle = T.tile[0]; ctx.fillRect(0, y, w, h / n + 1);
        for (let c = 0; c < 7; c++) { ctx.fillStyle = T.tile[c % 2]; ctx.fillRect(c * 100, y, 100, h / n + 1); }
        ctx.fillStyle = T.sky[0]; ctx.fillRect(0, y, 120, h / n + 1);
        text(wd.name, 200, y + h / n / 2, 22, { fill: '#fff8e0', sw: 5, align: 'left' });
        at(560, y + h / n - 6, 0.36, () => BUG_ART[['basic', 'scarecrow', 'mailman', 'parka', 'skater', 'beekeeper'][i]]({ walk: t * 6 + i, armorFrac: 1 }));
      });
    } },
  { title: 'Zappers and hordes', text: 'Each row has one Zombie Zapper by the greenhouse. If a zombie gets past your plants, the zapper fries every zombie in that row, but only once.\n\nThe bar at the top shows your progress. Flags mark big hordes.',
    draw(w, h, t) {
      miniLawn(w, h, 2);
      const lt = t % 4.5;
      drawZapper(60, 150, t, lt > 2.4 && lt < 3.2 ? 'fire' : 'ready');
      if (lt < 2.4) at(lerp(w + 40, 80, lt / 2.4), 150, 0.62, () => { shadow(2, 2, 28); BUG_ART.basic({ walk: t * 9 }); });
      else if (lt < 3.2) {
        ctx.globalAlpha = 1 - (lt - 2.4) / 0.8;
        P(); ctx.moveTo(60, 90); for (let x = 80; x < w; x += 30) ctx.lineTo(x, 90 + rand(-18, 18)); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const px = 60, pw = w - 120, py = 290;
      rrect(px, py - 12, pw, 24, 12); fs('#3e2612'); st(3);
      const k = (t % 8) / 8;
      rrect(px + 4, py - 8, Math.max(8, (pw - 8) * k), 16, 8); fs('#7fd458');
      for (const f of [0.5, 1]) { const fx = px + 4 + (pw - 8) * f - 2; line(fx, py + 10, fx, py - 24, 3, OUT); P(); ctx.moveTo(fx, py - 24); ctx.lineTo(fx + 15, py - 19); ctx.lineTo(fx, py - 14); ctx.closePath(); fst('#e8453a', 2); }
      at(px + 4 + (pw - 8) * k, py + 10, 0.24, () => BUG_ART.basic({ walk: t * 3 }));
    } },
  { title: 'Pro tips', text: '• Plant 2 Dew Lilies per row early on.\n• Get a shooter into every row before the first wave.\n• Put Stumpy in front of your shooters.\n• Save Boom Gourds and Fire Peppers for hordes.\n• Use fast-forward when things are calm.',
    draw(w, h, t) {
      miniLawn(w, h, 3);
      drawSprig(w / 2, h - 40, 2, t, (t % 4) < 2.5 ? 1 : 0);
    } }
];
function drawHowTo(t, onClose) {
  if (!mapBg || Math.abs(mapBg.rs - bgRS()) > 0.05) mapBg = renderMapBg();
  ctx.drawImage(mapBg, 0, 0, W, H);
  ctx.fillStyle = 'rgba(20,30,10,.45)'; ctx.fillRect(0, 0, W, H);
  const pg = App.howPage, page = HOWTO[pg];
  const pt = App.t - (App.howT || 0);
  woodPanel(40, 24, 1200, 672, { pad: 18 });
  text('How to Play', W / 2, 66, 42, { fill: '#fff8e0' });
  // illustration
  const bx = 80, by = 110, bw = 620, bh = 420;
  ctx.save(); rrect(bx, by, bw, bh, 16); ctx.clip(); ctx.translate(bx, by);
  page.draw(bw, bh, pt);
  ctx.restore();
  rrect(bx, by, bw, bh, 16); st(4);
  // text
  const slide = ease(Math.min(1, pt / 0.35));
  ctx.globalAlpha = slide;
  text(`${pg + 1}. ${page.title}`, 730, 140 + (1 - slide) * 20, 34, { align: 'left', fill: '#2f7a2c', stroke: '#fff8e0', sw: 6 });
  const lines = wrapLines(page.text, 460, `500 22px ${FONT_B}`);
  drawTyped(lines, 730, 176 + (1 - slide) * 20, 30, 99999, `500 22px ${FONT_B}`, '#3b2a14');
  ctx.globalAlpha = 1;
  // page dots
  HOWTO.forEach((_, i) => { circ(W / 2 - (HOWTO.length - 1) * 13 + i * 26, 566, i === pg ? 8 : 6); fst(i === pg ? '#5aa83a' : '#d9c9a6', 2.4); });
  const go_ = d => { App.howPage = clamp(pg + d, 0, HOWTO.length - 1); App.howT = App.t; Snd.play('click'); };
  if (pg > 0) plankBtn('hw_prev', 80, 600, 200, 64, 'Back', () => go_(-1), { size: 28 });
  if (pg < HOWTO.length - 1) plankBtn('hw_next', 1000, 600, 200, 64, 'Next', () => go_(1), { size: 30, color: '#5aa83a' });
  else if (!onClose) {
    plankBtn('hw_tut', 700, 600, 250, 64, 'Play Tutorial', () => { Snd.play('select'); go('play', () => startLevel(0, false, { tutorial: true })); }, { size: 26, color: '#5aa83a' });
    plankBtn('hw_demo', 970, 600, 230, 64, 'Watch Demo', () => { Snd.play('select'); go('play', () => startDemo()); }, { size: 26, color: '#4a8fc8' });
  }
  roundBtn('hw_close', 1196, 60, 26, () => { line(-8, -8, 8, 8, 4, '#fff8e0'); line(8, -8, -8, 8, 4, '#fff8e0'); }, () => { Snd.play('click'); if (onClose) onClose(); else go('title'); });
}

/* ---------- video scripts (only used when rendering tutorial videos) ---------- */
function* titleCard(title, sub, dur, outro = false) {
  App.card = { title, sub, t0: App.t, outro };
  App.scene = 'card'; Music.play('menu');
  yield dur;
}
function drawCard_(t) {
  const c = App.card; if (!c) return;
  if (!titleBg || Math.abs(titleBg.rs - bgRS()) > 0.05) titleBg = renderTitleBg();
  ctx.drawImage(titleBg, 0, 0, W, H);
  ctx.fillStyle = 'rgba(20,40,10,.35)'; ctx.fillRect(0, 0, W, H);
  const lt = App.t - c.t0;
  drawLogo(W / 2, 200, 0.95, t, lt * 1.5);
  const k = easeOutBack(clamp((lt - 0.5) / 0.4, 0, 1));
  ctx.save(); ctx.translate(W / 2, 410); ctx.scale(k, k);
  woodPanel(-380, -70, 760, 150, { inner: false });
  text(c.title, 0, -18, 50, { fill: '#fff8e0' });
  text(c.sub, 0, 36, 26, { fill: '#ffe9b8', sw: 5, body: true, weight: '700' });
  ctx.restore();
  drawSprig(220, 690, 1.3, t, 1);
}
function* tutorialAutopilot() {
  while (Coach.active()) {
    const s = Coach.step, idx = Coach.i;
    yield s.autoDelay || (0.8 + s.text.length / 24);
    if (Coach.i !== idx || !Coach.active()) continue;
    if (s.next) { yield () => Coach.nextRect; const r = Coach.nextRect; yield* tapAt(r.x + r.w / 2, r.y + r.h / 2); }
    else if (s.auto) {
      const tgt = () => s.auto() || { x: Auto.hand.x, y: Auto.hand.y };
      yield* tapAt(tgt, s.autoDelay ? 1.4 : 1);
    }
    let waited = 0;
    while (Coach.i === idx && Coach.active() && waited < 20) { yield 0.2; waited += 0.2; }
  }
}
function* recGettingStarted() {
  Save.reset(); Save.data.sfx = true; Save.data.music = true;
  yield* titleCard('Getting Started', 'Learn the basics in 2 minutes', 3.4);
  App.scene = 'loading'; App.loadP = 0; App.loadT = 0; App.started = false;
  yield () => App.loadP >= 1; yield 1.4;
  yield* tapAt(W / 2, 470); yield 2.6;
  { const c = plankCenter('adv'); yield* tapAt(c.x, c.y); } yield 2;
  yield* tapAt(MAP_NODES[0][0], MAP_NODES[0][1]);
  yield () => App.scene === 'play' && Coach.active();
  yield* tutorialAutopilot();
  yield 1.2;
  Caption.show('Now the real waves start. Keep collecting dew and plant a Berry Blaster in every row!', 5);
  yield* botPlay({ time: 34 });
  Auto.hand.vis = false;
  yield* titleCard("Now it's your turn!", 'Open Sprout Siege and start Level 1', 4, true);
}
function* recDemo() {
  Save.reset(); Save.data.tutDone = true; Save.data.seenBugs = BUG_ORDER.slice();
  yield* titleCard('Watch a Full Level', 'The bot plays and explains every move', 3.4);
  startDemo(false);
  yield* botPlay({ captions: true, until: () => UI.overlay === 'demoend' || UI.overlay === 'lose', time: 280 });
  yield 2.5;
  Auto.hand.vis = false; UI.overlay = null;
  yield* titleCard('Ready to try?', 'Tap Adventure on the main menu', 3.5, true);
}
function* recGuide() {
  yield* titleCard('Plants, Zombies & Tips', 'Everything in the garden, explained', 3.4);
  App.scene = 'howto'; App.howPage = 0; App.howT = App.t; Music.play('menu');
  for (let i = 0; i < HOWTO.length - 1; i++) {
    yield 3.5 + HOWTO[i].text.length / 30;
    yield* tapAt(1100, 632);
  }
  yield 3.5 + HOWTO[HOWTO.length - 1].text.length / 30;
  Auto.hand.vis = false;
  yield* titleCard('Have fun!', 'Sprout Siege: Zombies in the Garden', 3.5, true);
}
// Trailer: a big battle in each world
function showcase(idx, secs) {
  const L = LEVELS[idx];
  const pl = plantsFor(idx).filter(k => k !== 'gourd' && k !== 'pepper').slice(-10);
  startLevel(idx, false, { plants: pl }); App.scene = 'play';
  G.state = 'play'; G.coachStarted = true; G.dew = 1250; G.holdWaves = true;
  const layout = ['lily', pl.includes('rose') ? 'rose' : 'berry', pl.includes('thistle') ? 'thistle' : 'berry', pl.includes('frost') ? 'frost' : 'berry', pl.includes('lobber') ? 'lobber' : 'snap', 'stump'];
  for (const r of G.rows) layout.forEach((t, c) => { if (pl.includes(t) && !G.blocked.has(c + ',' + r) && Math.random() < 0.92) { const p = placePlant(t, c, r); p.born = -10; } });
  const zs = levelZombies(L);
  for (let i = 0; i < 11; i++) spawnBug(zs[i % zs.length], G.rows[i % G.rows.length], 760 + (i * 97) % 520);
  for (let i = 0; i < 4; i++) spawnDrop(rand(GX + 80, GX + 700), -30 - i * 120, false);
  Caption.show(`${WORLDS[L.world].name}: ${L.sub}`, secs - 0.5);
}
function* recTrailer() {
  Save.reset(); Save.data.tutDone = true; Save.data.seenBugs = BUG_ORDER.slice(); Save.data.tips = false;
  yield* titleCard('Sprout Siege', 'Zombies in the Garden', 3.2);
  for (const idx of [3, 13, 24, 34, 46]) { showcase(idx, 7.5); yield 7.5; }
  Caption.clear();
  yield* titleCard('Play free on any device', 'iPhone · Android · Windows · Mac · Web', 4, true);
}
const REC_SCRIPTS = { start: recGettingStarted, demo: recDemo, guide: recGuide, trailer: recTrailer };
