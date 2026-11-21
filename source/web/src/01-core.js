'use strict';
/* ===== Sprout Siege — core: constants, helpers, drawing primitives, audio, storage ===== */
const W = 1280, H = 720;
const COLS = 9, ROWS = 5;
const GX = 214, GY = 142, CW = 106, CH = 113;
const OUT = '#24180c';
const TAU = Math.PI * 2;
// editions (like the retro one) can swap fonts, save slot and synth waveforms before the game starts
const FONT_D = window.SPROUT_FONT_D || '"Lilita One", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
const FONT_B = window.SPROUT_FONT_B || 'Fredoka, "Trebuchet MS", system-ui, sans-serif';
let WAVE_MAP = null;

const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeIn = t => t * t * t;
const easeOutBack = t => { t = clamp(t, 0, 1); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const cellX = c => GX + c * CW + CW / 2;
const rowY = r => GY + r * CH + CH - 16;
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// Seeded random for consistent backgrounds
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- color tinting (flash / frozen / charred) ---------- */
let TINT = 0; // 0 none, 1 flash, 2 frozen, 3 shadow, 4 charred
const tintCache = [null, new Map(), new Map(), new Map(), new Map()];
const TINT_MIX = [null, [[255, 255, 255], 0.5], [[140, 215, 255], 0.5], [[20, 30, 20], 0.85], [[38, 30, 26], 0.82]];
function hexRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function col(hex) {
  if (!TINT || hex[0] !== '#') return hex;
  const m = tintCache[TINT];
  let v = m.get(hex);
  if (v) return v;
  const [r, g, b] = hexRgb(hex);
  const [[mr, mg, mb], k] = TINT_MIX[TINT];
  v = `rgb(${Math.round(r + (mr - r) * k)},${Math.round(g + (mg - g) * k)},${Math.round(b + (mb - b) * k)})`;
  m.set(hex, v);
  return v;
}

/* ---------- drawing primitives ---------- */
let ctx = null;
function setCtx(c) { ctx = c; }
function P() { ctx.beginPath(); }
function fs(f) { ctx.fillStyle = f; ctx.fill(); }
function st(w = 3.5, c = OUT) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function fst(f, w = 3.5) { fs(f); st(w); }
function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
function circ(x, y, r) { ell(x, y, r, r); }
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function lg(x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i < stops.length; i++) g.addColorStop(i / (stops.length - 1), col(stops[i]));
  return g;
}
function rg(x, y, r0, x1, y1, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x1, y1, r1);
  for (let i = 0; i < stops.length; i++) g.addColorStop(i / (stops.length - 1), col(stops[i]));
  return g;
}
function line(x1, y1, x2, y2, w, c) { P(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.stroke(); }
// stroke a path twice: thick outline, then colored core
function tube(w, c) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w + 5; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col(c); ctx.stroke(); }

function eye(x, y, r, lx = 0, ly = 0, o = {}) {
  circ(x, y, r); fs(col(o.white || '#ffffff')); st(Math.max(1.6, r * 0.24));
  const pr = r * (o.pupil || 0.55);
  const px = x + lx * r * 0.32, py = y + ly * r * 0.32;
  circ(px, py, pr); fs(o.iris ? col(o.iris) : '#1a1208');
  if (o.iris) { circ(px, py, pr * 0.55); fs('#1a1208'); }
  circ(px - pr * 0.35, py - pr * 0.4, pr * 0.34); fs('#ffffff');
  if (o.lid) {
    ctx.save(); circ(x, y, r); ctx.clip();
    ctx.fillStyle = col(o.lidColor || '#5cc244');
    const a = o.lidAngle || 0;
    ctx.translate(x, y); ctx.rotate(a);
    ctx.fillRect(-r - 2, -r - 2, 2 * r + 4, (2 * r + 4) * o.lid);
    ctx.restore();
    circ(x, y, r); st(Math.max(1.6, r * 0.24));
  }
}
function closedEye(x, y, r) { P(); ctx.arc(x, y - r * 0.2, r, 0.15 * Math.PI, 0.85 * Math.PI); st(Math.max(2, r * 0.35)); }
function brow(x1, y1, x2, y2, w = 3.5) { line(x1, y1, x2, y2, w, OUT); }
function shadow(x, y, rx, a = 0.22) { ell(x, y, rx, rx * 0.26); ctx.fillStyle = `rgba(20,30,10,${a})`; ctx.fill(); }

function leafPath(len, wid) {
  P(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.45, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.45, wid, 0, 0);
  ctx.closePath();
}
function leaf(x, y, len, wid, ang, fill, vein = true, lw = 3) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  leafPath(len, wid); fs(lg(0, -wid, 0, wid, [fill, shade(fill, -0.18)])); st(lw);
  if (vein) { P(); ctx.moveTo(len * 0.08, 0); ctx.quadraticCurveTo(len * 0.5, -wid * 0.12, len * 0.86, 0); ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(20,40,10,.35)'; ctx.stroke(); }
  ctx.restore();
}
const shadeCache = new Map();
function shade(hex, amt) {
  const k = hex + amt;
  let v = shadeCache.get(k);
  if (v) return v;
  const [r, g, b] = hexRgb(hex);
  const f = c => clamp(Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt), 0, 255);
  v = '#' + [f(r), f(g), f(b)].map(n => n.toString(16).padStart(2, '0')).join('');
  shadeCache.set(k, v);
  return v;
}
function dropPath(x, y, r) {
  P(); ctx.moveTo(x, y - r * 1.75);
  ctx.bezierCurveTo(x + r * 0.45, y - r * 1.05, x + r, y - r * 0.55, x + r, y);
  ctx.arc(x, y, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * 0.55, x - r * 0.45, y - r * 1.05, x, y - r * 1.75);
  ctx.closePath();
}
function drawDew(x, y, r, glow = 0) {
  if (glow > 0) { circ(x, y - r * 0.3, r * 2.1); ctx.fillStyle = `rgba(160,230,255,${0.28 * glow})`; ctx.fill(); }
  dropPath(x, y, r);
  fs(rg(x - r * 0.3, y - r * 0.4, r * 0.1, x, y - r * 0.2, r * 1.6, ['#f2fdff', '#7fdcff', '#1f8ee8']));
  st(Math.max(2, r * 0.17));
  ell(x - r * 0.38, y - r * 0.28, r * 0.2, r * 0.36, 0.4); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill();
  circ(x + r * 0.35, y + r * 0.42, r * 0.11); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
}

/* ---------- text ---------- */
function starPath(x, y, r, inner = 0.45) {
  P();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * inner : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath();
}
function star(x, y, r, fill, w = 2) { starPath(x, y, r); ctx.lineJoin = 'round'; fs(fill); st(w); }
function text(str, x, y, size, o = {}) {
  ctx.font = `${o.weight || ''} ${size}px ${o.body ? FONT_B : FONT_D}`;
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.base || 'middle';
  if (o.stroke !== false) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = o.sw || Math.max(3, size * 0.2);
    ctx.strokeStyle = o.stroke || OUT;
    ctx.strokeText(str, x, y);
  }
  if (o.shadow) { ctx.fillStyle = o.shadow; ctx.fillText(str, x, y + size * 0.08); }
  ctx.fillStyle = o.fill || '#ffffff';
  ctx.fillText(str, x, y);
}
function wrapText(str, x, y, maxW, size, lh, o = {}) {
  ctx.font = `${o.weight || '500'} ${size}px ${o.body === false ? FONT_D : FONT_B}`;
  const words = str.split(' ');
  let lineStr = '', lines = [];
  for (const w of words) {
    const test = lineStr ? lineStr + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && lineStr) { lines.push(lineStr); lineStr = w; } else lineStr = test;
  }
  if (lineStr) lines.push(lineStr);
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = o.fill || '#3b2a14';
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return lines.length * lh;
}

/* ---------- storage ---------- */
const SAVE_KEY = window.SPROUT_SAVE_KEY || 'sproutSiege.save.v1';
const Save = {
  data: { unlocked: 1, done: [], endlessBest: 0, sfx: true, music: true, autoDew: false, tips: true, tutDone: false, seenBugs: [], stars: {} },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    if (!Array.isArray(this.data.seenBugs)) this.data.seenBugs = [];
    if (!this.data.stars || typeof this.data.stars !== 'object') this.data.stars = {};
  },
  write(noCloud) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ } if (!noCloud && typeof Cloud !== 'undefined') Cloud.schedule(); },
  reset() {
    const keep = { sfx: this.data.sfx, music: this.data.music, autoDew: this.data.autoDew, tips: this.data.tips };
    this.data = Object.assign({ unlocked: 1, done: [], endlessBest: 0, tutDone: false, seenBugs: [], stars: {}, daily: null }, keep);
    this.write();
  }
};

/* ---------- recording mode (used to render the tutorial videos) ---------- */
const Rec = { active: false, time: 0, events: [], music: [] };

/* ---------- audio (all sounds synthesized with Web Audio) ---------- */
const NOTE_IDX = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const noteCache = new Map();
function noteFreq(n) {
  let f = noteCache.get(n);
  if (f !== undefined) return f;
  const m = n.match(/^([A-G](?:#|b)?)(\d)$/);
  f = 0;
  if (m) { const midi = NOTE_IDX[m[1]] + (parseInt(m[2], 10) + 1) * 12; f = 440 * Math.pow(2, (midi - 69) / 12); }
  noteCache.set(n, f);
  return f;
}
const SILENT_WAV = (() => {
  // 0.05s of silence; playing it through an <audio> tag switches iPhones to "playback" audio
  const n = 2205, b = new Uint8Array(44 + n * 2), v = new DataView(b.buffer);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return 'data:audio/wav;base64,' + btoa(s);
})();
const Snd = {
  ctx: null, master: null, sfx: null, mus: null, noiseBuf: null, last: {}, base: 0, unlocked: false,
  now() { return Rec.active ? Rec.time * 1000 : performance.now(); },
  setup(c) {
    this.ctx = c;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    comp.connect(c.destination);
    this.master = c.createGain(); this.master.gain.value = 1;
    if (this.chain) this.chain(c, this.master, comp); else this.master.connect(comp);
    this.sfx = c.createGain(); this.sfx.connect(this.master);
    this.mus = c.createGain(); this.mus.connect(this.master);
    const len = c.sampleRate;
    const b = c.createBuffer(1, len, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = b;
    this.apply();
  },
  init() {
    if (Rec.active) return;
    if (!this.unlocked) {
      this.unlocked = true;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }
      try { const a = new Audio(SILENT_WAV); a.setAttribute('playsinline', ''); a.volume = 0.01; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ }
    }
    if (this.ctx) { if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.setup(new AC({ latencyHint: 'interactive' })); } catch (e) { this.ctx = null; return; }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  },
  apply() {
    if (!this.ctx) return;
    this.sfx.gain.value = Save.data.sfx ? 1 : 0;
    this.mus.gain.value = Save.data.music ? 0.42 : 0;
  },
  tone(type, f0, f1, dur, vol, t0 = 0, dest, attack = 0.008) {
    const c = this.ctx, t = c.currentTime + this.base + t0;
    const o = c.createOscillator(), g = c.createGain();
    o.type = WAVE_MAP ? WAVE_MAP[type] || type : type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx);
    o.start(t); o.stop(t + dur + 0.05);
  },
  // filtered oscillator, for plucky/brassy voices
  voice(type, f, dur, vol, t0, dest, cutoff = 2400, q = 2) {
    const c = this.ctx, t = c.currentTime + this.base + t0;
    const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = WAVE_MAP ? WAVE_MAP[type] || type : type; o.frequency.setValueAtTime(f, t);
    fl.type = 'lowpass'; fl.Q.value = q;
    fl.frequency.setValueAtTime(cutoff, t); fl.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.25), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(dest || this.sfx);
    o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, vol, type = 'bandpass', f0 = 1000, f1 = f0, q = 1, t0 = 0, dest) {
    const c = this.ctx, t = c.currentTime + this.base + t0;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  },
  play(name) {
    if (!Save.data.sfx) return;
    const now = this.now();
    const lim = { shoot: 70, hit: 45, bite: 110, armor: 60, dew: 60, squish: 60, chitter: 900, tick: 60, ready: 200, pop: 80, groan: 2500, zdie: 250, thud: 120 }[name] || 25;
    if (this.last[name] && now - this.last[name] < lim) return;
    this.last[name] = now;
    if (Rec.active) { Rec.events.push({ name, t: Rec.time }); return; }
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.raw(name);
  },
  raw(name) {
    switch (name) {
      case 'click': this.tone('triangle', 700, 950, 0.07, 0.35); this.noise(0.03, 0.1, 'highpass', 4000); break;
      case 'hover': this.tone('sine', 900, 1000, 0.04, 0.08); break;
      case 'select': this.tone('triangle', 520, 780, 0.09, 0.4); this.tone('sine', 1040, 1300, 0.08, 0.18, 0.05); break;
      case 'deny': this.tone('square', 180, 110, 0.18, 0.12); this.tone('square', 150, 95, 0.18, 0.1, 0.05); break;
      case 'plant':
        this.tone('sine', 240, 70, 0.2, 0.8); this.noise(0.12, 0.35, 'lowpass', 1200, 200);
        this.noise(0.16, 0.18, 'bandpass', 3000, 6000, 2, 0.05); this.tone('triangle', 660, 990, 0.1, 0.18, 0.06);
        break;
      case 'dig': this.noise(0.22, 0.45, 'lowpass', 1600, 300); this.tone('sine', 180, 80, 0.16, 0.45); break;
      case 'shoot': this.tone('sine', 380, 900, 0.07, 0.35); this.tone('triangle', 900, 300, 0.06, 0.12, 0.02); break;
      case 'ice': this.tone('sine', 1800, 900, 0.12, 0.2); this.noise(0.08, 0.12, 'highpass', 6000); this.tone('triangle', 2600, 2400, 0.08, 0.06, 0.03); break;
      case 'hit': this.noise(0.07, 0.35, 'bandpass', 1500, 600, 1.2); this.tone('sine', 200, 90, 0.08, 0.35); break;
      case 'armor': this.tone('triangle', 1100, 900, 0.09, 0.22); this.noise(0.06, 0.18, 'bandpass', 3500, 3500, 5); break;
      case 'break': this.noise(0.32, 0.55, 'bandpass', 1000, 250, 0.8); this.tone('square', 320, 110, 0.18, 0.14); break;
      case 'dew': ['E6', 'G#6', 'B6'].forEach((n, i) => this.tone('sine', noteFreq(n), noteFreq(n), 0.22, 0.26, i * 0.055)); this.tone('triangle', 2637, 2637, 0.3, 0.05, 0.12); break;
      case 'pop': this.tone('sine', 500, 1400, 0.09, 0.28); this.noise(0.04, 0.1, 'highpass', 5000); break;
      case 'ready': this.tone('sine', 1568, 1568, 0.12, 0.09); this.tone('sine', 2093, 2093, 0.16, 0.07, 0.06); break;
      case 'bite': this.noise(0.08, 0.35, 'bandpass', 1900, 800, 2.4); this.noise(0.06, 0.25, 'bandpass', 1300, 600, 2.4, 0.09); break;
      case 'gulp': this.tone('sine', 360, 80, 0.3, 0.6); this.noise(0.15, 0.2, 'lowpass', 700, 200); break;
      case 'squish': this.noise(0.18, 0.4, 'lowpass', 1800, 250); this.tone('sine', 340, 100, 0.16, 0.35); this.tone('square', 900, 400, 0.05, 0.06, 0.02); break;
      case 'chitter': for (let i = 0; i < 7; i++) this.tone('square', rand(2200, 3200), rand(1600, 2400), 0.03, 0.06, i * 0.045 + rand(0, 0.02)); break;
      case 'boom': this.noise(1.1, 1, 'lowpass', 2600, 60, 0.7); this.tone('sine', 110, 30, 0.9, 1); this.noise(0.25, 0.5, 'highpass', 1500, 400, 0.7); break;
      case 'fire': this.noise(1.2, 0.7, 'bandpass', 500, 2200, 0.5); this.tone('sawtooth', 90, 50, 0.7, 0.18); this.noise(0.4, 0.4, 'lowpass', 900, 120); break;
      case 'puff': this.noise(0.7, 0.7, 'lowpass', 1800, 140, 0.8); this.tone('sine', 160, 50, 0.45, 0.7); break;
      case 'zap':
        this.tone('sawtooth', 110, 80, 0.9, 0.3); this.tone('square', 220, 160, 0.9, 0.12);
        for (let i = 0; i < 7; i++) this.noise(0.06, 0.35, 'highpass', 3000, 3000, 1, i * 0.1);
        break;
      case 'alarm':
        for (let i = 0; i < 3; i++) { this.voice('sawtooth', 330, 0.3, 0.22, i * 0.38, null, 1800); this.voice('sawtooth', 247, 0.3, 0.18, i * 0.38 + 0.15, null, 1800); }
        break;
      case 'wave': this.voice('square', 392, 0.16, 0.2, 0, null, 2000); this.voice('square', 523, 0.32, 0.22, 0.15, null, 2000); this.base += 0.6; this.groan(100, 1.4, 0.3); this.base -= 0.6; break;
      case 'win': ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'].forEach((n, i) => { this.voice('square', noteFreq(n), 0.35, 0.16, i * 0.1, null, 3000); this.tone('sine', noteFreq(n), noteFreq(n), 0.4, 0.2, i * 0.1); }); break;
      case 'lose': ['G4', 'F#4', 'F4', 'E4'].forEach((n, i) => this.voice('square', noteFreq(n), 0.5, 0.18, i * 0.34, null, 1400)); this.tone('sine', 82, 70, 1.2, 0.3, 1.0); break;
      case 'reward': ['G5', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) => this.tone('sine', noteFreq(n), noteFreq(n), 0.4, 0.22, i * 0.07)); break;
      case 'chomp': this.noise(0.12, 0.55, 'bandpass', 900, 400, 1.5); this.tone('square', 220, 70, 0.12, 0.16); break;
      case 'hop': this.tone('triangle', 280, 1000, 0.2, 0.25); this.noise(0.08, 0.12, 'lowpass', 800, 300); break;
      case 'whoosh': this.noise(0.45, 0.3, 'bandpass', 300, 2400, 0.9); break;
      case 'tick': this.tone('sine', 1300 + Math.random() * 300, 1200, 0.025, 0.06); break;
      case 'confetti': for (let i = 0; i < 10; i++) this.noise(0.04, 0.12, 'highpass', 5000, 5000, 1, rand(0, 0.5)); this.tone('sine', 1568, 2093, 0.3, 0.12); break;
      case 'land': this.tone('sine', 900, 600, 0.06, 0.08); break;
      case 'groan': this.groan(rand(85, 125), rand(0.9, 1.5), 0.32); break;
      case 'zdie': this.groan(rand(110, 140), 0.6, 0.3, true); break;
      case 'thud': this.tone('sine', 120, 45, 0.25, 0.6); this.noise(0.18, 0.3, 'lowpass', 600, 150); break;
      case 'stomp': this.tone('sine', 95, 30, 0.45, 0.9); this.noise(0.35, 0.55, 'lowpass', 700, 90, 0.8); break;
      case 'spit': this.tone('sine', 260, 760, 0.07, 0.3); this.noise(0.06, 0.2, 'bandpass', 2400, 1200, 2); break;
      case 'caw': this.voice('sawtooth', 620, 0.14, 0.12, 0, null, 1500, 4); this.voice('sawtooth', 560, 0.18, 0.1, 0.17, null, 1400, 4); break;
      case 'buzz': this.tone('sawtooth', 210, 230, 0.35, 0.05); this.tone('sawtooth', 250, 240, 0.35, 0.04, 0.05); break;
      case 'sting': this.tone('triangle', 1400, 700, 0.08, 0.2); this.noise(0.05, 0.15, 'highpass', 5000); break;
      case 'splash': this.noise(0.3, 0.35, 'bandpass', 2600, 700, 0.7); this.tone('sine', 900, 380, 0.1, 0.12); break;
      case 'thunder': this.noise(2.4, 0.6, 'lowpass', 1000, 70, 0.6); this.tone('sine', 62, 34, 1.8, 0.45); this.noise(0.25, 0.4, 'bandpass', 2200, 600, 0.6); break;
      case 'roar': this.groan(rand(62, 72), 1.6, 0.55); this.noise(0.9, 0.25, 'lowpass', 600, 120); break;
    }
  },
  // synthesized zombie groan: buzzy source through two vowel-like formant filters
  groan(f0, dur, vol, falling = false) {
    const c = this.ctx, t = c.currentTime + this.base;
    const o = c.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.linearRampToValueAtTime(f0 * (falling ? 0.55 : 0.82), t + dur);
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.5; vg.gain.value = f0 * 0.04; vib.connect(vg); vg.connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.12); g.gain.setValueAtTime(vol, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const mix = c.createGain(); mix.gain.value = 1;
    for (const [fa, fb, q, gain] of [[700, 450, 6, 1], [1150, 850, 8, 0.6], [2500, 2300, 10, 0.25]]) {
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
      f.frequency.setValueAtTime(fa, t); f.frequency.linearRampToValueAtTime(fb, t + dur);
      const fg = c.createGain(); fg.gain.value = gain;
      o.connect(f); f.connect(fg); fg.connect(mix);
    }
    mix.connect(g); g.connect(this.sfx);
    o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  },
  chitterLater() { this.noise(0.001, 0.0001); for (let i = 0; i < 6; i++) this.tone('square', rand(2400, 3200), rand(1600, 2200), 0.03, 0.05, 0.6 + i * 0.05); }
};

/* ---------- music: multi-voice step sequencer ----------
   Each song: 8 bars of 8 eighth-notes. Lead uses '-' for rest and '_' to hold the previous note.
   Chords drive the bass line and the plucked arpeggio. */
const CHORDS = {
  C: ['C', 'E', 'G'], Am: ['A', 'C', 'E'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], Dm: ['D', 'F', 'A'], Em: ['E', 'G', 'B'],
  D: ['D', 'F#', 'A'], Bb: ['Bb', 'D', 'F'], A: ['A', 'C#', 'E'], Gm: ['G', 'Bb', 'D'], E: ['E', 'G#', 'B'], Bm: ['B', 'D', 'F#'], B: ['B', 'D#', 'F#']
};
const SONGS = {
  menu: {
    bpm: 108, drums: 'soft',
    chords: 'Am Am Dm E Am F Dm E',
    lead: 'A4 _ C5 _ E5 _ D5 C5 | B4 _ A4 _ G#4 _ A4 _ | D5 _ F5 _ A5 _ G5 F5 | E5 _ _ _ G#4 _ B4 _ | A4 _ C5 E5 A5 _ G5 E5 | F5 _ E5 _ C5 _ A4 _ | D5 _ C5 _ B4 _ D5 C5 | B4 _ G#4 _ E4 _ _ _'
  },
  autumn: {
    bpm: 112, drums: 'soft',
    chords: 'D G A D Bm G A D',
    lead: 'D5 _ F#5 _ A5 _ F#5 D5 | B4 _ D5 _ G5 _ F#5 E5 | E5 _ C#5 _ A4 _ C#5 E5 | D5 _ _ _ A4 _ _ _ | F#5 _ A5 _ B5 _ A5 F#5 | G5 _ B5 _ D6 _ B5 G5 | A5 _ G5 F#5 E5 _ C#5 _ | D5 _ _ _ D4 _ _ _'
  },
  night: {
    bpm: 92, drums: 'tick', voice: 'bell',
    chords: 'Em Em C B Em Am B Em',
    lead: 'E5 _ _ G5 B5 _ A5 G5 | F#5 _ _ _ E5 _ _ _ | E5 _ G5 _ C6 _ B5 A5 | B5 _ _ _ D#5 _ F#5 _ | G5 _ _ B5 E6 _ D6 B5 | C6 _ A5 _ E5 _ A5 _ | B5 _ A5 G5 F#5 _ D#5 _ | E5 _ _ _ B4 _ _ _'
  },
  winter: {
    bpm: 110, drums: 'soft', voice: 'bell',
    chords: 'G C D G Em C D G',
    lead: 'B4 D5 G5 _ D5 _ B4 _ | C5 E5 G5 _ E5 _ C5 _ | D5 F#5 A5 _ F#5 _ D5 _ | G5 _ _ _ D5 _ _ _ | E5 G5 B5 _ G5 _ E5 _ | C5 E5 A5 _ G5 _ E5 _ | D5 _ F#5 _ A5 _ C6 _ | B5 _ _ _ G5 _ _ _'
  },
  beach: {
    bpm: 120, drums: 'calypso', voice: 'marimba',
    chords: 'F Bb C F F Bb C F',
    lead: 'F5 - A5 C6 - A5 F5 - | D5 - F5 Bb5 - F5 D5 - | E5 - G5 C6 - Bb5 G5 - | A5 _ _ - C5 - F5 - | A5 - C6 A5 - F5 A5 - | Bb5 - D6 Bb5 - F5 D5 - | C6 - Bb5 G5 - E5 G5 - | F5 _ _ - F4 - - -'
  },
  day: {
    bpm: 124, drums: 'march',
    chords: 'G Em C D G Em C D',
    lead: 'G4 B4 D5 _ B4 _ D5 G5 | E5 _ D5 B4 G4 _ B4 _ | C5 E5 G5 _ E5 C5 E5 _ | D5 _ F#5 _ A5 _ F#5 D5 | G5 _ D5 _ B4 D5 G5 _ | B5 _ G5 E5 _ B4 E5 _ | C5 _ E5 _ D5 _ F#5 _ | G5 _ D5 B4 G4 _ _ _'
  },
  grove: {
    bpm: 98, drums: 'tick', voice: 'marimba',
    chords: 'Am G F E Am Dm G Am',
    lead: 'A4 _ E5 _ D5 C5 B4 _ | G4 _ B4 _ D5 _ G5 _ | F5 _ E5 _ C5 _ A4 _ | E5 _ _ _ G#4 _ B4 _ | C5 _ E5 A5 _ G5 E5 _ | F5 _ D5 _ A4 _ F5 _ | D5 _ G5 _ F5 E5 D5 _ | A4 _ _ _ E4 _ _ _'
  },
  dusk: {
    bpm: 104, drums: 'tick',
    chords: 'Dm Dm Bb A Dm Gm A Dm',
    lead: 'D5 _ F5 _ A5 _ G5 F5 | E5 _ F5 _ D5 _ _ _ | D5 _ F5 _ Bb5 _ A5 G5 | A5 _ _ _ C#5 _ E5 _ | F5 _ A5 _ D6 _ C6 A5 | Bb5 _ G5 _ D5 _ G5 _ | A5 _ G5 F5 E5 _ C#5 _ | D5 _ _ _ A4 _ _ _'
  }
};
for (const k in SONGS) {
  const s = SONGS[k];
  s.leadN = s.lead.replace(/\|/g, ' ').split(/\s+/).filter(Boolean);
  s.chordN = s.chords.split(/\s+/);
  s.len = s.leadN.length;
}
const Music = {
  cur: null, step: 0, nextT: 0, timer: null,
  play(name) {
    if (this.cur === name) return;
    this.stop();
    this.cur = name;
    if (Rec.active) { Rec.music.push({ name, t: Rec.time }); return; }
    if (!Snd.ctx) return;
    this.step = 0; this.nextT = Snd.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.tick(), 40);
  },
  resume() { if (this.cur && !this.timer && Snd.ctx && !Rec.active) { const n = this.cur; this.cur = null; this.play(n); } },
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (Rec.active && this.cur) Rec.music.push({ name: null, t: Rec.time });
    this.cur = null;
  },
  stepDur(s) { return 60 / s.bpm / 2; },
  tick() {
    const c = Snd.ctx; if (!c || c.state !== 'running') return;
    const s = SONGS[this.cur]; if (!s) return;
    while (this.nextT < c.currentTime + 0.18) {
      if (Save.data.music) this.scheduleStep(s, this.step, this.nextT - c.currentTime);
      this.nextT += this.stepDur(s);
      this.step++;
    }
  },
  // schedule one eighth-note step; t0 is seconds from now (relative to Snd.base)
  scheduleStep(s, step, t0) {
    const i = step % s.len, bar = Math.floor(i / 8), pos = i % 8, sd = this.stepDur(s);
    const dest = Snd.mus;
    const tok = s.leadN[i];
    if (tok && tok !== '-' && tok !== '_') {
      let hold = 1; while (s.leadN[(i + hold) % s.len] === '_' && hold < 8) hold++;
      const f = noteFreq(tok);
      if (s.voice === 'bell') {
        Snd.tone('sine', f, f, sd * hold * 1.6 + 0.4, 0.2, t0, dest, 0.004);
        Snd.tone('sine', f * 2.01, f * 2.01, sd * hold + 0.2, 0.07, t0, dest, 0.004);
        Snd.tone('triangle', f * 3, f * 3, 0.12, 0.04, t0, dest, 0.002);
      } else if (s.voice === 'marimba') {
        Snd.tone('triangle', f, f, Math.min(0.35, sd * hold + 0.1), 0.26, t0, dest, 0.003);
        Snd.tone('sine', f * 4, f * 4, 0.07, 0.06, t0, dest, 0.002);
      } else {
        Snd.voice('square', f, sd * hold * 0.95 + 0.05, 0.11, t0, dest, 2600, 1);
        Snd.tone('triangle', f, f, sd * hold + 0.1, 0.16, t0, dest, 0.01);
        Snd.tone('sine', f * 2, f * 2, sd * 0.7, 0.035, t0 + 0.01, dest);
      }
    }
    const ch = CHORDS[s.chordN[bar]] || CHORDS.C;
    if (pos % 2 === 0) {
      const root = ch[0], fifth = ch[2];
      const n = (pos === 0 || pos === 4) ? root + '2' : fifth + '2';
      const f = noteFreq(n) || noteFreq(root + '3');
      Snd.tone('triangle', f, f, sd * 1.7, 0.34, t0, dest, 0.006);
      Snd.tone('sine', f * 0.5, f * 0.5, sd * 1.2, 0.18, t0, dest, 0.006);
    } else {
      const n = ch[[0, 1, 2, 1][(pos - 1) / 2]] + '4';
      Snd.voice('square', noteFreq(n), sd * 0.8, 0.045, t0, dest, 1800, 3);
    }
    const kick = () => Snd.tone('sine', 140, 42, 0.16, 0.55, t0, dest, 0.003);
    const snare = () => { Snd.noise(0.12, 0.2, 'bandpass', 2000, 1200, 0.7, t0, dest); Snd.tone('triangle', 220, 160, 0.06, 0.12, t0, dest); };
    const hat = v => Snd.noise(0.03, v, 'highpass', 8000, 8000, 1, t0, dest);
    if (s.drums === 'march') {
      if (pos === 0 || pos === 4 || pos === 5) kick();
      if (pos === 2 || pos === 6) snare();
      hat(pos % 2 ? 0.07 : 0.04);
    } else if (s.drums === 'soft') {
      if (pos === 0 || pos === 4) kick();
      if (pos % 2 === 1) hat(0.05);
      if (pos === 6) Snd.noise(0.06, 0.06, 'bandpass', 3000, 2500, 1, t0, dest);
    } else if (s.drums === 'calypso') {
      if (pos === 0 || pos === 3 || pos === 4) kick();
      if (pos === 2 || pos === 6) Snd.noise(0.05, 0.16, 'bandpass', 2600, 2200, 3, t0, dest);
      hat(pos % 2 ? 0.07 : 0.035);
    } else if (s.drums === 'tick') {
      if (pos === 0) kick();
      if (pos === 4) Snd.noise(0.09, 0.12, 'bandpass', 1800, 1200, 0.7, t0, dest);
      hat(pos % 2 ? 0.06 : 0.025);
    }
  }
};
// Render a recording's audio track offline (used only for the tutorial videos)
async function renderRecordingAudio(duration) {
  const sr = 44100;
  const off = new OfflineAudioContext(2, Math.ceil(sr * (duration + 1)), sr);
  const saved = { ctx: Snd.ctx, master: Snd.master, sfx: Snd.sfx, mus: Snd.mus, noiseBuf: Snd.noiseBuf, base: Snd.base };
  Snd.setup(off);
  for (const e of Rec.events) { Snd.base = e.t; Snd.raw(e.name); }
  const segs = Rec.music.slice().sort((a, b) => a.t - b.t);
  segs.forEach((seg, i) => {
    if (!seg.name) return;
    const end = i + 1 < segs.length ? segs[i + 1].t : duration;
    const s = SONGS[seg.name]; const sd = Music.stepDur(s);
    Snd.base = 0;
    for (let k = 0, t = seg.t; t < end; k++, t += sd) Music.scheduleStep(s, k, t);
  });
  const buf = await off.startRendering();
  Object.assign(Snd, saved);
  // encode 16-bit PCM WAV
  const ch = [buf.getChannelData(0), buf.getChannelData(1)], n = buf.length;
  const out = new DataView(new ArrayBuffer(44 + n * 4));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); ws(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * 4, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) { const v = Math.max(-1, Math.min(1, ch[c][i])); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return out.buffer;
}
