#!/usr/bin/env python3
"""Build Sprout Siege Retro: the shared game source plus the retro pixel renderer.

Usage: python3 build-retro.py
Reads the game from ../web/src and the retro layer from ./src, writes dist/ and dist-pwa/.
"""
import glob, json, os, shutil, time
ROOT = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(ROOT, '..', 'web', 'src')
TITLE = 'Sprout Siege Retro'

files = sorted(glob.glob(os.path.join(GAME, '*.js'))) + sorted(glob.glob(os.path.join(ROOT, 'src', '*.js')))
js = '\n'.join(open(f).read() for f in files)
# retro wording on the title and loading screens
for a, b in [("text('Zombies in the Garden', 470, 322, 30", "text('Retro Edition', 470, 322, 30"),
             ("text('TAP TO START', 0, -6, 52", "text('PRESS START', 0, -6, 52")]:
    assert js.count(a) == 1, a
    js = js.replace(a, b)

fonts = open(os.path.join(ROOT, 'fonts-retro.css')).read()
FONT = '"Pixelify Sans", ui-monospace, monospace'
css = fonts + """
:root { --bg: #101418; color-scheme: dark; }
html { box-sizing: border-box; height: 100%; background: var(--bg); }
body { height: 100%; margin: 0; background: var(--bg); overflow: hidden; overscroll-behavior: none;
  -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
canvas#pix { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
canvas#game { position: fixed; inset: 0; z-index: 1; display: block; width: 100%; height: 100%; touch-action: none; outline: none; background: transparent; }
#crt { position: fixed; z-index: 2; pointer-events: none; display: none;
  background-image: linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,0) 60%, rgba(0,0,0,.15) 60%, rgba(0,0,0,.15) 100%);
  box-shadow: inset 0 0 90px rgba(0,0,0,.45); }
.ss-modal { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(10,12,16,.7); font-family: FONT; font-variant-ligatures: none; font-feature-settings: 'liga' 0, 'clig' 0; -webkit-user-select: text; user-select: text; }
.ss-card { position: relative; width: min(560px, 100%); max-height: 100%; overflow-y: auto; box-sizing: border-box; padding: 20px 24px; border-radius: 0; background: #fff8e8; color: #3a2a1e; border: 6px solid #3a2a1e; box-shadow: 8px 8px 0 rgba(0,0,0,.4); }
.ss-card h2 { margin: 0 0 6px; font: 700 28px FONT; color: #2a5a2a; }
.ss-card h3 { margin: 18px 0 4px; font: 700 20px FONT; color: #a02828; }
.ss-card p { margin: 6px 0 10px; font-size: 16px; line-height: 1.4; }
.ss-card label { display: block; margin: 8px 0; font-weight: 700; font-size: 15px; }
.ss-card input { display: block; width: 100%; box-sizing: border-box; margin-top: 4px; padding: 10px 12px; font: 400 17px FONT; color: #3a2a1e; background: #fff; border: 3px solid #3a2a1e; border-radius: 0; }
.ss-card input:focus { outline: 3px solid #4fa83a; }
.ss-card input[hidden] { display: none; }
.ss-row { display: flex; gap: 10px; align-items: center; margin: 8px 0; }
.ss-row input { margin-top: 0; flex: 1; min-width: 0; font-family: ui-monospace, Menlo, monospace; font-size: 15px; }
.ss-btn, .ss-link, .ss-x, .ss-card input { font-variant-ligatures: none; }
.ss-btn { flex: none; padding: 10px 16px; font: 700 17px FONT; color: #fff8e8; background: #7a4a28; border: 3px solid #101418; border-radius: 0; box-shadow: 4px 4px 0 rgba(0,0,0,.35); cursor: pointer; }
.ss-btn.go { background: #4fa83a; }
.ss-btn:active { transform: translate(3px, 3px); box-shadow: 1px 1px 0 rgba(0,0,0,.35); }
.ss-btn:disabled { opacity: .55; }
.ss-btn:focus-visible, .ss-link:focus-visible, .ss-x:focus-visible { outline: 3px solid #ffd23a; outline-offset: 2px; }
.ss-link { background: none; border: none; padding: 4px 0; color: #2a4a8a; font: 700 15px FONT; text-decoration: underline; cursor: pointer; }
.ss-x { position: absolute; top: 10px; right: 12px; width: 40px; height: 40px; border-radius: 0; border: 3px solid #101418; background: #7a4a28; color: #fff8e8; font: 700 18px FONT; cursor: pointer; }
.ss-msg { min-height: 22px; margin: 6px 0; font-weight: 700; font-size: 15px; color: #2a5a2a; }
.ss-msg.bad { color: #a02828; }
@media (max-height: 500px) { .ss-card { padding: 14px 18px; } .ss-card h3 { margin-top: 10px; } .ss-card p { margin: 4px 0 6px; } }
.ss-modal, .ss-modal * { font-variant-ligatures: none !important; font-feature-settings: 'liga' 0, 'clig' 0 !important; }
""".replace('FONT', FONT)
pre = ("<script>window.SPROUT_SAVE_KEY = 'sproutSiegeRetro.save.v1'; window.SPROUT_FONT_D = window.SPROUT_FONT_B = '%s';"
       " window.SPROUT_CLOUD_CONFIG = null;</script>\n" % FONT.replace('"', '\\"'))
body = f'<canvas id="game" aria-label="{TITLE} game"></canvas>\n{pre}<script>\n{js}\n</script>\n'
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#101418">\n'
        f'<title>{TITLE}</title>\n<style>{css}</style>\n</head>\n<body>\n{body}</body>\n</html>\n')
out = os.path.join(ROOT, 'dist'); os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w').write(full)

# installable offline web app (GitHub Pages / iPhone home screen)
pwa = os.path.join(ROOT, 'dist-pwa'); os.makedirs(os.path.join(pwa, 'icons'), exist_ok=True)
head_extra = ('<link rel="manifest" href="manifest.webmanifest">\n'
  '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
  '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n'
  '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="SS Retro">\n')
sw_reg = ("<script>if ('serviceWorker' in navigator && location.protocol === 'https:') "
  "window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>\n")
page = full.replace(f'<title>{TITLE}</title>', head_extra + f'<title>{TITLE}</title>').replace('</body>', sw_reg + '</body>')
open(os.path.join(pwa, 'index.html'), 'w').write(page)
icons = os.path.join(ROOT, 'icons')
for name in ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']:
    if os.path.exists(os.path.join(icons, name)):
        shutil.copy(os.path.join(icons, name), os.path.join(pwa, 'icons', name))
manifest = { 'name': TITLE, 'short_name': 'SS Retro', 'description': 'A pixel-art garden defense game: plant a garden and hold off waves of zombies.',
  'start_url': './', 'scope': './', 'display': 'fullscreen', 'orientation': 'landscape', 'background_color': '#101418', 'theme_color': '#101418',
  'icons': [{ 'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any maskable' },
            { 'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable' }] }
open(os.path.join(pwa, 'manifest.webmanifest'), 'w').write(json.dumps(manifest, indent=2))
version = time.strftime('%Y%m%d%H%M%S')
sw = '''// Offline support: serve the game from the cache, refresh it whenever the network is available.
const CACHE = 'sprout-siege-retro-%s';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sprout-siege-retro-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))
  );
});
''' % version
open(os.path.join(pwa, 'sw.js'), 'w').write(sw)
open(os.path.join(pwa, '.nojekyll'), 'w').write('')
print('pwa built', version)
print('built', len(full), 'bytes')
