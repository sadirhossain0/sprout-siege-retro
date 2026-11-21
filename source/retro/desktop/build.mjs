import { packager } from '@electron/packager';
import fs from 'node:fs';
const ELECTRON = '44.10.2';
fs.mkdirSync('app/game', { recursive: true });
fs.copyFileSync('../dist/index.html', 'app/game/index.html');
const common = {
  dir: 'app', name: 'Sprout Siege Retro', executableName: 'Sprout Siege Retro', electronVersion: ELECTRON, out: 'out', overwrite: true, asar: true,
  appVersion: '1.0.0', buildVersion: '1.0.0', appCopyright: 'Sprout Siege', appBundleId: 'com.sproutsiege.retro',
  appCategoryType: 'public.app-category.games', quiet: true
};
const targets = (process.argv[2] || 'win32-x64,darwin-arm64,darwin-x64').split(',');
for (const t of targets) {
  const [platform, arch] = t.split('-');
  const icon = platform === 'win32' ? '../icons/icon.ico' : '../icons/icon.icns';
  const extra = platform === 'win32' ? { win32metadata: { CompanyName: 'Sprout Siege', FileDescription: 'Sprout Siege Retro', ProductName: 'Sprout Siege Retro', InternalName: 'SproutSiegeRetro', OriginalFilename: 'Sprout Siege Retro.exe' } } : {};
  const paths = await packager({ ...common, platform, arch, icon, ...extra });
  console.log('built', t, '->', paths.join(', '));
}
