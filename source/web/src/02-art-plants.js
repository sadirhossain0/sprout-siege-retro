/* ===== Plant artwork. Origin = ground point under the plant, facing right. ~95px tall ===== */
const PLANT_ART = {};

function stemPath(x0, y0, cx, cy, x1, y1, w, c) { P(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); tube(w, c); }

// --- Dew Lily: lavender cup flower that cradles a glowing dew drop
PLANT_ART.lily = (s) => {
  const t = s.t || 0, glow = s.glow || 0;
  const sway = Math.sin(t * 1.8) * 0.06;
  leaf(-3, -3, 44, 12, Math.PI + 0.22, '#55b83f');
  leaf(3, -3, 46, 12, -0.2, '#62c74a');
  ctx.save(); ctx.rotate(sway);
  stemPath(0, -2, -7, -28, 0, -50, 6, '#5cbf45');
  leaf(-2, -30, 22, 7, Math.PI + 0.7, '#62c74a', false);
  ctx.translate(0, -62);
  const petal = (x, y, a, c) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    P(); ctx.moveTo(0, 12); ctx.quadraticCurveTo(-15, -8, 0, -30); ctx.quadraticCurveTo(15, -8, 0, 12); ctx.closePath();
    fs(lg(0, -30, 0, 12, [shade(c, 0.35), c])); st(3);
    ctx.restore();
  };
  petal(-19, -6, -0.65, '#a98cf5'); petal(19, -6, 0.65, '#a98cf5'); petal(0, -12, 0, '#b9a0ff');
  drawDew(0, -12, 12 + glow * 3 + Math.sin(t * 4) * 0.6, glow);
  P(); ctx.moveTo(-31, -15);
  ctx.quadraticCurveTo(-30, 18, 0, 21); ctx.quadraticCurveTo(30, 18, 31, -15);
  ctx.quadraticCurveTo(16, -3, 0, -8); ctx.quadraticCurveTo(-16, -3, -31, -15); ctx.closePath();
  fs(lg(0, -12, 0, 22, ['#f3ecff', '#c7b3ff', '#9c7fe8'])); st(3.5);
  P(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(-12, 8, -6, 16); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(90,60,160,.4)'; ctx.stroke();
  P(); ctx.moveTo(10, -5); ctx.quadraticCurveTo(12, 8, 6, 16); ctx.stroke();
  const blink = (t % 4.3) < 0.12;
  if (blink) { closedEye(-9, 4, 5.5); closedEye(10, 4, 5.5); }
  else { eye(-9, 4, 6.4, 0.3, 0.1); eye(10, 4, 6.4, 0.3, 0.1); }
  P(); ctx.arc(1, 11, 5, 0.15 * Math.PI, 0.85 * Math.PI); st(2.5);
  ell(-19, 10, 4, 2.5); ctx.fillStyle = 'rgba(255,120,160,.45)'; ctx.fill();
  ell(20, 10, 4, 2.5); ctx.fill();
  ctx.restore();
};

// --- Berry Blaster: leafy round bush that spits berries
function berryBall(x, y, r) {
  circ(x, y, r); fs(rg(x - r * 0.4, y - r * 0.4, 1, x, y, r * 1.2, ['#ff8a8a', '#e3263b', '#a3112a'])); st(2.6);
  circ(x - r * 0.35, y - r * 0.35, r * 0.28); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
}
PLANT_ART.berry = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  const bob = Math.sin(t * 3) * 1.5;
  leaf(-2, -4, 30, 9, Math.PI + 0.45, '#3f9a34');
  leaf(2, -4, 32, 9, -0.45, '#45a33a');
  stemPath(0, -2, -2, -14, 0, -22, 7, '#3f9a34');
  ctx.save();
  ctx.translate(0, -40 + bob);
  ctx.scale(1 + sh * 0.1, 1 - sh * 0.08);
  const blobs = [[0, 2, 29], [-20, -10, 17], [18, -13, 18], [-1, -24, 18], [21, 6, 15], [-22, 9, 15]];
  for (const b of blobs) { circ(b[0], b[1], b[2]); st(7); }
  const g = rg(-8, -14, 2, 0, 0, 40, ['#8be05c', '#4fb53a', '#2f7d2a']);
  for (const b of blobs) { circ(b[0], b[1], b[2]); fs(g); }
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ell(-12, -22, 9, 5, -0.4); ctx.fill();
  ctx.fillStyle = 'rgba(20,70,20,.22)';
  ell(-6, 22, 18, 6); ctx.fill();
  berryBall(-12, -33, 7.5); berryBall(5, -38, 8); berryBall(17, -28, 7);
  line(5, -45, 7, -51, 2.5, OUT);
  const blink = (t % 3.7) < 0.12;
  if (blink) { closedEye(-3, -4, 6.5); closedEye(15, -5, 6); }
  else { eye(-3, -4, 8, 0.8, 0); eye(15, -5, 7, 0.8, 0); }
  brow(-10, -15, 2, -13, 3); brow(10, -14, 21, -15, 3);
  const mr = 3.6 + sh * 3.6;
  ell(25, 9, mr * 0.9, mr); fs('#4a1410'); st(2.6);
  ctx.restore();
};

// --- Stumpy: a tough hollow stump
PLANT_ART.stump = (s) => {
  const hp = s.hpFrac == null ? 1 : s.hpFrac, t = s.t || 0;
  P();
  ctx.moveTo(-33, -80); ctx.lineTo(-36, -12);
  ctx.quadraticCurveTo(-44, -2, -52, 3); ctx.lineTo(-26, 3); ctx.quadraticCurveTo(-16, -3, -8, 3);
  ctx.lineTo(12, 3); ctx.quadraticCurveTo(22, -3, 30, 3); ctx.lineTo(53, 3);
  ctx.quadraticCurveTo(44, -3, 36, -12); ctx.lineTo(33, -80); ctx.closePath();
  fs(lg(-40, 0, 40, 0, ['#5c3818', '#a06a3a', '#8a5a2e', '#5c3818'])); st(3.6);
  ctx.strokeStyle = 'rgba(40,20,5,.45)'; ctx.lineWidth = 2;
  for (const x of [-24, -10, 6, 22]) { P(); ctx.moveTo(x, -74); ctx.bezierCurveTo(x - 3, -50, x + 4, -32, x - 1, -6); ctx.stroke(); }
  ell(0, -80, 33, 10); fs(lg(0, -90, 0, -70, ['#f2cc8a', '#d9a462'])); st(3.4);
  ctx.strokeStyle = 'rgba(120,70,25,.6)'; ctx.lineWidth = 1.6;
  ell(0, -80, 22, 6.5); ctx.stroke(); ell(0, -80, 12, 3.5); ctx.stroke();
  // sprout
  stemPath(-20, -82, -26, -96, -16, -104, 3, '#4fb53a');
  leaf(-16, -104, 16, 6, -0.4, '#62c74a', false);
  // damage
  if (hp < 0.66) {
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.5;
    P(); ctx.moveTo(18, -84); ctx.lineTo(12, -70); ctx.lineTo(18, -62); ctx.lineTo(13, -52); ctx.stroke();
  }
  if (hp < 0.33) {
    P(); ctx.moveTo(-30, -40); ctx.lineTo(-20, -34); ctx.lineTo(-26, -24); ctx.lineTo(-18, -16); ctx.stroke();
    P(); ctx.moveTo(26, -86); ctx.lineTo(34, -76); ctx.lineTo(33, -88); ctx.closePath(); fs('#3a220c');
  }
  // face
  const worried = hp < 0.5;
  const blink = (t % 5.1) < 0.13;
  if (blink) { closedEye(-11, -48, 7); closedEye(13, -48, 7); }
  else { eye(-11, -48, 8.5, 0.6, worried ? -0.3 : 0); eye(13, -48, 8.5, 0.6, worried ? -0.3 : 0); }
  if (worried) { brow(-19, -62, -6, -58, 3.4); brow(20, -62, 7, -58, 3.4); }
  else { brow(-19, -58, -4, -61, 3.6); brow(21, -58, 6, -61, 3.6); }
  P();
  if (worried) { ctx.moveTo(-6, -28); ctx.quadraticCurveTo(2, -34, 10, -28); }
  else { ctx.moveTo(-7, -31); ctx.lineTo(10, -31); }
  st(3);
  // mushroom
  P(); ctx.moveTo(38, 1); ctx.lineTo(39, -10); ctx.lineTo(44, -10); ctx.lineTo(45, 1); fst('#f5ead2', 2.4);
  P(); ctx.arc(41.5, -10, 9, Math.PI, 0); ctx.closePath(); fst('#e24b3b', 2.6);
  circ(38, -14, 1.8); fs('#fff'); circ(44, -15, 1.4); fs('#fff');
};

// --- Spore Puff: buried mushroom mine
PLANT_ART.puff = (s) => {
  const t = s.t || 0;
  if (!s.armed) {
    const prog = s.arm || 0;
    ell(0, -4, 30, 10); fs(lg(0, -14, 0, 6, ['#9a6c42', '#6e4826'])); st(3);
    for (const [x, y] of [[-18, -6], [14, -8], [4, -2], [-6, -9]]) { circ(x, y, 2.2); fs('#5a3a1c'); }
    const up = prog * 6;
    P(); ctx.arc(0, -8 - up, 15, Math.PI, 0); ctx.closePath();
    fs(lg(0, -24, 0, -8, ['#f3e3bf', '#d8bd8a'])); st(3);
    circ(-6, -14 - up, 2.6); fs('#b88c55'); circ(6, -17 - up, 2.2); fs('#b88c55');
    closedEye(-5, -10 - up, 3); closedEye(5, -10 - up, 3);
    if ((t % 2) < 1) { text('z', 18, -26 - up, 14, { fill: '#e8f0ff', sw: 3 }); }
    return;
  }
  const pulse = 1 + Math.sin(t * 7) * 0.035;
  ell(0, -2, 32, 9); fs('#6e4826'); st(3);
  ctx.save(); ctx.translate(0, -26); ctx.scale(pulse, 1 / pulse);
  ell(0, 0, 31, 26); fs(rg(-10, -12, 2, 0, 0, 36, ['#fff6dc', '#ecd3a0', '#bf9459'])); st(3.6);
  for (const [x, y, r] of [[-17, -8, 4.5], [14, -14, 3.6], [20, 4, 3], [-4, -19, 3]]) { ell(x, y, r, r * 0.8); fs('#a77a43'); }
  const g = (Math.sin(t * 6) + 1) / 2;
  circ(0, -24, 5 + g * 2); fs(`rgba(190,255,90,${0.5 + g * 0.5})`); st(2.4);
  eye(-9, 0, 6.5, 0.5, 0); eye(9, 0, 6.5, 0.5, 0);
  brow(-15, -9, -4, -7, 3); brow(15, -9, 4, -7, 3);
  P(); ctx.moveTo(-8, 10); ctx.quadraticCurveTo(0, 17, 9, 10); ctx.closePath(); fst('#4a2410', 2.4);
  ctx.restore();
};

// --- Frost Fern: icy fern that blows frozen shards
PLANT_ART.frost = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  const frond = (ang, len) => {
    ctx.save(); ctx.rotate(ang);
    for (let i = 1; i <= 5; i++) {
      const k = i / 6, y = -len * k, l = 17 * (1 - k * 0.55);
      leaf(0, y, l, 5.5, -0.55, '#62d6ca', false, 2.2);
      leaf(0, y, l, 5.5, Math.PI + 0.55, '#4fc4b8', false, 2.2);
    }
    P(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.1, -len * 0.5, 0, -len); tube(2.5, '#2f9e98');
    leaf(0, -len, 12, 5, -Math.PI / 2, '#8be8de', false, 2.2);
    ctx.restore();
  };
  frond(-0.85, 44); frond(0.85, 44); frond(-0.35, 50); frond(0.35, 50);
  stemPath(0, 0, -4, -24, 0, -42, 6, '#2f9e98');
  ctx.save(); ctx.translate(0, -58 + Math.sin(t * 2.4) * 1.5);
  ctx.scale(1 + sh * 0.08, 1 - sh * 0.06);
  for (const [x, a, h] of [[-12, -0.4, 20], [0, 0, 26], [12, 0.4, 20]]) {
    ctx.save(); ctx.translate(x, -14); ctx.rotate(a);
    P(); ctx.moveTo(-6, 4); ctx.lineTo(0, -h); ctx.lineTo(6, 4); ctx.closePath();
    fs(lg(0, -h, 0, 4, ['#ffffff', '#9fe6ff'])); st(2.6); ctx.restore();
  }
  ell(0, 0, 26, 23); fs(rg(-8, -8, 2, 0, 0, 30, ['#ffffff', '#bdefff', '#5fc4ef'])); st(3.6);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ell(-11, -10, 6, 3.5, -0.5); ctx.fill();
  eye(-3, -2, 7, 0.8, 0, { iris: '#2a7fd4' }); eye(13, -3, 6.5, 0.8, 0, { iris: '#2a7fd4' });
  brow(-10, -12, 2, -11, 2.8); brow(9, -12, 19, -13, 2.8);
  ell(24, 7, 3 + sh * 3, 3.5 + sh * 3); fs('#1d4f7a'); st(2.2);
  ctx.restore();
  if ((t * 3) % 1 < 0.5) { ctx.fillStyle = 'rgba(255,255,255,.85)'; circ(-22, -70 + Math.sin(t) * 4, 2); ctx.fill(); circ(26, -40 + Math.cos(t) * 4, 1.6); ctx.fill(); }
};

// --- Boom Gourd: explosive striped gourd
PLANT_ART.gourd = (s) => {
  const t = s.t || 0, f = s.fuse || 0;
  const shake = f > 0 ? Math.sin(t * 70) * 3 * f : 0;
  const sw = 1 + f * 0.22;
  ctx.save(); ctx.translate(shake, 0);
  ctx.scale(sw, sw);
  const base = f > 0 ? lerpColor('#f28c28', '#e8321e', f) : '#f28c28';
  circ(0, -30, 30); st(7.2); circ(0, -62, 18); st(7.2);
  circ(0, -30, 30); fs(rg(-10, -42, 2, 0, -30, 36, [shade(base, 0.35), base, shade(base, -0.3)]));
  circ(0, -62, 18); fs(rg(-6, -68, 1, 0, -62, 22, [shade(base, 0.35), base, shade(base, -0.25)]));
  ctx.strokeStyle = 'rgba(120,40,0,.45)'; ctx.lineWidth = 2.4;
  for (const k of [-0.5, 0, 0.5]) {
    P(); ctx.moveTo(k * 22, -58); ctx.quadraticCurveTo(k * 48, -30, k * 22, -2); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ell(-12, -44, 7, 4, -0.6); ctx.fill();
  P(); ctx.moveTo(0, -78); ctx.bezierCurveTo(2, -90, 12, -90, 10, -84); tube(4, '#7a5a2a');
  leaf(2, -80, 18, 7, -2.6, '#55b83f', false);
  if (f > 0 && (t * 20) % 2 < 1) { circ(10, -86, 5); fs('#fff3a0'); }
  eye(-11, -34, 8, 0.4, 0); eye(11, -34, 8, 0.4, 0);
  brow(-20, -47, -5, -41, 3.6); brow(20, -47, 5, -41, 3.6);
  P(); ctx.moveTo(-12, -18); ctx.lineTo(12, -18); ctx.lineTo(9, -11); ctx.lineTo(-9, -11); ctx.closePath(); fst('#fff', 2.6);
  line(-4, -18, -3, -11, 2, OUT); line(4, -18, 3, -11, 2, OUT);
  ctx.restore();
};
function lerpColor(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t, 0, 1)).toString(16).padStart(2, '0')).join('');
}

// --- Snapjaw: a hungry trap plant
PLANT_ART.snap = (s) => {
  const t = s.t || 0, mode = s.mode || 'idle', p = s.p || 0;
  leaf(-2, -3, 36, 10, Math.PI + 0.3, '#4caf3a');
  leaf(2, -3, 32, 9, -0.35, '#4caf3a');
  let open = 0.5 + Math.sin(t * 2.2) * 0.06, chew = 0, lean = 0;
  if (mode === 'snap') { if (p < 0.45) { open = 0.5 + p * 1.2; lean = p * 18; } else { open = Math.max(0, 1.04 * (1 - (p - 0.45) / 0.2)); lean = 18 * (1 - (p - 0.45) / 0.55); } }
  if (mode === 'chew') { open = 0.03; chew = Math.sin(t * 9) * 0.5 + 0.5; }
  stemPath(0, -2, -14, -34, -6 + lean * 0.5, -54, 6.5, '#45a33a');
  ctx.save(); ctx.translate(-8 + lean, -58);
  const lobe = (up) => {
    ctx.save(); ctx.scale(1, up ? 1 : -1); ctx.rotate(-open * (up ? 1 : 0.7));
    // bristles
    ctx.strokeStyle = OUT; ctx.lineWidth = 2.2;
    for (let i = 0; i < 6; i++) { const x = 14 + i * 7.5; const y = -2 - Math.sin(i / 5 * Math.PI) * 4; P(); ctx.moveTo(x, y); ctx.lineTo(x + 5, y + 9); ctx.stroke(); }
    P(); ctx.moveTo(0, 0); ctx.bezierCurveTo(6, -34, 44, -36, 56, -4); ctx.quadraticCurveTo(28, 2, 0, 0); ctx.closePath();
    fs(lg(0, -30, 0, 0, ['#7fd458', '#3f9a34'])); st(3.4);
    P(); ctx.moveTo(6, -2); ctx.quadraticCurveTo(30, -12, 53, -5); ctx.quadraticCurveTo(28, 1, 6, -2); ctx.closePath(); fs(col('#e5455b'));
    ctx.restore();
  };
  lobe(false);
  if (mode === 'chew') { ell(26, 10 + chew * 2, 20, 10 + chew * 3); fs(lg(0, 0, 0, 22, ['#56b83e', '#3a8f2f'])); st(3); }
  lobe(true);
  const ey = -16 - open * 26;
  ctx.save(); ctx.rotate(-open * 0.5);
  eye(22, -22, 7.5, 0.7, 0.3); eye(36, -20, 6.5, 0.7, 0.3);
  brow(15, -32, 28, -28, 3); brow(32, -29, 43, -27, 3);
  ctx.restore();
  ctx.restore();
  void ey;
};

// --- Twin Thistle: double-shot spiky thistle
PLANT_ART.thistle = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  const spikyLeaf = (x, y, a, len) => {
    leaf(x, y, len, 8, a, '#45a85a', true, 2.6);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    for (let i = 1; i <= 3; i++) {
      const px = len * i / 4.2, w = 8 * Math.sin(Math.PI * px / len) * 0.75;
      line(px, -w, px + 5, -w - 5, 2.2, OUT); line(px, w, px + 5, w + 5, 2.2, OUT);
    }
    ctx.restore();
  };
  spikyLeaf(-2, -6, Math.PI + 0.35, 38); spikyLeaf(2, -6, -0.35, 38);
  stemPath(0, -2, 4, -22, 0, -36, 6, '#3e9b4a');
  spikyLeaf(0, -26, Math.PI + 0.9, 22); spikyLeaf(0, -28, -0.8, 20);
  ctx.save(); ctx.translate(0, -54 + Math.sin(t * 3.1) * 1.2);
  ctx.scale(1 + sh * 0.08, 1 - sh * 0.06);
  // purple tuft
  for (let i = -6; i <= 6; i++) {
    const a = i * 0.13 - Math.PI / 2 + Math.sin(t * 3 + i) * 0.03 - sh * 0.15;
    const len = 30 + (6 - Math.abs(i)) * 2;
    P(); ctx.moveTo(0, -12); ctx.lineTo(Math.cos(a) * len, -12 + Math.sin(a) * len); tube(3.5, i % 2 ? '#a34fd6' : '#c77cf0');
  }
  ell(0, 2, 24, 22); fs(rg(-8, -6, 2, 0, 2, 28, ['#9be07a', '#4caf50', '#2c7a39'])); st(3.6);
  ctx.strokeStyle = 'rgba(20,60,20,.5)'; ctx.lineWidth = 1.8;
  for (const [x, y] of [[-12, 12], [0, 15], [12, 12], [-15, 0], [15, 0], [-6, -9], [8, -10]]) { P(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x, y); ctx.lineTo(x + 3, y - 3); ctx.stroke(); }
  eye(-4, 0, 7, 0.8, 0, { iris: '#6b2fa3' }); eye(12, -1, 6.5, 0.8, 0, { iris: '#6b2fa3' });
  brow(-11, -9, 1, -11, 3); brow(7, -11, 18, -9, 3);
  ell(22, 9, 3 + sh * 2.5, 3.5 + sh * 2.5); fs('#3b1452'); st(2.2);
  ctx.restore();
};

// --- Thorn Carpet: bramble mat that pricks bugs walking over it
PLANT_ART.thorn = (s) => {
  const t = s.t || 0, a = s.attack || 0;
  ell(0, -6, 46, 11); fs(lg(0, -16, 0, 4, ['#4f8a2c', '#2f5e1d'])); st(3.2);
  ctx.strokeStyle = col('#6b4423'); ctx.lineWidth = 4;
  P(); ctx.moveTo(-40, -4); ctx.bezierCurveTo(-20, -16, 0, 4, 20, -10); ctx.bezierCurveTo(30, -14, 38, -8, 42, -4); ctx.stroke();
  P(); ctx.moveTo(-36, -10); ctx.bezierCurveTo(-14, 0, 10, -16, 36, -6); ctx.stroke();
  const h = 9 + a * 8;
  for (let i = 0; i < 9; i++) {
    const x = -38 + i * 9.5, y = -8 - Math.sin(i * 1.7) * 3;
    P(); ctx.moveTo(x - 4, y); ctx.lineTo(x, y - h + Math.sin(t * 4 + i) * 1.2); ctx.lineTo(x + 4, y); ctx.closePath();
    fs(lg(x, y - h, x, y, ['#fff1c7', '#c79a5a'])); st(2.2);
  }
  eye(-7, -10, 4.5, 0.6, 0); eye(6, -10, 4.5, 0.6, 0);
  brow(-12, -16, -3, -15, 2.4); brow(11, -16, 2, -15, 2.4);
};

// --- Fire Pepper: torches its whole row
PLANT_ART.pepper = (s) => {
  const t = s.t || 0, f = s.fuse || 0;
  const shake = f > 0 ? Math.sin(t * 60) * 3 * f : 0;
  ctx.save(); ctx.translate(shake, 0);
  if (f > 0) { circ(0, -40, 42 + f * 12); ctx.fillStyle = `rgba(255,140,40,${0.25 * f})`; ctx.fill(); }
  const sc = 1 + f * 0.15; ctx.scale(sc, sc);
  P(); ctx.moveTo(-18, -70);
  ctx.bezierCurveTo(-30, -40, -22, -12, 2, -4);
  ctx.bezierCurveTo(14, 0, 22, -6, 18, -14);
  ctx.bezierCurveTo(14, -6, 6, -10, 8, -20);
  ctx.bezierCurveTo(16, -40, 22, -58, 16, -72);
  ctx.quadraticCurveTo(0, -80, -18, -70); ctx.closePath();
  const base = f > 0 ? lerpColor('#e8261f', '#ff8a1e', f) : '#e8261f';
  fs(lg(-24, 0, 22, 0, [shade(base, -0.25), base, shade(base, 0.25), shade(base, -0.2)])); st(3.6);
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ell(-12, -48, 3.5, 12, 0.15); ctx.fill();
  P(); ctx.moveTo(-20, -72); ctx.quadraticCurveTo(-8, -64, 0, -72); ctx.quadraticCurveTo(10, -64, 18, -73); ctx.quadraticCurveTo(2, -86, -20, -72); ctx.closePath(); fst('#45a33a', 3);
  P(); ctx.moveTo(0, -78); ctx.quadraticCurveTo(2, -92, 12, -94); tube(3.5, '#3e8f30');
  eye(-9, -50, 6.8, 0.5, 0); eye(7, -52, 6.8, 0.5, 0);
  brow(-17, -60, -4, -56, 3.4); brow(15, -63, 3, -58, 3.4);
  P(); ctx.moveTo(-10, -36); ctx.quadraticCurveTo(-1, -42, 8, -38); st(3);
  ctx.restore();
};

const PLANTS = {
  lily: { name: 'Dew Lily', cost: 50, recharge: 7.5, hp: 300, desc: 'Gathers extra dew for you. Plant lots of these early!', stat: 'Dew: +25 every 24s' },
  berry: { name: 'Berry Blaster', cost: 100, recharge: 7.5, hp: 300, desc: 'A loyal bush that spits berries at zombies in its row.', stat: 'Damage: medium' },
  stump: { name: 'Stumpy', cost: 50, recharge: 30, hp: 4000, desc: 'A stubborn old stump. Zombies chew on it for ages.', stat: 'Toughness: very high' },
  puff: { name: 'Spore Puff', cost: 25, recharge: 30, hp: 300, desc: 'Buried mushroom. Takes 12 seconds to wake up, then bursts on the first zombie that touches it.', stat: 'Damage: huge, one zombie' },
  frost: { name: 'Frost Fern', cost: 175, recharge: 7.5, hp: 300, desc: 'Blows ice shards that slow zombies down.', stat: 'Slows zombies by half' },
  gourd: { name: 'Boom Gourd', cost: 150, recharge: 45, hp: 9999, desc: 'Swells up and explodes, blasting every zombie in a 3x3 area.', stat: 'Damage: massive, 3x3' },
  snap: { name: 'Snapjaw', cost: 150, recharge: 7.5, hp: 300, desc: 'Swallows a zombie in one bite, then needs a while to chew.', stat: 'Eats one zombie at a time' },
  thistle: { name: 'Twin Thistle', cost: 200, recharge: 7.5, hp: 300, desc: 'Fires two spines every volley.', stat: 'Damage: double' },
  thorn: { name: 'Thorn Carpet', cost: 100, recharge: 7.5, hp: 300, desc: 'A prickly mat. Zombies walk right over it and get hurt. Brute Zombies stomp it flat.', stat: 'Hits all zombies on it' },
  pepper: { name: 'Fire Pepper', cost: 125, recharge: 45, hp: 9999, desc: 'Bursts into flames that sweep its whole row.', stat: 'Damage: massive, full row' }
};
const PLANT_ORDER = ['lily', 'berry', 'stump', 'puff', 'frost', 'gourd', 'snap', 'thistle', 'thorn', 'pepper'];

// --- Thorn Rose: fires piercing thorns
PLANT_ART.rose = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  leaf(-2, -4, 30, 9, Math.PI + 0.4, '#3f9a34'); leaf(2, -4, 30, 9, -0.4, '#45a33a');
  P(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(-8, -26, 0, -46); tube(6, '#3f9a34');
  for (const [x, y, d] of [[-4, -16, -1], [-3, -30, 1], [-5, -38, -1]]) { P(); ctx.moveTo(x, y); ctx.lineTo(x + d * 8, y - 3); ctx.lineTo(x, y - 5); ctx.closePath(); fst('#c9b27a', 1.6); }
  leaf(-3, -30, 18, 6, Math.PI + 0.9, '#5cbf45', false);
  ctx.save(); ctx.translate(0, -60 + Math.sin(t * 2.6) * 1.4); ctx.scale(1 + sh * 0.08, 1 - sh * 0.06);
  for (const [a, r] of [[0, 26], [1.25, 24], [2.5, 25], [3.75, 24], [5, 25]]) { ell(Math.cos(a) * 9, Math.sin(a) * 8, r * 0.62, r * 0.48, a); fs(lg(0, -20, 0, 20, ['#ff6b7a', '#d8233a'])); st(2.8); }
  circ(0, 0, 17); fs(rg(-5, -6, 2, 0, 0, 20, ['#ff8a96', '#e8304a', '#b01a30'])); st(3);
  P(); for (let a = 0; a < 9; a += 0.25) { const r = 3 + a * 1.4; ctx.lineTo(Math.cos(a + 1) * r * 0.9, Math.sin(a + 1) * r * 0.75 - 4); } ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(110,10,25,.45)'; ctx.stroke();
  eye(-6, 2, 5.6, 0.8, 0); eye(7, 1, 5.2, 0.8, 0);
  brow(-11, -5, -2, -4, 2.6); brow(3, -5, 11, -6, 2.6);
  ell(15, 8, 2.6 + sh * 2, 3 + sh * 2); fst('#5a0a14', 2);
  ctx.restore();
};
// --- Ivy Snare: a coiled ground trap
PLANT_ART.snare = (s) => {
  const t = s.t || 0;
  ell(0, -4, 40, 10); fs(lg(0, -14, 0, 6, ['#5a8a34', '#3a6a24'])); st(3);
  ctx.strokeStyle = col('#2f6a1e'); ctx.lineWidth = 4;
  P(); for (let a = 0; a < TAU * 2.2; a += 0.2) { const r = 4 + a * 4.6; ctx.lineTo(Math.cos(a) * r, -5 + Math.sin(a) * r * 0.22); } ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + Math.sin(t * 2 + i) * 0.08, r = 12 + i * 4;
    const x = Math.cos(a) * r, y = -6 + Math.sin(a) * r * 0.22;
    ctx.save(); ctx.translate(x, y); ctx.rotate(-1.2 + Math.sin(t * 3 + i) * 0.2);
    P(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-7, -6, -4, -13, 0, -9); ctx.bezierCurveTo(4, -13, 7, -6, 0, 0); fst('#7fd458', 2); ctx.restore();
  }
  eye(-6, -10, 4.2, 0.4, 0); eye(5, -10, 4.2, 0.4, 0);
  brow(-10, -15, -3, -16, 2.2); brow(9, -15, 2, -16, 2.2);
};
// --- Breeze Bloom: a puffball that blows zombies back
PLANT_ART.breeze = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  leaf(-2, -4, 30, 9, Math.PI + 0.35, '#4caf3a'); leaf(2, -4, 30, 9, -0.35, '#55b83f');
  P(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(5, -24, 0, -42); tube(5, '#4caf3a');
  ctx.save(); ctx.translate(0, -62 + Math.sin(t * 2) * 1.5);
  for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; const r = 25 + Math.sin(i * 3.1 + t * 2) * 1.5; line(Math.cos(a) * 12, Math.sin(a) * 12, Math.cos(a) * r, Math.sin(a) * r, 2, '#d8dee8'); circ(Math.cos(a) * r, Math.sin(a) * r, 2.4); fs('#ffffff'); }
  circ(0, 0, 18); fs(rg(-5, -6, 2, 0, 0, 22, ['#ffffff', '#eef2f6', '#c8d0da'])); st(3);
  eye(-6, -2, 5.4, 0.8, 0); eye(7, -3, 5, 0.8, 0);
  const puff = 1 + sh * 0.6;
  ell(-12, 6, 5 * puff, 4 * puff); ctx.fillStyle = 'rgba(255,140,170,.55)'; ctx.fill();
  ell(16, 6, 3 + sh * 3, 2.5 + sh * 2.5); fst('#6a3040', 2);
  ctx.restore();
};
// --- Chestnut Lobber: spiky burr that lobs chestnuts over shields
function chestnut(x, y, r) {
  circ(x, y, r); fs(rg(x - r * 0.3, y - r * 0.4, 1, x, y, r * 1.2, ['#c88a52', '#8a4e22', '#5a2e12'])); st(2.4);
  ell(x, y + r * 0.45, r * 0.75, r * 0.4); fs('rgba(230,200,150,.75)');
}
PLANT_ART.lobber = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  leaf(-2, -4, 32, 10, Math.PI + 0.4, '#3f9a34'); leaf(2, -4, 32, 10, -0.4, '#45a33a');
  P(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(-4, -18, 0, -30); tube(8, '#3f9a34');
  ctx.save(); ctx.translate(0, -50 + Math.sin(t * 2.2) * 1.2); ctx.rotate(-0.25 - sh * 0.3); ctx.scale(1 - sh * 0.06, 1 + sh * 0.08);
  for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; P(); ctx.moveTo(Math.cos(a - 0.12) * 22, Math.sin(a - 0.12) * 22); ctx.lineTo(Math.cos(a) * 31, Math.sin(a) * 31); ctx.lineTo(Math.cos(a + 0.12) * 22, Math.sin(a + 0.12) * 22); ctx.closePath(); fst('#8ccf4a', 1.6); }
  circ(0, 0, 23); fs(rg(-7, -8, 2, 0, 0, 28, ['#b8ef7a', '#6fbf3a', '#3f8a24'])); st(3.2);
  P(); ctx.arc(0, -8, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.closePath(); fs('#3a1a0a'); st(2.4);
  if (sh < 0.3) chestnut(0, -13, 7);
  eye(-9, 4, 6, 0.4, -0.3); eye(8, 4, 5.6, 0.4, -0.3);
  brow(-14, -3, -4, -2, 2.6); brow(13, -3, 4, -2, 2.6);
  ctx.restore();
};
Object.assign(PLANTS, {
  rose: { name: 'Thorn Rose', cost: 125, recharge: 7.5, hp: 300, desc: 'Fires long thorns that pierce through every zombie in its row.', stat: 'Hits the whole row' },
  snare: { name: 'Ivy Snare', cost: 75, recharge: 20, hp: 300, desc: 'A ground trap. It grabs the first zombie that steps on it and holds it still for 6 seconds.', stat: 'Holds a zombie' },
  breeze: { name: 'Breeze Bloom', cost: 100, recharge: 10, hp: 300, desc: 'Blows a gust down its row every few seconds, pushing zombies back and making them let go of plants.', stat: 'Pushes zombies back' },
  lobber: { name: 'Chestnut Lobber', cost: 150, recharge: 7.5, hp: 300, desc: 'Lobs spiky chestnuts in a high arc, right over lids and other shields.', stat: 'Ignores shields' }
});
PLANT_ORDER.push('rose', 'snare', 'breeze', 'lobber');

// --- Moon Mushroom: small glowing mushroom that makes a little dew
PLANT_ART.moonshroom = (s) => {
  const t = s.t || 0, g = (Math.sin(t * 2.2) + 1) / 2;
  circ(0, -26, 26 + g * 4); ctx.fillStyle = `rgba(160,220,255,${0.18 + g * 0.12})`; ctx.fill();
  rrect(-8, -26, 16, 26, 6); fs(lg(0, -26, 0, 0, ['#f4f0ff', '#cfc4ea'])); st(3);
  P(); ctx.arc(0, -26, 24, Math.PI, 0); ctx.quadraticCurveTo(0, -18, -24, -26); ctx.closePath();
  fs(rg(-6, -40, 2, 0, -30, 30, ['#e8f4ff', '#8fb8f0', '#5a6ad0'])); st(3.2);
  for (const [x, y, r] of [[-12, -34, 3.4], [6, -40, 3], [14, -30, 2.6]]) { circ(x, y, r); fs(`rgba(255,255,220,${0.6 + g * 0.4})`); }
  const blink = (t % 3.9) < 0.12;
  if (blink) { closedEye(-4, -15, 3.6); closedEye(5, -15, 3.6); } else { eye(-4, -15, 4.2, 0.2, 0.2); eye(5, -15, 4.2, 0.2, 0.2); }
  P(); ctx.arc(0.5, -9, 3, 0.15 * Math.PI, 0.85 * Math.PI); st(2);
};
// --- Popcorn Pod: pops kernels that bounce between zombies
PLANT_ART.popcorn = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  leaf(-2, -4, 32, 10, Math.PI + 0.35, '#7ab848'); leaf(2, -4, 32, 10, -0.35, '#86c450');
  P(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(-4, -18, 0, -30); tube(7, '#7ab848');
  ctx.save(); ctx.translate(0, -54 + Math.sin(t * 2.6) * 1.2); ctx.scale(1 + sh * 0.08, 1 - sh * 0.07);
  for (const a of [-0.9, 0.9]) { ctx.save(); ctx.rotate(a * 0.45); P(); ctx.moveTo(0, 24); ctx.quadraticCurveTo(a * 34, 4, a * 12, -30); ctx.quadraticCurveTo(a * 8, 0, 0, 24); ctx.closePath(); fs(lg(0, -30, 0, 24, ['#b8e07a', '#6fa83a'])); st(2.8); ctx.restore(); }
  ell(0, 0, 17, 25); fs(lg(0, -25, 0, 25, ['#ffe680', '#f0b020'])); st(3);
  ctx.fillStyle = 'rgba(200,120,0,.35)'; for (let y = -18; y < 20; y += 7) for (let x = -10; x <= 10; x += 7) { ell(x + (y % 14 ? 3 : 0), y, 2.6, 2); ctx.fill(); }
  for (const [x, y] of [[-8, -26], [4, -30], [12, -22]]) { circ(x, y, 6); fst('#fffaf0', 2); }
  eye(-5, -2, 5.6, 0.8, 0); eye(8, -3, 5.2, 0.8, 0);
  brow(-11, -10, -1, -9, 2.6); brow(4, -10, 13, -11, 2.6);
  ell(15, 8, 2.6 + sh * 2, 3 + sh * 2); fst('#7a3a10', 2);
  ctx.restore();
};
// --- Bramble Hedge: a tough thorny wall that hurts zombies that bite it
PLANT_ART.hedge = (s) => {
  const hp = s.hpFrac == null ? 1 : s.hpFrac, t = s.t || 0;
  const blobs = [[-20, -22, 20], [0, -26, 24], [20, -22, 20], [-12, -50, 20], [12, -52, 21], [0, -72, 17]];
  for (const b of blobs) { circ(b[0], b[1], b[2]); st(7); }
  for (const b of blobs) { circ(b[0], b[1], b[2]); fs(rg(-8, -60, 4, 0, -40, 60, ['#7fd458', '#3f8f34', '#26602a'])); }
  ctx.strokeStyle = col('#5a3a1a'); ctx.lineWidth = 3;
  P(); ctx.moveTo(-30, -14); ctx.bezierCurveTo(-10, -40, 10, -10, 30, -40); ctx.stroke();
  P(); ctx.moveTo(-26, -56); ctx.bezierCurveTo(-4, -36, 14, -70, 26, -50); ctx.stroke();
  for (const [x, y, a] of [[-24, -8, -2.2], [26, -10, -0.9], [-30, -40, -2.6], [30, -36, -0.5], [-16, -76, -2.1], [16, -78, -1.0], [0, -90, -1.57], [-6, -44, -1.9], [10, -30, -1.2]]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); P(); ctx.moveTo(-3, 0); ctx.lineTo(0, -9); ctx.lineTo(3, 0); ctx.closePath(); fst('#fff1c7', 1.6); ctx.restore();
  }
  if (hp < 0.5) { ctx.fillStyle = 'rgba(60,40,10,.35)'; ell(14, -30, 9, 6); ctx.fill(); ell(-12, -60, 7, 5); ctx.fill(); }
  const blink = (t % 4.6) < 0.12;
  if (blink) { closedEye(-9, -42, 5.5); closedEye(9, -42, 5.5); } else { eye(-9, -42, 6.5, 0.7, hp < 0.5 ? -0.3 : 0); eye(9, -42, 6.5, 0.7, hp < 0.5 ? -0.3 : 0); }
  brow(-16, -52, -4, -48, 3); brow(16, -52, 4, -48, 3);
  P(); ctx.moveTo(-6, -28); ctx.quadraticCurveTo(0, -24, 7, -28); st(2.6);
};
// --- Sprinkler Bloom: sprays water all around it
PLANT_ART.sprinkler = (s) => {
  const t = s.t || 0, sh = s.shoot || 0;
  leaf(-2, -4, 34, 10, Math.PI + 0.3, '#4caf3a'); leaf(2, -4, 34, 10, -0.3, '#55b83f');
  P(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(4, -22, 0, -40); tube(6, '#4caf3a');
  ctx.save(); ctx.translate(0, -58); ctx.rotate(sh * 0.6 + Math.sin(t * 1.6) * 0.05);
  for (let k = 0; k < 8; k++) { ctx.save(); ctx.rotate(k * TAU / 8); P(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(-11, -26, 0, -32); ctx.quadraticCurveTo(11, -26, 0, -10); ctx.closePath(); fs(lg(0, -32, 0, -10, ['#bfe8ff', '#58b8f0'])); st(2.4); ctx.restore(); }
  ctx.restore();
  ctx.save(); ctx.translate(0, -58);
  circ(0, 0, 15); fs(rg(-4, -5, 1, 0, 0, 17, ['#ffffff', '#cfd8e0', '#8a96a4'])); st(3);
  for (let k = 0; k < 6; k++) { circ(Math.cos(k * 1.05) * 9, Math.sin(k * 1.05) * 9, 1.8); fs('#4a5a6a'); }
  eye(-5, -2, 4.6, 0.6, 0); eye(5, -2, 4.6, 0.6, 0);
  P(); ctx.arc(0, 4, 4, 0.15 * Math.PI, 0.85 * Math.PI); st(2);
  ctx.restore();
  if (sh > 0) for (let k = 0; k < 10; k++) { const a = k * TAU / 10 + t; circ(Math.cos(a) * (30 + (1 - sh) * 40), -58 + Math.sin(a) * (20 + (1 - sh) * 26), 3); ctx.fillStyle = `rgba(120,200,255,${sh})`; ctx.fill(); }
};
Object.assign(PLANTS, {
  moonshroom: { name: 'Moon Mushroom', cost: 25, recharge: 7.5, hp: 300, desc: 'A cheap little mushroom that makes a small dew drop every 15 seconds. Great at night.', stat: 'Dew: +15 every 15s' },
  popcorn: { name: 'Popcorn Pod', cost: 150, recharge: 7.5, hp: 300, desc: 'Pops kernels that bounce from one zombie to the next, hitting up to three.', stat: 'Bounces between zombies' },
  hedge: { name: 'Bramble Hedge', cost: 125, recharge: 25, hp: 2400, desc: 'A sturdy thorny hedge. Zombies that bite it get pricked the whole time.', stat: 'Tough, hurts biters' },
  sprinkler: { name: 'Sprinkler Bloom', cost: 175, recharge: 7.5, hp: 300, desc: 'Sprays water in every direction, splashing all zombies in the squares around it.', stat: 'Hits a 3x3 area' }
});
PLANT_ORDER.push('moonshroom', 'popcorn', 'hedge', 'sprinkler');
