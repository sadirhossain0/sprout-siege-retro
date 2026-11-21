/* ===== Screens, UI system, input, main loop ===== */
const canvas = document.getElementById('game');
const mainCtx = canvas.getContext('2d');
setCtx(mainCtx);
const View = { scale: 1, ox: 0, oy: 0, dpr: 1, cw: 0, ch: 0 };
function resize() {
  const dpr = Rec.active ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  const cw = Math.max(1, r.width || window.innerWidth), ch = Math.max(1, r.height || window.innerHeight);
  canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
  const s = Math.min(cw / W, ch / H);
  Object.assign(View, { scale: s, ox: (cw - W * s) / 2, oy: (ch - H * s) / 2, dpr, cw, ch });
  if (typeof Sprites !== 'undefined') Sprites.setScale(s * dpr);
}
const REC_MATCH = /[?&]rec=([a-z]+)/.exec(location.search || '');
if (REC_MATCH) Rec.active = true;
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
resize();

/* ---------- immediate-mode UI ---------- */
const UI = {
  regions: [], next: [], pressed: null, overlay: null, confirm: false, lastHover: null,
  btn(id, x, y, w, h, onClick, o = {}) {
    const r = { id, x, y, w, h, onClick: o.disabled ? null : onClick };
    this.next.push(r);
    const inside = Input.inside && inRect(Input.x, Input.y, r);
    return { hover: inside && Input.hover && !Input.touch, press: this.pressed === id && inside && Input.down };
  },
  block() { this.next.push({ id: '__block', x: 0, y: 0, w: W, h: H, onClick: null }); },
  hit(x, y) { for (let i = this.regions.length - 1; i >= 0; i--) if (inRect(x, y, this.regions[i])) return this.regions[i]; return null; },
  flip() {
    this.regions = this.next; this.next = [];
    if (!this.regions.some(r => r.id === this.lastHover && Input.inside && inRect(Input.x, Input.y, r))) this.lastHover = null;
  }
};

/* ---------- input ---------- */
const Input = { x: 0, y: 0, down: false, sx: 0, sy: 0, moved: false, hover: false, touch: Rec.active, inside: false, pid: null, sim: false };
function toLocal(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left - View.ox) / View.scale, y: (e.clientY - r.top - View.oy) / View.scale }; }
canvas.addEventListener('pointerdown', e => {
  if (Rec.active) return;
  if (Input.pid !== null && Input.down) return;
  e.preventDefault();
  Input.pid = e.pointerId;
  Input.touch = e.pointerType !== 'mouse';
  Snd.init(); Music.resume();
  const p = toLocal(e);
  Object.assign(Input, { x: p.x, y: p.y, sx: p.x, sy: p.y, down: true, moved: false, inside: true, hover: !Input.touch });
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  const r = UI.hit(p.x, p.y);
  if (r) { UI.pressed = r.id; return; }
  UI.pressed = null;
  sceneDown(p.x, p.y);
});
canvas.addEventListener('pointermove', e => {
  if (Rec.active) return;
  if (Input.down && e.pointerId !== Input.pid) return;
  const p = toLocal(e);
  Input.x = p.x; Input.y = p.y; Input.inside = true;
  if (e.pointerType === 'mouse') { Input.hover = true; Input.touch = false; }
  if (Input.down && Math.hypot(p.x - Input.sx, p.y - Input.sy) > 14) Input.moved = true;
});
function endPointer(e, cancel) {
  if (e.pointerId !== Input.pid) return;
  const p = toLocal(e);
  Input.x = p.x; Input.y = p.y;
  Input.down = false; Input.pid = null;
  if (!cancel) {
    if (UI.pressed) {
      const r = UI.hit(p.x, p.y);
      if (r && r.id === UI.pressed && r.onClick) r.onClick();
    } else sceneUp(p.x, p.y);
  }
  UI.pressed = null;
  if (G) { G.pressCard = -1; G.pressT = 0; }
  if (Input.touch) Input.inside = false;
}
canvas.addEventListener('pointerup', e => endPointer(e, false));
canvas.addEventListener('pointercancel', e => endPointer(e, true));
canvas.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { Input.inside = false; Input.hover = false; } });
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if (Rec.active) return;
  if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (Modal.isOpen()) { if (e.key === 'Escape') Modal.close(); return; }
  Snd.init();
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { e.preventDefault(); backAction(); return; }
  if (App.scene === 'howto' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { App.howPage = clamp(App.howPage + (e.key === 'ArrowRight' ? 1 : -1), 0, HOWTO.length - 1); App.howT = App.t; Snd.play('click'); }
  if (App.scene === 'play' && G && !UI.overlay && !G.demo) {
    if (/^[0-9]$/.test(e.key)) { const i = (parseInt(e.key, 10) + 9) % 10; selectCard(i); }
    if (e.key === 's' || e.key === 'S') { G.sel = G.sel === 'trowel' ? null : 'trowel'; Snd.play('click'); }
    if (e.key === 'f' || e.key === 'F') { G.speed = G.speed > 1 ? 1 : 2; }
    if (e.key === 'm' || e.key === 'M') toggleAllSound();
  }
});
document.addEventListener('visibilitychange', () => {
  if (Rec.active) return;
  if (document.hidden) {
    if (App.scene === 'play' && G && !UI.overlay && G.state !== 'lost') UI.overlay = 'pause';
    if (Snd.ctx && Snd.ctx.state === 'running') Snd.ctx.suspend().catch(() => {});
  } else if (Snd.ctx && App.started) Snd.ctx.resume().catch(() => {});
});
// Android back button / Escape
function backAction() {
  if (Modal.isOpen()) { Modal.close(); return true; }
  if (UI.overlay === 'options') { UI.overlay = App.scene === 'play' ? 'pause' : null; return true; }
  if (UI.overlay === 'pause') { UI.overlay = null; return true; }
  if (UI.overlay === 'newbug') { G.newBug = null; UI.overlay = null; return true; }
  if (UI.overlay) return true;
  if (App.scene === 'play') { if (G) openPause(); return true; }
  if (App.scene === 'seeds') { go('map'); return true; }
  if (App.scene === 'map' || App.scene === 'guide' || App.scene === 'howto') { go('title'); return true; }
  return false;
}
window.sproutBack = backAction;

/* ---------- scene management ---------- */
const App = {
  scene: 'loading', t: 0, fade: 0, fadeDir: 0, pending: null, loadP: 0, loadT: 0, loadTask: 0, fontsReady: false, started: false,
  guideTab: 'plants', guideSel: 'berry', howPage: 0, howT: 0, howReturn: 'title', titleT: 0, card: null, lockMsg: 0
};
const TIPS = [
  ['lily', 'Plant Dew Lilies early: dew is everything!'],
  ['basic', 'Every row needs at least one shooter.'],
  ['stump', 'Stumpy in front buys your blasters time.'],
  ['frost', 'Frost Fern shards slow zombies and their bites.'],
  ['leaper', 'Acrobat Zombies flip over the first plant they meet.'],
  ['gourd', 'A Boom Gourd hits a 3x3 area around it.'],
  ['barrel', 'Break the barrel and the zombie inside speeds up!'],
  ['mailman', 'Mailman Zombies drop a big 50-dew drop.'],
  ['gardener', 'Gardener Zombies heal their friends. Hit them first!'],
  ['puff', 'Spore Puffs need 12 seconds to arm.']
];
function go(scene, fn) {
  if (App.fadeDir) return;
  App.fadeDir = 1; App.fade = 0;
  Snd.play('whoosh');
  App.pending = () => {
    if (scene !== 'play') { Coach.steps = null; Caption.clear(); if (!Rec.active) Auto.stop(); }
    if (fn) fn();
    App.scene = scene;
    if (scene === 'title') App.titleT = App.t;
    if (scene === 'howto' && !fn) { App.howPage = 0; App.howT = App.t; }
    if (scene !== 'play') Music.play('menu');
  };
}
function sceneDown(x, y) {
  if (App.scene === 'loading') { if (App.loadP >= 1) startApp(); return; }
  if (App.scene === 'play' && G && !UI.overlay) playDown(x, y);
}
function sceneUp(x, y) { if (App.scene === 'play' && G && !UI.overlay) playUp(x, y); }
function startApp() {
  if (App.started) return;
  App.started = true;
  Snd.init(); Music.play('menu');
  Snd.play('select');
  go('title');
}

/* ---------- loading screen ---------- */
const LOAD_TASKS = [
  ['Watering the lawn...', () => { titleBg = renderTitleBg(); }],
  ['Laying the garden path...', () => { mapBg = renderMapBg(); }],
  ['Waking up the plants...', () => warmPlantSprites()],
  ['Counting the zombies...', () => warmBugSprites()],
  ['Charging the zombie zappers...', () => {}],
  ['Almost ready...', () => {}]
];
function warmPlantSprites() {
  for (const type of PLANT_ORDER) {
    const fake = { type, t: 0.5, hp: 1, maxHp: 1, armed: true, arm: 1, mode: 'idle', attack: 0 };
    const key = plantSpriteKey(fake);
    if (key) Sprites.get('p:' + key, PLANT_BOX, () => PLANT_ART[type](plantSpriteState(fake, key)));
    for (const can of [1, 0]) Sprites.get(`card:${type}:66x96:${can}`, { x: -2, y: -2, w: 70, h: 104 }, () => drawCardFace(66, 96, type, !!can));
  }
}
function warmBugSprites() {
  for (const type of ['basic', 'lid', 'runner']) {
    const stage = BUGS[type].armor ? 3 : 0;
    for (let fr = 0; fr < WALK_FRAMES; fr++) Sprites.get(`b:${type}:${stage}:0:w${fr}`, BUG_BOXES[type], () => BUG_ART[type]({ walk: (fr / WALK_FRAMES) * TAU, eat: 0, armorFrac: stage / 3 }));
  }
}
function updateLoading(dt) {
  App.loadT += dt;
  if (!App.fontsReady) { App.loadP = Math.min(0.12, App.loadP + dt * 0.1); return; }
  const n = LOAD_TASKS.length;
  const target = App.loadTask / n;
  App.loadP = Math.min(target, App.loadP + dt * 0.42);
  if (App.loadP >= target - 0.001 && App.loadTask < n && App.loadT > 0.6) {
    try { LOAD_TASKS[App.loadTask][1](); } catch (e) { /* render lazily later */ }
    App.loadTask++;
  }
  if (App.loadTask >= n && App.loadP >= 0.999) { App.loadP = 1; if (!App.readyT) { App.readyT = App.t; Snd.play('reward'); } }
}
function drawLoading(t) {
  const p = App.loadP, lt = App.loadT;
  // dawn sky
  const sky = ctx.createLinearGradient(0, 0, 0, 560);
  sky.addColorStop(0, '#5fb3f0'); sky.addColorStop(0.65, '#bfe6ff'); sky.addColorStop(1, '#ffe7b0');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // rising sun with rotating rays
  const sx = 1040, sy = 330 - ease(Math.min(1, lt / 4)) * 190;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.15);
  for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); P(); ctx.moveTo(0, 0); ctx.lineTo(-22, -260); ctx.lineTo(22, -260); ctx.closePath(); ctx.fillStyle = 'rgba(255,245,190,.22)'; ctx.fill(); }
  ctx.restore();
  circ(sx, sy, 78); ctx.fillStyle = 'rgba(255,240,170,.45)'; ctx.fill();
  circ(sx, sy, 56); fs(rg(sx - 14, sy - 14, 4, sx, sy, 60, ['#fffbe0', '#ffe27a', '#ffc93a']));
  // drifting clouds
  for (let i = 0; i < 6; i++) { const cx = ((i * 260 + t * (10 + i * 3)) % (W + 300)) - 150; cloud(cx, 60 + (i % 3) * 45, 0.7 + (i % 2) * 0.4); }
  // hills
  P(); ctx.moveTo(0, 520); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 470 - Math.sin(x * 0.005 + 1) * 40 - Math.sin(x * 0.013) * 14); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#9ad67a'; ctx.fill();
  P(); ctx.moveTo(0, 560); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 540 - Math.sin(x * 0.004) * 30); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fillStyle = '#7cc95a'; ctx.fill();
  // lawn
  for (let r = 0; r < 2; r++) for (let c = 0; c < 14; c++) { ctx.fillStyle = (r + c) % 2 ? '#76c44a' : '#86d356'; ctx.fillRect(c * 96, 580 + r * 70, 97, 71); }
  // butterflies
  drawButterfly(200 + Math.sin(t * 0.7) * 120, 380 + Math.sin(t * 1.3) * 40, t);
  drawButterfly(760 + Math.sin(t * 0.5 + 2) * 160, 330 + Math.cos(t * 1.1) * 50, t + 3, '#fff07a', '#ffc93a');
  // growing sprout -> Dew Lily
  const gx = 250, gy = 640;
  ell(gx, gy + 4, 70, 16); fs('#6e4826'); st(3);
  if (p < 1) {
    const hgt = 20 + 150 * ease(p);
    P(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx - 22, gy - hgt * 0.5, gx, gy - hgt); tube(8, '#5cbf45');
    [[0.12, -1], [0.3, 1], [0.5, -1], [0.7, 1]].forEach(([th, side], i) => {
      const k = clamp((p - th) / 0.12, 0, 1); if (k <= 0) return;
      const ly = gy - hgt * (0.2 + i * 0.18);
      leaf(gx - (side < 0 ? 4 : -4), ly, 44 * easeOutBack(k), 14, side < 0 ? Math.PI + 0.5 : -0.5, '#62c74a');
    });
    const bud = clamp((p - 0.82) / 0.15, 0, 1);
    if (bud > 0) { ell(gx, gy - hgt - 8, 12 * easeOutBack(bud), 18 * easeOutBack(bud)); fst('#b9a0ff', 3); }
  } else {
    const k = easeOutBack(Math.min(1, (t - (App.readyT || t)) / 0.6));
    at(gx, gy, 1.6 * (0.7 + 0.3 * k), () => PLANT_ART.lily({ t, glow: (Math.sin(t * 2) + 1) / 2 }));
  }
  // runner strolling and a basic peeking from the grass
  const lbx = W + 60 - ((lt * 45) % (W + 200));
  at(lbx, 712, 0.62, () => { shadow(4, 2, 26); BUG_ART.runner({ walk: t * 10 }); });
  const peek = Math.max(0, Math.sin(t * 0.8)) ;
  at(W - 40 + (1 - peek) * 110, 690, 0.7, () => BUG_ART.basic({ walk: 0, eat: (t * 2) % 1 }));
  for (let k = 0; k < 6; k++) { const x = W - 120 + k * 22; P(); ctx.moveTo(x - 8, 690); ctx.quadraticCurveTo(x + Math.sin(t * 2 + k) * 6, 620, x + 4, 600 + (k % 2) * 20); ctx.quadraticCurveTo(x + 2, 650, x + 8, 690); ctx.closePath(); ctx.fillStyle = k % 2 ? '#4f9a35' : '#428a2c'; ctx.fill(); }
  // falling dew drops
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.35 + i * 0.33) % 1, x = 420 + i * 230;
    if (ph < 0.8) drawDew(x, lerp(-30, 600, ph / 0.8), 12, 0.5);
    else { const k = (ph - 0.8) / 0.2; circ(x, 606, 6 + k * 26); ctx.lineWidth = 3 * (1 - k); ctx.strokeStyle = `rgba(200,240,255,${1 - k})`; ctx.stroke(); }
  }
  // logo with falling letters
  if (App.fontsReady) drawLogo(W / 2, 150, 1.0, t, lt * 1.3);
  // progress sign / start sign
  if (p < 1) {
    woodPanel(W / 2 - 300, 296, 600, 100, { inner: false, r: 18 });
    vineBar(W / 2 - 250, 330, 500, p, t);
    const task = LOAD_TASKS[Math.min(LOAD_TASKS.length - 1, App.loadTask)][0];
    text(`${task}  ${Math.floor(p * 100)}%`, W / 2, 372, 22, { fill: '#fff8e0', sw: 5 });
  } else {
    const k = (t - (App.readyT || t));
    const drop = easeOutBack(Math.min(1, k / 0.7));
    const swing = Math.sin(k * 3) * 0.05 * Math.exp(-k * 0.25) + Math.sin(t * 1.7) * 0.012;
    ctx.save(); ctx.translate(W / 2, 250 - (1 - drop) * 300); ctx.rotate(swing);
    line(-170, 0, -150, 180, 5, '#8a6a3a'); line(170, 0, 150, 180, 5, '#8a6a3a');
    const pulse = 1 + Math.sin(t * 5) * 0.03;
    ctx.translate(0, 220); ctx.scale(pulse, pulse);
    rrect(-230, -54, 460, 108, 22); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
    rrect(-230, -60, 460, 108, 22); fs(lg(0, -60, 0, 48, ['#7fd458', '#4fa83a', '#3a8a2a'])); st(5);
    circ(-150, -40, 4); fs('#e2dccb'); circ(150, -40, 4); fs('#e2dccb');
    text('TAP TO START', 0, -6, 52, { fill: '#fff8e0', sw: 10 });
    ctx.restore();
  }
  // tip card
  const ti = Math.floor(lt / 4) % TIPS.length, tip = TIPS[ti];
  const ta = clamp(Math.min((lt % 4) / 0.3, (4 - lt % 4) / 0.3), 0, 1);
  ctx.globalAlpha = ta;
  rrect(W / 2 - 300, 470 + (p >= 1 ? 1000 : 0), 600, 76, 16); fs('rgba(255,250,235,.95)'); st(3);
  if (p < 1) {
    ctx.save(); rrect(W / 2 - 290, 478, 60, 60, 10); ctx.clip(); fs('#bfe8ff');
    at(W / 2 - 260, 532, 0.42, () => (PLANT_ART[tip[0]] ? PLANT_ART[tip[0]]({ t, armed: true, hpFrac: 1 }) : BUG_ART[tip[0]]({ walk: t * 6, armorFrac: 1 })));
    ctx.restore();
    text('TIP', W / 2 - 214, 492, 16, { fill: '#e8a21c', stroke: false, align: 'left' });
    wrapText(tip[1], W / 2 - 214, 502, 500, 20, 24, { fill: '#3b2a14', weight: '600' });
  }
  ctx.globalAlpha = 1;
}

/* ---------- title screen ---------- */
let titleBg = null;
const TitleSim = { basic: null, wait: 2, cd: 1, projs: [], t: 0 };
const TITLE_PLANKS = {
  adv: [820, 136, 390, 84], endless: [840, 250, 350, 62], daily: [842, 322, 346, 62], howto: [845, 394, 340, 60], guide: [850, 464, 330, 58], opts: [860, 532, 310, 56]
};
const plankCenter = k => ({ x: TITLE_PLANKS[k][0] + TITLE_PLANKS[k][2] / 2, y: TITLE_PLANKS[k][1] + TITLE_PLANKS[k][3] / 2 });
function renderTitleBg() {
  const [c, g] = bgCanvas(); const prev = ctx; setCtx(g);
  const rnd = mulberry(99);
  const sky = g.createLinearGradient(0, 0, 0, 480); sky.addColorStop(0, '#5fb8f5'); sky.addColorStop(1, '#d4f1ff');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // hills
  P(); ctx.moveTo(0, 470); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 430 - Math.sin(x * 0.004) * 50 - Math.sin(x * 0.011) * 20); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); g.fillStyle = '#7cc95a'; g.fill();
  treeLine(rnd, 470, '#3f8f3a', '#357c31');
  for (let r = 0; r < 3; r++) for (let cI = 0; cI < 14; cI++) {
    g.fillStyle = (r + cI) % 2 ? '#76c44a' : '#86d356';
    g.fillRect(cI * 96, 480 + r * 80, 97, 81);
  }
  for (let i = 0; i < 700; i++) { const x = rnd() * W, y = 480 + rnd() * 240; g.strokeStyle = rnd() < 0.5 ? 'rgba(30,90,20,.25)' : 'rgba(220,255,170,.2)'; g.lineWidth = 2; P(); ctx.moveTo(x, y); ctx.lineTo(x + rnd() * 4 - 2, y - 6); ctx.stroke(); }
  rrect(1000, 130, 26, 580, 6); fs(lg(1000, 0, 1026, 0, ['#7a4a22', '#a86a33', '#7a4a22'])); st(4);
  P(); ctx.moveTo(996, 130); ctx.lineTo(1013, 104); ctx.lineTo(1030, 130); ctx.closePath(); fst('#8b5426', 4);
  setCtx(prev);
  return c;
}
function drawTitle(t, dt) {
  if (!titleBg || Math.abs(titleBg.rs - bgRS()) > 0.05) titleBg = renderTitleBg();
  // sun + rays and drifting clouds behind the static background layers
  ctx.drawImage(titleBg, 0, 0, W, H);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 470); ctx.clip();
  ctx.save(); ctx.translate(1110, 110); ctx.rotate(t * 0.12);
  for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); P(); ctx.moveTo(0, 0); ctx.lineTo(-20, -230); ctx.lineTo(20, -230); ctx.closePath(); ctx.fillStyle = 'rgba(255,250,200,.18)'; ctx.fill(); }
  ctx.restore();
  circ(1110, 110, 70); ctx.fillStyle = 'rgba(255,240,170,.5)'; ctx.fill(); circ(1110, 110, 50); ctx.fillStyle = '#fff3b0'; ctx.fill();
  for (let i = 0; i < 6; i++) { const cx = ((i * 240 + t * (8 + i * 2.5)) % (W + 300)) - 150; cloud(cx, 70 + (i % 3) * 48, 0.75 + (i % 2) * 0.45); }
  ctx.restore();
  // mini scene: berry blaster guarding against a basic
  const S = TitleSim; S.t += dt;
  const by = 640;
  at(120, by + 10, 1, () => { shadow(0, 2, 30); PLANT_ART.lily({ t: t + 1, glow: (Math.sin(t) + 1) / 2 }); });
  at(250, by, 1, () => { shadow(0, 2, 30); PLANT_ART.berry({ t, shoot: Math.max(0, 1 - (S.t - (S.lastShot || -9)) * 5) }); });
  at(380, by - 10, 1, () => { shadow(0, 2, 38); PLANT_ART.stump({ t: t + 2, hpFrac: 1 }); });
  if (!S.basic) { S.wait -= dt; if (S.wait <= 0) S.basic = { x: W + 60, hp: 6, walk: 0, dying: 0, flash: 0, type: pick(['basic', 'lid', 'runner']) }; }
  else {
    const b = S.basic;
    if (b.dying) { b.dying += dt; if (b.dying > 0.9) { S.basic = null; S.wait = 2.5; } }
    else {
      if (b.x > 440) { b.x -= 40 * dt; b.walk += dt * 9; }
      b.flash -= dt;
      S.cd -= dt;
      if (S.cd <= 0 && b.x < W - 40) { S.cd = 1.1; S.projs.push({ x: 280, y: by - 48 }); S.lastShot = S.t; Snd.play('shoot'); }
    }
    ctx.save(); ctx.translate(b.x, by);
    shadow(6, 2, 30);
    if (b.dying) { ctx.globalAlpha = 1 - b.dying; ctx.translate(0, -26); ctx.scale(1, Math.cos(Math.min(1, b.dying * 1.6) * Math.PI)); ctx.translate(0, 26); }
    TINT = b.flash > 0 ? 1 : 0;
    ctx.scale(0.85, 0.85); BUG_ART[b.type]({ walk: b.walk, eat: b.x <= 440 ? (t * 3) % 1 : 0, armorFrac: b.hp > 3 ? 1 : 0.3 });
    TINT = 0; ctx.restore(); ctx.globalAlpha = 1;
  }
  for (let i = S.projs.length - 1; i >= 0; i--) {
    const p = S.projs[i]; p.x += 560 * dt;
    berryBall(p.x, p.y, 9);
    if (S.basic && !S.basic.dying && p.x > S.basic.x - 20) { S.basic.hp--; S.basic.flash = 0.09; S.projs.splice(i, 1); Snd.play('hit'); burst2(p.x, p.y); if (S.basic.hp <= 0) { S.basic.dying = 0.001; Snd.play('squish'); } }
    else if (p.x > W + 20) S.projs.splice(i, 1);
  }
  // butterflies
  drawButterfly(560 + Math.sin(t * 0.6) * 200, 420 + Math.sin(t * 1.4) * 50, t);
  drawButterfly(300 + Math.cos(t * 0.45) * 180, 470 + Math.sin(t * 1.1 + 1) * 40, t + 2, '#fff07a', '#ffc93a');
  // foreground grass tufts swaying
  for (let k = 0; k < 14; k++) {
    const x = 20 + k * 92 + (k % 3) * 14, sway = Math.sin(t * 1.8 + k) * 6;
    if (x > 790 && x < 1220) continue;
    P(); ctx.moveTo(x - 10, H); ctx.quadraticCurveTo(x - 4 + sway * 0.5, H - 30, x + sway, H - 52 - (k % 2) * 14); ctx.quadraticCurveTo(x + 4, H - 26, x + 10, H); ctx.closePath();
    ctx.fillStyle = k % 2 ? '#4f9a35' : '#5aa83a'; ctx.fill();
  }
  const it = App.t - App.titleT;
  drawLogo(470, 180, 1.08, t, it * 1.4);
  if (it > 1) { ctx.globalAlpha = clamp((it - 1) / 0.4, 0, 1); text('Zombies in the Garden', 470, 322, 30, { fill: '#fff8e0', sw: 6 }); ctx.globalAlpha = 1; }
  // signpost planks swing in one after another
  const d = Save.data;
  const endlessOpen = d.done.includes(9);
  const nextLvl = Math.min(LEVELS.length, d.unlocked);
  const P_ = TITLE_PLANKS;
  const swing = (i) => Math.sin(t * 1.6 + i * 1.3) * 0.012 + (1 - easeOutBack(clamp((it - 0.3 - i * 0.1) / 0.5, 0, 1))) * 0.9;
  plankBtn('adv', ...P_.adv, 'Adventure', () => { Snd.play('select'); go('map'); }, { size: 40, color: '#5aa83a', rot: swing(0) });
  if (App.lockMsg > 0) { App.lockMsg -= dt; text(App.lockText || 'Beat Level 1-10 to unlock!', 1015, 234, 19, { fill: '#ffe14a', sw: 5 }); }
  else if (it > 0.8) text(d.done.length >= LEVELS.length ? 'All levels cleared!' : `Next: ${LEVELS[nextLvl - 1].name}`, 1015, 234, 17, { fill: '#fff8e0', sw: 4, body: true, weight: '700' });
  plankBtn('endless', ...P_.endless, 'Endless Horde', () => {
    if (!endlessOpen) { Snd.play('deny'); App.lockMsg = 2.5; App.lockText = 'Beat Level 1-10 to unlock!'; return; }
    Snd.play('select'); go('play', () => startLevel(0, true));
  }, { size: 30, disabled: !endlessOpen, icon: endlessOpen ? null : (x, y) => iconLock(x - 6, y, 0.8), rot: swing(1) });
  const dailyOpen = d.done.includes(2), dailyDone = d.daily && d.daily.day === dailyKey();
  plankBtn('daily', ...P_.daily, dailyDone ? 'Daily  ' + '★'.repeat(d.daily.stars) : 'Daily Challenge', () => {
    if (!dailyOpen) { Snd.play('deny'); App.lockMsg = 2.5; App.lockText = 'Beat Level 1-3 to unlock!'; return; }
    Snd.play('select'); go('play', startDaily);
  }, { size: 28, color: '#d8902a', disabled: !dailyOpen, icon: dailyOpen ? null : (x, y) => iconLock(x - 6, y, 0.8), rot: swing(1.5) });
  plankBtn('howto', ...P_.howto, 'How to Play', () => { Snd.play('select'); go('howto'); }, { size: 30, color: '#3f9fb0', rot: swing(2) });
  plankBtn('guide', ...P_.guide, 'Field Guide', () => { Snd.play('select'); go('guide'); }, { size: 28, rot: swing(3) });
  plankBtn('opts', ...P_.opts, 'Options', () => { Snd.play('click'); UI.overlay = 'options'; }, { size: 26, color: '#9a7350', rot: swing(4) });
  roundBtn('t_sound', 52, 52, 28, () => iconSound(Save.data.sfx || Save.data.music), toggleAllSound);
}
function burst2(x, y) { /* small berry splat on the title screen */
  for (let i = 0; i < 5; i++) { circ(x + rand(-10, 10), y + rand(-8, 8), rand(2, 4)); ctx.fillStyle = '#e3263b'; ctx.fill(); }
}

/* ---------- world map ---------- */
let mapBg = null;
const mapBgs = {};
const MAP_NODES = [[170, 560], [330, 610], [470, 520], [400, 390], [560, 300], [730, 360], [850, 480], [1010, 540], [1110, 400], [1020, 250]];
function renderMapBg(theme = 'day') {
  const lawn = renderLawn({ rows: ALL_ROWS, theme, seed: 4 + theme.length * 7 });
  const [c, g] = bgCanvas(); const prev = ctx; setCtx(g);
  g.drawImage(lawn, 0, 0, W, H);
  g.fillStyle = 'rgba(40,60,20,.22)'; g.fillRect(0, 0, W, H);
  P(); MAP_NODES.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.lineWidth = 46; ctx.strokeStyle = '#5c3a1e'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.lineWidth = 36; ctx.strokeStyle = theme === 'winter' ? '#c4ccd6' : theme === 'beach' ? '#e8d6a0' : '#c9a26a'; ctx.stroke();
  ctx.setLineDash([2, 22]); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(120,80,40,.5)'; ctx.stroke(); ctx.setLineDash([]);
  setCtx(prev);
  return c;
}
function mapBgFor(theme) {
  let c = mapBgs[theme];
  if (!c || Math.abs(c.rs - bgRS()) > 0.05) c = mapBgs[theme] = renderMapBg(theme);
  return c;
}
function worldUnlocked(w) { return Save.data.unlocked > w * 10; }
// pick a level: show the seed picker when more plants are unlocked than fit in the tray
function chooseLevel(idx) {
  const avail = plantsFor(idx);
  if (avail.length > 10) { go('seeds', () => initSeeds(idx)); return; }
  go('play', () => startLevel(idx, false, { tutorial: idx === 0 && !Save.data.tutDone && Save.data.tips !== false }));
}
function drawMap(t) {
  const d = Save.data;
  let w = App.mapWorld == null ? Math.min(WORLDS.length - 1, Math.floor((d.unlocked - 1) / 10)) : App.mapWorld;
  App.mapWorld = w;
  const theme = WORLDS[w].key;
  ctx.drawImage(mapBgFor(theme), 0, 0, W, H);
  WORLDS.forEach((wd, i) => {
    const open = worldUnlocked(i), x = 22 + i * 206;
    plankBtn('wt' + i, x, 14, 198, 58, wd.name, () => { if (!open) { Snd.play('deny'); App.lockMsg = 2; return; } App.mapWorld = i; Snd.play('click'); },
      { size: 19, color: i === w ? wd.color : '#9a7350', disabled: !open, icon: open ? null : (ix, iy) => iconLock(ix - 6, iy, 0.62) });
  });
  if (App.lockMsg > 0) { App.lockMsg -= 1 / 60; text('Finish the previous world to open this one!', W / 2, 96, 22, { fill: '#ffe14a', sw: 5 }); }
  MAP_NODES.forEach(([x, y], i) => {
    const idx = w * 10 + i, L = LEVELS[idx];
    const unlocked = idx < d.unlocked, done = d.done.includes(idx), current = unlocked && !done && idx === d.unlocked - 1;
    const b = UI.btn('lvl' + i, x - 44, y - 44, 88, 88, () => {
      if (!unlocked) { Snd.play('deny'); return; }
      Snd.play('select'); chooseLevel(idx);
    });
    const s = (b.hover ? 1.08 : 1) * (current ? 1 + Math.sin(t * 4) * 0.04 : 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ell(0, 8, 46, 40); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill();
    const base = !unlocked ? '#8d8a82' : shade(WORLDS[w].color, 0.55);
    ell(0, 0, 44, 38); fs(lg(0, -38, 0, 38, [shade(base, 0.3), base, shade(base, -0.25)])); st(4);
    if (current) { ell(0, 0, 52, 46); st(4, '#fff36b'); }
    if (unlocked) text(`${w + 1}-${i + 1}`, 0, 2, 32, { fill: '#5a3a1a', stroke: '#fff8e0', sw: 6 });
    else iconLock(0, -2, 1.3);
    if (done) { const n = (d.stars && d.stars[idx]) || 1; for (let k = 0; k < 3; k++) star(-26 + k * 26, k === 1 ? -46 : -40, 12, k < n ? '#ffd23a' : '#a89a80', 2.4); }
    ctx.restore();
    if (b.hover || current) {
      const rw = rewardOf(idx);
      text(L.sub, x, y + 62, 20, { fill: '#fff8e0', sw: 5 });
      if (current && rw) text(`Win: ${PLANTS[rw].name}`, x, y + 86, 17, { fill: '#ffe14a', sw: 4, body: true, weight: '700' });
    }
  });
  // stars collected in this world
  let got = 0; for (let i = 0; i < 10; i++) got += (d.stars && d.stars[w * 10 + i]) || (d.done.includes(w * 10 + i) ? 1 : 0);
  star(1180, 664, 18, '#ffd23a', 3); text(`${got}/30`, 1230, 666, 26, { fill: '#fff8e0', sw: 5 });
  roundBtn('back', 60, 660, 34, iconBack, () => { Snd.play('click'); go('title'); });
}

/* ---------- seed picker ---------- */
function initSeeds(idx) {
  const avail = plantsFor(idx);
  const last = (Save.data.loadout || []).filter(k => avail.includes(k));
  const chosen = last.length ? last.slice(0, 10) : avail.slice(0, 10);
  App.seeds = { idx, avail, chosen, info: chosen[0] || avail[0] };
}
// relative drawing size so big and small zombies fit the same card
function zScale(k) { return { brute: 0.76, boss: 0.4, gnome: 1.25, wheelbarrow: 0.85 }[k] || 1; }
function levelZombies(L) { return BUG_ORDER.filter(k => L.pool && L.pool[k] > 0); }
function drawSeeds(t) {
  const S = App.seeds; if (!S) return;
  const L = LEVELS[S.idx];
  ctx.drawImage(mapBgFor(L.theme || 'day'), 0, 0, W, H);
  ctx.fillStyle = 'rgba(20,30,10,.45)'; ctx.fillRect(0, 0, W, H);
  woodPanel(24, 16, 1232, 688, { pad: 16 });
  text(`${L.name}: ${L.sub}`, W / 2, 58, 36, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 6 });
  text(`Choose up to 10 plants  (${S.chosen.length}/10)`, 330, 100, 22, { fill: '#2f7a2c', stroke: false });
  // tray
  rrect(50, 118, 730, 116, 14); fs(lg(0, 118, 0, 234, ['#6b4220', '#4a2c12'])); st(3);
  for (let i = 0; i < 10; i++) {
    const x = 62 + i * 71, y = 128, k = S.chosen[i];
    if (!k) { rrect(x, y, 64, 94, 9); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill(); ctx.setLineDash([6, 5]); st(2, 'rgba(255,240,200,.5)'); ctx.setLineDash([]); continue; }
    UI.btn('sc' + i, x, y, 64, 94, () => { S.chosen.splice(i, 1); S.info = k; Snd.play('click'); });
    drawCard(x, y, 64, 94, k, {});
  }
  // all unlocked plants
  text('Your plants', 120, 262, 22, { fill: '#2f7a2c', stroke: false });
  S.avail.forEach((k, i) => {
    const x = 62 + (i % 9) * 80, y = 280 + Math.floor(i / 9) * 112, on = S.chosen.includes(k);
    const b = UI.btn('sa' + k, x, y, 70, 100, () => {
      S.info = k;
      if (on) { S.chosen.splice(S.chosen.indexOf(k), 1); Snd.play('click'); }
      else if (S.chosen.length < 10) { S.chosen.push(k); Snd.play('select'); }
      else Snd.play('deny');
    });
    ctx.save(); if (b.hover) ctx.translate(0, -3);
    drawCard(x, y, 70, 100, k, { affordable: true });
    ctx.restore();
    if (on) { rrect(x, y, 70, 100, 9); ctx.fillStyle = 'rgba(20,30,10,.55)'; ctx.fill(); text('✓', x + 35, y + 50, 40, { fill: '#7fd458' }); }
  });
  // plant info
  const info = PLANTS[S.info];
  if (info) {
    rrect(50, 520, 730, 104, 12); fs('#fffaf0'); st(3);
    text(info.name, 70, 545, 26, { align: 'left', fill: '#2f7a2c', stroke: false });
    ctx.font = `700 16px ${FONT_B}`; ctx.fillStyle = '#7a5a3a'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(`${info.cost} dew  ·  ${info.stat}`, 762, 545);
    wrapText(info.desc, 70, 564, 690, 18, 24, { fill: '#3b2a14', weight: '500' });
  }
  // zombies coming
  rrect(810, 92, 420, 532, 14); fs('#fffaf0'); st(3);
  text('Zombies in this level', 1020, 122, 26, { fill: '#a8503a', stroke: false });
  const zs = levelZombies(L).concat(L.boss ? ['boss'] : []);
  const cols = zs.length > 12 ? 5 : 4, cw = cols === 5 ? 80 : 102, chh = cols === 5 ? 122 : 128, bw = cw - 8;
  zs.forEach((k, i) => {
    const x = 1020 - (cols - 1) * cw / 2 + (i % cols) * cw, y = (cols === 5 ? 226 : 236) + Math.floor(i / cols) * chh;
    ctx.save(); rrect(x - bw / 2, y - 92, bw, 104, 10); ctx.clip(); fs(k === 'boss' ? '#f4d8c8' : '#e9f1dc');
    at(x + 4, y + 8, (cols === 5 ? 0.44 : 0.5) * zScale(k), () => BUG_ART[k]({ walk: t * 5 + i, armorFrac: 1 }));
    ctx.restore(); rrect(x - bw / 2, y - 92, bw, 104, 10); st(2);
    const nm = BUGS[k].name.replace(' Zombie', '');
    text(nm, x, y + 24, nm.length > 9 ? (cols === 5 ? 11 : 13) : (cols === 5 ? 13 : 15), { fill: '#3b2a14', stroke: false });
  });
  plankBtn('seed_back', 50, 636, 200, 56, 'Back', () => { Snd.play('click'); go('map'); }, { size: 26 });
  plankBtn('seed_go', 1010, 636, 220, 56, 'Start!', () => {
    if (!S.chosen.length) { Snd.play('deny'); return; }
    Save.data.loadout = S.chosen.slice(); Save.write(); Snd.play('select');
    go('play', () => startLevel(S.idx, false, { plants: S.chosen.slice() }));
  }, { size: 30, color: '#5aa83a', disabled: !S.chosen.length });
}

/* ---------- field guide ---------- */
function drawGuide(t) {
  if (!mapBg || Math.abs(mapBg.rs - bgRS()) > 0.05) mapBg = renderMapBg();
  ctx.drawImage(mapBg, 0, 0, W, H);
  ctx.fillStyle = 'rgba(20,30,10,.4)'; ctx.fillRect(0, 0, W, H);
  woodPanel(40, 30, 1200, 660, { pad: 18 });
  text('Field Guide', W / 2, 74, 46, { fill: '#fff8e0' });
  const tabs = [['plants', 'Plants'], ['bugs', 'Zombies']];
  tabs.forEach(([k, label], i) => {
    const on = App.guideTab === k;
    plankBtn('tab' + k, 76 + i * 190, 100, 170, 52, label, () => { App.guideTab = k; App.guideSel = k === 'plants' ? 'berry' : 'basic'; Snd.play('click'); }, { size: 26, color: on ? '#5aa83a' : '#9a7350' });
  });
  const d = Save.data;
  const maxIdx = Math.max(d.unlocked - 1, ...d.done, 0);
  const list = App.guideTab === 'plants' ? PLANT_ORDER : BUG_ORDER;
  const known = k => App.guideTab === 'plants' ? UNLOCK_AT[k] <= maxIdx || d.done.includes(UNLOCK_AT[k] - 1) : BUG_INTRO[k] <= maxIdx;
  list.forEach((k, i) => {
    const x = 66 + (i % 6) * 95, y = 166 + Math.floor(i / 6) * 162;
    const kn = known(k), sel = App.guideSel === k;
    const b = UI.btn('g' + k, x, y, 88, 152, () => { if (kn) { App.guideSel = k; Snd.play('click'); } else Snd.play('deny'); });
    rrect(x, y, 88, 152, 12); fs(sel ? '#fff3b0' : b.hover ? '#fffaf0' : '#f6ead0'); st(3, sel ? '#e8a21c' : OUT);
    ctx.save(); rrect(x + 4, y + 4, 80, 120, 10); ctx.clip();
    ctx.translate(x + 44, y + 116);
    const sc = App.guideTab === 'plants' ? (['stump', 'pepper', 'gourd', 'hedge'].includes(k) ? 0.7 : 0.78) : 0.6 * zScale(k);
    ctx.scale(sc, sc);
    if (!kn) TINT = 3;
    if (App.guideTab === 'plants') PLANT_ART[k]({ t: t + i, armed: true, hpFrac: 1 });
    else BUG_ART[k]({ walk: t * 4 + i, eat: 0, armorFrac: 1 });
    TINT = 0; ctx.restore();
    const nm = kn ? (App.guideTab === 'plants' ? PLANTS[k] : BUGS[k]).name.replace(' Zombie', '') : '???';
    text(nm, x + 44, y + 138, nm.length > 12 ? 11 : nm.length > 9 ? 13 : 15, { fill: '#3b2a14', stroke: false });
  });
  const k = App.guideSel;
  const def = App.guideTab === 'plants' ? PLANTS[k] : BUGS[k];
  if (def && known(k)) {
    rrect(650, 100, 560, 560, 16); fs('#fffaf0'); st(3);
    ctx.save(); rrect(670, 120, 520, 270, 12); ctx.clip();
    fs(lg(0, 120, 0, 390, App.guideTab === 'plants' ? ['#bfe8ff', '#8fd6a0'] : ['#ffe0b8', '#c9e89a']));
    ctx.translate(930, 372); const big = App.guideTab === 'plants' ? 2 : 1.45 * zScale(k);
    shadow(0, 2, 34); ctx.scale(big, big);
    if (App.guideTab === 'plants') PLANT_ART[k]({ t, armed: true, hpFrac: 1, glow: (Math.sin(t * 2) + 1) / 2 });
    else BUG_ART[k]({ walk: t * 5, eat: (t * 2) % 1, armorFrac: 1 });
    ctx.restore();
    rrect(670, 120, 520, 270, 12); st(3);
    text(def.name, 930, 424, 38, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 6 });
    ctx.font = `700 21px ${FONT_B}`; ctx.fillStyle = '#2f7a2c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(App.guideTab === 'plants' ? `Cost: ${def.cost} dew  ·  ${def.stat}` : def.stat, 930, 462);
    wrapText(def.desc, 690, 490, 480, 21, 29, { fill: '#3b2a14', align: 'left', weight: '500' });
    if (App.guideTab === 'bugs' && BUG_TIPS[k]) wrapText('Tip: ' + BUG_TIPS[k], 690, 580, 480, 18, 24, { fill: '#2f5a1c', weight: '600' });
  }
  roundBtn('back', 60, 660, 34, iconBack, () => { Snd.play('click'); go('title'); });
}

/* ---------- overlays ---------- */
const EXTRA_OVERLAYS = {};   // extra overlay screens an edition can add
let OPTIONS_EXTRA = null;     // { label, open } adds one more button to Options
function toggleRow(id, x, y, w, label, val, onToggle) {
  const b = UI.btn(id, x, y, w, 56, onToggle);
  rrect(x, y, w, 56, 12); fs(b.hover ? '#fff3d0' : '#f6ead0'); st(3);
  text(label, x + 22, y + 29, 26, { fill: '#3b2a14', stroke: false, align: 'left' });
  const sx = x + w - 92, sy = y + 12;
  rrect(sx, sy, 72, 32, 16); fs(val ? '#5cc244' : '#b8a890'); st(3);
  circ(val ? sx + 56 : sx + 16, sy + 16, 13); fst('#fff8e0', 3);
}
function overlayIn() { return easeOutBack(clamp((App.t - (UI.overlayT || 0)) / 0.3, 0, 1)); }
function drawOverlay(t) {
  const o = UI.overlay;
  if (!o) { UI.prevOverlay = null; return; }
  if (UI.prevOverlay !== o) { UI.prevOverlay = o; UI.overlayT = App.t; }
  UI.block();
  ctx.fillStyle = 'rgba(15,20,10,.55)'; ctx.fillRect(0, 0, W, H);
  const k = overlayIn();
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k); ctx.translate(-W / 2, -H / 2);
  const d = Save.data;
  if (o === 'pause') {
    woodPanel(400, 60, 480, 600);
    text('Paused', W / 2, 120, 54, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
    plankBtn('resume', 470, 168, 340, 70, 'Resume', () => { UI.overlay = null; Snd.play('click'); }, { size: 34, color: '#5aa83a' });
    plankBtn('restart', 470, 252, 340, 62, 'Restart Level', () => { Snd.play('click'); const i = G.idx, e = G.endless, dm = G.demo, pl = G.cards.map(c => c.type); UI.overlay = null; go('play', () => (dm ? startDemo() : i === DAILY_IDX ? startDaily() : startLevel(i, e, { plants: pl }))); }, { size: 28 });
    plankBtn('phow', 470, 328, 340, 62, 'How to Play', () => { Snd.play('click'); UI.overlay = 'howto'; App.howPage = 0; App.howT = App.t; }, { size: 28, color: '#3f9fb0' });
    plankBtn('popts', 470, 404, 340, 62, 'Options', () => { Snd.play('click'); UI.overlay = 'options'; }, { size: 28, color: '#9a7350' });
    plankBtn('quit', 470, 480, 340, 62, G && (G.endless || G.demo || G.idx === DAILY_IDX) ? 'Main Menu' : 'Level Map', () => { Snd.play('click'); UI.overlay = null; Auto.stop(); const e = G.endless || G.demo || G.idx === DAILY_IDX; go(e ? 'title' : 'map'); }, { size: 28, color: '#a8503a' });
    text('Esc / P to resume', W / 2, 590, 18, { fill: '#7a5a3a', stroke: false, body: true, weight: '600' });
  } else if (o === 'howto') {
    ctx.restore(); ctx.save();
    drawHowToPanel(t, () => { UI.overlay = 'pause'; });
  } else if (EXTRA_OVERLAYS[o]) {
    EXTRA_OVERLAYS[o](t);
  } else if (o === 'options') {
    const ex = OPTIONS_EXTRA ? 62 : 0;
    ctx.save(); ctx.translate(0, -ex / 2);
    woodPanel(360, 90, 560, 540 + ex);
    text('Options', W / 2, 150, 54, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
    if (OPTIONS_EXTRA) { plankBtn('o_extra', 430, 420, 420, 54, OPTIONS_EXTRA.label, () => { Snd.play('click'); OPTIONS_EXTRA.open(); }, { size: 24, color: '#d8902a' }); ctx.translate(0, ex); }
    toggleRow('o_sfx', 410, 176, 460, 'Sound effects', d.sfx, () => { d.sfx = !d.sfx; Save.write(); Snd.init(); Snd.apply(); Snd.play('click'); });
    toggleRow('o_mus', 410, 236, 460, 'Music', d.music, () => { d.music = !d.music; Save.write(); Snd.init(); Snd.apply(); Music.resume(); Snd.play('click'); });
    toggleRow('o_auto', 410, 296, 460, 'Auto-collect dew', d.autoDew, () => { d.autoDew = !d.autoDew; Save.write(); Snd.play('click'); });
    toggleRow('o_tips', 410, 356, 460, 'Tutorials & tips', d.tips !== false, () => { d.tips = d.tips === false; Save.write(); Snd.play('click'); });
    plankBtn('o_cloud', 430, 420, 420, 54, Cloud.signedIn() ? 'Cloud Save: ' + (Cloud.status === 'Synced' ? 'synced' : 'on') : Cloud.enabled() ? 'Cloud Save & Backups' : 'Save Codes & Backups', () => { Snd.play('click'); Modal.open(); }, { size: 24, color: '#3f9fb0' });
    plankBtn('o_reset', 470, 482, 340, 46, UI.confirm ? 'Tap again to erase' : 'Reset Progress', () => {
      if (!UI.confirm) { UI.confirm = true; Snd.play('deny'); return; }
      Save.reset(); UI.confirm = false; Snd.play('click');
    }, { size: 24, color: UI.confirm ? '#c0392b' : '#9a7350' });
    plankBtn('o_done', 470, 540, 340, 60, 'Done', () => { UI.confirm = false; UI.overlay = App.scene === 'play' ? 'pause' : null; Snd.play('click'); }, { size: 32, color: '#5aa83a' });
    ctx.restore();
  } else if (o === 'win' && G.idx === DAILY_IDX) {
    woodPanel(330, 60, 620, 600);
    text('Daily Challenge Complete!', W / 2, 124, 44, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
    drawResultStars(W / 2, 210, t);
    text(G.L.sub, W / 2, 290, 30, { fill: '#d8902a', stroke: '#fff3d0', sw: 6 });
    const dd = d.daily || {};
    wrapText(`Come back tomorrow for a brand new challenge! Daily streak: ${dd.streak || 1} day${(dd.streak || 1) > 1 ? 's' : ''}.`, 420, 330, 440, 22, 30, { fill: '#3b2a14', weight: '600' });
    drawResultStats(470);
    plankBtn('w_dmenu', 380, 572, 290, 66, 'Main Menu', () => { Snd.play('select'); UI.overlay = null; go('title'); }, { size: 30, color: '#5aa83a' });
    plankBtn('w_dagain', 690, 572, 210, 66, 'Replay', () => { Snd.play('click'); UI.overlay = null; go('play', startDaily); }, { size: 30 });
  } else if (o === 'win') {
    const idx = G.idx, rw = rewardOf(idx);
    woodPanel(330, 50, 620, 620);
    if (rw) {
      text('New Plant!', W / 2, 102, 52, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
      drawResultStars(W / 2, 166, t, 0.8);
      ctx.save(); rrect(440, 206, 400, 196, 16); ctx.clip(); fs(lg(0, 206, 0, 402, ['#bfe8ff', '#8fd6a0']));
      ctx.save(); ctx.translate(W / 2, 300); ctx.rotate(t * 0.4);
      for (let i = 0; i < 10; i++) { ctx.rotate(TAU / 10); P(); ctx.moveTo(0, 0); ctx.lineTo(-24, -260); ctx.lineTo(24, -260); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(); }
      ctx.restore();
      ctx.translate(W / 2, 388); shadow(0, 2, 40); ctx.scale(1.7, 1.7); PLANT_ART[rw]({ t, armed: true, hpFrac: 1, glow: (Math.sin(t * 2) + 1) / 2 }); ctx.restore();
      rrect(440, 206, 400, 196, 16); st(3);
      text(PLANTS[rw].name, W / 2, 432, 36, { fill: '#2f7a2c', stroke: '#fff3d0', sw: 6 });
      wrapText(PLANTS[rw].desc, 420, 456, 440, 20, 26, { fill: '#3b2a14', weight: '500' });
    } else if (idx === LEVELS.length - 1) {
      text('You saved the garden!', W / 2, 130, 48, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
      ctx.save(); ctx.translate(W / 2, 330); ctx.scale(1.4, 1.4);
      circ(0, -40, 60); fs(rg(-14, -54, 4, 0, -40, 64, ['#fff6b0', '#ffd23a', '#d08a10'])); st(4);
      drawTrowel(0, -32, 1.6, -0.5); ctx.restore();
      wrapText('Every last zombie has fled the meadow. The greenhouse is safe! Endless Horde is open if you want to keep going.', 420, 420, 440, 22, 30, { fill: '#3b2a14', weight: '500' });
    } else {
      const worldDone = idx % 10 === 9;
      text(worldDone ? 'World Complete!' : 'Level Complete!', W / 2, 116, 52, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
      drawResultStars(W / 2, 200, t);
      ctx.save(); ctx.translate(W / 2, 360); circ(0, -30, 62); fs(rg(-14, -44, 4, 0, -30, 66, ['#fff6b0', '#ffd23a', '#d08a10'])); st(4); drawTrowel(0, -24, 1.5, -0.5); ctx.restore();
      const nextW = WORLDS[Math.floor(idx / 10) + 1];
      const msg = worldDone && nextW ? `A new world is open: ${nextW.name}!` + (idx === 9 ? ' Endless Horde is unlocked too.' : '') : 'Great job! On to the next level.';
      wrapText(msg, 420, 430, 440, 24, 32, { fill: '#3b2a14', weight: '600' });
    }
    drawResultStats(rw ? 546 : 520);
    const hasNext = idx < LEVELS.length - 1;
    if (hasNext) plankBtn('w_next', 380, 580, 290, 70, 'Next Level', () => { Snd.play('select'); UI.overlay = null; App.mapWorld = Math.floor((idx + 1) / 10); chooseLevel(idx + 1); }, { size: 32, color: '#5aa83a' });
    else plankBtn('w_end', 380, 580, 290, 70, 'Endless', () => { Snd.play('select'); UI.overlay = null; go('play', () => startLevel(0, true)); }, { size: 32, color: '#5aa83a' });
    plankBtn('w_map', 690, 580, 210, 70, 'Map', () => { Snd.play('click'); UI.overlay = null; go('map'); }, { size: 32 });
  } else if (o === 'lose') {
    woodPanel(370, 110, 540, 480);
    text('Oh no!', W / 2, 172, 58, { fill: '#a8503a', stroke: '#fff3d0', sw: 7 });
    ctx.save(); ctx.translate(W / 2, 352); ctx.scale(1.05, 1.05); BUG_ART.basic({ walk: t * 3, eat: (t * 3) % 1 }); ctx.restore();
    if (G.endless) {
      text(`You survived ${G.newBest || 0} waves`, W / 2, 380, 32, { fill: '#3b2a14', stroke: false });
      text(`Best: ${d.endlessBest}`, W / 2, 418, 24, { fill: '#2f7a2c', stroke: false });
    } else wrapText('The zombies got into the greenhouse. Try putting a shooter in every row and more Dew Lilies early on!', 420, 356, 440, 22, 30, { fill: '#3b2a14', weight: '600', align: 'left' });
    plankBtn('l_retry', 420, 470, 250, 72, 'Try Again', () => { Snd.play('select'); UI.overlay = null; const i = G.idx, e = G.endless, pl = G.cards.map(c => c.type); go('play', () => (i === DAILY_IDX ? startDaily() : startLevel(i, e, { plants: pl }))); }, { size: 30, color: '#5aa83a' });
    plankBtn('l_map', 690, 470, 180, 72, G.endless || G.idx === DAILY_IDX ? 'Menu' : 'Map', () => { Snd.play('click'); UI.overlay = null; go(G.endless || G.idx === DAILY_IDX ? 'title' : 'map'); }, { size: 30 });
  } else if (o === 'newbug') {
    drawNewBugCard(t);
  } else if (o === 'demoend') {
    woodPanel(330, 80, 620, 560);
    text("That's how it's done!", W / 2, 140, 46, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
    drawSprig(W / 2, 380, 1.6, t, 1);
    wrapText('Collect dew, plant lilies at the back, put a shooter in every row, and save the big plants for hordes.', 400, 400, 480, 22, 30, { fill: '#3b2a14', weight: '600' });
    plankBtn('de_play', 370, 540, 260, 70, 'Play Now', () => { Snd.play('select'); UI.overlay = null; Auto.stop(); go('map'); }, { size: 30, color: '#5aa83a' });
    plankBtn('de_menu', 650, 540, 260, 70, 'Main Menu', () => { Snd.play('click'); UI.overlay = null; Auto.stop(); go('title'); }, { size: 30 });
  }
  ctx.restore();
}
// results: three stars pop in one after another
function drawResultStars(cx, cy, t, sc = 1) {
  const r = G.result || { stars: 1 }, k = t - (UI.overlayT || 0);
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * 84 * sc, y = cy + (i === 1 ? -12 : 0) * sc;
    star(x, y, 36 * sc, '#8a7a60', 3);
    const a = clamp((k - 0.35 - i * 0.35) / 0.3, 0, 1);
    if (i < r.stars && a > 0) {
      if (a < 1 && !UI['starSnd' + i]) { UI['starSnd' + i] = true; Snd.play('ready'); }
      const s = easeOutBack(a); ctx.save(); ctx.translate(x, y); ctx.scale(s, s); star(0, 0, 36 * sc, '#ffd23a', 3); ctx.restore();
    }
  }
  if (k < 0.1) UI.starSnd0 = UI.starSnd1 = UI.starSnd2 = false;
}
function drawResultStats(y) {
  const r = G.result || { zaps: 0 }, s = G.stats;
  const lines = [`${s.killed} zombies`, `${s.lost} plant${s.lost === 1 ? '' : 's'} lost`, r.zaps ? `${r.zaps} zapper${r.zaps === 1 ? '' : 's'} used` : 'No zappers used'];
  ctx.font = `700 18px ${FONT_B}`; ctx.fillStyle = '#7a5a3a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(lines.join('   ·   '), W / 2, y);
  if (r.stars < 3) { ctx.font = `600 15px ${FONT_B}`; ctx.fillStyle = '#9a7a5a'; ctx.fillText('★ Win  ★ No zappers used  ★ Lose 2 plants or fewer', W / 2, y + 22); }
}
// How to Play as a full scene (from the title) or as an overlay (from the pause menu)
function drawHowToPanel(t, onClose) { drawHowTo(t, onClose); }

/* ---------- main loop ---------- */
function tick(dt) {
  App.t += dt;
  const t = App.t;
  if (App.scene === 'loading') updateLoading(dt);
  // leafy transitions
  if (App.fadeDir === 1) { App.fade += dt * 2.6; if (App.fade >= 1) { App.fade = 1; App.fadeDir = -1; const f = App.pending; App.pending = null; if (f) f(); } }
  else if (App.fadeDir === -1) { App.fade -= dt * 2.6; if (App.fade <= 0) { App.fade = 0; App.fadeDir = 0; } }
  Auto.update(dt);
  Caption.update(dt);
  if (App.scene === 'play' && G) {
    if (App.fadeDir === 0) levelCoachHooks();
    if (G.newBug && !UI.overlay && !Coach.active() && G.state === 'play') { UI.overlay = 'newbug'; Snd.play('alarm'); }
    if (!UI.overlay) Coach.update(dt);
    if (G.pressCard >= 0 && Input.down && !Input.moved) G.pressT += dt;
    if (!UI.overlay && App.fadeDir === 0 && !Coach.pauses()) {
      const steps = G.speed > 1 ? 2 : 1;
      for (let i = 0; i < steps; i++) updateGame(dt);
    }
  }
  renderFrame(t, dt);
}
// layerHook lets an edition know which layer is being drawn ('scene', 'top', 'overlay', 'wipe')
let layerHook = () => {};
function drawAll(t, dt) {
  layerHook('scene');
  switch (App.scene) {
    case 'loading': drawLoading(t); break;
    case 'title': drawTitle(t, dt); break;
    case 'map': drawMap(t); break;
    case 'guide': drawGuide(t); break;
    case 'seeds': drawSeeds(t); break;
    case 'howto': drawHowTo(t); break;
    case 'card': drawCard_(t); break;
    case 'play':
      if (G) {
        drawGame(t);
        layerHook('top');
        if (!UI.overlay) Coach.draw(t);
        Caption.draw(t);
        if (G.demo && !Rec.active && !UI.overlay) plankBtn('exitdemo', W - 196, H - 66, 180, 54, 'Exit Demo', () => { Snd.play('click'); Auto.stop(); Caption.clear(); go('title'); }, { size: 24, color: '#a8503a' });
      }
      break;
  }
  layerHook('overlay');
  drawOverlay(t);
  layerHook('top');
  Auto.draw();
  layerHook('wipe');
  if (App.fadeDir) drawLeafWipe(App.fade, App.fadeDir);
}
function renderFrame(t, dt) {
  const c = mainCtx;
  setCtx(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#1c2a12'; c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(View.dpr * View.scale, 0, 0, View.dpr * View.scale, View.dpr * View.ox, View.dpr * View.oy);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
  drawAll(t, dt);
  c.restore();
  UI.flip();
  drawPortraitWarning(c, t);
}
function drawPortraitWarning(c, t) {
  if (!Rec.active && View.ch > View.cw * 1.15) {
    c.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
    c.fillStyle = 'rgba(15,25,10,.92)'; c.fillRect(0, 0, View.cw, View.ch);
    setCtx(c);
    const s = Math.min(1, View.cw / 420);
    c.translate(View.cw / 2, View.ch / 2); c.scale(s, s);
    c.rotate(Math.sin(t * 2) * 0.4 - 0.4);
    rrect(-46, -120, 92, 150, 14); st(6, '#fff8e0');
    c.rotate(-(Math.sin(t * 2) * 0.4 - 0.4));
    P(); c.arc(0, 60, 40, Math.PI * 1.1, Math.PI * 1.9); st(5, '#ffe14a');
    text('Turn your phone sideways', 0, 120, 30, { fill: '#fff8e0' });
  }
}
let lastT = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - lastT) / 1000; lastT = now;
  if (!(dt > 0)) dt = 0; if (dt > 0.05) dt = 0.05;
  tick(dt);
}

/* ---------- video recording hooks (only active with ?rec=...) ---------- */
window.recStart = name => { Rec.events = []; Rec.music = []; Rec.time = 0; Auto.run(REC_SCRIPTS[name]()); };
window.recFrames = (n, dt) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    tick(dt); Rec.time += dt;
    out.push(canvas.toDataURL('image/jpeg', 0.9));
    if (!Auto.active()) break;
  }
  return { frames: out, done: !Auto.active(), time: Rec.time };
};
window.recAudio = async () => {
  const buf = new Uint8Array(await renderRecordingAudio(Rec.time));
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
};

/* ---------- boot ---------- */
Save.load();
Cloud.init();
(async function boot() {
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.race([
        Promise.all([document.fonts.load(`40px "Lilita One"`), document.fonts.load(`600 20px Fredoka`)]),
        new Promise(r => setTimeout(r, 2500))
      ]);
    }
  } catch (e) { /* fall back to system fonts */ }
  App.fontsReady = true;
})();
if (!Rec.active) requestAnimationFrame(frame);
