/* ===== Zombie artwork: chunky cartoon garden zombies (original designs).
   Origin = ground point between the feet, facing LEFT. Each one has something growing on its head. ===== */
const BUG_ART = {};

function zLimb(x0, y0, a1, l1, a2, l2, w, c) {
  const x1 = x0 + Math.cos(a1) * l1, y1 = y0 + Math.sin(a1) * l1;
  const x2 = x1 + Math.cos(a2) * l2, y2 = y1 + Math.sin(a2) * l2;
  P(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); tube(w, c);
  return [x2, y2, x1, y1];
}
function zMitten(x, y, skin, ang, r = 7.5) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ell(-2, 0, r, r * 0.85); fst(skin, 2.6);
  for (const dy of [-0.45, 0.05, 0.55]) { ell(-r - 1.5, dy * r, r * 0.42, r * 0.3); fst(skin, 2); }
  ctx.restore();
}
function zShoe(x, y, c) { ell(x - 5, y - 4, 13, 7.5); fs(lg(0, y - 11, 0, y + 3, [shade(c, 0.25), c])); st(2.8); }

// things growing out of the zombies' heads
const Z_TOPS = {
  mushroom(t) { rrect(-3, -14, 6, 12, 2); fst('#f5ead2', 2.2); P(); ctx.arc(0, -14, 11, Math.PI, 0); ctx.closePath(); fst('#e24b3b', 2.6); circ(-4, -18, 2); fs('#fff'); circ(4, -20, 1.6); fs('#fff'); },
  dandelion(t) { P(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-4, -12, 1, -22); tube(2, '#5cbf45'); circ(1, -27, 8); fs('rgba(255,255,255,.9)'); st(1.6, 'rgba(36,24,12,.5)'); },
  sprout(t) { P(); ctx.moveTo(0, 0); ctx.lineTo(0, -12); tube(2.4, '#4fb53a'); leaf(0, -12, 13, 5, -0.6 + Math.sin(t * 3) * 0.1, '#7fd458', false, 2); leaf(0, -10, 11, 4.5, Math.PI + 0.7, '#62c74a', false, 2); },
  daisy(t) { P(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(3, -8, 0, -16); tube(2, '#4fb53a'); for (let k = 0; k < 6; k++) { ell(Math.cos(k * 1.05) * 6, -20 + Math.sin(k * 1.05) * 6, 4, 2.6, k * 1.05); fst('#ffffff', 1.4); } circ(0, -20, 3.2); fst('#ffd23a', 1.4); },
  sapling(t) { P(); ctx.moveTo(0, 0); ctx.lineTo(1, -16); tube(3, '#7a5a2a'); for (const [x, y, r] of [[-5, -18, 7], [6, -19, 7], [0, -25, 8]]) { circ(x, y, r); fst('#5cbf45', 2.2); } },
  moss() { for (const [x, r] of [[-8, 6], [0, 7], [8, 5]]) { P(); ctx.arc(x, 2, r, Math.PI, 0); ctx.closePath(); fst('#6fae3a', 2); } }
};

// Shared zombie rig. L = look options, s = { walk, eat, armorFrac }
function zombieRig(s, L) {
  const ph = s.walk || 0, eat = s.eat || 0, eating = eat > 0.001, t = s.t || ph * 0.3;
  const sc = L.scale || 1, b = L.bulk || 1, legL = L.legLen || 1, armL = L.armLen || 1;
  const skin = L.skin || '#a6c98a', skinD = shade(skin, -0.25);
  const swing = eating ? 0.12 : Math.sin(ph) * 0.55;
  const bob = eating ? 0 : Math.abs(Math.sin(ph)) * 4;
  const squash = eating ? 1 : 1 - Math.abs(Math.cos(ph)) * 0.035;
  const chomp = eating ? (Math.sin(eat * TAU) + 1) / 2 : 0;
  const lean = (L.lean || 0.1) + (eating ? 0.32 + chomp * 0.08 : 0);
  const hipY = -26 * legL;
  const armA = eating ? Math.PI - 0.7 + chomp * 0.35 : Math.PI + 0.14 - Math.sin(ph) * 0.08;
  ctx.save(); ctx.scale(sc, sc);
  // ---- back leg
  const bl = zLimb(6, hipY, Math.PI / 2 - swing, 14 * legL, Math.PI / 2 - swing * 0.5, 13 * legL, 11 * b, shade(L.pants, -0.2));
  zShoe(bl[0], bl[1], shade(L.shoes, -0.2));
  // ---- torso frame (leaning forward, bouncing)
  const torsoFrame = () => { ctx.translate(2, hipY - bob); ctx.rotate(-lean); ctx.scale(1, squash); };
  ctx.save(); torsoFrame();
  // back arm
  const ba = zLimb(9 * b, -36, armA - 0.06, 15 * armL, armA + 0.1, 14 * armL, 9 * b, skinD);
  if (L.sleeves) { P(); ctx.moveTo(9 * b, -36); ctx.lineTo(ba[2], ba[3]); tube(10.5 * b, shade(L.shirt, -0.22)); }
  zMitten(ba[0], ba[1], skinD, armA - Math.PI, 7.5 * b);
  // body: a round pear shape
  const body = () => { P(); ctx.moveTo(-18 * b, 6); ctx.quadraticCurveTo(-26 * b, -22, -14 * b, -42); ctx.quadraticCurveTo(0, -50, 14 * b, -42); ctx.quadraticCurveTo(27 * b, -22, 19 * b, 6); ctx.quadraticCurveTo(0, 12, -18 * b, 6); ctx.closePath(); };
  body(); fs(lg(-24, 0, 26, 0, [shade(L.shirt, 0.2), L.shirt, shade(L.shirt, -0.22)]));
  ctx.save(); body(); ctx.clip();
  if (L.pattern === 'plaid') {
    ctx.strokeStyle = col(shade(L.shirt, -0.38)); ctx.lineWidth = 3.4;
    for (let x = -28; x < 30; x += 10) { P(); ctx.moveTo(x, 12); ctx.lineTo(x + 3, -54); ctx.stroke(); }
    ctx.strokeStyle = col(shade(L.shirt, 0.32)); ctx.lineWidth = 2.2;
    for (let y = -4; y > -54; y -= 10) { P(); ctx.moveTo(-30, y); ctx.lineTo(30, y - 2); ctx.stroke(); }
  } else if (L.pattern === 'stripes') {
    ctx.fillStyle = col(L.stripe || '#ffe14a');
    for (let y = 2; y > -56; y -= 13) ctx.fillRect(-32, y - 6, 64, 6.5);
  } else if (L.pattern === 'track') {
    ctx.fillStyle = col('#ffffff'); ctx.fillRect(-3, -56, 5, 70);
    ctx.fillStyle = col(shade(L.shirt, -0.3)); ctx.fillRect(-32, -30, 64, 5);
  } else if (L.pattern === 'patch') {
    rrect(-12, -30, 14, 14, 2); fs(col('#c9a24a')); ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.strokeStyle = OUT; ctx.stroke(); ctx.setLineDash([]);
    rrect(6, -14, 11, 11, 2); fs(col('#8a6a9a')); ctx.stroke();
  }
  // pants on the lower part of the body
  ctx.fillStyle = col(L.pants); ctx.fillRect(-34, -6, 68, 20);
  ctx.fillStyle = col(shade(L.pants, -0.25)); ctx.fillRect(-34, -8, 68, 4);
  if (L.belly) { ell(-4, -16, 10, 8); fs(col(shade(skin, 0.05))); }
  ctx.restore();
  body(); st(3.4);
  // torn hem
  P(); for (let x = -20 * b; x <= 18 * b; x += 7) { ctx.lineTo(x, -6); ctx.lineTo(x + 3.5, -1); } ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(36,24,12,.6)'; ctx.stroke();
  if (L.onTorso) L.onTorso(s, b);
  ctx.restore();
  // ---- front leg
  const fl = zLimb(-6, hipY, Math.PI / 2 + swing, 14 * legL, Math.PI / 2 + swing * 0.5, 13 * legL, 11.5 * b, L.pants);
  zShoe(fl[0], fl[1], L.shoes);
  // ---- head + front arm (same torso frame)
  ctx.save(); torsoFrame();
  const hs = L.headScale || 1;
  ctx.save(); ctx.translate(-9, -66 * (L.neck || 1) + (eating ? 4 : 0)); ctx.rotate(lean * 0.5 - (eating ? Math.sin(eat * TAU) * 0.1 : Math.sin(ph * 2) * 0.06)); ctx.scale(hs, hs);
  // neck
  P(); ctx.moveTo(4, 14); ctx.lineTo(6, 26); tube(10, skinD);
  // head (big and round)
  ell(0, 0, 27, 25, -0.08); fs(rg(-10, -12, 3, 0, 0, 32, [shade(skin, 0.22), skin, skinD])); st(3.6);
  ell(10, -14, 6, 4, 0.4); fs(col(shade(skin, -0.12))); ell(14, 8, 4, 3); fs(col(shade(skin, -0.12)));
  ell(24, 4, 5.5, 8); fst(skin, 2.6);
  // nose
  ell(-25, 6, 5, 4.5); fst(skin, 2.4);
  // mismatched goofy eyes
  eye(-12, -5, 10, -0.6, 0.35, { white: '#fffbe6', pupil: 0.3 });
  eye(6, -7, 7, 0.4, -0.3, { white: '#fffbe6', pupil: 0.36, lid: 0.5, lidColor: skinD });
  line(-22, -16, -5, -18, 3.2, OUT); line(1, -18, 13, -15, 3, OUT);
  // mouth
  if (eating) {
    ell(-10, 13 + chomp * 2, 11, 3 + chomp * 7); fst('#4a1212', 2.6);
    rrect(-15, 7 - chomp * 1, 5, 5, 1.5); fs('#fffbe6'); rrect(-7, 7 - chomp * 1, 5, 4, 1.5); fs('#fffbe6');
    if (chomp > 0.4) { rrect(-12, 17 + chomp * 4, 5, 4, 1.5); fs('#fffbe6'); }
  } else {
    P(); ctx.moveTo(-22, 11); ctx.quadraticCurveTo(-10, 19, 4, 11); ctx.quadraticCurveTo(-9, 15, -22, 11); fst('#4a1212', 2.6);
    rrect(-16, 11, 5, 5, 1.5); fs('#fffbe6'); rrect(-6, 12, 5, 4.5, 1.5); fs('#fffbe6');
    if (L.tongue) { ell(-2, 17, 4, 5); fst('#e86a7a', 2); }
  }
  // stitches on the cheek
  line(6, 12, 15, 6, 2, OUT); line(9, 12, 8, 7, 1.6, OUT); line(13, 10, 12, 5, 1.6, OUT);
  // hair tufts + garden growth on top
  if (L.hair) { ctx.strokeStyle = col(L.hair); ctx.lineCap = 'round'; ctx.lineWidth = 4; for (const [x, a] of [[-6, -1.9], [2, -1.5], [9, -1.1]]) { P(); ctx.moveTo(x, -23); ctx.lineTo(x + Math.cos(a) * 9, -23 + Math.sin(a) * 9); ctx.stroke(); } }
  if (L.top && Z_TOPS[L.top]) { ctx.save(); ctx.translate(L.topX || 4, -24); ctx.rotate(-0.15); Z_TOPS[L.top](t); ctx.restore(); }
  if (L.onHead) L.onHead(s);
  ctx.restore();
  // front arm
  const fa = zLimb(-14 * b, -34, armA + 0.05 + Math.sin(ph) * 0.06, 15 * armL, armA + 0.14, 14 * armL, 10 * b, skin);
  if (L.sleeves) { const a = armA + 0.05 + Math.sin(ph) * 0.06; P(); ctx.moveTo(-14 * b, -34); ctx.lineTo(-14 * b + Math.cos(a) * 11, -34 + Math.sin(a) * 11); tube(12 * b, L.shirt); }
  zMitten(fa[0], fa[1], skin, armA - Math.PI, 8 * b);
  if (L.onFront) L.onFront(s, fa);
  ctx.restore();
  ctx.restore();
}

const ZLOOK = {
  basic: { skin: '#a6c98a', shirt: '#c0503e', pattern: 'plaid', pants: '#4166a0', shoes: '#6a4426', hair: null, top: 'mushroom', sleeves: true, lean: 0.12 },
  lid: { skin: '#a9c784', shirt: '#5f9a4a', pattern: 'plaid', pants: '#7a6440', shoes: '#3a2a1a', top: 'dandelion', sleeves: true, lean: 0.06 },
  runner: { skin: '#9fca8e', shirt: '#2f74c8', pattern: 'track', pants: '#2f74c8', shoes: '#f4f4f4', top: 'sprout', sleeves: true, lean: 0.32, tongue: true },
  barrel: { skin: '#adc78e', shirt: '#e2d8c6', pattern: null, pants: '#ec6a5e', shoes: '#6a4426', top: 'moss', lean: 0.04, belly: true },
  leaper: { skin: '#a6c482', shirt: '#7c3cb4', pattern: 'stripes', stripe: '#ffd23a', pants: '#7c3cb4', shoes: '#f4d454', top: 'daisy', lean: 0.16, legLen: 1.35 },
  brute: { skin: '#94b676', shirt: '#ece6d6', pattern: null, pants: '#4f6040', shoes: '#2a2018', top: 'sapling', lean: 0.16, bulk: 1.3, scale: 1.32, headScale: 0.82, armLen: 1.2, belly: true },
  scarecrow: { skin: '#b6c682', shirt: '#8e6e3e', pattern: 'patch', pants: '#5070a0', shoes: '#4a3020', sleeves: true, lean: 0.1 },
  parka: { skin: '#acceaa', shirt: '#3f8ccc', pattern: null, pants: '#3a3a4a', shoes: '#2a2a2a', top: 'sprout', sleeves: true, lean: 0.1, bulk: 1.12 }
};
ZLOOK.scarecrow.onTorso = () => { ctx.strokeStyle = col('#e8c860'); ctx.lineWidth = 2.6; for (const a of [-2.3, -1.95, -1.6, -1.25]) { P(); ctx.moveTo(0, -44); ctx.lineTo(Math.cos(a) * 15, -44 + Math.sin(a) * 11); ctx.stroke(); } };

BUG_ART.basic = s => zombieRig(s, ZLOOK.basic);
BUG_ART.runner = s => zombieRig(s, Object.assign({}, ZLOOK.runner, {
  onHead: () => {
    ctx.save(); ell(0, 0, 27, 25, -0.08); ctx.clip(); ctx.fillStyle = col('#e8453a'); ctx.fillRect(-30, -22, 60, 9); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(-30, -19, 60, 2); ctx.restore();
    line(24, -18, 34, -10, 4, '#e8453a'); line(24, -16, 31, -4, 4, '#e8453a');
  }
}));
// trash-can lid shield held in front
BUG_ART.lid = s => {
  const ar = s.armorFrac || 0;
  zombieRig(s, Object.assign({}, ZLOOK.lid, {
    onFront: (st_, fa) => {
      if (ar <= 0) return;
      ctx.save(); ctx.translate(fa[0] - 7, fa[1] - 2);
      ell(0, 0, 13, 36); fs(lg(-12, -32, 12, 32, ['#eef2f6', '#aab2be', '#7c8492'])); st(3.6);
      ell(0, 0, 8, 27); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,40,50,.35)'; ctx.stroke();
      rrect(-3.5, -7, 7, 14, 2.5); fst('#5a606a', 2.2);
      if (ar <= 0.66) { ell(-4, -15, 4.5, 5.5); fs('rgba(60,60,70,.55)'); line(3, 7, 7, 17, 2.2, OUT); }
      if (ar <= 0.33) { ell(3, 15, 5, 6.5); fs('rgba(60,60,70,.55)'); line(-7, -28, -2, -19, 2.2, OUT); line(-2, -19, -8, -12, 2.2, OUT); }
      ctx.restore();
    }
  }));
};
// wooden barrel worn like a suit; once it breaks: spotty shorts
BUG_ART.barrel = s => {
  const ar = s.armorFrac || 0;
  zombieRig(s, Object.assign({}, ZLOOK.barrel, {
    pants: ar > 0 ? '#6a4a2a' : '#ec6a5e',
    onTorso: () => {
      if (ar <= 0) { for (const [x, y] of [[-10, 2], [6, 5], [-1, 8], [14, -1]]) { circ(x, y, 2.4); fs('#fff'); } return; }
      P(); ctx.moveTo(-28, 14); ctx.quadraticCurveTo(-36, -20, -26, -52); ctx.lineTo(28, -52); ctx.quadraticCurveTo(38, -20, 30, 14); ctx.closePath();
      fs(lg(-32, 0, 34, 0, ['#7a4a22', '#b47e46', '#8e5e30', '#6a3e1c'])); st(3.6);
      ctx.strokeStyle = 'rgba(50,25,5,.45)'; ctx.lineWidth = 2.2;
      for (const x of [-14, 0, 14]) { P(); ctx.moveTo(x, 12); ctx.quadraticCurveTo(x * 1.25, -20, x, -50); ctx.stroke(); }
      for (const y of [-42, 4]) { P(); ctx.moveTo(-30, y); ctx.quadraticCurveTo(2, y + 5, 32, y); ctx.lineWidth = 6; ctx.strokeStyle = col('#7c8492'); ctx.stroke(); ctx.lineWidth = 1.6; ctx.strokeStyle = OUT; ctx.stroke(); }
      if (ar <= 0.66) { line(18, -32, 9, -19, 2.6, OUT); line(9, -19, 16, -8, 2.6, OUT); }
      if (ar <= 0.33) { line(-20, -12, -9, -2, 2.6, OUT); P(); ctx.moveTo(20, -52); ctx.lineTo(29, -38); ctx.lineTo(27, -52); ctx.closePath(); fs('#3a220c'); }
    }
  }));
};
// circus acrobat: somersaults over the first plant it meets
BUG_ART.leaper = s => {
  const jp = s.jump || 0;
  const look = Object.assign({}, ZLOOK.leaper, { onHead: () => { P(); ctx.moveTo(-26, 12); ctx.quadraticCurveTo(-16, 20, -6, 13); ctx.quadraticCurveTo(-16, 16, -26, 12); fst('#1a1a1a', 1.6); } });
  if (jp > 0) {
    ctx.save(); ctx.translate(0, -60); ctx.rotate(-jp * TAU); ctx.translate(0, 60);
    zombieRig({ walk: 1.3, eat: 0 }, Object.assign(look, { legLen: 1.0 }));
    ctx.restore();
    return;
  }
  zombieRig(s, look);
};
// the brute: huge, with a little sapling on top
BUG_ART.brute = s => zombieRig(s, Object.assign({}, ZLOOK.brute, {
  onTorso: () => { for (let i = 0; i < 5; i++) { circ(-18 + i * 9, -4, 3.4); fst('#9aa0aa', 1.6); } },
  onHead: () => { line(-22, -18, 12, -20, 5, OUT); }
}));
// scarecrow with a big straw hat (armor)
BUG_ART.scarecrow = s => {
  const ar = s.armorFrac || 0;
  zombieRig(s, Object.assign({}, ZLOOK.scarecrow, {
    onHead: () => {
      if (ar <= 0) { ctx.strokeStyle = col('#e8c860'); ctx.lineWidth = 2.6; for (const x of [-10, -3, 4, 10]) { P(); ctx.moveTo(x, -22); ctx.lineTo(x + 3, -33); ctx.stroke(); } return; }
      ell(2, -20, 42, 9); fs(lg(0, -28, 0, -12, ['#f4d47c', '#caa24a'])); st(3.2);
      P(); ctx.moveTo(-18, -22); ctx.quadraticCurveTo(-16, -50, 3, -50); ctx.quadraticCurveTo(20, -48, 20, -22); ctx.closePath(); fs(lg(0, -50, 0, -22, ['#f4d47c', '#dab45c'])); st(3.2);
      rrect(-18, -30, 38, 7, 2); fs(col('#c0503e'));
      if (ar <= 0.5) { line(-30, -20, -20, -15, 2.2, OUT); P(); ctx.moveTo(8, -48); ctx.lineTo(12, -40); ctx.lineTo(16, -48); ctx.closePath(); fs('#3a2a0a'); }
    }
  }));
};
// parka with a furry hood (armor): can't be slowed while the hood is up
BUG_ART.parka = s => {
  const ar = s.armorFrac || 0;
  zombieRig(s, Object.assign({}, ZLOOK.parka, {
    shirt: ar > 0 ? '#3f8ccc' : '#c05a8e', pattern: ar > 0 ? null : 'stripes', stripe: '#f4e4f2', top: ar > 0 ? null : 'sprout',
    onTorso: () => {
      if (ar <= 0) return;
      ctx.strokeStyle = 'rgba(20,40,80,.4)'; ctx.lineWidth = 2.2;
      for (const y of [-12, -26, -40]) { P(); ctx.moveTo(-22, y); ctx.quadraticCurveTo(0, y + 4, 24, y); ctx.stroke(); }
      line(0, 4, 0, -48, 2.4, '#c8d0d8');
    },
    onHead: () => {
      if (ar <= 0) return;
      P(); ctx.arc(2, -2, 35, -Math.PI * 0.98, Math.PI * 0.42, false); ctx.lineTo(12, 26); ctx.arc(2, -2, 26, Math.PI * 0.42, -Math.PI * 0.98, true); ctx.closePath();
      fs(lg(0, -38, 0, 26, ['#56a0e0', '#2f6aa8'])); st(3.2);
      for (let a = -3.0; a < 1.3; a += 0.28) { circ(2 + Math.cos(a) * 27, -2 + Math.sin(a) * 27, 5); fs(col('#f4eee2')); }
      if (ar <= 0.5) line(24, -26, 30, -16, 2.2, OUT);
    }
  }));
};
ZLOOK.gardener = { skin: '#a2c486', shirt: '#e6dcc0', pattern: null, pants: '#5a8a4a', shoes: '#5a3a22', top: 'sprout', sleeves: true, lean: 0.12 };
ZLOOK.pumpkin = { skin: '#a8c286', shirt: '#4a2a5a', pattern: 'stripes', stripe: '#f08a2a', pants: '#2a2a3a', shoes: '#1a1a1a', top: 'mushroom', sleeves: true, lean: 0.1 };
ZLOOK.skater = { skin: '#a4cbb0', shirt: '#e8eef4', pattern: 'stripes', stripe: '#6aaad8', pants: '#3a4a6a', shoes: '#f4f4f4', top: null, sleeves: true, lean: 0.28 };
ZLOOK.mailman = { skin: '#a6c68c', shirt: '#4f7fc0', pattern: null, pants: '#2f4a7a', shoes: '#2a2018', top: null, sleeves: true, lean: 0.12 };
// gardener with an apron and a watering can (heals nearby zombies)
BUG_ART.gardener = s => zombieRig(s, Object.assign({}, ZLOOK.gardener, {
  onTorso: () => { P(); ctx.moveTo(-15, -36); ctx.lineTo(15, -36); ctx.lineTo(18, 8); ctx.lineTo(-17, 8); ctx.closePath(); fs(col('#5aa83a')); st(2.6); rrect(-8, -18, 14, 10, 2); fst('#4a9030', 2); },
  onHead: () => { ell(2, -21, 34, 7); fst('#7ab84a', 2.8); P(); ctx.moveTo(-20, -22); ctx.quadraticCurveTo(-18, -42, 2, -42); ctx.quadraticCurveTo(22, -42, 22, -22); ctx.closePath(); fst('#8cc85a', 2.8); },
  onFront: (st_, fa) => {
    ctx.save(); ctx.translate(fa[0] - 4, fa[1] + 6);
    rrect(-14, -2, 26, 20, 5); fs(lg(0, -2, 0, 18, ['#7fd6a8', '#3f9a6a'])); st(3);
    P(); ctx.moveTo(-12, 4); ctx.lineTo(-30, -6); tube(4, '#3f9a6a'); ell(-31, -7, 5, 3, -0.5); fst('#3f9a6a', 2);
    P(); ctx.arc(0, -2, 9, Math.PI, 0); st(3.4);
    ctx.restore();
  }
}));
// carved pumpkin over the head (armor)
BUG_ART.pumpkin = s => {
  const ar = s.armorFrac || 0;
  zombieRig(s, Object.assign({}, ZLOOK.pumpkin, {
    top: ar > 0 ? null : 'mushroom',
    onHead: () => {
      if (ar <= 0) return;
      ctx.save(); ctx.translate(-2, -4);
      for (const [x, rx] of [[-16, 16], [16, 16], [0, 19]]) { ell(x, 0, rx, 28); fs(lg(0, -28, 0, 28, ['#ffb04a', '#f0801e', '#c85a10'])); st(3.2); }
      P(); ctx.moveTo(0, -28); ctx.quadraticCurveTo(4, -38, 10, -40); tube(4, '#5a7a2a');
      for (const ex of [-20, -2]) { P(); ctx.moveTo(ex - 6, -2); ctx.lineTo(ex, -12); ctx.lineTo(ex + 6, -2); ctx.closePath(); fst('#ffe46a', 2.4); }
      P(); ctx.moveTo(-26, 8); ctx.lineTo(-18, 12); ctx.lineTo(-14, 8); ctx.lineTo(-8, 14); ctx.lineTo(-2, 8); ctx.lineTo(4, 12); ctx.lineTo(8, 8); ctx.quadraticCurveTo(-8, 24, -26, 8); ctx.closePath(); fst('#ffe46a', 2.4);
      if (ar <= 0.5) { line(14, -20, 22, -8, 2.4, OUT); line(22, -8, 16, 2, 2.4, OUT); }
      ctx.restore();
    }
  }));
};
// ice skater with a scarf and bobble hat (fast until it gets hit)
BUG_ART.skater = s => zombieRig(s, Object.assign({}, ZLOOK.skater, {
  onTorso: () => { rrect(-20, -48, 38, 10, 4); fst('#e8453a', 2.4); rrect(-22, -46, 8, 26, 3); fst('#e8453a', 2.4); line(-22, -30, -14, -30, 2.4, '#fff'); },
  onHead: () => { P(); ctx.ellipse(1, -6, 28, 25, -0.08, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(28, -12); ctx.quadraticCurveTo(2, -44, -26, -12); fst('#e8453a', 3); for (let x = -18; x < 24; x += 8) line(x, -14 - Math.abs(x) * 0.1, x + 2, -26, 2, 'rgba(255,255,255,.7)'); circ(0, -40, 7); fst('#fff', 2.4); },
  shoes: '#f4f4f4'
}));
// mailman with a satchel full of letters (drops bonus dew when defeated)
BUG_ART.mailman = s => zombieRig(s, Object.assign({}, ZLOOK.mailman, {
  onTorso: () => {
    line(-14, -40, 18, -2, 4, '#7a4a22');
    rrect(4, -14, 24, 20, 4); fs(lg(0, -14, 0, 6, ['#a86a33', '#7a4a22'])); st(2.8);
    rrect(7, -20, 8, 10, 1); fst('#fff8e0', 1.6); rrect(14, -22, 8, 10, 1); fst('#ffe9b8', 1.6);
  },
  onHead: () => { P(); ctx.ellipse(2, -10, 27, 18, -0.08, Math.PI, Math.PI * 2); ctx.closePath(); fst('#2f4a7a', 3); ell(-22, -10, 14, 4, -0.2); fst('#24385e', 2.4); circ(4, -22, 4); fst('#ffd23a', 1.8); }
}));

ZLOOK.gnome = { skin: '#a8cc8c', shirt: '#3f78c8', pattern: null, pants: '#6a4a2a', shoes: '#4a2e18', top: null, sleeves: true, lean: 0.1, scale: 0.62, headScale: 1.12 };
ZLOOK.wheelbarrow = { skin: '#a2c486', shirt: '#d8a040', pattern: 'plaid', pants: '#4a5a7a', shoes: '#4a3020', top: 'sprout', sleeves: true, lean: 0.22 };
ZLOOK.beekeeper = { skin: '#a6c88a', shirt: '#f2f0e6', pattern: null, pants: '#f2f0e6', shoes: '#5a5a5a', top: null, sleeves: true, lean: 0.1, bulk: 1.1 };
ZLOOK.boss = { skin: '#8fae70', shirt: '#6a4a2a', pattern: 'patch', pants: '#4a3a24', shoes: '#2a1e12', top: 'sapling', lean: 0.12, bulk: 1.45, scale: 2.0, headScale: 0.8, armLen: 1.25, belly: true, tongue: true };
// garden-gnome zombie: tiny, with a felt cap and a beard
BUG_ART.gnome = s => zombieRig(s, Object.assign({}, ZLOOK.gnome, {
  onHead: () => {
    P(); ctx.moveTo(-26, -14); ctx.quadraticCurveTo(-6, -76, 26, -16); ctx.quadraticCurveTo(0, -24, -26, -14); ctx.closePath(); fs(lg(0, -70, 0, -14, ['#ff6a5a', '#d8302a'])); st(3);
    P(); ctx.moveTo(-24, 6); ctx.quadraticCurveTo(-18, 34, -4, 40); ctx.quadraticCurveTo(6, 30, 12, 12); ctx.quadraticCurveTo(-6, 18, -24, 6); fst('#f4f0e6', 2.6);
  }
}));
// pushes a wheelbarrow full of dirt that soaks up hits (armor)
BUG_ART.wheelbarrow = s => {
  const ar = s.armorFrac || 0, ph = s.walk || 0;
  zombieRig(s, Object.assign({}, ZLOOK.wheelbarrow, {
    onFront: (st_, fa) => {
      if (ar <= 0) return;
      ctx.save(); ctx.translate(fa[0] - 30, 30);
      const wy = -6 + Math.abs(Math.sin(ph)) * -2;
      line(32, -26 + wy, 66, -36 + wy, 4, '#7a4a22');
      P(); ctx.moveTo(-34, -48 + wy); ctx.lineTo(34, -48 + wy); ctx.lineTo(22, -14 + wy); ctx.lineTo(-22, -14 + wy); ctx.closePath();
      fs(lg(0, -48, 0, -14, ['#5aa0d8', '#2f6aa8'])); st(3.2);
      P(); ctx.ellipse(0, -48 + wy, 34, 8, 0, Math.PI, 0); fs('#6a4426'); st(2.4);
      for (const [x, c] of [[-14, '#5cbf45'], [8, '#e24b3b']]) { circ(x, -56 + wy, 6); fst(c, 2); }
      ctx.save(); ctx.translate(-22, -6 + wy); ctx.rotate(ph * 2);
      circ(0, 0, 12); fst('#3a3a3a', 3); circ(0, 0, 4); fst('#c8c8c8', 2); line(-10, 0, 10, 0, 2, '#888'); line(0, -10, 0, 10, 2, '#888'); ctx.restore();
      if (ar <= 0.6) { line(-10, -44 + wy, -2, -28 + wy, 2.4, OUT); line(-2, -28 + wy, -12, -18 + wy, 2.4, OUT); }
      if (ar <= 0.3) { P(); ctx.moveTo(18, -48 + wy); ctx.lineTo(28, -36 + wy); ctx.lineTo(30, -48 + wy); ctx.closePath(); fs('#1a3a5a'); }
      ctx.restore();
    }
  }));
};
// beekeeper with a veiled hat (armor) and a few bees buzzing around
BUG_ART.beekeeper = s => {
  const ar = s.armorFrac || 0, t = (s.walk || 0) * 0.5 + (s.eat || 0) * 3;
  zombieRig(s, Object.assign({}, ZLOOK.beekeeper, {
    top: ar > 0 ? null : 'daisy',
    onHead: () => {
      if (ar > 0) {
        ell(2, -20, 38, 8); fst('#f4eed8', 3);
        P(); ctx.moveTo(-18, -22); ctx.quadraticCurveTo(-16, -46, 2, -46); ctx.quadraticCurveTo(20, -46, 20, -22); ctx.closePath(); fst('#f4eed8', 3);
        P(); ctx.moveTo(-34, -18); ctx.lineTo(-32, 22); ctx.lineTo(34, 22); ctx.lineTo(38, -18); ctx.closePath(); ctx.fillStyle = 'rgba(40,40,40,.35)'; ctx.fill(); st(2);
        ctx.strokeStyle = 'rgba(30,30,30,.35)'; ctx.lineWidth = 1; for (let x = -30; x < 36; x += 6) { P(); ctx.moveTo(x, -18); ctx.lineTo(x, 22); ctx.stroke(); }
      }
      for (let k = 0; k < 3; k++) {
        const a = t * 3 + k * 2.1, bx = Math.cos(a) * 40, by = -20 + Math.sin(a * 1.3) * 22;
        ell(bx, by, 5, 3.6); fst('#ffd23a', 1.4); line(bx - 1, by - 3, bx - 1, by + 3, 1.6, OUT);
        ell(bx + 1, by - 5, 3, 2, -0.4); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
      }
    }
  }));
};
// boss: the Compost Giant, a towering heap of garden waste
BUG_ART.boss = s => zombieRig(s, Object.assign({}, ZLOOK.boss, {
  onTorso: () => {
    for (const [x, y, a, c] of [[-14, -30, -0.6, '#5cbf45'], [12, -16, 0.4, '#b8902a'], [-4, -40, 1.8, '#7fd458'], [16, -36, -1.2, '#c84a2a']]) leaf(x, y, 16, 6, a, c, false, 2);
    line(-20, -10, 4, -24, 3, '#6a4426'); line(8, -4, 22, -20, 3, '#6a4426');
  },
  onHead: () => {
    for (const [x, a] of [[-14, -2.2], [-4, -1.8], [8, -1.3]]) { P(); ctx.moveTo(x, -22); ctx.lineTo(x + Math.cos(a) * 18, -22 + Math.sin(a) * 18); tube(3, '#7a5a2a'); }
    circ(-18, -40, 5); fst('#ffd23a', 2); circ(18, -36, 5); fst('#ff8ab0', 2);
  }
}));
const BUGS = {
  basic: { name: 'Farmhand Zombie', hp: 200, speed: 18, bite: 60, cost: 1, size: 30, desc: 'Your everyday garden zombie, mushroom and all. Slow, hungry and very stubborn.', stat: 'Toughness: low' },
  lid: { name: 'Lid Zombie', hp: 200, armor: 380, speed: 18, bite: 60, cost: 2, size: 30, desc: 'Hides behind a dented trash-can lid that soaks up hits.', stat: 'Toughness: medium' },
  runner: { name: 'Jogger Zombie', hp: 150, speed: 34, bite: 45, cost: 1, size: 28, desc: 'Still out for its morning run. Fast, and the first time a plant blocks its way it jogs into the next lane.', stat: 'Dodges into another lane' },
  barrel: { name: 'Barrel Zombie', hp: 220, armor: 1100, speed: 11, bite: 60, cost: 4, size: 32, desc: 'Waddles in wearing a wooden barrel. Break it and the barrel rolls on ahead and smashes into your first plant.', stat: 'Rolling barrel' },
  leaper: { name: 'Acrobat Zombie', hp: 320, speed: 36, bite: 60, cost: 2, size: 28, desc: 'A circus zombie that somersaults clean over the first plant it meets.', stat: 'Flips over one plant' },
  brute: { name: 'Brute Zombie', hp: 1600, speed: 10, bite: 220, cost: 8, size: 40, desc: 'A huge zombie that munches through plants fast. Its ground stomps make nearby plants too dizzy to fight.', stat: 'Stomp stuns plants' },
  scarecrow: { name: 'Scarecrow Zombie', hp: 320, armor: 320, speed: 16, bite: 60, cost: 3, size: 30, desc: 'Stuffed with straw, so fire hurts it twice as much. When its hat falls off, a crow flies out to steal your dew. Tap the crow to scare it.', stat: 'Crow steals dew' },
  parka: { name: 'Parka Zombie', hp: 220, armor: 650, speed: 18, bite: 60, cost: 3, size: 32, desc: 'Bundled up in a puffy parka. It throws snowballs that freeze a plant solid, and it cannot be slowed while the hood is up.', stat: 'Freezes plants' },
  gardener: { name: 'Gardener Zombie', hp: 260, speed: 16, bite: 60, cost: 3, size: 30, desc: 'Waters its friends with a rusty can, healing every zombie close by. Take it out first!', stat: 'Heals nearby zombies' },
  pumpkin: { name: 'Pumpkin-head Zombie', hp: 200, armor: 520, speed: 17, bite: 60, cost: 3, size: 30, desc: 'Wears a carved pumpkin over its head and spits pumpkin seeds at plants ahead until the pumpkin cracks.', stat: 'Spits seeds' },
  skater: { name: 'Skater Zombie', hp: 220, speed: 42, bite: 60, cost: 2, size: 28, desc: 'Glides in on ice skates at top speed, then slows to a stumble the moment it gets hit.', stat: 'Fast until hit' },
  mailman: { name: 'Mailman Zombie', hp: 260, speed: 18, bite: 60, cost: 2, size: 30, desc: 'Always delivers. Defeat it and its satchel spills a big 50-dew drop.', stat: 'Drops bonus dew' }
};
Object.assign(BUGS, {
  gnome: { name: 'Gnome Zombie', hp: 90, speed: 30, bite: 35, cost: 1, size: 22, desc: 'A pint-sized garden gnome that crept out of the flowerbed. They always come in threes, and Breeze Bloom blows them twice as far.', stat: 'Comes in groups of 3' },
  wheelbarrow: { name: 'Wheelbarrow Zombie', hp: 220, armor: 800, speed: 14, bite: 60, cost: 4, size: 34, desc: 'Pushes a wheelbarrow full of dirt and dumps it on the first plant it reaches, burying it. Then it hurries along.', stat: 'Buries a plant' },
  beekeeper: { name: 'Beekeeper Zombie', hp: 240, armor: 420, speed: 16, bite: 60, cost: 3, size: 30, desc: 'Its bees sting nearby plants while it eats, stopping them from attacking for a few seconds.', stat: 'Stuns nearby plants' },
  boss: { name: 'Compost Giant', hp: 4000, speed: 7, bite: 400, cost: 99, size: 64, desc: 'A towering heap of garden waste that guards the end of every world. It calls in helper zombies and stomps the ground as it lumbers along.', stat: 'Boss' }
});
const BUG_ORDER = ['basic', 'lid', 'runner', 'barrel', 'leaper', 'brute', 'scarecrow', 'pumpkin', 'gardener', 'mailman', 'parka', 'skater', 'gnome', 'wheelbarrow', 'beekeeper', 'boss'];
