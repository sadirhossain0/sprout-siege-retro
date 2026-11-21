/* ===== Gameplay ===== */
const ALL_ROWS = [0, 1, 2, 3, 4];
const W1_LEVELS = [
  { name: 'Level 1-1', world: 0, theme: 'day', sub: 'First Sprouts', rows: [1, 2, 3], waves: 5, flags: [5], base: 1, grow: 0.35, pool: { basic: 1 }, first: 24, dew: 150, interval: 24,
    tip: 'Tap a seed card, then tap the lawn to plant it. Tap dew drops to collect them!' },
  { name: 'Level 1-2', world: 0, theme: 'day', sub: 'Trash-Lid Shields', waves: 7, flags: [7], base: 1, grow: 0.45, pool: { basic: 3, lid: 1.4 }, minWave: { lid: 3 }, first: 22, dew: 100,
    tip: 'Stumpy is cheap and tough. Put it in front of your blasters to hold zombies back.' },
  { name: 'Level 1-3', world: 0, theme: 'day', sub: 'Mushroom Traps', waves: 8, flags: [4, 8], base: 1.5, grow: 0.5, pool: { basic: 3, lid: 2 }, minWave: { lid: 2 }, first: 22, dew: 100,
    tip: 'Spore Puffs are only 25 dew, but they need 12 seconds to wake up. Plant them early.' },
  { name: 'Level 1-4', world: 0, theme: 'day', sub: 'Frosty Morning', waves: 9, flags: [5, 9], base: 2, grow: 0.55, pool: { basic: 3, lid: 2, runner: 2 }, minWave: { runner: 3 }, first: 20, dew: 100,
    tip: 'Ladybugs are fast. Frost Ferns slow down everything they hit.' },
  { name: 'Level 1-5', world: 0, theme: 'day', sub: 'Roll Out the Barrels', waves: 10, flags: [5, 10], base: 2, grow: 0.65, pool: { basic: 3, lid: 2, runner: 1.5, barrel: 1.2 }, minWave: { barrel: 3 }, first: 20, dew: 100,
    tip: 'Shell Snails soak up damage. Save a Boom Gourd for when they bunch up.' },
  { name: 'Level 1-6', world: 0, theme: 'dusk', sub: 'Dusk Acrobats', dusk: true, waves: 10, flags: [5, 10], base: 2, grow: 0.7, pool: { basic: 3, lid: 2, leaper: 1.6, barrel: 1 }, minWave: { leaper: 2, barrel: 5 }, first: 20, dew: 125,
    tip: 'Less dew falls at dusk. Hoppers jump the first plant they reach: a Stumpy is a good thing to sacrifice.' },
  { name: 'Level 1-7', world: 0, theme: 'dusk', sub: 'Twilight Thorns', dusk: true, waves: 12, flags: [6, 12], base: 2.5, grow: 0.75, pool: { basic: 3, lid: 2, runner: 1.5, barrel: 1.2, leaper: 1.4 }, first: 20, dew: 125,
    tip: 'Snapjaw can swallow a zombie whole, but it is helpless while it chews.' },
  { name: 'Level 1-8', world: 0, theme: 'dusk', sub: 'The Brute Arrives', dusk: true, waves: 12, flags: [6, 12], base: 3, grow: 0.8, pool: { basic: 3, lid: 2, barrel: 1.3, leaper: 1.3, brute: 0.7 }, minWave: { brute: 5 }, first: 20, dew: 125,
    tip: 'Rhino Beetles crush plants quickly. Hit them hard and early.' },
  { name: 'Level 1-9', world: 0, theme: 'day', sub: 'Garden Under Siege', waves: 14, flags: [7, 14], base: 3, grow: 0.9, pool: { basic: 3, lid: 2, runner: 1.5, barrel: 1.3, leaper: 1.3, brute: 0.8 }, minWave: { brute: 4 }, first: 20, dew: 125,
    tip: 'Fire Pepper clears an entire row. Keep one ready for an emergency.' },
  { name: 'Level 1-10', world: 0, theme: 'day', sub: 'The Final Horde', waves: 15, flags: [5, 10, 15], base: 3.5, grow: 1.0, pool: { basic: 3, lid: 2.2, runner: 1.6, barrel: 1.4, leaper: 1.4, brute: 1 }, minWave: { brute: 3 }, first: 20, dew: 150,
    tip: 'This is it. Every zombie in the meadow is coming for your greenhouse!' }
];

const WORLDS = [
  { key: 'day', name: 'Backyard', color: '#5aa83a' },
  { key: 'autumn', name: 'Autumn Orchard', color: '#d0782a' },
  { key: 'night', name: 'Moonlit Garden', color: '#5a64b8' },
  { key: 'winter', name: 'Frosty Garden', color: '#4f9ad0' },
  { key: 'beach', name: 'Sunny Beach', color: '#d8a830' },
  { key: 'grove', name: 'Mushroom Grove', color: '#8a5ab8' }
];
const WORLD_GEN = {
  autumn: { dew: 125, intro: { scarecrow: 0, pumpkin: 3, gnome: 5, gardener: 6 },
    subs: ['Falling Leaves', 'Apple Picking', 'Scarecrow Season', 'Pumpkin Patch', 'Windy Rows', 'Harvest Moon', 'The Gardener Arrives', 'Cider Press', 'Leaf Pile Panic', 'The Great Harvest'],
    tips: ['Apples fall from the orchard trees now and then. Tap them for 50 dew!', 'Scarecrow hats soak up the first hits. Two shooters per row help.', 'Rocks and logs block some squares. Plan around them.', 'Pumpkin-heads are tough. Snapjaw can swallow them whole.', 'Gardener Zombies heal their friends. Take them out first!'] },
  night: { dew: 150, intro: { mailman: 1, wheelbarrow: 3 },
    subs: ['First Night', 'Firefly Lane', 'Midnight Mail', 'Moonbeam Rows', 'Owl Hour', 'Shadow Hedges', 'Lantern Light', 'Witching Hour', 'Starless Sky', 'Dawn Is Coming'],
    tips: ['Very little dew falls at night. Dew Lilies are your lifeline.', 'Mailman Zombies drop a big 50-dew drop when defeated.', 'Spore Puffs and Ivy Snares are cheap ways to hold the line.', 'Save Fire Peppers for the final horde.'] },
  winter: { dew: 125, intro: { parka: 0, skater: 2 },
    subs: ['First Frost', 'Snowed In', 'Skating Season', 'Icicle Alley', 'Blizzard Warning', 'Frozen Pond', 'Snowball Fight', 'Polar Night', 'Deep Freeze', 'The Big Thaw'],
    tips: ['The lanes are icy: zombies walk a little faster here.', 'Parka Zombies cannot be slowed while their hood is up.', 'Skaters race in until something hits them. Keep a shooter in every row.', 'Breeze Bloom pushes zombies back into your line of fire.'] },
  beach: { dew: 125, intro: { beekeeper: 1 },
    subs: ['Sunny Start', 'Sandcastles', 'Tide Pools', 'Heat Wave', 'Boardwalk', 'Beach Party', 'Sunburn', 'Coconut Grove', 'Storm Clouds', 'The Last Stand'],
    tips: ['Lots of dew falls at the beach, but it dries up fast. Grab it quickly!', 'Every kind of zombie shows up here. Mix up your plants.', 'Thorn Rose hits every zombie in a row. Great against crowds.', 'This is the final world. Good luck!'] }
};
WORLD_GEN.grove = { dew: 125, intro: {},
  subs: ['Rainy Start', 'Puddle Jump', 'Toadstool Ring', 'Drizzle', 'Spore Season', 'Thunder Rolls', 'Moss Maze', 'Downpour', 'Glowcap Night', 'The Compost King'],
  tips: ['It always rains in the Mushroom Grove: extra dew falls, and the mud slows zombies down.', 'Moon Mushrooms are cheap dew makers. Plant lots of them!', 'Sprinkler Bloom splashes every zombie around it.', 'The biggest Compost Giant of all waits at the end. Good luck!'] };
const BASE_POOL = { basic: 3, lid: 2, runner: 1.3, barrel: 1, leaper: 1, brute: 0.6 };
function genBlocked(seed, k) {
  const r = mulberry(seed * 977 + 13), cells = [];
  for (let g = 0; cells.length < k && g < 60; g++) {
    const c = 3 + Math.floor(r() * 5), rr = Math.floor(r() * 5);
    if (!cells.some(([a, b]) => a === c && b === rr)) cells.push([c, rr]);
  }
  return cells;
}
function genWorldLevels(w) {
  const key = WORLDS[w].key, def = WORLD_GEN[key], out = [];
  for (let n = 0; n < 10; n++) {
    const waves = Math.min(16, 8 + n + (w >= 3 ? 1 : 0));
    const flags = n === 9 ? [Math.ceil(waves / 3), Math.ceil(waves * 2 / 3), waves] : [Math.ceil(waves / 2), waves];
    const pool = Object.assign({}, BASE_POOL), minWave = {};
    pool.brute = n < 3 ? 0.25 : 0.5 + n * 0.05;
    minWave.brute = Math.max(2, 7 - n);
    for (let pw = 1; pw < w; pw++) for (const k in WORLD_GEN[WORLDS[pw].key].intro) pool[k] = 0.8;
    for (const k in def.intro) if (n >= def.intro[k]) { pool[k] = n === def.intro[k] ? 2.4 : 1.4; if (n === def.intro[k]) minWave[k] = 2; }
    const weather = key === 'grove' ? 'rain' : ({ autumn: { 4: 'wind', 8: 'rain' }, winter: { 4: 'wind', 8: 'wind' }, beach: { 8: 'rain' }, night: { 5: 'wind' } }[key] || {})[n] || null;
    out.push({
      name: `Level ${w + 1}-${n + 1}`, sub: def.subs[n], world: w, theme: key, waves, flags, weather, boss: n === 9,
      base: 2 + w * 0.45 + n * 0.12, grow: 0.62 + w * 0.08 + n * 0.035, pool, minWave,
      first: 20, dew: def.dew, interval: Math.max(18, 24 - n * 0.6), tip: def.tips[n % def.tips.length],
      blocked: n >= 1 ? genBlocked(w * 10 + n, n >= 5 ? 3 : 2) : [], thunder: key === 'grove' && (n === 5 || n === 9)
    });
  }
  return out;
}
W1_LEVELS[9].boss = true; W1_LEVELS[6].weather = 'rain';
const LEVELS = W1_LEVELS.concat(genWorldLevels(1), genWorldLevels(2), genWorldLevels(3), genWorldLevels(4), genWorldLevels(5));
// Daily Challenge: everyone gets the same seeded level each day, with its own plants and a twist.
const DAILY_TWISTS = [
  { key: 'fast', name: 'Speedy Zombies', desc: 'Every zombie moves 30% faster.' },
  { key: 'tough', name: 'Tough Crowd', desc: 'Zombies have 40% more health.' },
  { key: 'poor', name: 'Dry Spell', desc: 'You start with only 50 dew and less falls from the sky.' },
  { key: 'rush', name: 'Zombie Rush', desc: 'Waves arrive much closer together.' },
  { key: 'giant', name: 'Giant Finale', desc: 'A Compost Giant joins the final horde.' },
  { key: 'storm', name: 'Thunderstorm', desc: 'Rain and thunder all level long.' },
  { key: 'gusty', name: 'Gusty Day', desc: 'Strong gusts blow the zombies toward you.' },
  { key: 'narrow', name: 'Narrow Garden', desc: 'Only three rows, but zombies pile in.' }
];
function dailyKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function makeDaily(key = dailyKey()) {
  const seed = key.split('-').reduce((a, n) => a * 37 + +n, 7), r = mulberry(seed);
  const rpick = arr => arr[Math.floor(r() * arr.length)];
  const twist = DAILY_TWISTS[Math.floor(r() * DAILY_TWISTS.length)];
  let world = Math.floor(r() * WORLDS.length);
  if (['storm', 'gusty'].includes(twist.key) && WORLDS[world].key === 'winter') world = WORLDS.length - 1;
  const theme = WORLDS[world].key;
  // plants: always a dew maker and a shooter, then six more at random
  const others = PLANT_ORDER.filter(k => !['lily', 'berry'].includes(k));
  for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
  const plants = [r() < 0.7 ? 'lily' : 'moonshroom', 'berry'].concat(others.filter(k => k !== 'moonshroom').slice(0, 6));
  const pool = { basic: 3, lid: 2 };
  const extra = BUG_ORDER.filter(k => !['basic', 'lid', 'boss'].includes(k));
  for (let i = 0; i < 5; i++) pool[rpick(extra)] = 1.2 + r();
  const rows = twist.key === 'narrow' ? [1, 2, 3] : ALL_ROWS;
  const L = {
    name: 'Daily Challenge', sub: twist.name, daily: key, twist: twist.key, world, theme, rows, waves: 10, flags: [5, 10],
    base: 2.6, grow: 0.75, pool, minWave: { brute: 4 }, first: 20, dew: twist.key === 'poor' ? 50 : 150,
    interval: twist.key === 'rush' ? 15 : 22, plants, boss: twist.key === 'giant',
    weather: twist.key === 'storm' ? 'rain' : twist.key === 'gusty' ? 'wind' : theme === 'grove' ? 'rain' : null, thunder: twist.key === 'storm',
    budgetMult: twist.key === 'narrow' ? 0.8 : 1,
    blocked: twist.key === 'narrow' ? [] : genBlocked(seed % 1000, 2 + Math.floor(r() * 2)),
    tip: `Today's twist: ${twist.desc}`
  };
  return L;
}
const DAILY_IDX = -2;
const DIFFICULTY = { easy: { hp: 0.75, speed: 0.9, dew: 50 }, normal: { hp: 1, speed: 1, dew: 0 }, hard: { hp: 1.3, speed: 1.1, dew: -25 } };
function startDaily() { startLevel(DAILY_IDX, false, { level: makeDaily() }); }
const ENDLESS = { name: 'Endless Horde', sub: 'How long can you last?', endless: true, theme: 'dusk', world: 0, first: 20, dew: 150, interval: 24, tip: 'Waves keep coming and keep getting bigger.' };
// level index at which each plant becomes available
const UNLOCK_AT = { lily: 0, berry: 0, stump: 1, puff: 2, frost: 3, gourd: 4, snap: 5, thistle: 6, thorn: 7, pepper: 8, rose: 12, snare: 16, moonshroom: 21, breeze: 23, popcorn: 27, lobber: 33, hedge: 37, sprinkler: 43 };
const BUG_INTRO = { basic: 0, lid: 1, runner: 3, barrel: 4, leaper: 5, brute: 7, scarecrow: 10, pumpkin: 13, gardener: 16, mailman: 21, parka: 30, skater: 32, gnome: 15, wheelbarrow: 23, beekeeper: 41, boss: 9 };
const rewardOf = idx => PLANT_ORDER.find(k => UNLOCK_AT[k] === idx + 1) || null;
const plantsFor = idx => PLANT_ORDER.filter(k => UNLOCK_AT[k] <= idx);

function weightedPick(weights) {
  let total = 0; for (const k in weights) total += weights[k];
  let r = Math.random() * total;
  for (const k in weights) { r -= weights[k]; if (r <= 0) return k; }
  return Object.keys(weights)[0];
}
function makeWave(budget, pool, w, minWave, huge) {
  const list = [];
  const avail = {};
  for (const k in pool) if (w >= ((minWave && minWave[k]) || 1)) avail[k] = pool[k];
  if (huge) { // lead with the toughest bug available
    const tough = Object.keys(avail).sort((a, b) => BUGS[b].cost - BUGS[a].cost)[0];
    if (BUGS[tough].cost <= budget) { list.push(tough); budget -= BUGS[tough].cost; }
  }
  let guard = 200;
  while (budget > 0 && guard--) {
    const opts = {};
    for (const k in avail) if (BUGS[k].cost <= budget) opts[k] = avail[k];
    if (!Object.keys(opts).length) break;
    const k = weightedPick(opts);
    list.push(k); budget -= BUGS[k].cost;
  }
  return { list, huge };
}
function buildWaves(L) {
  const out = [];
  for (let w = 1; w <= L.waves; w++) {
    const huge = L.flags.includes(w);
    const budget = Math.max(1, Math.round((L.base + L.grow * (w - 1)) * (huge ? 2.5 : 1) * (L.budgetMult || 1)));
    out.push(makeWave(budget, L.pool, w, L.minWave, huge));
  }
  if (L.boss) out[out.length - 1].list.push('boss');
  return out;
}
function endlessWave(w) {
  const huge = w % 5 === 0;
  const budget = Math.round((3 + 0.75 * (w - 1)) * (huge ? 2.2 : 1));
  const pool = { basic: 4, lid: 3, runner: 2, barrel: 1.6, leaper: 1.6, brute: 0.5 + w / 15, scarecrow: 1.2, pumpkin: 1.2, gardener: 0.8, mailman: 1, parka: 1.2, skater: 1.2, gnome: 1, wheelbarrow: 0.8, beekeeper: 0.8 };
  return makeWave(budget, pool, w, { gnome: 4, wheelbarrow: 8, beekeeper: 9, lid: 2, runner: 3, mailman: 3, scarecrow: 4, barrel: 5, skater: 6, leaper: 7, pumpkin: 8, parka: 9, brute: 10, gardener: 11 }, huge);
}

let G = null;
const cardRect = i => ({ x: 116 + i * 70, y: 12, w: 66, h: 96 });
const trowelRect = () => ({ x: 116 + G.cards.length * 70 + 4, y: 12, w: 80, h: 96 });

function startLevel(idx, endless = false, opts = {}) {
  const L = opts.level || (idx === DAILY_IDX ? makeDaily() : endless ? ENDLESS : LEVELS[idx]);
  const rows = L.rows || ALL_ROWS;
  const types = opts.plants || L.plants || (endless ? PLANT_ORDER.slice(0, 10) : plantsFor(idx).slice(0, 10));
  const theme = L.theme || (L.dusk ? 'dusk' : 'day');
  G = {
    idx, endless, L, rows,
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    plants: [], bugs: [], projs: [], drops: [], parts: [], fires: [], zapFx: [],
    dew: Math.max(25, (L.dew || 100) + (DIFFICULTY[Save.data.difficulty] || DIFFICULTY.normal).dew),
    cards: types.map(type => ({ type, cd: PLANTS[type].recharge >= 30 ? PLANTS[type].recharge * 0.5 : 0 })),
    sel: null, drag: null, time: 0,
    wave: 0, totalWaves: endless ? Infinity : L.waves, waves: endless ? null : buildWaves(L),
    waveTimer: L.first || 20, sinceWave: 0, waveHP: 1, warned: -1,
    spawnQ: [],
    zappers: ALL_ROWS.map(r => (rows.includes(r) ? 'ready' : 'none')),
    msg: null, shake: 0, skyT: 5, state: 'intro', introT: 0, endT: 0,
    reward: null, lastDeath: { x: GX + CW * 6, y: rowY(2) },
    speed: 1, progVis: 0, hover: null, chompT: 0,
    tutorial: !!opts.tutorial, demo: !!opts.demo, holdWaves: !!(opts.tutorial || opts.holdWaves), tutCollected: false,
    dewBump: 0, newBug: null, pressCard: -1, pressT: 0, critters: [], critterT: 2,
    theme, blocked: new Set((L.blocked || []).map(([c, r]) => c + ',' + r)), appleT: 14,
    weather: L.weather || null, zprojs: [], crows: [], gustT: rand(9, 13), gust: 0, thunderT: rand(7, 12), thunder: 0, boss: null, bossVis: 1,
    stats: { killed: 0, planted: 0, lost: 0, dew: 0 },
    lawn: renderLawn({ rows, theme, blocked: L.blocked || [], seed: (idx + 3) * 17 })
  };
  UI.overlay = null;
  Music.play(SONGS[theme] ? theme : 'day');
}

/* ---------- helpers ---------- */
function cellAt(x, y) {
  const c = Math.floor((x - GX) / CW), r = Math.floor((y - GY) / CH);
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
  return { c, r };
}
const liveBug = b => !b.dying;
const heavy = b => b.type === 'brute' || b.type === 'boss';
const onLawn = b => b.x < GX + COLS * CW + 20;
// stun / freeze a plant (bombs are too quick to care)
function stunPlant(p, secs, frozen) {
  if (!p || p.dead || p.type === 'gourd' || p.type === 'pepper') return;
  p.stun = Math.max(p.stun || 0, secs); p.frozen = !!frozen || (p.frozen && p.stun > 0);
}
function hurtPlant(p, dmg) {
  if (!p || p.dead) return;
  p.hp -= dmg; p.flash = 0.08;
  if (p.hp <= 0) { removePlant(p); G.stats.lost++; Snd.play('gulp'); }
}
function addPart(o) {
  if (G.parts.length > 420) G.parts.shift();
  G.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 0.6, t: 0, size: 4, color: '#ffffff', kind: 'dot', rot: 0, vr: 0, drag: 0 }, o));
}
function burst(x, y, n, color, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(o.min || 60, o.max || 220);
    addPart({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g == null ? 500 : o.g, life: rand(0.3, o.life || 0.7), size: rand(o.s0 || 2.5, o.s1 || 5), color: Array.isArray(color) ? pick(color) : color, kind: o.kind || 'dot', rot: rand(0, TAU), vr: rand(-8, 8), drag: o.drag || 0 });
  }
}
function showMsg(textStr, o = {}) { G.msg = Object.assign({ text: textStr, t: 0, dur: 2.4, color: '#ffffff', size: 64 }, o); }

/* ---------- planting ---------- */
function canAfford(card) { return G.dew >= PLANTS[card.type].cost; }
function selectCard(i) {
  const card = G.cards[i];
  if (!card) return;
  if (G.sel === card.type) { G.sel = null; Snd.play('click'); return; }
  if (card.cd > 0 || !canAfford(card)) { Snd.play('deny'); return; }
  G.sel = card.type; Snd.play('select');
}
function tryPlace(cell) {
  if (!G.sel || !cell) return false;
  const existing = G.grid[cell.r][cell.c];
  if (G.sel === 'trowel') {
    if (existing && !existing.dead) { removePlant(existing); Snd.play('dig'); burst(existing.x, existing.y - 10, 12, ['#7a5532', '#5a3a1c'], { up: 120 }); G.sel = null; return true; }
    Snd.play('deny'); return false;
  }
  const card = G.cards.find(c => c.type === G.sel);
  if (!card) return false;
  if (!G.rows.includes(cell.r) || existing || G.blocked.has(cell.c + ',' + cell.r)) { Snd.play('deny'); return false; }
  if (card.cd > 0 || !canAfford(card)) { Snd.play('deny'); G.sel = null; return false; }
  G.dew -= PLANTS[card.type].cost;
  card.cd = PLANTS[card.type].recharge;
  placePlant(card.type, cell.c, cell.r);
  G.sel = null;
  return true;
}
function placePlant(type, c, r) {
  const d = PLANTS[type];
  const p = { type, c, r, x: cellX(c), y: rowY(r), hp: d.hp, maxHp: d.hp, t: rand(0, 6), cd: 0, shoot: 0, flash: 0, born: G.time, pop: 0 };
  if (type === 'lily') p.cd = rand(6, 9);
  if (type === 'berry' || type === 'frost' || type === 'thistle') p.cd = 0.5;
  if (type === 'puff') { p.arm = 0; p.armed = false; }
  if (type === 'gourd' || type === 'pepper') p.fuse = 0.0001;
  if (type === 'snap') { p.mode = 'idle'; p.p = 0; }
  if (type === 'thorn') p.attack = 0;
  if (type === 'moonshroom') p.cd = rand(4, 6);
  if (type === 'popcorn' || type === 'sprinkler') p.cd = 0.6;
  G.grid[r][c] = p; G.plants.push(p);
  if (G.stats) G.stats.planted++;
  burst(p.x, p.y - 4, 10, ['#7a5532', '#9a6c42', '#5cc244'], { up: 140, max: 160 });
  Snd.play('plant');
  return p;
}
function removePlant(p) {
  p.dead = true;
  if (G.grid[p.r][p.c] === p) G.grid[p.r][p.c] = null;
  const i = G.plants.indexOf(p); if (i >= 0) G.plants.splice(i, 1);
  for (const b of G.bugs) if (b.eating === p) b.eating = null;
}

/* ---------- bugs ---------- */
function spawnBug(type, row, x) {
  const d = BUGS[type];
  const b = { type, row, x: x == null ? W + rand(30, 80) : x, y: rowY(row), hp: d.hp, maxHp: d.hp, armor: d.armor || 0, maxArmor: d.armor || 0,
    speed: d.speed * rand(0.9, 1.08) * (G.theme === 'winter' ? 1.12 : 1), bite: d.bite, held: 0, healT: 2, skating: type === 'skater', walk: rand(0, 6), eat: 0, eating: null, slow: 0, flash: 0, dying: 0, kind: null, jumped: false, jump: 0, t: 0, biteT: rand(0, 0.4),
    stompT: rand(3, 5), spitT: rand(1.5, 3), throwT: rand(2, 4), stingT: rand(1.5, 2.5), summonT: 6, prick: 0, stompA: 0, actA: 0 };
  if (G.weather === 'rain') b.speed *= 0.9;
  if (G.L.twist === 'fast') b.speed *= 1.3;
  const df = DIFFICULTY[Save.data.difficulty] || DIFFICULTY.normal;
  b.speed *= df.speed; b.hp = b.maxHp = Math.round(b.hp * df.hp); b.armor = b.maxArmor = Math.round(b.armor * df.hp);
  if (G.L.twist === 'tough') { b.hp = b.maxHp = Math.round(b.hp * 1.4); }
  G.bugs.push(b);
  if (type === 'boss') {
    b.hp = b.maxHp = Math.round((2500 + (G.L.world || 0) * 500) * df.hp);   // the giant grows tougher world by world
    G.boss = b; G.bossVis = 0;
    showMsg('The Compost Giant is coming!', { color: '#ff6b4a', size: 60, dur: 3 });
    Snd.play('roar'); G.shake = Math.max(G.shake, 10);
  }
  return b;
}
function bugRadius(b) { return BUGS[b.type].size * (heavy(b) ? 1.1 : 0.95); }
function damageBug(b, dmg, o = {}) {
  if (b.dying) return;
  b.flash = 0.09;
  if (b.skating) { b.skating = false; b.speed = 18 * rand(0.95, 1.05); burst(b.x + 10, b.y - 4, 8, ['#e6f4ff', '#ffffff'], { up: 40, max: 120, g: 100 }); }
  if (o.kind === 'burn' && b.type === 'scarecrow') dmg *= 2;   // straw burns!
  if (o.kind === 'burn' && b.type === 'boss') dmg = Math.min(dmg, 700);
  if (b.armor > 0 && !o.pierce) {
    const a = Math.min(b.armor, dmg); b.armor -= a; dmg -= a;
    if (b.armor <= 0) {
      Snd.play('break');
      if (b.type === 'lid') addPart({ x: b.x - 44, y: b.y - 70, vx: 90, vy: -200, g: 700, life: 1.2, kind: 'lidfall', rot: 0, vr: 7 });
      if (b.type === 'barrel') { // the empty barrel rolls on ahead and smashes into the first plant
        burst(b.x + 4, b.y - 50, 10, ['#b07a42', '#7a4a22', '#8a5a2e'], { kind: 'shard', up: 160, s0: 5, s1: 10 }); b.speed *= 1.6;
        if (onLawn(b)) G.zprojs.push({ kind: 'barrel', row: b.row, x: b.x - 30, y: b.y - 22, vx: -240, dmg: 300, t: 0 });
      }
      if (b.type === 'scarecrow') {
        addPart({ x: b.x - 6, y: b.y - 120, vx: 80, vy: -240, g: 600, life: 1.3, kind: 'hatfall', rot: 0, vr: 5 });
        G.crows.push({ x: b.x - 4, y: b.y - 128, t: 0, state: 'seek', vx: 0, vy: 0 }); Snd.play('caw');
      }
      if (b.type === 'wheelbarrow') hurryBarrow(b);
      if (b.type === 'beekeeper') burst(b.x, b.y - 120, 10, ['#ffd23a', '#3a2a10'], { up: 80, g: 0, max: 200 });
      if (b.type === 'parka') burst(b.x - 6, b.y - 100, 14, ['#f2ece0', '#4f98d8'], { up: 120, s0: 3, s1: 6 });
      if (b.type === 'pumpkin') burst(b.x - 8, b.y - 110, 16, ['#f0801e', '#ffb04a', '#c85a10'], { kind: 'shard', up: 160, s0: 4, s1: 9 });
    } else if (o.sound !== false && (b.type === 'lid' || b.type === 'barrel')) Snd.play('armor');
  }
  if (dmg > 0) b.hp -= dmg;
  if (b.hp <= 0) killBug(b, o.kind || 'normal');
}
function killBug(b, kind) {
  if (b.dying) return;
  b.dying = 0.0001; b.kind = kind; b.eating = null;
  if (G.stats) G.stats.killed++;
  if (b === G.boss) {
    G.boss = null; boomFx(b.x, b.y - 120, 1.4); confettiBurst(b.x, b.y - 160, 50);
    showMsg('Compost Giant defeated!', { color: '#ffe14a', size: 60, dur: 3 }); Snd.play('reward');
    for (const o of G.bugs) if (!o.dying && o.summoned) damageBug(o, 300, { pierce: true });
  }
  G.lastDeath = { x: clamp(b.x, GX + 60, GX + COLS * CW - 60), y: b.y };
  if (b.type === 'mailman') { const d = spawnDrop(clamp(b.x, GX + 30, GX + COLS * CW - 20), b.y - 60, true); d.value = 50; d.ty = b.y - 20; burst(b.x, b.y - 50, 8, ['#fff8e0', '#ffe9b8'], { kind: 'shard', up: 140 }); }
  if (kind === 'eaten') { b.dying = 1; return; }
  if (kind === 'normal') { Snd.play('zdie'); burst(b.x, b.y - 60, 6, ['#9ec27c', '#7a9a5c'], { up: 80, max: 120 }); }
  if (kind === 'zap') burst(b.x, b.y - 30, 10, ['#bff3ff', '#ffffff', '#58c8ff'], { kind: 'spark', g: 0, max: 260 });
}
function hurryBarrow(b) {
  if (b.hurried) return;
  b.hurried = true; b.armor = 0; b.speed *= 2.2;
  burst(b.x - 50, b.y - 30, 18, ['#6a4a2a', '#8a6a3a', '#4a3018'], { up: 160, s0: 4, s1: 8 });
  Snd.play('break');
}
function plantBlocking(b) {
  const reach = b.type === 'boss' ? 80 : b.type === 'brute' ? 60 : b.type === 'wheelbarrow' && !b.hurried ? 70 : 44;
  let best = null;
  for (let c = 0; c < COLS; c++) {
    const p = G.grid[b.row][c];
    if (!p || p.dead) continue;
    if ((p.type === 'thorn' && !heavy(b)) || p.type === 'snare') continue;
    const dx = b.x - p.x;
    if (dx > -18 && dx < reach && (!best || p.x > best.x)) best = p;
  }
  return best;
}

function spawnWave(wi) {
  const wave = G.endless ? endlessWave(wi + 1) : G.waves[wi];
  const counts = {};
  G.rows.forEach(r => (counts[r] = 0));
  let delay = 0, hp = 0;
  wave.list.forEach((type, i) => {
    const minC = Math.min(...G.rows.map(r => counts[r]));
    const rowsMin = G.rows.filter(r => counts[r] === minC);
    const row = pick(rowsMin); counts[row]++;
    G.spawnQ.push({ type, row, delay });
    delay += wave.huge ? rand(0.25, 0.7) : rand(0.6, 1.6);
    hp += BUGS[type].hp + (BUGS[type].armor || 0);
    if (type === 'runner' && Math.random() < 0.3) { G.spawnQ.push({ type, row, delay: delay + 0.3, x: W + 110 }); hp += BUGS.runner.hp; }
    if (type === 'gnome') for (let k = 1; k <= 2; k++) { G.spawnQ.push({ type, row, delay: delay + k * 0.35, x: W + 30 + k * 46 }); hp += BUGS.gnome.hp; }
    if (type === 'boss') { const q = G.spawnQ[G.spawnQ.length - 1]; q.row = G.rows[Math.floor(G.rows.length / 2)]; q.delay = delay + 2; }
  });
  G.waveHP = hp;
}

/* ---------- dew ---------- */
function spawnDrop(x, y, fromPlant) {
  const d = { x, y, value: 25, t: 0, life: 9, state: fromPlant ? 'pop' : 'fall', vx: 0, vy: 0, ty: 0, rot: 0 };
  if (fromPlant) { d.vx = rand(-50, 50); d.vy = -190; d.ty = y + 46; }
  else { d.ty = rand(GY + 70, GY + ROWS * CH - 30); d.vy = 70; }
  if (fromPlant) { Snd.play('pop'); burst(x, y, 8, ['#e9fbff', '#7fdcff'], { max: 120, g: 100, kind: 'dot' }); }
  G.drops.push(d);
  return d;
}
function collectDrop(d) {
  if (d.state === 'fly') return;
  d.state = 'fly'; d.t = 0; d.fx = d.x; d.fy = d.y;
  G.tutCollected = true;
  burst(d.x, d.y, 8, ['#ffffff', '#bdefff'], { kind: 'spark', g: 0, max: 200 });
  Snd.play('dew');
}

/* ---------- attacks ---------- */
function laneTarget(p) {
  for (const b of G.bugs) if (!b.dying && b.row === p.r && b.x > p.x - 20 && b.x < W - 18) return true;
  return false;
}
function fire(p, kind) {
  const yOff = { berry: -48, frost: -52, thistle: -46 }[p.type] || -48;
  G.projs.push({ kind, row: p.r, x: p.x + 28, y: p.y + yOff, vx: 560, dmg: 20, t: 0 });
  p.shoot = 1;
  Snd.play(kind === 'ice' ? 'ice' : 'shoot');
}
function explodeArea(cx, cy, rowsArr, xr, dmg) {
  for (const b of G.bugs) if (!b.dying && rowsArr.includes(b.row) && Math.abs(b.x - cx) <= xr) damageBug(b, dmg, { kind: 'burn', pierce: false, sound: false });
}
function boomFx(x, y, scale = 1) {
  addPart({ x, y, kind: 'ring', life: 0.45, size: 150 * scale, color: '#fff4b0' });
  burst(x, y, 26, ['#ffd23a', '#ff8a1e', '#ff4a1e', '#fff3a0'], { max: 420 * scale, g: 200, s0: 4, s1: 9, life: 0.8 });
  for (let i = 0; i < 9; i++) addPart({ x: x + rand(-60, 60) * scale, y: y + rand(-40, 30), vx: rand(-30, 30), vy: rand(-80, -30), kind: 'smoke', life: rand(0.8, 1.4), size: rand(24, 44) * scale, color: '#5a5048' });
  G.shake = Math.max(G.shake, 14 * scale);
}
function fireZapper(r) {
  G.zappers[r] = 'fire';
  G.zapFx.push({ row: r, t: 0 });
  Snd.play('zap');
  G.shake = Math.max(G.shake, 8);
  for (const b of G.bugs) if (!b.dying && b.row === r && b.x < W + 30) { if (b.type === 'boss') damageBug(b, 1500, { pierce: true }); else killBug(b, 'zap'); }
  G.spawnQ.forEach(q => { if (q.row === r) q.zapSafe = true; });
}

/* ---------- update ---------- */
function updateGame(dt) {
  if (G.state === 'intro') {
    G.introT += dt;
    if (G.introT > 2.6) { G.state = 'play'; }
    return;
  }
  if (G.state === 'lost') {
    G.endT += dt;
    for (const b of G.bugs) if (b === G.loser) { b.x -= b.speed * dt * 0.6; b.walk += dt * 6; }
    updateParts(dt);
    if (G.endT > 2.6 && !UI.overlay) { UI.overlay = 'lose'; }
    return;
  }
  G.time += dt;
  G.shake = Math.max(0, G.shake - dt * 40);
  if (G.msg) G.msg.t += dt;
  G.dewBump = Math.max(0, G.dewBump - dt * 4);
  for (const c of G.cards) {
    const was = c.cd;
    c.cd = Math.max(0, c.cd - dt);
    c.flash = Math.max(0, (c.flash || 0) - dt);
    if (was > 0 && c.cd === 0) { c.flash = 0.7; if (canAfford(c)) Snd.play('ready'); }
  }
  updateCritters(dt);

  // sky dew
  G.skyT -= dt;
  if (G.skyT <= 0 && G.state === 'play' && !G.holdWaves) {
    spawnDrop(rand(GX + 50, GX + COLS * CW - 50), -30, false);
    G.skyT = ({ dusk: rand(15, 19), night: rand(22, 28), beach: rand(6, 8) }[G.theme] || rand(8.5, 11.5)) * (G.weather === 'rain' ? 0.7 : 1) * (G.L.twist === 'poor' ? 1.5 : 1);
    if (G.theme === 'beach') G.drops[G.drops.length - 1].life = 5;
  }
  // orchard twist: apples worth 50 dew fall from the trees
  if (G.theme === 'autumn' && G.state === 'play' && !G.holdWaves) {
    G.appleT -= dt;
    if (G.appleT <= 0) { const d = spawnDrop(rand(GX + 50, GX + COLS * CW - 50), -30, false); d.value = 50; d.kind = 'apple'; d.vy = 110; G.appleT = rand(17, 24); }
  }

  updateWeather(dt);
  // waves
  if (G.state === 'play' && !G.holdWaves) {
    const allSpawned = G.wave >= G.totalWaves;
    if (!allSpawned) {
      G.waveTimer -= dt; G.sinceWave += dt;
      let alive = 0;
      for (const b of G.bugs) if (!b.dying) alive += Math.max(0, b.hp) + b.armor;
      for (const q of G.spawnQ) alive += BUGS[q.type].hp;
      if (G.wave > 0 && G.sinceWave > 9 && alive < G.waveHP * 0.3) G.waveTimer = Math.min(G.waveTimer, 2.5);
      const next = G.endless ? endlessWave(G.wave + 1) : G.waves[G.wave];
      if (G.waveTimer <= 0) {
        const isFinal = !G.endless && G.wave === G.totalWaves - 1;
        if (next.huge && G.warned !== G.wave) {
          G.warned = G.wave; G.waveTimer = 3.6;
          showMsg(isFinal ? 'FINAL HORDE!' : 'A big horde is coming!', { color: isFinal ? '#ff6b4a' : '#ffe14a', size: isFinal ? 84 : 58, dur: 3.2 });
          Snd.play('alarm');
        } else {
          if (G.wave === 0) { showMsg('Here come the zombies!', { size: 56, dur: 2.4 }); Snd.play('wave'); }
          spawnWave(G.wave);
          G.wave++; G.sinceWave = 0;
          G.waveTimer = G.L.interval || 25;
        }
      }
    } else if (!G.endless && G.spawnQ.length === 0 && !G.bugs.some(liveBug)) {
      G.state = 'won';
      const rw = rewardOf(G.idx);
      G.reward = { x: G.lastDeath.x, y: G.lastDeath.y - 50, t: 0, type: rw, taken: false, ct: 0 };
      Snd.play('reward');
    }
  }
  // spawn queue
  for (let i = G.spawnQ.length - 1; i >= 0; i--) {
    const q = G.spawnQ[i]; q.delay -= dt;
    if (q.delay <= 0) {
      spawnBug(q.type, q.row, q.x); G.spawnQ.splice(i, 1);
      for (let k = 0; k < 6; k++) addPart({ x: W - rand(10, 60), y: rowY(q.row) - rand(10, 70), vx: rand(-120, -40), vy: rand(-80, 20), g: 300, life: 0.8, kind: 'leafp', color: pick(['#4f9a35', '#6db544', '#3d7a2a']), rot: rand(0, 6), vr: rand(-6, 6), size: rand(6, 10) });
      if (!G.demo && !G.endless && !Save.data.seenBugs.includes(q.type)) { Save.data.seenBugs.push(q.type); Save.write(); if (Save.data.tips !== false) G.newBug = q.type; }
    }
  }

  updatePlants(dt);
  updateBugs(dt);
  updateProjs(dt);
  updateZProjs(dt);
  updateCrows(dt);
  updateDrops(dt);
  updateParts(dt);
  for (const f of G.fires) f.t += dt;
  G.fires = G.fires.filter(f => f.t < 1.1);
  for (const z of G.zapFx) { z.t += dt; if (z.t > 0.9 && G.zappers[z.row] === 'fire') G.zappers[z.row] = 'gone'; }
  G.zapFx = G.zapFx.filter(z => z.t < 1);
  if (G.reward && G.reward.taken) {
    G.reward.ct += dt / 1.7;
    if (G.reward.ct >= 1 && !UI.overlay) { if (G.demo) UI.overlay = 'demoend'; else { UI.overlay = 'win'; completeLevel(); } }
  } else if (G.reward) {
    G.reward.t += dt;
    if (G.reward.t > 12) takeReward();
  }
}
function takeReward() {
  if (!G.reward || G.reward.taken) return;
  G.reward.taken = true; G.reward.sx = G.reward.x; G.reward.sy = G.reward.y;
  Snd.play('win'); Snd.play('confetti'); Music.stop();
  confettiBurst(G.reward.x, G.reward.y, 70);
}
function confettiBurst(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), sp = rand(250, 650);
    addPart({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 520, drag: 1.2, life: rand(1.4, 2.4), kind: 'confetti', color: pick(CONFETTI_COLORS), rot: rand(0, 6), vr: rand(-12, 12), size: rand(5, 9) });
  }
}
// ambient critters: butterflies (day/beach), fireflies (dusk/night), falling leaves (autumn), snow (winter)
function critterKind() { return { dusk: 'firefly', night: 'firefly', autumn: 'leaf', winter: 'snow' }[G.theme] || 'butterfly'; }
function updateCritters(dt) {
  const kind = critterKind();
  G.critterT -= dt;
  const max = { firefly: 12, leaf: 10, snow: 40, butterfly: 3 }[kind];
  if (G.critterT <= 0 && G.critters.length < max) {
    G.critterT = { firefly: rand(0.5, 1.2), leaf: rand(0.6, 1.4), snow: rand(0.08, 0.2), butterfly: rand(5, 10) }[kind];
    if (kind === 'leaf' || kind === 'snow') G.critters.push({ kind, x: rand(0, W + 200), y: -20, vx: kind === 'leaf' ? -rand(30, 70) : -rand(5, 20), vy: kind === 'leaf' ? rand(40, 70) : rand(30, 60), seed: rand(0, 100), t: 0, life: 20, c: pick(['#e8783a', '#c84a2a', '#f0b040', '#b85a1a']), s: rand(2, 4.5) });
    else {
      const fromLeft = Math.random() < 0.5;
      G.critters.push({ kind, x: fromLeft ? -20 : W + 20, y: rand(GY + 20, GY + ROWS * CH - 30), vx: (fromLeft ? 1 : -1) * rand(35, 70), vy: 0, seed: rand(0, 100), t: 0, life: kind === 'firefly' ? rand(8, 14) : 40, hue: pick([['#ffb3d1', '#ff7aa8'], ['#fff07a', '#ffc93a'], ['#bde4ff', '#7fc4ff']]) });
    }
  }
  for (let i = G.critters.length - 1; i >= 0; i--) {
    const c = G.critters[i]; c.t += dt;
    if (c.kind === 'leaf' || c.kind === 'snow') { c.x += (c.vx + Math.sin(c.t * 2 + c.seed) * 30) * dt; c.y += c.vy * dt; if (c.y > H + 20) G.critters.splice(i, 1); continue; }
    c.x += c.vx * dt * (c.kind === 'firefly' ? 0.35 : 1); c.y += Math.sin(c.t * 2 + c.seed) * (c.kind === 'firefly' ? 12 : 40) * dt;
    if (c.x < -40 || c.x > W + 40 || c.t > c.life) G.critters.splice(i, 1);
  }
}
function drawCritters(t) {
  for (const c of G.critters) {
    if (c.kind === 'firefly') { ctx.globalAlpha = Math.min(1, c.t, c.life - c.t); drawFirefly(c.x, c.y, t, c.seed); ctx.globalAlpha = 1; }
    else if (c.kind === 'leaf') { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.t * 2 + c.seed); leafPath(16, 6); ctx.fillStyle = c.c; ctx.fill(); ctx.restore(); }
    else if (c.kind === 'snow') { circ(c.x, c.y, c.s); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill(); }
    else drawButterfly(c.x, c.y + Math.sin(t * 6 + c.seed) * 4, t + c.seed, c.hue[0], c.hue[1]);
  }
}
// weather: rain (more dew, muddy lanes, thunder in the grove) and wind gusts (zombies get blown forward)
function updateWeather(dt) {
  G.thunder = Math.max(0, G.thunder - dt * 2.5);
  if (!G.weather || G.state !== 'play') return;
  if (G.weather === 'rain') {
    if (Math.random() < dt * 6) addPart({ x: rand(GX, GX + COLS * CW), y: rand(GY + 20, GY + ROWS * CH - 6), kind: 'splash', life: 0.35, size: rand(6, 10), color: 'rgba(220,235,255,.8)' });
    if (G.L.thunder) {
      G.thunderT -= dt;
      if (G.thunderT <= 0) { G.thunder = 1; G.thunderT = rand(10, 16); Snd.play('thunder'); }
    }
  } else if (G.weather === 'wind' && !G.holdWaves) {
    G.gustT -= dt; G.gust = Math.max(0, G.gust - dt);
    if (G.gustT <= 0) { G.gust = 2.6; G.gustT = rand(13, 18); showMsg('Gust of wind!', { size: 40, dur: 1.6, color: '#e6f4ff' }); Snd.play('whoosh'); }
    if (G.gust > 0 && Math.random() < dt * 30) addPart({ x: W + 10, y: rand(GY, GY + ROWS * CH), vx: -rand(700, 900), vy: rand(-20, 20), g: 0, life: 1.6, kind: 'spark', color: 'rgba(255,255,255,.55)' });
  }
}
// zombie attacks: pumpkin seeds, parka snowballs, rolling barrels, beekeeper bees
function updateZProjs(dt) {
  for (let i = G.zprojs.length - 1; i >= 0; i--) {
    const z = G.zprojs[i]; z.t += dt;
    if (z.kind === 'snow') {
      const k = Math.min(1, z.t / z.dur);
      z.x = lerp(z.x0, z.tx, k); z.y = lerp(z.y0, z.ty, k) - Math.sin(k * Math.PI) * 110;
      if (k >= 1) {
        const p = z.target;
        if (p && !p.dead) { stunPlant(p, 2.5, true); hurtPlant(p, 10); }
        burst(z.x, z.y, 12, ['#ffffff', '#dff4ff'], { max: 160, s0: 2, s1: 5 }); Snd.play('ice');
        G.zprojs.splice(i, 1);
      }
      continue;
    }
    if (z.kind === 'bee') {
      const p = z.target;
      if (!p || p.dead) { z.y -= 200 * dt; z.x += 60 * dt; if (z.t > 1.5) G.zprojs.splice(i, 1); continue; }
      const tx = p.x + Math.sin(z.t * 9) * 10, ty = p.y - 60 + Math.cos(z.t * 11) * 8;
      const dx = tx - z.x, dy = ty - z.y, d = Math.hypot(dx, dy);
      if (d < 14) { stunPlant(p, 3); addPart({ x: p.x, y: p.y - 96, vy: -30, g: 0, life: 0.9, kind: 'text', text: 'Ouch!', size: 18, color: '#ffd23a' }); Snd.play('sting'); G.zprojs.splice(i, 1); continue; }
      z.x += dx / d * 240 * dt; z.y += dy / d * 240 * dt;
      continue;
    }
    // seeds and barrels travel left along their row and hit the first plant they reach
    z.x += z.vx * dt;
    if (z.x < GX - 20) { G.zprojs.splice(i, 1); continue; }
    let hit = null;
    for (let c = COLS - 1; c >= 0; c--) {
      const p = G.grid[z.row][c];
      if (p && !p.dead && !(p.type === 'puff' && !p.armed) && Math.abs(p.x - z.x) < 26) { hit = p; break; }
    }
    if (hit) {
      hurtPlant(hit, z.dmg);
      if (z.kind === 'barrel') { burst(z.x, z.y, 16, ['#b07a42', '#7a4a22', '#8a5a2e'], { kind: 'shard', up: 180, s0: 5, s1: 10 }); Snd.play('break'); G.shake = Math.max(G.shake, 5); }
      else { burst(z.x, z.y, 6, ['#f0e0a0', '#c8a050'], { max: 120 }); Snd.play('hit'); }
      G.zprojs.splice(i, 1);
    }
  }
}
// crows fly off a scarecrow's hat and steal dew drops you haven't picked up
function updateCrows(dt) {
  for (let i = G.crows.length - 1; i >= 0; i--) {
    const c = G.crows[i]; c.t += dt;
    if (c.state === 'seek') {
      if (!c.drop || !G.drops.includes(c.drop) || c.drop.state !== 'rest') {
        c.drop = null; let best = 1e9;
        for (const d of G.drops) if (d.state === 'rest' && !G.crows.some(o => o !== c && o.drop === d)) { const dd = Math.hypot(d.x - c.x, d.y - c.y); if (dd < best) { best = dd; c.drop = d; } }
      }
      if (!c.drop) { if (c.t > 1.2) c.state = 'leave'; c.x -= 40 * dt; c.y -= 20 * dt; continue; }
      const dx = c.drop.x - c.x, dy = c.drop.y - 14 - c.y, d = Math.hypot(dx, dy);
      if (d < 12) {
        G.drops.splice(G.drops.indexOf(c.drop), 1); c.carry = c.drop.value; c.drop = null; c.state = 'leave';
        Snd.play('caw'); burst(c.x, c.y + 14, 6, ['#e9fbff', '#7fdcff'], { max: 100, g: 0 });
      } else { c.x += dx / d * 230 * dt; c.y += dy / d * 230 * dt; c.face = dx < 0 ? -1 : 1; }
    } else {
      c.x += 200 * dt; c.y -= 160 * dt; c.face = 1;
      if (c.y < -60 || c.x > W + 60) G.crows.splice(i, 1);
    }
  }
}
function scareCrow(x, y) {
  for (const c of G.crows) if (c.state === 'seek' && Math.hypot(c.x - x, c.y - y) < 40) { c.state = 'leave'; c.drop = null; Snd.play('caw'); return true; }
  return false;
}
// 1 star for winning, +1 if no greenhouse zapper was used, +1 if you lost two plants or fewer
function levelStars() {
  const zaps = G.zappers.filter(z => z === 'fire' || z === 'gone').length;
  return { stars: 1 + (zaps === 0 ? 1 : 0) + (G.stats.lost <= 2 ? 1 : 0), zaps };
}
function completeLevel() {
  const d = Save.data, res = levelStars();
  G.result = res;
  if (G.idx === DAILY_IDX) {
    const day = G.L.daily, prev = d.daily && d.daily.day === day ? d.daily : null;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const streak = prev ? prev.streak : (d.daily && d.daily.day === dailyKey(y) ? (d.daily.streak || 0) + 1 : 1);
    d.daily = { day, stars: Math.max(res.stars, prev ? prev.stars : 0), streak, total: (d.daily && d.daily.total || 0) + (prev ? 0 : 1) };
    Save.write(); return;
  }
  d.stars = d.stars || {};
  G.result.best = res.stars > (d.stars[G.idx] || 0);
  d.stars[G.idx] = Math.max(d.stars[G.idx] || 0, res.stars);
  if (!d.done.includes(G.idx)) d.done.push(G.idx);
  d.unlocked = Math.max(d.unlocked, Math.min(LEVELS.length, G.idx + 2));
  Save.write();
}

function updatePlants(dt) {
  for (const p of G.plants.slice()) {
    if (p.dead) continue;
    p.t += dt; p.shoot = Math.max(0, p.shoot - dt * 5); p.flash -= dt;
    if (p.stun > 0) { p.stun -= dt; if (p.stun <= 0) { p.frozen = false; if (p.wasFrozen) burst(p.x, p.y - 40, 8, ['#ffffff', '#bdefff'], { kind: 'shard', max: 120 }); } p.wasFrozen = p.frozen; continue; }
    switch (p.type) {
      case 'lily':
        p.cd -= dt; p.glow = clamp(1 - p.cd / 2.5, 0, 1);
        if (p.cd <= 0) { spawnDrop(p.x, p.y - 70, true); p.cd = 24; }
        break;
      case 'berry': case 'frost':
        p.cd -= dt;
        if (p.cd <= 0 && laneTarget(p)) { fire(p, p.type === 'frost' ? 'ice' : 'berry'); p.cd = 1.45; }
        break;
      case 'thistle':
        p.cd -= dt;
        if (p.burst > 0) { p.burst -= dt; if (p.burst <= 0) fire(p, 'spine'); }
        if (p.cd <= 0 && laneTarget(p)) { fire(p, 'spine'); p.burst = 0.2; p.cd = 1.45; }
        break;
      case 'puff':
        p.arm = clamp((G.time - p.born) / 12, 0, 1);
        if (!p.armed && p.arm >= 1) { p.armed = true; burst(p.x, p.y - 10, 10, ['#7a5532', '#9a6c42'], { up: 160 }); Snd.play('plant'); }
        if (p.armed) {
          const hit = G.bugs.find(b => !b.dying && b.row === p.r && !b.jump && Math.abs(b.x - p.x) < 52);
          if (hit) {
            for (const b of G.bugs) if (!b.dying && b.row === p.r && Math.abs(b.x - p.x) < 70) damageBug(b, 1800, { kind: 'burn', sound: false });
            for (let i = 0; i < 14; i++) addPart({ x: p.x + rand(-40, 40), y: p.y - rand(10, 60), vx: rand(-60, 60), vy: rand(-90, -20), kind: 'smoke', life: rand(0.6, 1.2), size: rand(18, 34), color: '#d4e26a' });
            burst(p.x, p.y - 20, 20, ['#f3e3bf', '#d4e26a', '#a77a43'], { max: 300 });
            Snd.play('puff'); G.shake = Math.max(G.shake, 6);
            removePlant(p);
          }
        }
        break;
      case 'gourd':
        p.fuse += dt / 1.15;
        if (p.fuse >= 1) {
          explodeArea(p.x, p.y, [p.r - 1, p.r, p.r + 1], CW * 1.5, 1800);
          boomFx(p.x, p.y - 40, 1); Snd.play('boom');
          removePlant(p);
        }
        break;
      case 'pepper':
        p.fuse += dt / 1.0;
        if (p.fuse >= 1) {
          for (const b of G.bugs) if (!b.dying && b.row === p.r && b.x < W + 40) damageBug(b, 1800, { kind: 'burn', sound: false });
          G.fires.push({ row: p.r, t: 0 });
          Snd.play('fire'); G.shake = Math.max(G.shake, 8);
          removePlant(p);
        }
        break;
      case 'snap':
        if (p.mode === 'idle') {
          const tgt = G.bugs.find(b => !b.dying && b.row === p.r && !b.jump && b.x >= p.x - 30 && b.x <= p.x + CW * 1.35);
          if (tgt) { p.mode = 'snap'; p.p = 0; p.target = tgt; p.bit = false; }
        } else if (p.mode === 'snap') {
          p.p += dt / 0.65;
          if (p.p >= 0.58 && !p.bit) {
            p.bit = true;
            const b = p.target;
            if (b && !b.dying && b.row === p.r && b.x >= p.x - 40 && b.x <= p.x + CW * 1.5) {
              Snd.play('chomp');
              if (heavy(b)) { damageBug(b, 500, { pierce: true }); p.ate = false; }
              else { killBug(b, 'eaten'); p.ate = true; burst(p.x + 40, p.y - 50, 10, ['#e5455b', '#7fd458'], { max: 160 }); }
            } else p.ate = false;
          }
          if (p.p >= 1) { if (p.ate) { p.mode = 'chew'; p.chewT = 22; } else p.mode = 'idle'; }
        } else if (p.mode === 'chew') {
          p.chewT -= dt;
          if (p.chewT <= 0) { p.mode = 'idle'; Snd.play('gulp'); }
        }
        break;
      case 'rose':
        p.cd -= dt;
        if (p.cd <= 0 && laneTarget(p)) { G.projs.push({ kind: 'rose', row: p.r, x: p.x + 26, y: p.y - 62, vx: 620, dmg: 20, t: 0, hit: new Set() }); p.shoot = 1; Snd.play('shoot'); p.cd = 1.6; }
        break;
      case 'snare': {
        const v = G.bugs.find(b => !b.dying && b.row === p.r && !b.jump && !b.held && Math.abs(b.x - p.x) < 40);
        if (v) { v.held = v.type === 'boss' ? 1.5 : v.type === 'brute' ? 3 : 6; v.eating = null; burst(p.x, p.y - 10, 14, ['#7fd458', '#2f6a1e'], { up: 120 }); Snd.play('chomp'); removePlant(p); }
        break;
      }
      case 'breeze':
        p.cd -= dt;
        if (p.cd <= 0 && G.bugs.some(b => !b.dying && b.row === p.r && b.x > p.x && b.x < p.x + CW * 4.5 && b.x < W - 10)) {
          for (const b of G.bugs) if (!b.dying && b.row === p.r && b.x > p.x && b.x < p.x + CW * 4.5 && !b.jump) { b.x += b.type === 'boss' ? 4 : b.type === 'brute' ? 15 : b.type === 'gnome' ? 110 : 55; b.eating = null; }
          for (let k = 0; k < 10; k++) addPart({ x: p.x + 30 + k * 30, y: p.y - 60 + rand(-25, 25), vx: 420, vy: 0, g: 0, life: 0.45, kind: 'spark', color: 'rgba(255,255,255,.85)' });
          p.shoot = 1; Snd.play('whoosh'); p.cd = 6;
        }
        break;
      case 'lobber': {
        p.cd -= dt;
        if (p.cd <= 0) {
          let tgt = null;
          for (const b of G.bugs) if (!b.dying && b.row === p.r && b.x > p.x - 10 && b.x < W - 18 && (!tgt || b.x < tgt.x)) tgt = b;
          if (tgt) {
            const flight = 0.9, tx = Math.max(p.x + 40, tgt.x - (tgt.held || tgt.eating ? 0 : tgt.speed * flight * (tgt.slow > 0 ? 0.5 : 1)));
            G.projs.push({ kind: 'nut', row: p.r, x0: p.x, y0: p.y - 62, x: p.x, y: p.y - 62, tx, ty: p.y - 50, t: 0, dur: flight, dmg: 40 });
            p.shoot = 1; Snd.play('shoot'); p.cd = 2.6;
          }
        }
        break;
      }
      case 'thorn':
        p.cd -= dt; p.attack = Math.max(0, p.attack - dt * 4);
        if (p.cd <= 0) {
          let any = false;
          for (const b of G.bugs) if (!b.dying && b.row === p.r && !b.jump && Math.abs(b.x - p.x) < 54 && !heavy(b)) { damageBug(b, 20, { pierce: true, sound: false }); any = true; }
          if (any) { p.attack = 1; p.cd = 1.0; Snd.play('hit'); }
        }
        break;
      case 'moonshroom':
        p.cd -= dt; p.glow = clamp(1 - p.cd / 2, 0, 1);
        if (p.cd <= 0) { const d = spawnDrop(p.x, p.y - 44, true); d.value = 15; d.small = true; p.cd = 15; }
        break;
      case 'popcorn':
        p.cd -= dt;
        if (p.cd <= 0 && laneTarget(p)) { G.projs.push({ kind: 'kernel', row: p.r, x: p.x + 22, y: p.y - 60, vx: 520, dmg: 20, t: 0, hits: 0, hit: new Set(), target: null }); p.shoot = 1; Snd.play('pop'); p.cd = 1.7; }
        break;
      case 'sprinkler':
        p.cd -= dt;
        if (p.cd <= 0) {
          const hits = G.bugs.filter(b => !b.dying && Math.abs(b.row - p.r) <= 1 && Math.abs(b.x - p.x) < CW * 1.5 && !b.jump && onLawn(b));
          if (hits.length) {
            for (const b of hits) { damageBug(b, 18, { sound: false }); burst(b.x, b.y - 50, 4, ['#bfe8ff', '#58b8f0'], { max: 90, g: 300 }); }
            for (let k = 0; k < 14; k++) { const a = k * TAU / 14; addPart({ x: p.x, y: p.y - 58, vx: Math.cos(a) * 260, vy: Math.sin(a) * 160 - 60, g: 400, life: 0.5, size: 3.5, color: '#9fd8ff' }); }
            p.shoot = 1; Snd.play('splash'); p.cd = 2.2;
          } else p.cd = 0.3;
        }
        break;
    }
  }
}

function updateBugs(dt) {
  G.chompT -= dt;
  for (let i = G.bugs.length - 1; i >= 0; i--) {
    const b = G.bugs[i];
    if (b.dying) {
      const was = b.dying;
      b.dying += dt / 1.15;
      if (b.kind === 'normal' && was < 0.62 && b.dying >= 0.62) { burst(b.x + 50, b.y - 4, 10, ['#c8b89a', '#a89878'], { up: 60, max: 110, g: 200 }); Snd.play('thud'); }
      if (b.dying >= 1) G.bugs.splice(i, 1);
      continue;
    }
    b.t += dt; b.flash -= dt;
    const sf = (b.slow > 0 ? 0.5 : 1) * (G.gust > 0 ? 1.7 : 1);
    b.slow -= dt;
    b.y += (rowY(b.row) - b.y) * Math.min(1, dt * 7);   // glide when changing lanes
    b.stompA = Math.max(0, b.stompA - dt * 3); b.actA = Math.max(0, b.actA - dt * 3);
    if (!b.held && !b.jump) bugAbility(b, dt);
    if (b.type === 'gardener') {
      b.healT -= dt;
      if (b.healT <= 0) {
        b.healT = 3;
        for (const o of G.bugs) if (!o.dying && o !== b && Math.abs(o.row - b.row) <= 1 && Math.abs(o.x - b.x) < 150 && o.hp < o.maxHp) {
          o.hp = Math.min(o.maxHp, o.hp + 30);
          for (let k = 0; k < 3; k++) addPart({ x: o.x + rand(-14, 14), y: o.y - rand(40, 100), vy: -40, g: 0, life: 0.8, kind: 'text', text: '+', size: 22, color: '#7fe07a' });
        }
      }
    }
    if (b.held > 0) { b.held -= dt; b.eat = 0; continue; }
    if (b.jump > 0) {
      b.jump += dt / 0.8;
      b.x = lerp(b.jx0, b.jx1, ease(Math.min(1, b.jump)));
      if (b.jump >= 1) { b.jump = 0; b.jumped = true; b.speed = 20 * rand(0.95, 1.05); }
      continue;
    }
    if (b.eating && b.eating.dead) b.eating = null;
    if (!b.eating) {
      const p = plantBlocking(b);
      if (p) {
        const lane = b.type === 'runner' && !b.laneSwitched ? switchLane(b) : null;
        if (lane != null) {
          // the jogger dodges into the next lane instead of stopping to eat
        } else if (b.type === 'wheelbarrow' && !b.hurried && p.type !== 'gourd' && p.type !== 'pepper') {
          // dumps its load of dirt on the plant, then hurries on
          if (p.type === 'stump' || p.type === 'hedge') hurtPlant(p, 600);
          else { removePlant(p); G.stats.lost++; addPart({ x: p.x, y: p.y - 30, vy: -30, g: 0, life: 1, kind: 'text', text: 'Buried!', size: 20, color: '#e8c890' }); }
          Snd.play('dig'); burst(p.x, p.y - 20, 22, ['#6a4a2a', '#8a6a3a', '#4a3018'], { up: 200, s0: 4, s1: 9 });
          hurryBarrow(b);
        } else if (b.type === 'leaper' && !b.jumped) {
          b.jump = 0.0001; b.jx0 = b.x; b.jx1 = p.x - CW * 0.85; Snd.play('hop');
        } else if (p.type === 'thorn' && heavy(b)) {
          removePlant(p); Snd.play('break'); burst(p.x, p.y - 6, 14, ['#4f8a2c', '#c79a5a'], { up: 120 });
        } else if (p.type === 'gourd' || p.type === 'pepper') {
          // these are about to blow; bugs just stand in front
          b.eating = null;
        } else b.eating = p;
      }
    }
    if (b.eating) {
      const p = b.eating;
      b.eat = (b.eat + dt * 3.2 * sf) % 1;
      p.hp -= b.bite * dt * sf;
      b.biteT -= dt * sf;
      if (p.type === 'hedge') { b.prick += dt; if (b.prick >= 0.5) { b.prick = 0; damageBug(b, 7, { pierce: true, sound: false }); } }
      if (b.biteT <= 0) { b.biteT = 0.45; p.flash = 0.06; if (G.chompT <= 0) { Snd.play('bite'); G.chompT = 0.12; } if (Math.random() < 0.6) burst(p.x + 20, p.y - 40, 2, ['#7fd458', '#5cc244'], { max: 90, up: 60 }); }
      if (p.hp <= 0) { removePlant(p); G.stats.lost++; Snd.play('gulp'); b.eating = null; }
    } else {
      const blockedByFuse = plantBlocking(b);
      if (!(blockedByFuse && (blockedByFuse.type === 'gourd' || blockedByFuse.type === 'pepper'))) {
        b.x -= b.speed * sf * dt;
        b.walk += dt * (6 + b.speed * 0.12) * sf;
      }
      b.eat = Math.max(0, b.eat - dt * 3);
    }
    if (b.x < GX - 26) {
      if (G.zappers[b.row] === 'ready') fireZapper(b.row);
      else if (b.x < 120 && G.zappers[b.row] !== 'fire') loseGame(b);
    }
  }
}
// the jogger hops into a neighbouring lane once, if there is one
function switchLane(b) {
  const opts = [b.row - 1, b.row + 1].filter(r => G.rows.includes(r));
  if (!opts.length) { b.laneSwitched = true; return null; }
  const ahead = r => G.plants.filter(p => p.r === r && p.x < b.x + 10 && p.type !== 'snare').length;
  opts.sort((a, c) => ahead(a) - ahead(c) || Math.random() - 0.5);
  b.laneSwitched = true; b.row = opts[0]; b.eating = null;
  burst(b.x, b.y - 4, 8, ['#c8b89a', '#a89878'], { up: 60, max: 110, g: 200 }); Snd.play('hop');
  return b.row;
}
function plantsNear(b, xr, rr) { return G.plants.filter(p => !p.dead && Math.abs(p.r - b.row) <= rr && Math.abs(p.x - b.x) < xr); }
function bugAbility(b, dt) {
  if (!onLawn(b) || G.state !== 'play') return;
  switch (b.type) {
    case 'brute': case 'boss': { // ground stomp stuns nearby plants
      b.stompT -= dt;
      if (b.stompT > 0) break;
      const big = b.type === 'boss', near = plantsNear(b, CW * (big ? 2.2 : 1.6), 1);
      if (!near.length) { b.stompT = 0.8; break; }
      for (const p of near) stunPlant(p, 2);
      b.stompA = 1; b.stompT = big ? rand(7, 9) : rand(6, 8);
      addPart({ x: b.x - 10, y: b.y, kind: 'ring', life: 0.5, size: big ? 200 : 130, color: '#c8a878' });
      burst(b.x - 10, b.y, 18, ['#c8b89a', '#a89878', '#8a6a3a'], { up: 140, max: 260, g: 600 });
      G.shake = Math.max(G.shake, big ? 12 : 6); Snd.play('stomp');
      break;
    }
    case 'pumpkin': { // spits pumpkin seeds at plants ahead (while its pumpkin is on)
      if (b.armor <= 0 || b.eating) break;
      b.spitT -= dt;
      if (b.spitT > 0) break;
      const tgt = G.plants.some(p => !p.dead && p.r === b.row && p.x < b.x && b.x - p.x < CW * 3.5);
      if (!tgt) { b.spitT = 0.5; break; }
      G.zprojs.push({ kind: 'seed', row: b.row, x: b.x - 34, y: b.y - 96, vx: -320, dmg: 30, t: 0 });
      b.actA = 1; b.spitT = rand(3.5, 4.5); Snd.play('spit');
      break;
    }
    case 'parka': { // lobs snowballs that freeze a plant solid
      if (b.eating) break;
      b.throwT -= dt;
      if (b.throwT > 0) break;
      let tgt = null;
      for (const p of G.plants) if (!p.dead && p.r === b.row && p.x < b.x && b.x - p.x < CW * 5 && !(p.stun > 0) && (!tgt || p.x > tgt.x)) tgt = p;
      if (!tgt) { b.throwT = 0.6; break; }
      G.zprojs.push({ kind: 'snow', row: b.row, x0: b.x - 20, y0: b.y - 110, x: b.x - 20, y: b.y - 110, tx: tgt.x, ty: tgt.y - 40, t: 0, dur: 0.8, target: tgt });
      b.actA = 1; b.throwT = rand(6, 8); Snd.play('whoosh');
      break;
    }
    case 'beekeeper': { // bees sting nearby plants while it eats (until its veil comes off)
      if (b.armor <= 0 || !b.eating) break;
      b.stingT -= dt;
      if (b.stingT > 0) break;
      const near = plantsNear(b, CW * 1.6, 1).filter(p => !(p.stun > 0)).slice(0, 2);
      for (const p of near) G.zprojs.push({ kind: 'bee', row: b.row, x: b.x - 10, y: b.y - 120, t: rand(0, 1), target: p });
      b.stingT = 5; if (near.length) Snd.play('buzz');
      break;
    }
  }
  if (b.type === 'boss') { // calls in helpers
    b.summonT -= dt;
    if (b.summonT <= 0) {
      b.summonT = rand(9, 12);
      const rows = [b.row - 1, b.row + 1].filter(r => G.rows.includes(r));
      for (const r of rows.length ? rows : [b.row]) {
        const h = spawnBug(pick(['basic', 'basic', 'runner', 'lid', 'gnome']), r, b.x + 30); h.summoned = true;
        for (let k = 0; k < 8; k++) addPart({ x: h.x + rand(-20, 20), y: h.y - rand(0, 30), vx: rand(-30, 30), vy: rand(-90, -40), kind: 'smoke', life: rand(0.6, 1.1), size: rand(16, 28), color: '#6a8a4a' });
      }
      b.actA = 1; Snd.play('roar');
    }
  }
}
function loseGame(b) {
  if (G.state === 'lost') return;
  G.state = 'lost'; G.loser = b; G.endT = 0; G.sel = null;
  Music.stop(); Snd.play('lose');
  if (G.endless) { const waves = Math.max(0, G.wave - 1); if (waves > Save.data.endlessBest) { Save.data.endlessBest = waves; Save.write(); } G.newBest = waves; }
}

function updateProjs(dt) {
  for (let i = G.projs.length - 1; i >= 0; i--) {
    const pr = G.projs[i];
    if (pr.kind === 'nut') {
      pr.t += dt;
      const k = Math.min(1, pr.t / pr.dur);
      pr.x = lerp(pr.x0, pr.tx, k); pr.y = lerp(pr.y0, pr.ty, k) - Math.sin(k * Math.PI) * 150;
      if (k >= 1) {
        let tgt = null;
        for (const b of G.bugs) if (!b.dying && b.row === pr.row && !b.jump && Math.abs(b.x - pr.tx) < 55 && (!tgt || Math.abs(b.x - pr.tx) < Math.abs(tgt.x - pr.tx))) tgt = b;
        if (tgt) { damageBug(tgt, pr.dmg, { pierce: tgt.type === 'lid' }); Snd.play('hit'); }
        burst(pr.x, pr.y, 8, ['#8a4e22', '#c88a52', '#8ccf4a'], { max: 160 });
        G.projs.splice(i, 1);
      }
      continue;
    }
    if (pr.kind === 'kernel') { // bounces from zombie to zombie, up to 3 hits
      pr.t += dt;
      const hitIt = b => {
        damageBug(b, pr.dmg); pr.hit.add(b); pr.hits++; Snd.play('hit');
        burst(pr.x, pr.y, 6, ['#fffaf0', '#ffe680'], { max: 130 });
        let next = null, bd = 230;
        if (pr.hits < 3) for (const o of G.bugs) {
          if (o.dying || pr.hit.has(o) || o.jump || Math.abs(o.row - b.row) > 1 || !onLawn(o)) continue;
          const d = Math.hypot(o.x - b.x, (o.row - b.row) * CH); if (d < bd) { bd = d; next = o; }
        }
        pr.target = next; return !next;
      };
      if (pr.target) {
        const b = pr.target;
        if (b.dying) { G.projs.splice(i, 1); continue; }
        const tx = b.x, ty = b.y - 56, dx = tx - pr.x, dy = ty - pr.y, d = Math.hypot(dx, dy);
        if (d < 18) { if (hitIt(b)) { G.projs.splice(i, 1); } else pr.row = pr.target.row; continue; }
        pr.x += dx / d * 560 * dt; pr.y += dy / d * 560 * dt - Math.sin(pr.t * 12) * 0.6;
        continue;
      }
      pr.x += pr.vx * dt;
      if (pr.x > W + 30) { G.projs.splice(i, 1); continue; }
      let tgt = null;
      for (const b of G.bugs) if (!b.dying && b.row === pr.row && !(b.jump > 0.15 && b.jump < 0.85) && Math.abs(b.x - pr.x) < bugRadius(b) && (!tgt || b.x < tgt.x)) tgt = b;
      if (tgt) { if (hitIt(tgt)) G.projs.splice(i, 1); else pr.row = pr.target.row; }
      continue;
    }
    pr.x += pr.vx * dt; pr.t += dt;
    if (pr.kind === 'rose') {
      if (pr.x > W + 30) { G.projs.splice(i, 1); continue; }
      for (const b of G.bugs) {
        if (b.dying || b.row !== pr.row || pr.hit.has(b) || (b.jump > 0.15 && b.jump < 0.85)) continue;
        if (Math.abs(b.x - pr.x) < bugRadius(b)) { pr.hit.add(b); damageBug(b, pr.dmg); burst(pr.x, pr.y, 4, ['#e8304a', '#7fd458'], { max: 110 }); Snd.play('hit'); }
      }
      continue;
    }
    if (pr.kind === 'ice' && Math.random() < 0.4) addPart({ x: pr.x - 8, y: pr.y + rand(-4, 4), vx: -40, vy: rand(-10, 10), g: 0, life: 0.35, size: 2.5, color: '#e6fbff' });
    if (pr.x > W + 30) { G.projs.splice(i, 1); continue; }
    let target = null;
    for (const b of G.bugs) {
      if (b.dying || b.row !== pr.row) continue;
      if (b.jump > 0.15 && b.jump < 0.85) continue;
      if (Math.abs(b.x - pr.x) < bugRadius(b) && (!target || b.x < target.x)) target = b;
    }
    if (target) {
      const hadArmor = target.armor > 0;
      damageBug(target, pr.dmg);
      if (pr.kind === 'ice') { if (!(target.type === 'parka' && target.armor > 0)) target.slow = 4; burst(pr.x, pr.y, 7, ['#ffffff', '#bdefff'], { kind: 'shard', max: 140, s0: 2, s1: 4 }); Snd.play('hit'); }
      else if (pr.kind === 'spine') { burst(pr.x, pr.y, 5, ['#c77cf0', '#7fd458'], { max: 120 }); Snd.play('hit'); }
      else { burst(pr.x, pr.y, 8, ['#e3263b', '#ff8a8a', '#a3112a'], { max: 150 }); if (!hadArmor || target.type !== 'barrel') Snd.play('hit'); }
      G.projs.splice(i, 1);
    }
  }
}
function updateDrops(dt) {
  for (let i = G.drops.length - 1; i >= 0; i--) {
    const d = G.drops[i];
    d.t += dt;
    if (d.state === 'fall') {
      d.y += d.vy * dt; d.x += Math.sin(d.t * 2) * 10 * dt;
      if (d.y >= d.ty) { d.y = d.ty; d.state = 'rest'; d.t = 0; }
    } else if (d.state === 'pop') {
      d.vy += 520 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.vy > 0 && d.y >= d.ty) { d.y = d.ty; d.state = 'rest'; d.t = 0; }
    } else if (d.state === 'rest') {
      if (Save.data.autoDew && d.t > 0.6) collectDrop(d);
      else if (d.t > d.life) { G.drops.splice(i, 1); continue; }
    } else if (d.state === 'fly') {
      const k = ease(d.t / 0.55);
      d.x = lerp(d.fx, 60, k); d.y = lerp(d.fy, 46, k);
      if (d.t >= 0.55) {
        G.dew += d.value; G.drops.splice(i, 1); G.dewBump = 1;
        addPart({ x: 60, y: 112, vy: -50, g: 0, life: 0.8, kind: 'text', text: '+' + d.value, size: 22, color: '#bff3ff' });
      }
    }
  }
}
function updateParts(dt) {
  for (let i = G.parts.length - 1; i >= 0; i--) {
    const p = G.parts[i];
    p.t += dt;
    if (p.t >= p.life) { G.parts.splice(i, 1); continue; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
  }
}

/* ---------- drawing ---------- */
// Pose transforms applied to cached plant sprites (cheap idle animation)
function plantSpriteKey(p) {
  const blink = (p.t % 4.3) < 0.12;
  switch (p.type) {
    case 'gourd': case 'pepper': return null;
    case 'snap':
      if (p.mode === 'snap') return null;
      if (p.mode === 'chew') return 'snap:c' + (Math.floor(p.t * 6) % 4);
      return 'snap:i';
    case 'stump': { const f = p.hp / p.maxHp; return 'stump:' + (f >= 0.66 ? 0 : f >= 0.5 ? 1 : f >= 0.33 ? 2 : 3) + ((p.t % 5.1) < 0.13 ? 'b' : ''); }
    case 'puff': return p.armed ? 'puff:a' : 'puff:u' + Math.floor((p.arm || 0) * 4) + ((p.t % 2) < 1 ? 'z' : '');
    case 'thorn': return 'thorn:' + Math.round((p.attack || 0) * 2);
    case 'hedge': return 'hedge:' + (p.hp / p.maxHp >= 0.5 ? 0 : 1) + (blink ? 'b' : '');
    default: return p.type + (blink ? ':b' : ':o');
  }
}
function plantSpriteState(p, key) {
  const s = { t: 0.5, armed: p.armed, arm: p.arm, hpFrac: p.hp / p.maxHp, mode: p.mode, glow: 0, shoot: 0, attack: 0 };
  if (key.endsWith('b')) s.t = 0.05;
  if (p.type === 'stump') { const st_ = +key.split(':')[1][0]; s.hpFrac = [1, 0.6, 0.45, 0.2][st_]; s.t = key.endsWith('b') ? 0.05 : 0.5; }
  if (p.type === 'puff' && !p.armed) { s.arm = (+key[6]) / 4; s.t = key.endsWith('z') ? 0.5 : 1.5; }
  if (p.type === 'snap' && p.mode === 'chew') { const f = +key.slice(-1); s.t = Math.asin([-1, 0, 1, 0][f]) / 9; s.mode = 'chew'; }
  if (p.type === 'thorn') s.attack = (+key.split(':')[1]) / 2;
  if (p.type === 'hedge') { s.hpFrac = key[6] === '0' ? 1 : 0.3; s.t = key.endsWith('b') ? 0.05 : 0.5; }
  return s;
}
function drawPlantEntity(p) {
  shadow(p.x, p.y + 2, p.type === 'thorn' ? 44 : p.type === 'stump' ? 40 : 30);
  const age = G.time - p.born;
  ctx.save(); ctx.translate(p.x, p.y);
  if (age < 0.25) { const s = easeOutBack(age / 0.25); ctx.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s); }
  const key = plantSpriteKey(p);
  if (!key) {
    TINT = p.flash > 0 ? 1 : 0;
    PLANT_ART[p.type](p);
    TINT = 0;
  } else {
    const spr = Sprites.get('p:' + key, PLANT_BOX, () => PLANT_ART[p.type](plantSpriteState(p, key)));
    const t = p.t, sh = p.shoot || 0;
    switch (p.type) {
      case 'lily': ctx.rotate(Math.sin(t * 1.8) * 0.05); break;
      case 'berry': ctx.translate(0, Math.sin(t * 3) * 1.5); ctx.scale(1 + sh * 0.1, 1 - sh * 0.08); break;
      case 'frost': ctx.translate(0, Math.sin(t * 2.4) * 1.5); ctx.scale(1 + sh * 0.08, 1 - sh * 0.06); break;
      case 'thistle': ctx.translate(0, Math.sin(t * 3.1) * 1.2); ctx.scale(1 + sh * 0.08, 1 - sh * 0.06); break;
      case 'puff': if (p.armed) { const k = 1 + Math.sin(t * 7) * 0.035; ctx.scale(k, 1 / k); } break;
      case 'rose': case 'lobber': case 'breeze': case 'popcorn': ctx.translate(0, Math.sin(t * 2.4) * 1.2); ctx.scale(1 + sh * 0.08, 1 - sh * 0.07); break;
      case 'sprinkler': ctx.translate(0, Math.sin(t * 2) * 1.2); ctx.scale(1 + sh * 0.06, 1 - sh * 0.06); break;
      case 'moonshroom': { const k = 1 + Math.sin(t * 2.2) * 0.03; ctx.scale(k, 1 / k); break; }
      case 'hedge': ctx.scale(1 + Math.sin(t * 1.4) * 0.012, 1); break;
      case 'snap': if (p.mode === 'idle') ctx.scale(1, 1 + Math.sin(t * 2.2) * 0.025); break;
    }
    Sprites.draw(spr, 0, 0);
    if (p.flash > 0) Sprites.flash(spr, 0, 0, 0.45);
    if (p.type === 'lily' && p.glow > 0) { circ(0, -74, 18 + p.glow * 10); ctx.fillStyle = `rgba(170,235,255,${0.35 * p.glow})`; ctx.fill(); drawDew(0, -74, 11 + p.glow * 3, 0); }
    if (p.type === 'puff' && p.armed) { const g = (Math.sin(t * 6) + 1) / 2; circ(0, -50, 9 + g * 4); ctx.fillStyle = `rgba(200,255,100,${0.25 + g * 0.35})`; ctx.fill(); }
    if (p.type === 'moonshroom' && p.glow > 0) { circ(0, -50, 10 + p.glow * 6); ctx.fillStyle = `rgba(170,235,255,${0.3 * p.glow})`; ctx.fill(); drawDew(0, -50, 7 + p.glow * 3, 0); }
  }
  ctx.restore();
  if (p.stun > 0) {
    if (p.frozen) { // frozen solid in an ice block
      ctx.save(); ctx.globalAlpha = Math.min(1, p.stun * 2);
      rrect(p.x - 38, p.y - 96, 76, 98, 12); ctx.fillStyle = 'rgba(180,225,255,.45)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke();
      P(); ctx.moveTo(p.x - 26, p.y - 80); ctx.lineTo(p.x - 12, p.y - 88); ctx.moveTo(p.x - 28, p.y - 64); ctx.lineTo(p.x - 20, p.y - 70); ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    } else for (let k = 0; k < 3; k++) { // dizzy stars
      const a = G.time * 4 + k * TAU / 3;
      star(p.x + Math.cos(a) * 22, p.y - 92 + Math.sin(a) * 6, 7, '#ffe14a');
    }
  }
  if (p.type !== 'gourd' && p.type !== 'pepper' && p.hp < p.maxHp && G.bugs.some(b => b.eating === p)) {
    const w = 46, f = clamp(p.hp / p.maxHp, 0, 1);
    rrect(p.x - w / 2, p.y + 6, w, 6, 3); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
    rrect(p.x - w / 2, p.y + 6, w * f, 6, 3); ctx.fillStyle = f > 0.5 ? '#7fd458' : f > 0.25 ? '#ffd23a' : '#ff5a3a'; ctx.fill();
  }
}
const WALK_FRAMES = 8, EAT_FRAMES = 5;
function drawBugEntity(b) {
  const big = b.type === 'boss' ? 2.3 : b.type === 'brute' ? 1.3 : b.type === 'gnome' ? 0.7 : 1;
  const d = b.dying;
  ctx.save();
  if (!(d && b.kind !== 'normal' && d > 0.6)) shadow(b.x + 2, b.y + 2, 28 * big, 0.25 * (1 - (d || 0)));
  ctx.translate(b.x, b.y);
  if (b.stompA > 0) { const k = Math.sin(b.stompA * Math.PI) * 0.12; ctx.scale(1 + k, 1 - k); }
  if (b.actA > 0) ctx.rotate(-Math.sin(b.actA * Math.PI) * 0.08);
  if (b.jump > 0) ctx.translate(0, -Math.sin(Math.min(1, b.jump) * Math.PI) * 95);
  const armorStage = b.maxArmor ? Math.ceil((b.armor / b.maxArmor) * 3) : 0;
  const procedural = b.jump > 0 || (d && b.kind !== 'normal');
  if (d) {
    if (b.kind === 'normal') {
      // zombies topple over backwards, then fade
      ctx.globalAlpha = 1 - easeIn(Math.max(0, d - 0.3) / 0.7);
      ctx.translate(14 * big, 0); ctx.rotate(easeIn(Math.min(1, d * 1.6)) * 1.5); ctx.translate(-14 * big, 0);
    } else {
      TINT = 4;
      if (d > 0.55) { ctx.globalAlpha = 1 - (d - 0.55) / 0.45; ctx.scale(1, 1 - (d - 0.55) * 0.6); }
    }
  }
  if (procedural) {
    if (!d) TINT = b.flash > 0 ? 1 : b.slow > 0 ? 2 : 0;
    BUG_ART[b.type]({ walk: b.walk, eat: b.eat, armorFrac: b.maxArmor ? b.armor / b.maxArmor : 0, jump: b.jump });
    TINT = 0;
  } else {
    const tint = !d && b.slow > 0 ? 2 : 0;
    const eating = b.eating || b.eat > 0.05;
    const fr = eating ? Math.floor(b.eat * EAT_FRAMES) % EAT_FRAMES : Math.floor(((b.walk % TAU) + TAU) % TAU / TAU * WALK_FRAMES) % WALK_FRAMES;
    const key = `b:${b.type}:${armorStage}:${tint}:${eating ? 'e' : 'w'}${fr}`;
    const spr = Sprites.get(key, BUG_BOXES[b.type], () => {
      TINT = tint;
      BUG_ART[b.type](eating ? { walk: 0, eat: (fr + 0.5) / EAT_FRAMES, armorFrac: armorStage / 3 } : { walk: (fr / WALK_FRAMES) * TAU, eat: 0, armorFrac: armorStage / 3 });
      TINT = 0;
    });
    Sprites.draw(spr, 0, 0);
    if (!d && b.flash > 0) Sprites.flash(spr, 0, 0, 0.55);
  }
  ctx.restore();
  if (!d && b.held > 0) {
    for (let k = 0; k < 3; k++) { const y = b.y - 10 - k * 16; ell(b.x, y, 24, 7); ctx.lineWidth = 5; ctx.strokeStyle = '#2f6a1e'; ctx.stroke(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#7fd458'; ctx.stroke(); leaf(b.x - 20 + k * 12, y - 2, 10, 4, -1.2 + k, '#7fd458', false, 1.6); }
  }
  if (d && b.kind !== 'normal' && d > 0.55 && d < 0.6 && Math.random() < 0.5) burst(b.x, b.y - 20, 6, ['#3a302a', '#5a5048'], { g: 100, max: 80 });
  if (!d && b.slow > 0 && Math.random() < 0.08) addPart({ x: b.x + rand(-20, 20), y: b.y - rand(10, 60), vy: -20, life: 0.6, size: 2.5, color: '#e6fbff' });
}
function drawProj(pr) {
  if (pr.kind === 'kernel') {
    ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.t * 7);
    for (const [x, y, r] of [[-4, -2, 6], [4, -3, 5.5], [0, 4, 5.5]]) { circ(x, y, r); fst('#fffaf0', 2); }
    circ(1, 1, 3); fs('#f0b020');
    ctx.restore(); return;
  }
  if (pr.kind === 'nut') { shadow(pr.x, rowY(pr.row) + 2, 8, 0.15); ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(pr.t * 9); chestnut(0, 0, 8); ctx.restore(); return; }
  if (pr.kind === 'rose') {
    ctx.save(); ctx.translate(pr.x, pr.y);
    P(); ctx.moveTo(-26, 0); ctx.lineTo(10, 0); tube(3, '#5a8a2a');
    P(); ctx.moveTo(10, -4); ctx.lineTo(22, 0); ctx.lineTo(10, 4); ctx.closePath(); fst('#e8304a', 2);
    ctx.restore(); return;
  }
  if (pr.kind === 'berry') {
    shadow(pr.x, rowY(pr.row) + 2, 9, 0.18);
    berryBall(pr.x, pr.y, 9);
    leaf(pr.x - 2, pr.y - 9, 8, 3, -2.4, '#5cc244', false);
  } else if (pr.kind === 'ice') {
    shadow(pr.x, rowY(pr.row) + 2, 9, 0.15);
    ctx.save(); ctx.translate(pr.x, pr.y); ctx.rotate(Math.sin(pr.t * 20) * 0.1);
    P(); ctx.moveTo(14, 0); ctx.lineTo(0, -8); ctx.lineTo(-14, 0); ctx.lineTo(0, 8); ctx.closePath();
    fs(lg(-14, 0, 14, 0, ['#9fe6ff', '#ffffff', '#bdefff'])); st(2.6);
    ctx.restore();
  } else {
    ctx.save(); ctx.translate(pr.x, pr.y);
    P(); ctx.moveTo(-14, 0); ctx.lineTo(12, 0); tube(3, '#7a3aa8');
    P(); ctx.moveTo(12, -3); ctx.lineTo(20, 0); ctx.lineTo(12, 3); ctx.closePath(); fst('#f2e6ff', 2);
    ctx.restore();
  }
}
function drawZProj(z) {
  if (z.kind === 'seed') {
    ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.t * 14);
    ell(0, 0, 7, 4.5); fst('#f4e6b0', 2); ctx.restore(); return;
  }
  if (z.kind === 'snow') { shadow(z.x, rowY(z.row) + 2, 9, 0.15); circ(z.x, z.y, 10); fs(rg(z.x - 3, z.y - 3, 1, z.x, z.y, 12, ['#ffffff', '#dfe8f2'])); st(2.4); return; }
  if (z.kind === 'bee') {
    ctx.save(); ctx.translate(z.x, z.y);
    const f = Math.sin(z.t * 60) * 0.5 + 0.5;
    ell(-2, -7, 5, 3 + f * 3); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill(); ell(3, -7, 5, 3 + f * 3); ctx.fill();
    ell(0, 0, 8, 5.5); fst('#ffd23a', 2); line(-2, -5, -2, 5, 2.4, OUT); line(3, -5, 3, 5, 2.4, OUT);
    ctx.restore(); return;
  }
  if (z.kind === 'barrel') {
    shadow(z.x, rowY(z.row) + 2, 24, 0.2);
    ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(-z.t * 9);
    circ(0, 0, 22); fs(rg(-6, -6, 2, 0, 0, 24, ['#c89058', '#9a6232', '#7a4a22'])); st(3.2);
    circ(0, 0, 14); ctx.lineWidth = 3; ctx.strokeStyle = '#5a5a62'; ctx.stroke();
    line(-20, 0, 20, 0, 2, 'rgba(60,30,10,.5)'); line(0, -20, 0, 20, 2, 'rgba(60,30,10,.5)');
    ctx.restore();
  }
}
function drawCrow(c) {
  const flap = Math.sin(c.t * 18);
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.face || 1, 1);
  P(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-18, -10 - flap * 14, -30, -4 - flap * 18); ctx.quadraticCurveTo(-16, 0, -4, 4); ctx.closePath(); fst('#2a2630', 2);
  ell(0, 2, 15, 9); fst('#3a3440', 2.4);
  circ(12, -4, 8); fst('#3a3440', 2.4);
  P(); ctx.moveTo(18, -6); ctx.lineTo(28, -2); ctx.lineTo(18, 0); ctx.closePath(); fst('#f0b020', 1.6);
  circ(14, -6, 2.6); fs('#ffffff'); circ(14.6, -6, 1.3); fs(OUT);
  P(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(14, -12 - flap * 12, 26, -8 - flap * 16); ctx.quadraticCurveTo(14, -2, 4, 4); ctx.closePath(); fst('#2a2630', 2);
  if (c.carry) drawDew(4, 16, 8, 0.2);
  ctx.restore();
}
function drawWeather(t) {
  if (G.weather === 'rain') {
    ctx.fillStyle = 'rgba(30,40,80,.12)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(210,225,255,.45)'; ctx.lineWidth = 2; P();
    for (let i = 0; i < 110; i++) {
      const sp = 700 + (i % 7) * 40, x = ((i * 137.5 + t * 120) % (W + 200)) - 100, y = ((i * 91.3 + t * sp) % (H + 60)) - 30;
      ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 20);
    }
    ctx.stroke();
  }
  if (G.gust > 0) { ctx.fillStyle = `rgba(255,255,255,${0.08 * Math.min(1, G.gust)})`; ctx.fillRect(0, GY, W, ROWS * CH); }
  if (G.thunder > 0) { ctx.fillStyle = `rgba(240,245,255,${0.55 * G.thunder * G.thunder})`; ctx.fillRect(0, 0, W, H); }
}
function drawBossBar() {
  const b = G.boss; if (!b) return;
  G.bossVis = Math.min(1, G.bossVis + 0.03);
  const w = 440, x = (W - w) / 2 + 60, y = 132, f = clamp(b.hp / b.maxHp, 0, 1);
  ctx.save(); ctx.globalAlpha = G.bossVis;
  rrect(x - 4, y - 4, w + 8, 26, 13); ctx.fillStyle = 'rgba(40,20,10,.75)'; ctx.fill(); st(3);
  rrect(x, y, w * f, 18, 9); fs(lg(0, y, 0, y + 18, ['#ff8a5a', '#c8301e']));
  text('Compost Giant', x + w / 2, y + 9, 17, { fill: '#fff8e0', sw: 4 });
  ctx.restore();
}
function drawPart(p) {
  const k = 1 - p.t / p.life;
  switch (p.kind) {
    case 'dot': circ(p.x, p.y, p.size * (0.4 + 0.6 * k)); ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, k * 1.6); ctx.fill(); ctx.globalAlpha = 1; break;
    case 'shard':
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, k * 2);
      P(); ctx.moveTo(-p.size, -p.size * 0.6); ctx.lineTo(p.size, -p.size * 0.3); ctx.lineTo(p.size * 0.3, p.size * 0.7); ctx.closePath(); fs(p.color); st(1.6);
      ctx.restore(); ctx.globalAlpha = 1; break;
    case 'spark': line(p.x, p.y, p.x - p.vx * 0.04, p.y - p.vy * 0.04, 3 * k + 1, p.color); break;
    case 'smoke': circ(p.x, p.y, p.size * (1.2 - k * 0.5)); ctx.fillStyle = p.color; ctx.globalAlpha = 0.5 * k; ctx.fill(); ctx.globalAlpha = 1; break;
    case 'splash': ell(p.x, p.y, p.size * (1.4 - k), p.size * (1.4 - k) * 0.35); ctx.lineWidth = 2; ctx.strokeStyle = p.color; ctx.globalAlpha = k; ctx.stroke(); ctx.globalAlpha = 1; break;
    case 'ring': circ(p.x, p.y, p.size * (1 - k * 0.8)); ctx.lineWidth = 10 * k; ctx.strokeStyle = p.color; ctx.globalAlpha = k; ctx.stroke(); ctx.globalAlpha = 1; break;
    case 'lidfall':
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, k * 2);
      ell(0, 0, 11, 34); fs('#a8b0bc'); st(3); rrect(-3, -6, 6, 12, 2); fst('#5a606a', 2);
      ctx.restore(); ctx.globalAlpha = 1; break;
    case 'hatfall':
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, k * 2);
      ell(0, 6, 30, 7); fst('#e0c06a', 2.6); P(); ctx.moveTo(-14, 4); ctx.quadraticCurveTo(-12, -16, 2, -16); ctx.quadraticCurveTo(14, -14, 14, 4); ctx.closePath(); fst('#e8c870', 2.6);
      ctx.restore(); ctx.globalAlpha = 1; break;
    case 'text': ctx.globalAlpha = Math.min(1, k * 2); text(p.text, p.x, p.y, p.size, { fill: p.color }); ctx.globalAlpha = 1; break;
    case 'confetti':
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.sin(p.t * 9 + p.rot)) + 0.15);
      ctx.globalAlpha = Math.min(1, k * 3); ctx.fillStyle = p.color; ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
      ctx.restore(); ctx.globalAlpha = 1; break;
    case 'leafp':
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, k * 2);
      leafPath(p.size * 1.6, p.size * 0.5); ctx.fillStyle = p.color; ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1; break;
  }
}
function drawFire(f) {
  const y = rowY(f.row), k = f.t / 1.1;
  const reach = GX + (COLS * CW + 120) * Math.min(1, k * 3);
  for (let x = GX; x < reach; x += 26) {
    const h = (60 + Math.sin(x * 0.3 + f.t * 30) * 18) * (1 - Math.max(0, k - 0.6) / 0.4);
    if (h <= 0) continue;
    P(); ctx.moveTo(x - 18, y); ctx.quadraticCurveTo(x - 14, y - h * 0.6, x, y - h); ctx.quadraticCurveTo(x + 14, y - h * 0.6, x + 18, y); ctx.closePath();
    ctx.fillStyle = 'rgba(255,120,30,.85)'; ctx.fill();
    P(); ctx.moveTo(x - 9, y); ctx.quadraticCurveTo(x - 7, y - h * 0.35, x, y - h * 0.6); ctx.quadraticCurveTo(x + 7, y - h * 0.35, x + 9, y); ctx.closePath();
    ctx.fillStyle = 'rgba(255,230,120,.9)'; ctx.fill();
  }
}
function drawZap(z) {
  const y = rowY(z.row) - 60, k = z.t;
  ctx.save();
  ctx.globalAlpha = 1 - k;
  for (let pass = 0; pass < 2; pass++) {
    P(); ctx.moveTo(182, y);
    for (let x = 200; x < W + 20; x += 30) ctx.lineTo(x, y + rand(-22, 22));
    ctx.lineWidth = pass ? 3 : 12; ctx.strokeStyle = pass ? '#ffffff' : 'rgba(110,210,255,.6)'; ctx.lineJoin = 'round'; ctx.stroke();
  }
  ctx.fillStyle = `rgba(190,240,255,${0.25 * (1 - k)})`;
  ctx.fillRect(GX, GY + z.row * CH, W - GX, CH);
  ctx.restore();
}

function drawProgress(x, y, w) {
  if (G.endless) {
    text(`Wave ${Math.max(1, G.wave)}`, x + w / 2, y + 2, 30, { fill: '#ffe14a' });
    text(`Best: ${Save.data.endlessBest}`, x + w / 2, y + 30, 18, { fill: '#fff8e0', sw: 4 });
    return;
  }
  const target = G.wave / G.totalWaves;
  G.progVis = lerp(G.progVis, target, 0.05);
  rrect(x, y - 12, w, 24, 12); fs(lg(0, y - 12, 0, y + 12, ['#3e2612', '#5c3a1e'])); st(3.4);
  const fw = Math.max(0, (w - 8) * G.progVis);
  if (fw > 2) { rrect(x + 4, y - 8, fw, 16, 8); fs(lg(0, y - 8, 0, y + 8, ['#a8ee6e', '#4fb53a'])); }
  for (const f of G.L.flags) {
    const fx = x + 4 + (w - 8) * (f / G.totalWaves) - 2;
    line(fx, y + 10, fx, y - 22, 3, OUT);
    P(); ctx.moveTo(fx, y - 22); ctx.lineTo(fx + 15, y - 17); ctx.lineTo(fx, y - 12); ctx.closePath(); fst(G.wave >= f ? '#ffe14a' : '#e8453a', 2);
  }
  ctx.save(); ctx.translate(x + 4 + fw, y + 10); ctx.scale(0.24, 0.24); BUG_ART.basic({ walk: G.time * 3, eat: 0 }); ctx.restore();
}

function drawHUD() {
  const n = G.cards.length;
  const tw = trowelRect();
  const trayW = tw.x + tw.w + 8;
  Sprites.draw(Sprites.get('tray:' + trayW, { x: 0, y: 0, w: trayW + 10, h: 124 }, () => {
    woodPanel(4, 4, trayW, 112, { inner: false, r: 14 });
    rrect(12, 12, 96, 96, 12); fs(lg(0, 12, 0, 108, ['#4a2c12', '#6b4220'])); st(3);
    rrect(tw.x, tw.y, tw.w, tw.h, 12); fs(lg(0, tw.y, 0, tw.y + tw.h, ['#4a2c12', '#6b4220'])); st(3);
  }), 0, 0);
  const bump = 1 + easeOutBack(G.dewBump) * 0.0 + G.dewBump * 0.22;
  ctx.save(); ctx.translate(60, 60); ctx.scale(bump, bump); ctx.translate(-60, -60);
  drawDew(60, 46, 17, 0.2 + Math.sin(App.t * 3.3) * 0.1 + G.dewBump * 0.8);
  text(String(G.dew), 60, 88, 30, { fill: G.dewBump > 0.1 ? '#dffbff' : '#fff8e0' });
  ctx.restore();
  let hoverCard = -1;
  for (let i = 0; i < n; i++) {
    const r = cardRect(i), c = G.cards[i];
    const sel = G.sel === c.type;
    ctx.save();
    if (sel) ctx.translate(0, Math.sin(App.t * 6) * 2);
    drawCard(r.x, r.y, r.w, r.h, c.type, { affordable: canAfford(c), cd: c.cd / PLANTS[c.type].recharge, selected: sel });
    ctx.restore();
    if (c.flash > 0) { // shine sweep when a card finishes recharging
      ctx.save(); rrect(r.x, r.y, r.w, r.h, 9); ctx.clip();
      const sx = r.x - 40 + (1 - c.flash / 0.7) * (r.w + 80);
      P(); ctx.moveTo(sx, r.y - 10); ctx.lineTo(sx + 22, r.y - 10); ctx.lineTo(sx - 8, r.y + r.h + 10); ctx.lineTo(sx - 30, r.y + r.h + 10); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fill(); ctx.restore();
    }
    if (!Input.touch && n > 1) text(String((i + 1) % 10), r.x + r.w - 9, r.y + 11, 13, { fill: '#fff8e0', sw: 3 });
    if (Input.inside && Input.hover && !Input.touch && inRect(Input.x, Input.y, r)) hoverCard = i;
  }
  if (G.pressCard >= 0 && G.pressT > 0.45) hoverCard = G.pressCard;
  G.tipCard = hoverCard;
  if (G.sel === 'trowel') { rrect(tw.x - 3, tw.y - 3, tw.w + 6, tw.h + 6, 14); st(4, '#fff36b'); }
  else drawTrowel(tw.x + tw.w / 2, tw.y + tw.h / 2 + 4, 1.1);
  // right side
  const rx = tw.x + tw.w + 20;
  text(G.endless ? G.L.name : `${G.L.name}`, (rx + 1072) / 2, 34, 28, { fill: '#fff8e0' });
  if (!G.endless) text(G.L.sub, (rx + 1072) / 2, 60, 16, { fill: '#ffe9b8', sw: 4, body: true, weight: '600' });
  drawProgress(rx + 4, 96, 1262 - rx);
  roundBtn('sound', 1106, 40, 27, () => iconSound(Save.data.sfx || Save.data.music), toggleAllSound);
  roundBtn('speed', 1172, 40, 27, () => iconFast(G.speed > 1), () => { G.speed = G.speed > 1 ? 1 : 2; Snd.play('click'); });
  roundBtn('pause', 1238, 40, 27, iconPause, () => { openPause(); });
}
function drawCardTip(i) {
  const c = G.cards[i]; if (!c) return;
  const d = PLANTS[c.type], r = cardRect(i);
  const w = 300, x = clamp(r.x + r.w / 2 - w / 2, 8, W - w - 8), y = r.y + r.h + 14;
  ctx.font = `500 17px ${FONT_B}`;
  rrect(x, y, w, 150, 14); ctx.fillStyle = 'rgba(255,250,235,.97)'; ctx.fill(); st(3);
  P(); ctx.moveTo(r.x + r.w / 2 - 10, y + 1); ctx.lineTo(r.x + r.w / 2, y - 12); ctx.lineTo(r.x + r.w / 2 + 10, y + 1); ctx.closePath(); fs('rgba(255,250,235,.97)'); st(3);
  rrect(r.x + r.w / 2 - 12, y - 1, 24, 6, 2); fs('rgba(255,250,235,1)');
  text(d.name, x + 16, y + 24, 24, { align: 'left', fill: '#2f7a2c', stroke: false });
  const speed = d.recharge >= 30 ? 'Slow recharge' : 'Fast recharge';
  ctx.font = `700 15px ${FONT_B}`; ctx.fillStyle = '#7a5a3a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`${d.cost} dew  ·  ${speed}  ·  ${d.stat}`, x + 16, y + 50);
  wrapText(d.desc, x + 16, y + 64, w - 30, 16, 21, { fill: '#3b2a14', weight: '500' });
}
function toggleAllSound() {
  const on = !(Save.data.sfx || Save.data.music);
  Save.data.sfx = on; Save.data.music = on; Save.write(); Snd.init(); Snd.apply();
  if (on) { Music.resume(); Snd.play('click'); }
}
function openPause() { if (G.state === 'lost' || (G.reward && G.reward.taken)) return; UI.overlay = 'pause'; Snd.play('click'); }

function drawGame(t) {
  ctx.save();
  if (G.shake > 0 && Save.data.shake !== false) ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake));
  if (Math.abs(G.lawn.rs - bgRS()) > 0.05) G.lawn = renderLawn(G.lawn.opts);
  ctx.drawImage(G.lawn, 0, 0, W, H);
  // hovered cell highlight / ghost
  const hc = (G.sel && Input.inside && (Input.hover || G.drag)) ? cellAt(Input.x, Input.y) : null;
  if (hc && G.state === 'play') {
    const valid = G.sel === 'trowel' ? !!G.grid[hc.r][hc.c] : (G.rows.includes(hc.r) && !G.grid[hc.r][hc.c] && !G.blocked.has(hc.c + ',' + hc.r));
    ctx.fillStyle = valid ? 'rgba(255,255,255,.22)' : 'rgba(255,60,40,.18)';
    ctx.fillRect(GX + hc.c * CW, GY + hc.r * CH, CW, CH);
  }
  for (let r = 0; r < ROWS; r++) {
    if (G.zappers[r] !== 'none') drawZapper(182, rowY(r), t, G.zappers[r]);
  }
  for (let r = 0; r < ROWS; r++) {
    for (const p of G.plants) if (p.r === r && p.type === 'thorn') drawPlantEntity(p);
    for (const p of G.plants) if (p.r === r && p.type !== 'thorn') drawPlantEntity(p);
    if (hc && hc.r === r && G.sel !== 'trowel' && G.state === 'play' && G.rows.includes(r) && !G.grid[r][hc.c]) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(cellX(hc.c), rowY(r)); PLANT_ART[G.sel]({ t, armed: true, hpFrac: 1 }); ctx.restore();
    }
    const rowBugs = G.bugs.filter(b => b.row === r).sort((a, b) => b.x - a.x);
    for (const b of rowBugs) drawBugEntity(b);
    for (const pr of G.projs) if (pr.row === r) drawProj(pr);
    for (const f of G.fires) if (f.row === r) drawFire(f);
  }
  for (const z of G.zapFx) drawZap(z);
  for (const z of G.zprojs) drawZProj(z);
  for (const p of G.parts) drawPart(p);
  for (const c of G.crows) drawCrow(c);
  drawCritters(t);
  // dew drops
  for (const d of G.drops) {
    if (d.state === 'rest' && d.life - d.t < 2 && (d.t * 8) % 2 < 1) continue;
    const bob = d.state === 'rest' ? Math.sin(d.t * 3) * 2 : 0;
    if (d.kind === 'apple') { ctx.save(); ctx.translate(d.x, d.y + bob); circ(0, 0, 15); fs(rg(-5, -6, 2, 0, 0, 18, ['#ff8a7a', '#e0302a', '#a01818'])); st(2.6); P(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(2, -22, 5, -24); st(2.6); leaf(2, -18, 12, 5, -0.5, '#5cbf45', false, 2); ctx.restore(); }
    else drawDew(d.x, d.y + bob, d.small ? 12 : 17, 0.6);
  }
  if (G.sel === 'trowel' && Input.inside && (Input.hover || G.drag)) drawTrowel(Input.x + 10, Input.y - 6, 1.1, -0.3);
  drawWeather(t);
  ctx.restore();

  drawHUD();
  drawBossBar();

  if (G.state === 'intro') {
    const k = G.introT;
    const a = k < 0.3 ? k / 0.3 : k > 2.2 ? 1 - (k - 2.2) / 0.4 : 1;
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.fillStyle = 'rgba(20,30,10,.35)'; ctx.fillRect(0, 280, W, 190);
    const s = easeOutBack(Math.min(1, k / 0.45));
    ctx.save(); ctx.translate(W / 2, 340); ctx.scale(s, s);
    text(G.L.name, 0, 0, 76, { fill: '#fff8e0' });
    ctx.restore();
    text(G.L.sub, W / 2, 404, 32, { fill: '#ffe14a', sw: 6 });
    ctx.globalAlpha = 1;
    if (G.L.tip && k < 2.6) drawTip(G.L.tip, clamp(a, 0, 1));
  } else if (G.time < 14 && G.L.tip && G.idx === 0 && !G.endless && !G.demo && !G.tutorial && !Coach.active() && G.L === LEVELS[0] && Save.data.tutDone && G.coachStarted && false) {
    drawTip(G.L.tip, clamp((14 - G.time) / 1, 0, 1));
  }
  if (G.msg) {
    const m = G.msg;
    const a = m.t < 0.2 ? m.t / 0.2 : m.t > m.dur - 0.4 ? (m.dur - m.t) / 0.4 : 1;
    if (m.t > m.dur) G.msg = null;
    else {
      ctx.globalAlpha = clamp(a, 0, 1);
      const s = 0.8 + 0.2 * easeOutBack(Math.min(1, m.t / 0.35));
      if (m.size >= 58) { // ribbon banner behind big warnings
        const slide = ease(Math.min(1, m.t / 0.3));
        ctx.fillStyle = 'rgba(120,20,10,.55)'; ctx.fillRect(lerp(-W, 0, slide), 320, W, 100);
        ctx.fillStyle = 'rgba(255,220,80,.8)'; ctx.fillRect(lerp(-W, 0, slide), 316, W, 5); ctx.fillRect(lerp(W, 0, slide), 419, W, 5);
      }
      ctx.save(); ctx.translate(W / 2, 370 + (m.size >= 58 ? Math.sin(m.t * 30) * Math.max(0, 0.4 - m.t) * 10 : 0)); ctx.scale(s, s);
      text(m.text, 0, 0, m.size, { fill: m.color, sw: m.size * 0.18 });
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
  if (G.tipCard >= 0 && G.state !== 'intro' && !G.demo) drawCardTip(G.tipCard);
  if (G.reward) drawReward(t);
  if (G.state === 'lost' && G.endT > 0.8) {
    const a = clamp((G.endT - 0.8) / 0.5, 0, 1);
    ctx.fillStyle = `rgba(20,10,5,${0.45 * a})`; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = a;
    text('THE ZOMBIES GOT INTO', W / 2, 300, 62, { fill: '#ffe14a' });
    text('THE GREENHOUSE!', W / 2, 372, 78, { fill: '#ff6b4a' });
    ctx.globalAlpha = 1;
  }
}
function drawTip(str, a) {
  ctx.globalAlpha = a;
  ctx.font = `600 20px ${FONT_B}`;
  const w = Math.min(820, ctx.measureText(str).width + 60);
  rrect(W / 2 - w / 2, 640, w, 52, 14); ctx.fillStyle = 'rgba(40,25,10,.82)'; ctx.fill(); st(3, '#e8c890');
  ctx.fillStyle = '#fff8e0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, W / 2, 667);
  ctx.globalAlpha = 1;
}
function drawReward(t) {
  const r = G.reward;
  let x = r.x, y = r.y + Math.sin(t * 3) * 6, s = 1;
  if (r.taken) { const k = ease(r.ct); x = lerp(r.sx, W / 2, k); y = lerp(r.sy, H / 2, k); s = 1 + k * 1.6; }
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 10; i++) {
    ctx.save(); ctx.rotate(t * 0.8 + (i * TAU) / 10);
    P(); ctx.moveTo(0, 0); ctx.lineTo(-14 * s, -120 * s); ctx.lineTo(14 * s, -120 * s); ctx.closePath();
    ctx.fillStyle = 'rgba(255,240,150,.25)'; ctx.fill(); ctx.restore();
  }
  ctx.scale(s, s);
  if (r.type) drawCard(-33, -48, 66, 96, r.type, { t });
  else { // golden trowel trophy
    circ(0, 0, 40); fs(rg(-10, -10, 4, 0, 0, 44, ['#fff6b0', '#ffd23a', '#d08a10'])); st(4);
    drawTrowel(0, 6, 1.2, -0.5);
  }
  ctx.restore();
  if (!r.taken) text('Tap to collect!', r.x, r.y + 70, 24, { fill: '#fff8e0' });
  if (r.taken && r.ct > 0.5) { ctx.fillStyle = `rgba(255,252,235,${(r.ct - 0.5) * 2})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------- play input ---------- */
function playDown(x, y) {
  if (G.demo && !Input.sim) return;
  if (G.state === 'intro') { G.introT = Math.max(G.introT, 2.2); return; }
  if (G.reward && !G.reward.taken) {
    if (Math.hypot(x - G.reward.x, y - G.reward.y) < 80) { takeReward(); return; }
  }
  if (G.state !== 'play' && G.state !== 'won') return;
  for (let i = G.drops.length - 1; i >= 0; i--) {
    const d = G.drops[i];
    if (d.state !== 'fly' && Math.hypot(x - d.x, y - d.y) < 46) { collectDrop(d); return; }
  }
  if (scareCrow(x, y)) return;
  for (let i = 0; i < G.cards.length; i++) {
    if (inRect(x, y, cardRect(i))) { const was = G.sel; selectCard(i); G.drag = G.sel && G.sel !== was ? { from: 'card' } : null; G.pressCard = i; G.pressT = 0; return; }
  }
  if (inRect(x, y, trowelRect())) { G.sel = G.sel === 'trowel' ? null : 'trowel'; G.drag = G.sel ? { from: 'card' } : null; Snd.play('click'); return; }
  if (G.sel) {
    const cell = cellAt(x, y);
    if (cell) tryPlace(cell);
    else if (y > GY) { G.sel = null; }
  }
}
function playUp(x, y) {
  if (G.drag && Input.moved && G.sel) {
    const cell = cellAt(x, y);
    if (cell) tryPlace(cell);
  }
  G.drag = null; G.pressCard = -1; G.pressT = 0;
}
