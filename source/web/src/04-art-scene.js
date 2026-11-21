/* ===== Scenery, UI widgets, logo ===== */

function drawSky(g, dusk, h = 160) {
  const sky = g.createLinearGradient(0, 0, 0, h);
  if (dusk) { sky.addColorStop(0, '#5b3f8f'); sky.addColorStop(0.6, '#e0708a'); sky.addColorStop(1, '#ffb070'); }
  else { sky.addColorStop(0, '#6cc4ff'); sky.addColorStop(1, '#cfefff'); }
  g.fillStyle = sky; g.fillRect(0, 0, W, h);
}
function cloud(x, y, s, a = 0.9) {
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  for (const [dx, dy, r] of [[0, 0, 22], [22, -8, 26], [46, 0, 20], [24, 8, 20]]) { circ(x + dx * s, y + dy * s, r * s); ctx.fill(); }
}
function treeLine(rnd, y0, c1, c2) {
  for (let x = -20; x < W + 40; x += 34 + rnd() * 30) {
    const r = 26 + rnd() * 26;
    circ(x, y0 - r * 0.3, r); ctx.fillStyle = rnd() < 0.5 ? c1 : c2; ctx.fill();
  }
}

// Visual themes for each world
const THEMES = {
  day: { sky: ['#6cc4ff', '#cfefff'], trees: ['#3f8f3a', '#357c31', '#2f7a2c', '#2a6d27'], wall: ['#b6ab97', '#cdbfa6'], tile: ['#86d356', '#76c44a'], meadow: '#6db544', tuft: ['#4f9a35', '#428a2c'], path: ['#cdb48a', '#e2cfaa'], glass: ['#cbeefa', '#dbf5ff'], pots: ['#4faa45', '#62c04f'], grass: ['rgba(30,90,20,.28)', 'rgba(220,255,170,.22)'], flowers: ['#ffffff', '#ffe25a', '#ffb3d1'], clouds: 0.85, obstacle: 'rock' },
  dusk: { sky: ['#5b3f8f', '#ffb070'], skyMid: '#e0708a', trees: ['#3d4a3a', '#334031', '#2e3a2b', '#283325'], wall: ['#6f6a78', '#827d8c'], tile: ['#5d9a45', '#538d3d'], meadow: '#4b7f37', tuft: ['#3d6b2c', '#355f27'], path: ['#7d6a55', '#968470'], glass: ['#6f8b98', '#7d99a6'], pots: ['#3f6e3a', '#4a7e3e'], grass: ['rgba(20,60,10,.3)', 'rgba(220,255,170,.12)'], flowers: ['#ffd8e8', '#ffe8a0'], clouds: 0.35, tint: 'rgba(70,30,90,.18)', obstacle: 'rock' },
  autumn: { sky: ['#7fbde8', '#ffe2b8'], trees: ['#d0782a', '#b85a1a', '#c8902a', '#a04818'], wall: ['#a89880', '#c0b098'], tile: ['#b2c860', '#a0b650'], meadow: '#a0a848', tuft: ['#b8902a', '#a07a20'], path: ['#c8a070', '#dcbc8c'], glass: ['#d8ecf0', '#e8f4f6'], pots: ['#c8782a', '#d89a3a'], grass: ['rgba(90,70,10,.25)', 'rgba(255,240,170,.22)'], flowers: ['#e8783a', '#c84a2a', '#f0b040', '#b85a1a'], leaves: true, clouds: 0.7, obstacle: 'log', apples: true },
  night: { sky: ['#0b1430', '#2c3c6c'], trees: ['#1b2f2a', '#16281f', '#14241c', '#102018'], wall: ['#4a4a5a', '#5a5a6c'], tile: ['#3f6c4a', '#365f41'], meadow: '#2e5236', tuft: ['#24452c', '#1e3c26'], path: ['#565068', '#686078'], glass: ['#34506a', '#44607a'], pots: ['#2e5a36', '#386a40'], grass: ['rgba(0,20,10,.3)', 'rgba(180,220,255,.12)'], flowers: ['#c8d8ff', '#9ab0ff', '#ffffff'], clouds: 0.12, stars: true, moon: true, tint: 'rgba(10,20,70,.2)', obstacle: 'shroomstump' },
  winter: { sky: ['#9cc0e4', '#eef4fa'], trees: ['#e6eef8', '#cfdcec', '#dbe6f2', '#c4d4e6'], wall: ['#b8c0cc', '#d4dae2'], tile: ['#f2f7fc', '#e0eaf4'], meadow: '#d4e2ee', tuft: ['#b4c6d6', '#a2b6c8'], path: ['#c4ccd6', '#dde4ec'], glass: ['#dff2fa', '#f0f8fc'], pots: ['#5a9a6a', '#6aaa7a'], grass: ['rgba(120,150,190,.25)', 'rgba(255,255,255,.5)'], flowers: ['#ffffff', '#d6ecff'], clouds: 0.9, snow: true, obstacle: 'snowman' },
  grove: { sky: ['#2c2350', '#7a5a9a'], skyMid: '#5a4580', trees: ['#3a4a3a', '#2e3e30', '#2a3a2c', '#243226'], wall: ['#5a5a50', '#6a6a5e'], tile: ['#5c9450', '#528748'], meadow: '#477a40', tuft: ['#3a6a34', '#30602c'], path: ['#6a5a48', '#7e6c58'], glass: ['#6a7a8a', '#7a8a9a'], pots: ['#5a4a8a', '#6a5aa0'], grass: ['rgba(20,50,20,.3)', 'rgba(200,240,190,.14)'], flowers: ['#d8a8ff', '#a8d8ff', '#ffd8f0'], clouds: 0.3, tint: 'rgba(40,20,70,.14)', obstacle: 'toadstool', shrooms: true },
  beach: { sky: ['#3ab0f0', '#c8ecff'], trees: [], wall: ['#c8a878', '#dcc090'], tile: ['#f4de9e', '#e8cf8a'], meadow: '#e2c47e', tuft: ['#7ab848', '#5aa03a'], path: ['#d8c08a', '#eadaa8'], glass: ['#d4f4fc', '#e6faff'], pots: ['#4faa45', '#62c04f'], grass: ['rgba(150,110,40,.2)', 'rgba(255,255,230,.35)'], flowers: ['#ff9a8a', '#ffffff', '#f4b0c8', '#ffd08a'], clouds: 0.8, sea: true, obstacle: 'sandcastle' }
};
function drawObstacle(kind, x, y, rnd) {
  shadow(x, y + 2, 34);
  if (kind === 'rock') {
    P(); ctx.moveTo(x - 34, y); ctx.quadraticCurveTo(x - 38, y - 30, x - 12, y - 42); ctx.quadraticCurveTo(x + 18, y - 52, x + 32, y - 22); ctx.quadraticCurveTo(x + 38, y - 4, x + 30, y); ctx.closePath();
    fs(lg(x, y - 50, x, y, ['#b4b8bc', '#8c9298', '#6c7278'])); st(3.4);
    ell(x - 10, y - 30, 9, 5, -0.4); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
    for (const [dx, dy] of [[12, -18], [-18, -10]]) { ell(x + dx, y + dy, 6, 3); ctx.fillStyle = '#7fb85a'; ctx.fill(); }
  } else if (kind === 'log') {
    rrect(x - 40, y - 30, 80, 28, 12); fs(lg(0, y - 30, 0, y, ['#a8743e', '#7a4a22'])); st(3.2);
    ell(x + 36, y - 16, 10, 14); fs('#e3b877'); st(3); ell(x + 36, y - 16, 5, 7); ctx.strokeStyle = 'rgba(120,70,25,.6)'; ctx.lineWidth = 1.6; ctx.stroke();
    for (const [dx, c] of [[-20, '#e8783a'], [0, '#c84a2a'], [16, '#f0b040']]) { leaf(x + dx, y - 30, 14, 5, -2.2 + dx * 0.02, c, false, 2); }
  } else if (kind === 'shroomstump') {
    rrect(x - 26, y - 34, 52, 34, 6); fs(lg(-26, 0, 26, 0, ['#4a3420', '#6a4a2a', '#4a3420'])); st(3.2);
    ell(x, y - 34, 26, 8); fst('#a88a5a', 3);
    for (const [dx, dy, r] of [[-14, -40, 9], [6, -44, 11], [20, -30, 7]]) { P(); ctx.arc(x + dx, y + dy, r, Math.PI, 0); ctx.closePath(); fs('#8fe0ff'); st(2.4); circ(x + dx, y + dy - r * 0.4, r * 1.6); ctx.fillStyle = 'rgba(140,220,255,.18)'; ctx.fill(); }
  } else if (kind === 'snowman') {
    circ(x, y - 18, 22); fs(rg(x - 6, y - 26, 2, x, y - 18, 26, ['#ffffff', '#dfe8f2'])); st(3);
    circ(x, y - 52, 16); fs(rg(x - 5, y - 58, 2, x, y - 52, 20, ['#ffffff', '#dfe8f2'])); st(3);
    circ(x - 6, y - 55, 2.4); fs(OUT); circ(x + 5, y - 55, 2.4); fs(OUT);
    P(); ctx.moveTo(x - 2, y - 50); ctx.lineTo(x - 16, y - 47); ctx.lineTo(x - 2, y - 46); ctx.closePath(); fst('#f08a2a', 1.6);
    rrect(x - 14, y - 72, 28, 6, 2); fst('#3a3a4a', 2); rrect(x - 9, y - 88, 18, 17, 2); fst('#3a3a4a', 2);
    rrect(x - 16, y - 40, 32, 6, 3); fst('#e8453a', 2);
  } else if (kind === 'toadstool') {
    rrect(x - 11, y - 40, 22, 40, 8); fs(lg(0, y - 40, 0, y, ['#f4eee0', '#d8ccb4'])); st(3);
    P(); ctx.moveTo(x - 38, y - 36); ctx.quadraticCurveTo(x - 36, y - 74, x, y - 76); ctx.quadraticCurveTo(x + 36, y - 74, x + 38, y - 36); ctx.quadraticCurveTo(x, y - 46, x - 38, y - 36); ctx.closePath();
    fs(lg(0, y - 76, 0, y - 36, ['#c070e8', '#8a40c0'])); st(3.2);
    for (const [dx, dy, r] of [[-20, -52, 5], [2, -64, 6], [20, -50, 4.5], [-6, -48, 3.5]]) { circ(x + dx, y + dy, r); fs('#fff4e0'); }
    for (const dx of [-26, 22]) { P(); ctx.arc(x + dx, y - 4, 7, Math.PI, 0); ctx.closePath(); fs('#a8e0ff'); st(2); }
  } else if (kind === 'sandcastle') {
    P(); ctx.moveTo(x - 36, y); ctx.lineTo(x - 32, y - 30); ctx.lineTo(x + 32, y - 30); ctx.lineTo(x + 36, y); ctx.closePath(); fs(lg(0, y - 30, 0, y, ['#f2d690', '#d8b468'])); st(3);
    for (const dx of [-24, 0, 24]) { rrect(x + dx - 9, y - 50, 18, 22, 2); fs('#ecd088'); st(2.6); for (let k = 0; k < 3; k++) { rrect(x + dx - 9 + k * 7, y - 55, 4, 6, 1); fs('#ecd088'); st(1.6); } }
    P(); ctx.moveTo(x, y - 55); ctx.lineTo(x, y - 74); st(2); P(); ctx.moveTo(x, y - 74); ctx.lineTo(x + 12, y - 70); ctx.lineTo(x, y - 66); ctx.closePath(); fst('#e8453a', 1.6);
    rrect(x - 5, y - 16, 10, 16, 5); fs('#a8844a');
  }
}
function bgRS() { return clamp(View.scale * View.dpr, 0.75, 2); }
function bgCanvas() {
  const rs = bgRS();
  const c = document.createElement('canvas'); c.width = Math.round(W * rs); c.height = Math.round(H * rs); c.rs = rs;
  const g = c.getContext('2d'); g.scale(rs, rs);
  return [c, g];
}
// The garden board, pre-rendered once per level.
function renderLawn(opts) {
  const [c, g] = bgCanvas(); c.opts = opts;
  const prev = ctx; setCtx(g);
  const rnd = mulberry(opts.seed || 7);
  const T = THEMES[opts.theme] || (opts.dusk ? THEMES.dusk : THEMES.day);
  // sky
  const sky = g.createLinearGradient(0, 0, 0, 170);
  sky.addColorStop(0, T.sky[0]); if (T.skyMid) sky.addColorStop(0.6, T.skyMid); sky.addColorStop(1, T.sky[1]);
  g.fillStyle = sky; g.fillRect(0, 0, W, 170);
  if (T.stars) for (let i = 0; i < 70; i++) { circ(rnd() * W, rnd() * 120, rnd() * 1.6 + 0.4); ctx.fillStyle = `rgba(255,255,240,${0.4 + rnd() * 0.6})`; ctx.fill(); }
  if (T.moon) { circ(1030, 52, 46); ctx.fillStyle = 'rgba(255,250,220,.15)'; ctx.fill(); circ(1030, 52, 30); ctx.fillStyle = '#fdf6d8'; ctx.fill(); circ(1040, 46, 6); ctx.fillStyle = 'rgba(200,190,160,.5)'; ctx.fill(); circ(1022, 62, 4); ctx.fill(); }
  for (let i = 0; i < 5; i++) cloud(120 + i * 270 + rnd() * 80, 30 + rnd() * 40, 0.7 + rnd() * 0.5, T.clouds);
  if (T.sea) {
    g.fillStyle = '#2f9ad8'; g.fillRect(0, 92, W, 30);
    g.fillStyle = '#56b8ec'; g.fillRect(0, 92, W, 6);
    for (let x = 0; x < W; x += 40) { P(); ctx.arc(x + 20, 122, 20, Math.PI, 0); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill(); }
    for (const px of [80, 420, 760, 1180]) { // palm trees
      P(); ctx.moveTo(px, 140); ctx.quadraticCurveTo(px + 10, 90, px - 4, 50); tube(8, '#a8743e');
      for (const a of [-2.8, -2.2, -1.2, -0.4, 0.2]) leaf(px - 4, 50, 46, 11, a, '#4faa45', true, 2.4);
    }
  } else {
    treeLine(rnd, 128, T.trees[0], T.trees[1]);
    treeLine(rnd, 142, T.trees[2], T.trees[3]);
    if (T.shrooms) for (let i = 0; i < 9; i++) {
      const mx = 40 + i * 150 + rnd() * 60, my = 138, mh = 40 + rnd() * 40, mr = 24 + rnd() * 22, c0 = ['#b070e0', '#e070a0', '#70b0e0'][i % 3];
      P(); ctx.moveTo(mx - 6, my); ctx.quadraticCurveTo(mx - 4, my - mh * 0.6, mx, my - mh); ctx.lineTo(mx + 6, my - mh); ctx.quadraticCurveTo(mx + 4, my - mh * 0.5, mx + 7, my); ctx.closePath(); ctx.fillStyle = '#d8d0c0'; ctx.fill();
      circ(mx, my - mh, mr * 1.5); ctx.fillStyle = 'rgba(200,160,255,.12)'; ctx.fill();
      P(); ctx.ellipse(mx, my - mh, mr, mr * 0.6, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = c0; ctx.fill();
      for (let k = 0; k < 3; k++) { circ(mx - mr * 0.5 + k * mr * 0.5, my - mh - mr * 0.3, 3); ctx.fillStyle = 'rgba(255,255,230,.85)'; ctx.fill(); }
    }
    if (opts.theme === 'autumn') for (let i = 0; i < 26; i++) { circ(rnd() * W, 96 + rnd() * 40, 4); ctx.fillStyle = '#d8302a'; ctx.fill(); }
    if (T.snow) for (let x = -20; x < W; x += 40) { ell(x + rnd() * 30, 104 + rnd() * 20, 26, 9); ctx.fillStyle = '#ffffff'; ctx.fill(); }
  }
  // low garden wall
  g.fillStyle = T.wall[0]; g.fillRect(0, 118, W, 26);
  for (let x = 0; x < W; x += 38) {
    rrect(x + 2 + (Math.floor(x / 38) % 2) * 6, 121, 32, 10, 3); ctx.fillStyle = T.wall[1]; ctx.fill();
    rrect(x + 8, 132, 32, 10, 3); ctx.fill();
  }
  if (T.snow) for (let x = 0; x < W; x += 30) { ell(x + 15, 118, 18, 5); ctx.fillStyle = '#ffffff'; ctx.fill(); }
  // lawn tiles
  for (let r = 0; r < ROWS; r++) {
    const active = opts.rows.includes(r);
    for (let cI = 0; cI < COLS; cI++) {
      const x = GX + cI * CW, y = GY + r * CH;
      g.fillStyle = active ? T.tile[(r + cI) % 2] : ((cI % 2 === 0) ? '#8a5a33' : '#7f5230');
      g.fillRect(x, y, CW + 1, CH + 1);
    }
    if (!active) {
      g.strokeStyle = 'rgba(60,35,15,.45)'; g.lineWidth = 3;
      for (let k = 0; k < 3; k++) { P(); ctx.moveTo(GX, GY + r * CH + 25 + k * 32); ctx.lineTo(GX + COLS * CW, GY + r * CH + 25 + k * 32); ctx.stroke(); }
    }
  }
  g.fillStyle = T.meadow; g.fillRect(GX + COLS * CW, GY, W - (GX + COLS * CW), ROWS * CH);
  // texture
  for (let i = 0; i < 1600; i++) {
    const x = GX + rnd() * (W - GX), y = GY + rnd() * ROWS * CH;
    const r = Math.min(ROWS - 1, Math.floor((y - GY) / CH));
    if (!opts.rows.includes(r) && x < GX + COLS * CW) continue;
    g.strokeStyle = rnd() < 0.5 ? T.grass[0] : T.grass[1];
    g.lineWidth = 2; P(); ctx.moveTo(x, y);
    if (opts.theme === 'beach') ctx.lineTo(x + 2, y + 1); else ctx.lineTo(x + rnd() * 4 - 2, y - 5 - rnd() * 5);
    ctx.stroke();
  }
  // flowers / fallen leaves / shells / snow tufts
  for (let i = 0; i < 46; i++) {
    const x = GX + rnd() * COLS * CW, y = GY + 10 + rnd() * (ROWS * CH - 20);
    const r = Math.floor((y - GY) / CH);
    if (!opts.rows.includes(r)) continue;
    const c0 = T.flowers[Math.floor(rnd() * T.flowers.length)];
    if (T.leaves) { leafPath(14, 5); ctx.save(); ctx.translate(x, y); ctx.rotate(rnd() * 6); leafPath(14, 5); ctx.fillStyle = c0; ctx.fill(); ctx.restore(); }
    else if (opts.theme === 'beach') { ctx.save(); ctx.translate(x, y); P(); ctx.arc(0, 0, 5, Math.PI, 0); ctx.closePath(); ctx.fillStyle = c0; ctx.fill(); ctx.strokeStyle = 'rgba(120,80,40,.4)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
    else if (T.snow) { ell(x, y, 8, 3); ctx.fillStyle = '#ffffff'; ctx.fill(); }
    else { for (let k = 0; k < 5; k++) { circ(x + Math.cos(k * 1.26) * 3, y + Math.sin(k * 1.26) * 3, 2.4); ctx.fillStyle = c0; ctx.fill(); } circ(x, y, 1.8); ctx.fillStyle = '#ffae2a'; ctx.fill(); }
  }
  for (let r = 1; r < ROWS; r++) { g.fillStyle = 'rgba(30,60,10,.12)'; g.fillRect(GX, GY + r * CH - 1, COLS * CW, 2); }
  // left path & greenhouse
  g.fillStyle = T.path[0]; g.fillRect(140, GY, GX - 140, ROWS * CH);
  for (let i = 0; i < 26; i++) {
    const y = GY + 8 + i * 22 + rnd() * 6, x = 150 + rnd() * 40;
    ell(x + 10, y, 14 + rnd() * 6, 8); ctx.fillStyle = T.path[1]; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(80,60,30,.35)'; ctx.stroke();
  }
  drawGreenhouse(g, T);
  // right edge plants
  for (let r = 0; r < ROWS; r++) {
    const by = GY + r * CH + CH;
    for (let k = 0; k < 9; k++) {
      const x = GX + COLS * CW + 6 + k * 12 + rnd() * 8;
      const hgt = 40 + rnd() * 50;
      P(); ctx.moveTo(x - 6, by); ctx.quadraticCurveTo(x - 2, by - hgt * 0.6, x + rnd() * 10 - 5, by - hgt); ctx.quadraticCurveTo(x + 2, by - hgt * 0.5, x + 6, by); ctx.closePath();
      ctx.fillStyle = T.tuft[k % 2]; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(20,40,10,.4)'; ctx.stroke();
    }
  }
  // blocked squares
  for (const [bc, br] of (opts.blocked || [])) drawObstacle(T.obstacle || 'rock', cellX(bc), rowY(br) - 4, rnd);
  g.fillStyle = '#5c3a1e'; g.fillRect(0, GY + ROWS * CH, W, H - (GY + ROWS * CH));
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(GX, GY, COLS * CW, 6);
  if (T.tint) { g.fillStyle = T.tint; g.fillRect(0, 0, W, H); }
  setCtx(prev);
  return c;
}

function drawGreenhouse(g, T) {
  const x0 = 0, x1 = 142, y0 = 70, y1 = GY + ROWS * CH;
  g.fillStyle = T.glass[0]; g.fillRect(x0, y0 + 40, x1 - x0, y1 - y0 - 40);
  P(); ctx.moveTo(x0, y0 + 40); ctx.lineTo(x1, y0 + 40); ctx.lineTo(x1 - 30, y0); ctx.lineTo(x0, y0); ctx.closePath();
  ctx.fillStyle = T.glass[1]; ctx.fill();
  for (let i = 0; i < 6; i++) {
    const y = y0 + 110 + i * 95;
    rrect(20, y, 34, 26, 4); ctx.fillStyle = '#c0643a'; ctx.fill();
    circ(37, y - 10, 20); ctx.fillStyle = T.pots[0]; ctx.fill();
    rrect(78, y + 30, 30, 22, 4); ctx.fillStyle = '#b0583a'; ctx.fill();
    circ(93, y + 22, 16); ctx.fillStyle = T.pots[1]; ctx.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.35)';
  for (let y = y0 + 60; y < y1; y += 90) { P(); ctx.moveTo(14, y + 40); ctx.lineTo(40, y); ctx.lineTo(52, y); ctx.lineTo(26, y + 40); ctx.closePath(); ctx.fill(); }
  g.strokeStyle = '#f6f6ef'; g.lineWidth = 7;
  for (let x = 0; x <= x1; x += 47) { P(); ctx.moveTo(x, y0 + 40); ctx.lineTo(x, y1); ctx.stroke(); }
  for (let y = y0 + 40; y <= y1; y += 90) { P(); ctx.moveTo(0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  P(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - 30, y0); ctx.lineTo(x1, y0 + 40); ctx.stroke();
  if (T.snow) { P(); ctx.moveTo(x0, y0 + 2); ctx.lineTo(x1 - 30, y0 + 2); ctx.lineTo(x1 + 2, y0 + 42); ctx.lineTo(x1 - 34, y0 + 14); ctx.lineTo(x0, y0 + 14); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); }
  g.strokeStyle = 'rgba(40,40,40,.5)'; g.lineWidth = 2; P(); ctx.moveTo(x1 + 2, y0 + 40); ctx.lineTo(x1 + 2, y1); ctx.stroke();
}

// Bug zapper lantern at the left edge of each row
function drawZapper(x, y, t, state) {
  shadow(x, y + 2, 20);
  rrect(x - 4, y - 46, 8, 46, 2); fst('#8a5a2e', 2.6);
  if (state === 'gone') return;
  const glow = state === 'fire' ? 1 : 0.5 + Math.sin(t * 5 + x) * 0.15;
  circ(x, y - 66, 30); ctx.fillStyle = `rgba(110,210,255,${0.18 * glow})`; ctx.fill();
  rrect(x - 15, y - 84, 30, 36, 6); fs(rg(x, y - 66, 2, x, y - 66, 26, ['#e6fbff', '#58c8ff', '#1b6fc2'])); st(3);
  ctx.strokeStyle = 'rgba(20,40,70,.65)'; ctx.lineWidth = 1.6;
  for (let k = -9; k <= 9; k += 6) { P(); ctx.moveTo(x + k, y - 82); ctx.lineTo(x + k, y - 50); ctx.stroke(); }
  rrect(x - 18, y - 90, 36, 8, 3); fst('#4a4f5a', 2.6);
  rrect(x - 18, y - 50, 36, 6, 3); fst('#4a4f5a', 2.6);
  P(); ctx.moveTo(x - 6, y - 90); ctx.quadraticCurveTo(x, y - 100, x + 6, y - 90); st(2.6);
}

/* ---------- UI widgets ---------- */
function woodPanel(x, y, w, h, o = {}) {
  rrect(x, y + 6, w, h, o.r || 18); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fill();
  rrect(x, y, w, h, o.r || 18); fs(lg(x, y, x, y + h, ['#c98a4b', '#a86a33', '#8b5426'])); st(4);
  ctx.save(); rrect(x, y, w, h, o.r || 18); ctx.clip();
  ctx.strokeStyle = 'rgba(70,35,10,.25)'; ctx.lineWidth = 2;
  for (let k = 1; k < 5; k++) { const yy = y + (h * k) / 5; P(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + w * 0.3, yy - 4, x + w * 0.7, yy + 4, x + w, yy); ctx.stroke(); }
  ctx.restore();
  if (o.inner !== false) {
    const p = o.pad || 14;
    rrect(x + p, y + p, w - p * 2, h - p * 2, (o.r || 18) - 6); fs(lg(0, y, 0, y + h, ['#fff7e2', '#f2e2bd'])); st(3);
  }
  for (const [nx, ny] of [[x + 9, y + 9], [x + w - 9, y + 9], [x + 9, y + h - 9], [x + w - 9, y + h - 9]]) { circ(nx, ny, 3.2); fs('#d9d2c0'); st(1.6); }
}
// wooden plank button (immediate-mode)
function plankBtn(id, x, y, w, h, label, onClick, o = {}) {
  const b = UI.btn(id, x, y, w, h, onClick, o);
  const press = b.press ? 4 : 0, hov = b.hover && !o.disabled;
  if (b.hover && UI.lastHover !== id) { UI.lastHover = id; Snd.play('hover'); }
  ctx.save(); ctx.translate(0, press);
  if (o.rot) { ctx.translate(x + w / 2, y); ctx.rotate(o.rot); ctx.translate(-(x + w / 2), -y); }
  rrect(x, y + 7 - press, w, h, 14); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill();
  const base = o.disabled ? '#8f8172' : (o.color || '#b8783d');
  rrect(x, y, w, h, 14); fs(lg(x, y, x, y + h, [shade(base, hov ? 0.32 : 0.2), base, shade(base, -0.22)])); st(4);
  ctx.save(); rrect(x, y, w, h, 14); ctx.clip();
  ctx.strokeStyle = 'rgba(60,30,5,.22)'; ctx.lineWidth = 2;
  P(); ctx.moveTo(x + 10, y + h * 0.35); ctx.bezierCurveTo(x + w * 0.4, y + h * 0.3, x + w * 0.6, y + h * 0.42, x + w - 10, y + h * 0.36); ctx.stroke();
  P(); ctx.moveTo(x + 10, y + h * 0.72); ctx.bezierCurveTo(x + w * 0.35, y + h * 0.76, x + w * 0.7, y + h * 0.66, x + w - 10, y + h * 0.7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, y, w, h * 0.3);
  ctx.restore();
  circ(x + 12, y + h / 2, 3.4); fs('#e2dccb'); st(1.6);
  circ(x + w - 12, y + h / 2, 3.4); fs('#e2dccb'); st(1.6);
  const fsz = o.size || Math.min(34, h * 0.48);
  text(label, x + w / 2 + (o.icon ? 14 : 0), y + h / 2 + 2, fsz, { fill: o.disabled ? '#d8d0c4' : (o.textColor || '#fff8e0'), sw: fsz * 0.22 });
  if (o.icon) o.icon(x + w / 2 - ctx.measureText(label).width / 2 - 8, y + h / 2);
  ctx.restore();
  return b;
}
function roundBtn(id, x, y, r, drawIcon, onClick, o = {}) {
  const b = UI.btn(id, x - r, y - r, r * 2, r * 2, onClick, o);
  const press = b.press ? 3 : 0;
  circ(x, y + 5, r); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill();
  const base = o.color || '#b8783d';
  circ(x, y + press, r); fs(lg(x, y - r, x, y + r, [shade(base, b.hover ? 0.32 : 0.2), base, shade(base, -0.25)])); st(4);
  ctx.save(); ctx.translate(x, y + press); drawIcon(); ctx.restore();
  return b;
}
function iconPause() { rrect(-10, -12, 7, 24, 2); fst('#fff8e0', 2.5); rrect(3, -12, 7, 24, 2); fst('#fff8e0', 2.5); }
function iconPlay() { P(); ctx.moveTo(-7, -12); ctx.lineTo(12, 0); ctx.lineTo(-7, 12); ctx.closePath(); fst('#fff8e0', 2.5); }
function iconFast(on) { for (const dx of [-10, 2]) { P(); ctx.moveTo(dx, -11); ctx.lineTo(dx + 11, 0); ctx.lineTo(dx, 11); ctx.closePath(); fst(on ? '#ffe45c' : '#fff8e0', 2.4); } }
function iconSound(on) {
  P(); ctx.moveTo(-13, -5); ctx.lineTo(-6, -5); ctx.lineTo(3, -13); ctx.lineTo(3, 13); ctx.lineTo(-6, 5); ctx.lineTo(-13, 5); ctx.closePath(); fst('#fff8e0', 2.4);
  if (on) { P(); ctx.arc(4, 0, 8, -0.9, 0.9); st(3, '#fff8e0'); P(); ctx.arc(4, 0, 14, -0.9, 0.9); st(3, '#fff8e0'); }
  else { line(7, -7, 17, 7, 3.5, '#ff6b4a'); line(17, -7, 7, 7, 3.5, '#ff6b4a'); }
}
function iconBack() { P(); ctx.moveTo(8, -12); ctx.lineTo(-8, 0); ctx.lineTo(8, 12); st(5, '#fff8e0'); }
function iconLock(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  P(); ctx.arc(0, -6, 8, Math.PI, 0); st(4, OUT); P(); ctx.arc(0, -6, 8, Math.PI, 0); st(2.2, '#c9c9c9');
  rrect(-11, -6, 22, 17, 4); fst('#f2c14e', 3); circ(0, 2, 2.6); fs(OUT);
  ctx.restore();
}
function drawTrowel(x, y, s = 1, rot = -0.6) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(rot);
  rrect(-5, 4, 10, 28, 4); fst('#c0703a', 3);
  rrect(-3, -2, 6, 8, 2); fst('#8a8f99', 2.4);
  P(); ctx.moveTo(-13, -4); ctx.quadraticCurveTo(-14, -26, 0, -36); ctx.quadraticCurveTo(14, -26, 13, -4); ctx.closePath();
  fs(lg(-12, 0, 12, 0, ['#d8dee8', '#9aa3b0'])); st(3);
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ell(-5, -18, 2.5, 8, 0.2); ctx.fill();
  ctx.restore();
}

// Seed card
function drawCardFace(w, h, type, can) {
  const def = PLANTS[type];
  rrect(0, 4, w, h, 9); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fill();
  rrect(0, 0, w, h, 9); fs(lg(0, 0, 0, h, ['#fbf3d5', '#e8d39b'])); st(3);
  rrect(5, 5, w - 10, h - 30, 6); fs(lg(0, 0, 0, h - 25, ['#bfe8ff', '#8fd6a0'])); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(40,30,10,.4)'; ctx.stroke();
  ctx.save(); rrect(5, 5, w - 10, h - 30, 6); ctx.clip();
  const big = ['stump', 'pepper', 'gourd'].includes(type) ? 0.5 : type === 'thorn' ? 0.62 : 0.56;
  ctx.translate(w / 2 - 2, h - 30 - (type === 'thorn' ? 18 : 2)); ctx.scale(big, big);
  PLANT_ART[type]({ t: 0.5, armed: true, hpFrac: 1 });
  ctx.restore();
  drawDew(14, h - 13, 6);
  text(String(def.cost), w / 2 + 6, h - 13, 19, { fill: can ? '#3b2a14' : '#b13a2a', stroke: false });
}
function drawCard(x, y, w, h, type, o = {}) {
  const can = o.affordable !== false;
  ctx.save();
  if (o.selected) ctx.translate(0, -6);
  Sprites.draw(Sprites.get(`card:${type}:${w}x${h}:${can ? 1 : 0}`, { x: -2, y: -2, w: w + 4, h: h + 8 }, () => drawCardFace(w, h, type, can)), x, y);
  if (o.cd > 0) { ctx.fillStyle = 'rgba(30,20,10,.55)'; rrect(x, y, w, h * o.cd, 9); ctx.fill(); }
  if (!can || o.cd > 0) { rrect(x, y, w, h, 9); ctx.fillStyle = 'rgba(30,20,10,.28)'; ctx.fill(); }
  if (o.selected) { rrect(x - 3, y - 3, w + 6, h + 6, 11); st(4, '#fff36b'); }
  ctx.restore();
}

/* ---------- Logo ---------- */
function drawLogo(x, y, s, t, intro = 99) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wob = i => Math.sin(t * 2.4 + i * 0.7) * 3;
  const word = (str, yy, size, c1, c2, i0 = 0) => {
    ctx.font = `${size}px ${FONT_D}`;
    const widths = [...str].map(ch => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + (str.length - 1) * 2;
    let xx = -total / 2;
    [...str].forEach((ch, i) => {
      const k = clamp((intro - (i0 + i) * 0.08) / 0.55, 0, 1);
      if (k <= 0) { xx += widths[i] + 2; return; }
      const cx = xx + widths[i] / 2, cy = yy + wob(i) - (1 - easeOutBack(k)) * 320;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(i * 1.7) * 0.06);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.3; ctx.strokeStyle = OUT; ctx.strokeText(ch, 0, 6);
      ctx.strokeText(ch, 0, 0);
      const gr = ctx.createLinearGradient(0, -size / 2, 0, size / 2); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      ctx.fillStyle = gr; ctx.fillText(ch, 0, 0);
      ctx.restore();
      xx += widths[i] + 2;
    });
    return total;
  };
  const w1 = word('SPROUT', -44, 92, '#c9ff7a', '#3fae2a');
  word('SIEGE', 44, 92, '#ffe26a', '#f08a1c', 6);
  if (intro < 1.1) { ctx.restore(); return; }
  // sprout on top-left
  ctx.save(); ctx.translate(-w1 / 2 + 10, -100);
  stemPath(0, 10, -4, -6, 4, -18, 4, '#4fb53a'); leaf(4, -18, 26, 9, -0.6, '#7fd458'); leaf(2, -10, 20, 7, Math.PI + 0.6, '#62c74a');
  ctx.restore();
  // a zombie peeking over the logo
  ctx.save(); ctx.translate(w1 / 2 + 30, -12); ctx.scale(0.5, 0.5); ctx.rotate(0.12);
  BUG_ART.basic({ walk: t * 4, eat: (Math.sin(t * 3) + 1) / 2 });
  ctx.restore();
  ctx.restore();
}

// Growing-vine progress bar (loading screen)
function vineBar(x, y, w, p, t) {
  rrect(x - 6, y - 16, w + 12, 32, 16); fs(lg(0, y - 16, 0, y + 16, ['#5c3a1e', '#3e2612'])); st(4);
  const end = x + w * clamp(p, 0, 1);
  P(); ctx.moveTo(x + 4, y);
  for (let xx = x + 4; xx <= end; xx += 6) ctx.lineTo(xx, y + Math.sin(xx * 0.08) * 4);
  tube(6, '#5cc244');
  for (let xx = x + 30; xx < end - 6; xx += 46) {
    const up = (Math.floor(xx / 46) % 2) ? -1 : 1;
    leaf(xx, y + Math.sin(xx * 0.08) * 4, 18, 6, up > 0 ? -0.9 : 0.9, '#7fd458', false);
  }
  if (p < 1) { circ(end, y + Math.sin(end * 0.08) * 4, 7); fst('#a8ee6e', 3); }
  else { // flower bloom
    const fx = end, fy = y + Math.sin(end * 0.08) * 4;
    for (let k = 0; k < 6; k++) { circ(fx + Math.cos(k * 1.05 + t) * 9, fy + Math.sin(k * 1.05 + t) * 9, 7); fst('#ffd23a', 2.4); }
    circ(fx, fy, 6); fst('#f08a1c', 2.4);
  }
}

/* ---------- sprite cache: pre-rendered plants, bugs and cards (LRU, pixel budget) ---------- */
const Sprites = {
  map: new Map(), px: 0, budget: 14e6, rs: 1,
  setScale(rs) {
    rs = clamp(rs, 0.5, 1.75);
    if (Math.abs(rs - this.rs) > 0.02) { this.map.clear(); this.px = 0; this.rs = rs; }
  },
  get(key, box, drawFn) {
    let e = this.map.get(key);
    if (e) { this.map.delete(key); this.map.set(key, e); return e; }
    const c = document.createElement('canvas');
    const w = Math.max(1, Math.ceil(box.w * this.rs)), h = Math.max(1, Math.ceil(box.h * this.rs));
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const prev = ctx; setCtx(g);
    g.scale(this.rs, this.rs); g.translate(-box.x, -box.y);
    drawFn();
    setCtx(prev);
    e = { c, box };
    this.map.set(key, e); this.px += w * h;
    while (this.px > this.budget && this.map.size > 1) {
      const k = this.map.keys().next().value, old = this.map.get(k);
      this.px -= old.c.width * old.c.height; this.map.delete(k);
    }
    return e;
  },
  draw(e, x, y) { ctx.drawImage(e.c, x + e.box.x, y + e.box.y, e.box.w, e.box.h); },
  flash(e, x, y, a = 0.5) {
    const op = ctx.globalCompositeOperation, ga = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ga * a;
    this.draw(e, x, y);
    ctx.globalCompositeOperation = op; ctx.globalAlpha = ga;
  }
};
const PLANT_BOX = { x: -66, y: -130, w: 144, h: 156 };
const BUG_BOXES = {
  basic: { x: -84, y: -152, w: 128, h: 164 }, lid: { x: -88, y: -150, w: 132, h: 162 }, runner: { x: -88, y: -146, w: 136, h: 158 },
  barrel: { x: -84, y: -150, w: 132, h: 162 }, leaper: { x: -86, y: -162, w: 130, h: 174 }, brute: { x: -116, y: -198, w: 172, h: 210 },
  scarecrow: { x: -90, y: -164, w: 140, h: 176 }, pumpkin: { x: -86, y: -152, w: 130, h: 164 }, gardener: { x: -98, y: -152, w: 142, h: 164 },
  mailman: { x: -86, y: -146, w: 132, h: 158 }, parka: { x: -90, y: -150, w: 138, h: 162 }, skater: { x: -88, y: -158, w: 134, h: 170 },
  gnome: { x: -56, y: -128, w: 88, h: 140 }, wheelbarrow: { x: -126, y: -152, w: 172, h: 164 }, beekeeper: { x: -96, y: -156, w: 142, h: 168 }, boss: { x: -170, y: -306, w: 260, h: 318 }
};


/* ---------- Sprig, the tutorial mascot (a seedling in a flowerpot) ---------- */
function drawSprig(x, y, s, t, talk = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const bob = Math.sin(t * 3) * 2;
  // pot
  P(); ctx.moveTo(-30, -36); ctx.lineTo(30, -36); ctx.lineTo(23, 0); ctx.lineTo(-23, 0); ctx.closePath();
  fs(lg(-30, 0, 30, 0, ['#b8572e', '#e07a45', '#b8572e'])); st(3.4);
  rrect(-35, -46, 70, 14, 5); fs(lg(0, -46, 0, -32, ['#f08f58', '#c4612f'])); st(3.2);
  ctx.translate(0, -44 + bob);
  // stem + leaf arms (wave when talking)
  P(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-3, -14, 0, -26); tube(6, '#4fb53a');
  const wave = talk ? Math.sin(t * 9) * 0.35 : Math.sin(t * 2) * 0.1;
  leaf(-2, -12, 26, 9, Math.PI + 0.3 + wave, '#6fd14f');
  leaf(2, -14, 26, 9, -0.3 - wave * 0.6, '#6fd14f');
  // head
  ctx.translate(0, -48);
  ell(0, 0, 30, 27); fs(rg(-10, -12, 2, 0, 0, 36, ['#d8ffb0', '#8be05c', '#4fb53a'])); st(3.6);
  leaf(-4, -24, 26, 10, -1.9, '#62c74a'); leaf(4, -24, 26, 10, -1.25, '#7fd458');
  const blink = (t % 3.3) < 0.12;
  if (blink) { closedEye(-10, -2, 6); closedEye(10, -2, 6); } else { eye(-10, -2, 7.5, 0.2, 0.1); eye(10, -2, 7.5, 0.2, 0.1); }
  ell(-19, 8, 5, 3); ctx.fillStyle = 'rgba(255,110,140,.5)'; ctx.fill(); ell(19, 8, 5, 3); ctx.fill();
  const mo = talk ? (Math.sin(t * 18) + 1) / 2 : 0;
  ell(0, 12, 6, 2 + mo * 5); fst('#5a1e14', 2.4);
  ctx.restore();
}
/* ---------- pointing hand (tutorial / demo cursor) ---------- */
function drawHand(x, y, s = 1, press = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - press * 0.12), s * (1 - press * 0.12)); ctx.rotate(-0.35);
  // finger tip at (0,0); hand extends down-right
  P();
  ctx.moveTo(-7, 6); ctx.quadraticCurveTo(-8, -2, 0, -2); ctx.quadraticCurveTo(8, -2, 7, 6);
  ctx.lineTo(8, 30); ctx.quadraticCurveTo(14, 24, 20, 30); ctx.quadraticCurveTo(26, 26, 31, 33);
  ctx.quadraticCurveTo(38, 31, 40, 40); ctx.lineTo(40, 58); ctx.quadraticCurveTo(38, 74, 22, 76);
  ctx.lineTo(4, 76); ctx.quadraticCurveTo(-10, 72, -14, 56); ctx.lineTo(-20, 42); ctx.quadraticCurveTo(-22, 34, -14, 34);
  ctx.lineTo(-7, 42); ctx.closePath();
  fs(lg(-20, 0, 40, 0, ['#ffffff', '#f2ece0'])); st(3.6);
  line(8, 30, 9, 44, 2.4, 'rgba(36,24,12,.55)'); line(20, 30, 21, 46, 2.4, 'rgba(36,24,12,.55)'); line(31, 34, 31, 48, 2.4, 'rgba(36,24,12,.55)');
  rrect(-6, 70, 48, 14, 5); fst('#e8453a', 3);
  ctx.restore();
}
function drawTapRipple(x, y, k) { // k: 0..1
  circ(x, y, 10 + k * 40); ctx.lineWidth = 5 * (1 - k); ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`; ctx.stroke();
}
/* ---------- ambient critters ---------- */
function drawButterfly(x, y, t, c1 = '#ffb3d1', c2 = '#ff7aa8') {
  const flap = Math.abs(Math.sin(t * 14));
  ctx.save(); ctx.translate(x, y);
  for (const sgn of [-1, 1]) {
    ctx.save(); ctx.scale(sgn * (0.25 + flap * 0.75), 1);
    ell(8, -6, 9, 7, -0.4); fst(c1, 2); ell(7, 5, 6, 5, 0.4); fst(c2, 2);
    ctx.restore();
  }
  ell(0, 0, 2, 7); fs(OUT);
  line(0, -7, -4, -13, 1.4, OUT); line(0, -7, 4, -13, 1.4, OUT);
  ctx.restore();
}
function drawFirefly(x, y, t, seed) {
  const g = 0.5 + Math.sin(t * 3 + seed) * 0.5;
  circ(x, y, 9); ctx.fillStyle = `rgba(255,240,120,${0.18 * g})`; ctx.fill();
  circ(x, y, 3); ctx.fillStyle = `rgba(255,250,170,${0.5 + 0.5 * g})`; ctx.fill();
}
/* ---------- leafy screen transition ---------- */
function drawLeafWipe(k, dir) {
  // dir 1: cover sweeping left->right (k 0..1); dir -1: reveal continuing to the right (k 1..0)
  const edge = dir === 1 ? lerp(-260, W + 260, ease(k)) : lerp(W + 260, -260, ease(k));
  const coverLeft = dir === 1;
  P();
  if (coverLeft) { ctx.moveTo(-10, -10); ctx.lineTo(edge, -10); }
  else { ctx.moveTo(W + 10, -10); ctx.lineTo(edge, -10); }
  for (let y = -10; y <= H + 40; y += 40) {
    const bulge = 60 * (coverLeft ? 1 : -1);
    ctx.quadraticCurveTo(edge + bulge, y + 20, edge + Math.sin(y * 0.05) * 30, y + 40);
  }
  if (coverLeft) ctx.lineTo(-10, H + 50); else ctx.lineTo(W + 10, H + 50);
  ctx.closePath();
  fs(lg(0, 0, 0, H, ['#3f8f3a', '#2a6a28', '#1f4f1e'])); st(6, '#173a16');
  for (let y = 20; y < H; y += 72) {
    const x = edge + Math.sin(y * 0.05) * 30;
    leaf(x - (coverLeft ? 10 : -10), y, 46, 16, coverLeft ? -0.4 + Math.sin(y) * 0.5 : Math.PI + 0.4, '#5cbf45');
  }
}
/* ---------- confetti ---------- */
const CONFETTI_COLORS = ['#ffd23a', '#ff6b4a', '#5cc244', '#58c8ff', '#c77cf0', '#ffffff'];
