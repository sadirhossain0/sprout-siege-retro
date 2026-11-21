/* ===== Sprout Siege Retro: pixel renderer, colour palettes, chiptune sound and extra options =====
   The game draws into a small offscreen canvas (320x180 to 640x360). A WebGL pass blows it up with
   hard pixel edges and snaps every pixel to the chosen palette, with optional ordered dithering.
   Text is captured during that pass and redrawn on top at full resolution in a pixel font, so it
   stays readable however chunky the pixels get. */
const RETRO_PALETTES = [
  { key: 'arcade', name: 'Arcade 16', colors: ['#101418', '#3a2a1e', '#7a4a28', '#c8884a', '#f4d8a0', '#fff8e8', '#2a5a2a', '#4fa83a', '#a8e060', '#2a4a8a', '#5ab0f0', '#a8e0ff', '#a02828', '#e85a3a', '#ffd23a', '#8a4ab8'] },
  { key: 'handheld', name: 'Handheld Green', mono: true, colors: ['#0f2a12', '#3a6b28', '#8bb04a', '#d4e89a'] },
  { key: 'pocket', name: 'Pocket Gray', mono: true, colors: ['#1c1c1c', '#5a5a5a', '#a8a8a8', '#eeeeee'] },
  { key: 'amber', name: 'Amber Monitor', mono: true, colors: ['#140a00', '#5a3200', '#b06a00', '#ffb43a'] },
  { key: 'sunset', name: 'Sunset 8', colors: ['#1a1028', '#4a2a5a', '#a04a5a', '#e8806a', '#ffc890', '#fff0d0', '#3a6a5a', '#8ac080'] },
  { key: 'full', name: '16-bit Color', colors: null }
];
const RETRO_PIXELS = [
  { key: 'chunky', name: 'Chunky', w: 320, h: 180 },
  { key: 'classic', name: 'Classic', w: 427, h: 240 },
  { key: 'fine', name: 'Fine', w: 640, h: 360 }
];
const hexRgb01 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

const Retro = {
  low: null, lowG: null, lw: 427, lh: 240, ls: 427 / W, hi: true, texts: [],
  gl: null, prog: null, tex: null, pix: null, crt: null, colorCache: new Map(),
  get opts() {
    const d = Save.data;
    if (!d.retro || typeof d.retro !== 'object') d.retro = {};
    const o = d.retro;
    if (!RETRO_PALETTES.some(p => p.key === o.pal)) o.pal = 'arcade';
    if (!RETRO_PIXELS.some(p => p.key === o.px)) o.px = 'classic';
    if (o.dither == null) o.dither = true;
    if (o.crt == null) o.crt = true;
    return o;
  },
  palette() { return RETRO_PALETTES.find(p => p.key === this.opts.pal); },
  init() {
    this.pix = document.createElement('canvas'); this.pix.id = 'pix';
    canvas.parentNode.insertBefore(this.pix, canvas);
    this.crt = document.createElement('div'); this.crt.id = 'crt';
    document.body.appendChild(this.crt);
    this.low = document.createElement('canvas');
    this.lowG = this.low.getContext('2d');
    const g = this.lowG, fill = g.fillText.bind(g), stroke = g.strokeText.bind(g);
    // capture text drawn in the pixel pass so it can be redrawn sharply on top
    g.fillText = (s, x, y, mw) => { if (this.hi) this.record('f', s, x, y, mw); else fill(s, x, y, mw); };
    g.strokeText = (s, x, y, mw) => { if (this.hi) this.record('s', s, x, y, mw); else stroke(s, x, y, mw); };
    this.initGL();
    this.applyPixels();
  },
  applyPixels() {
    const p = RETRO_PIXELS.find(q => q.key === this.opts.px);
    this.lw = p.w; this.lh = p.h; this.ls = p.w / W;
    this.low.width = p.w; this.low.height = p.h;
    this.lowG.imageSmoothingEnabled = false;
    Sprites.map.clear(); Sprites.px = 0; Sprites.rs = this.ls;
  },
  record(op, s, x, y, mw) {
    const g = this.lowG;
    this.texts.push({ op, s, x, y, mw, m: g.getTransform(), font: g.font, fill: g.fillStyle, stroke: g.strokeStyle, lw: g.lineWidth, join: g.lineJoin, align: g.textAlign, base: g.textBaseline, a: g.globalAlpha });
  },
  initGL() {
    let gl = null;
    try { gl = this.pix.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true }); } catch (e) { gl = null; }
    if (!gl) return;
    const vs = `attribute vec2 p; varying vec2 uv; void main() { uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5); gl_Position = vec4(p, 0.0, 1.0); }`;
    const fs = `precision mediump float;
      varying vec2 uv; uniform sampler2D tex; uniform vec2 low; uniform vec3 pal[16]; uniform float n; uniform float mono; uniform float dith; uniform float full;
      float b2(vec2 q) { return mod(q.x * 2.0 + q.y * 3.0, 4.0); }
      void main() {
        vec2 px = floor(uv * low);
        vec3 c = texture2D(tex, (px + 0.5) / low).rgb;
        float d = (4.0 * b2(mod(px, 2.0)) + b2(mod(floor(px / 2.0), 2.0)) + 0.5) / 16.0 - 0.5;
        if (full > 0.5) { gl_FragColor = vec4(floor(c * 31.0 + 0.5 + d * dith) / 31.0, 1.0); return; }
        if (mono > 0.5) {
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          float i = clamp(floor(l * (n - 1.0) + 0.5 + d * dith), 0.0, n - 1.0);
          vec3 o = pal[0];
          for (int k = 1; k < 16; k++) { if (float(k) == i) o = pal[k]; }
          gl_FragColor = vec4(o, 1.0); return;
        }
        c = c + d * dith * 0.12;
        vec3 best = pal[0]; float bd = 1e9;
        for (int k = 0; k < 16; k++) {
          if (float(k) >= n) break;
          vec3 e = c - pal[k]; float dd = dot(e * e, vec3(0.9, 1.6, 0.5));
          if (dd < bd) { bd = dd; best = pal[k]; }
        }
        gl_FragColor = vec4(best, 1.0);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    try {
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
      gl.useProgram(pr);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.u = name => gl.getUniformLocation(pr, name);
      this.gl = gl; this.prog = pr;
    } catch (e) { this.gl = null; }
  },
  // where the 1280x720 game sits on screen, in device pixels
  box() { const d = View.dpr, s = View.scale; return { x: View.ox * d, y: View.oy * d, w: W * s * d, h: H * s * d }; },
  present() {
    const gl = this.gl, d = View.dpr;
    const pw = Math.round(View.cw * d), ph = Math.round(View.ch * d);
    if (this.pix.width !== pw || this.pix.height !== ph) { this.pix.width = pw; this.pix.height = ph; }
    const pal = this.palette(), cols = pal.colors || ['#000000'];
    if (!gl) return false;
    const bg = hexRgb01(cols[0]);
    gl.viewport(0, 0, pw, ph); gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
    const b = this.box();
    gl.viewport(Math.round(b.x), Math.round(ph - b.y - b.h), Math.round(b.w), Math.round(b.h));
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.low);
    const flat = new Float32Array(48); cols.forEach((c, i) => flat.set(hexRgb01(c), i * 3));
    gl.uniform3fv(this.u('pal'), flat);
    gl.uniform1f(this.u('n'), cols.length);
    gl.uniform1f(this.u('mono'), pal.mono ? 1 : 0);
    gl.uniform1f(this.u('full'), pal.colors ? 0 : 1);
    gl.uniform1f(this.u('dith'), this.opts.dither ? 1 : 0);
    gl.uniform2f(this.u('low'), this.lw, this.lh);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  },
  // map a CSS colour to the nearest palette colour (for the sharp text layer)
  mapColor(c) {
    if (typeof c !== 'string') return c;
    const pal = this.palette(); if (!pal.colors) return c;
    const key = pal.key + c; let v = this.colorCache.get(key);
    if (v) return v;
    const g = this.lowG; const prev = g.fillStyle; g.fillStyle = c; const norm = g.fillStyle; g.fillStyle = prev;
    let r, gg, b, a = 1;
    if (norm[0] === '#') { [r, gg, b] = hexRgb01(norm); }
    else { const m = norm.match(/[\d.]+/g) || [0, 0, 0]; r = m[0] / 255; gg = m[1] / 255; b = m[2] / 255; a = m[3] == null ? 1 : +m[3]; }
    let best = pal.colors[0];
    if (pal.mono) {
      const l = 0.299 * r + 0.587 * gg + 0.114 * b, n = pal.colors.length;
      best = pal.colors[clamp(Math.round(l * (n - 1)), 0, n - 1)];
    } else {
      let bd = 1e9;
      for (const h of pal.colors) { const [pr, pg, pb] = hexRgb01(h), dd = 0.9 * (r - pr) ** 2 + 1.6 * (gg - pg) ** 2 + 0.5 * (b - pb) ** 2; if (dd < bd) { bd = dd; best = h; } }
    }
    if (a < 1) { const [pr, pg, pb] = hexRgb01(best); best = `rgba(${Math.round(pr * 255)},${Math.round(pg * 255)},${Math.round(pb * 255)},${a})`; }
    if (this.colorCache.size > 600) this.colorCache.clear();
    this.colorCache.set(key, best);
    return best;
  },
  replayText(c) {
    const b = this.box(), k = b.w / this.lw;
    const base = new DOMMatrix([k, 0, 0, k, b.x, b.y]);
    c.save(); c.beginPath(); c.rect(b.x, b.y, b.w, b.h); c.clip();
    for (const r of this.texts) {
      c.setTransform(base.multiply(r.m));
      c.font = r.font; c.textAlign = r.align; c.textBaseline = r.base; c.globalAlpha = r.a;
      if (r.op === 's') { c.lineWidth = r.lw; c.lineJoin = r.join; c.strokeStyle = this.mapColor(r.stroke); r.mw ? c.strokeText(r.s, r.x, r.y, r.mw) : c.strokeText(r.s, r.x, r.y); }
      else { c.fillStyle = this.mapColor(r.fill); r.mw ? c.fillText(r.s, r.x, r.y, r.mw) : c.fillText(r.s, r.x, r.y); }
    }
    c.restore(); c.globalAlpha = 1;
  },
  // scanlines that line up with the pixel rows, plus a soft vignette
  updateCrt() {
    const el = this.crt, on = this.opts.crt;
    if (!on) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
    const s = View.scale, row = (H * s) / this.lh;
    const css = `display:block;left:${View.ox}px;top:${View.oy}px;width:${W * s}px;height:${H * s}px;background-size:100% ${row}px;`;
    if (el._css !== css) { el._css = css; el.style.cssText = css; }
  }
};

// pixel-pass versions of the engine's render hooks
bgRS = () => Retro.ls;
// Cached sprites (like seed cards) keep their text out of the bitmap and redraw it live,
// so prices and labels end up on the sharp text layer too.
const textState = g => ({ m: g.getTransform(), font: g.font, fill: g.fillStyle, stroke: g.strokeStyle, lw: g.lineWidth, join: g.lineJoin, align: g.textAlign, base: g.textBaseline, a: g.globalAlpha });
const _sprGet = Sprites.get.bind(Sprites);
Sprites.get = function (key, box, drawFn) {
  let rec = null;
  const e = _sprGet(key, box, () => {
    const g = ctx; rec = [];
    g.fillText = (str, x, y, mw) => rec.push(Object.assign({ op: 'f', s: str, x, y, mw }, textState(g)));
    g.strokeText = (str, x, y, mw) => rec.push(Object.assign({ op: 's', s: str, x, y, mw }, textState(g)));
    drawFn();
  });
  if (rec) { e.texts = rec.length ? rec : null; e.rs = this.rs; }
  return e;
};
Sprites.draw = function (e, x, y) {
  ctx.drawImage(e.c, x + e.box.x, y + e.box.y, e.box.w, e.box.h);
  if (!e.texts) return;
  ctx.save();
  const base = ctx.getTransform().translate(x + e.box.x, y + e.box.y).scale(1 / e.rs);
  for (const r of e.texts) {
    ctx.setTransform(base.multiply(r.m));
    ctx.font = r.font; ctx.textAlign = r.align; ctx.textBaseline = r.base; ctx.globalAlpha *= r.a;
    if (r.op === 's') { ctx.lineWidth = r.lw; ctx.lineJoin = r.join; ctx.strokeStyle = r.stroke; ctx.strokeText(r.s, r.x, r.y); }
    else { ctx.fillStyle = r.fill; ctx.fillText(r.s, r.x, r.y); }
  }
  ctx.restore();
};
Sprites.flash = function (e, x, y, a = 0.5) {
  const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ga * a;
  ctx.drawImage(e.c, x + e.box.x, y + e.box.y, e.box.w, e.box.h);
  ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
};
Sprites.setScale = function () { if (Math.abs(this.rs - Retro.ls) > 0.001) { this.map.clear(); this.px = 0; this.rs = Retro.ls; } };
layerHook = name => {
  const covered = !!UI.overlay || !!App.fadeDir;
  if (name === 'scene') Retro.hi = !covered && !(App.scene === 'play' && G && Coach.active());
  else if (name === 'top') Retro.hi = !covered;
  else if (name === 'overlay') Retro.hi = !App.fadeDir;
  else Retro.hi = false;
};
renderFrame = function (t, dt) {
  const g = Retro.lowG;
  setCtx(g);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.fillStyle = '#1c2a12'; g.fillRect(0, 0, Retro.lw, Retro.lh);
  g.setTransform(Retro.lw / W, 0, 0, Retro.lh / H, 0, 0);
  g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
  Retro.texts.length = 0;
  drawAll(t, dt);
  g.restore();
  const c = mainCtx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
  if (!Retro.present()) { // no WebGL: plain pixel upscale, full colour
    const b = Retro.box(); c.fillStyle = '#101418'; c.fillRect(0, 0, canvas.width, canvas.height);
    c.imageSmoothingEnabled = false; c.drawImage(Retro.low, b.x, b.y, b.w, b.h);
  }
  setCtx(c);
  Retro.replayText(c);
  UI.flip();
  drawPortraitWarning(c, t);
  Retro.updateCrt();
};

// chiptune: square and triangle waves only, through a 4-bit crusher
WAVE_MAP = { sine: 'triangle', sawtooth: 'square' };
Snd.chain = (c, master, out) => {
  const ws = c.createWaveShaper(), n = 2048, curve = new Float32Array(n), steps = 12;
  for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curve[i] = Math.round(x * steps) / steps; }
  ws.curve = curve;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
  master.connect(ws); ws.connect(lp); lp.connect(out);
};

/* ---------- Retro Settings screen ---------- */
function cycleRow(id, x, y, w, label, value, onPrev, onNext) {
  rrect(x, y, w, 56, 12); fs('#f6ead0'); st(3);
  text(label, x + 22, y + 29, 24, { fill: '#3b2a14', stroke: false, align: 'left' });
  const vx = x + w - 170;
  roundBtn(id + 'p', vx - 30, y + 28, 20, () => { P(); ctx.moveTo(4, -9); ctx.lineTo(-6, 0); ctx.lineTo(4, 9); st(4, '#fff8e0'); }, () => { Snd.play('click'); onPrev(); });
  text(value, vx + 80, y + 29, 22, { fill: '#2f7a2c', stroke: false });
  roundBtn(id + 'n', vx + 190, y + 28, 20, () => { P(); ctx.moveTo(-4, -9); ctx.lineTo(6, 0); ctx.lineTo(-4, 9); st(4, '#fff8e0'); }, () => { Snd.play('click'); onNext(); });
}
const cyc = (list, cur, step) => list[(list.indexOf(cur) + step + list.length) % list.length];
EXTRA_OVERLAYS.retro = t => {
  const d = Save.data, o = Retro.opts;
  woodPanel(330, 40, 620, 640);
  text('Retro Settings', W / 2, 96, 46, { fill: '#5a3a1a', stroke: '#fff3d0', sw: 7 });
  const pal = Retro.palette(), px = RETRO_PIXELS.find(p => p.key === o.px);
  const keys = RETRO_PALETTES.map(p => p.key), pxs = RETRO_PIXELS.map(p => p.key), diffs = ['easy', 'normal', 'hard'];
  const setPal = s => { o.pal = cyc(keys, o.pal, s); Retro.colorCache.clear(); Save.write(); };
  const setPx = s => { o.px = cyc(pxs, o.px, s); Retro.applyPixels(); Save.write(); };
  const setDiff = s => { d.difficulty = cyc(diffs, d.difficulty || 'normal', s); Save.write(); };
  cycleRow('r_pal', 370, 130, 540, 'Colors', pal.name, () => setPal(-1), () => setPal(1));
  // palette swatches
  const cols = pal.colors || ['#e3263b', '#ff8a1e', '#ffd23a', '#7fd458', '#3a9a4a', '#5ab0f0', '#2a4a8a', '#8a4ab8', '#fff8e8', '#101418'];
  const sw = Math.min(32, 520 / cols.length);
  cols.forEach((c, i) => { rrect(380 + i * sw, 192, sw - 3, 16, 3); fs(c); });
  cycleRow('r_px', 370, 220, 540, 'Pixel size', `${px.name} ${px.w}x${px.h}`.replace('Classic 427x240', 'Classic'), () => setPx(-1), () => setPx(1));
  toggleRow('r_dith', 370, 288, 540, 'Dithering', o.dither, () => { o.dither = !o.dither; Save.write(); Snd.play('click'); });
  toggleRow('r_crt', 370, 352, 540, 'CRT scanlines', o.crt, () => { o.crt = !o.crt; Save.write(); Snd.play('click'); });
  cycleRow('r_diff', 370, 416, 540, 'Difficulty', { easy: 'Easy', normal: 'Normal', hard: 'Hard' }[d.difficulty || 'normal'], () => setDiff(-1), () => setDiff(1));
  toggleRow('r_shake', 370, 480, 540, 'Screen shake', d.shake !== false, () => { d.shake = d.shake === false; Save.write(); Snd.play('click'); });
  const dn = { easy: 'Zombies are weaker and slower, and you start with more dew.', normal: 'The standard challenge.', hard: 'Zombies are tougher and faster, and you start with less dew.' }[d.difficulty || 'normal'];
  ctx.font = `600 16px ${FONT_B}`; ctx.fillStyle = '#7a5a3a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(dn, W / 2, 556);
  plankBtn('r_done', 470, 590, 340, 62, 'Done', () => { Snd.play('click'); UI.overlay = 'options'; }, { size: 30, color: '#5aa83a' });
};
OPTIONS_EXTRA = { label: 'Retro Settings', open: () => { UI.overlay = 'retro'; } };
const _back = backAction;
backAction = function () { if (UI.overlay === 'retro') { UI.overlay = 'options'; return true; } return _back.apply(this, arguments); };

Retro.init();
