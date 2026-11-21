const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 640,
    minHeight: 360,
    title: 'Sprout Siege Retro',
    backgroundColor: '#101418',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  // F11 or Alt+Enter toggles fullscreen
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.key === 'Enter' && input.alt)) {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    }
  });
  win.webContents.on('did-finish-load', () => console.log('[sprout-retro] game loaded'));
  win.webContents.on('render-process-gone', (e, d) => console.log('[sprout-retro] renderer gone:', d.reason));
  win.loadFile(path.join(__dirname, 'game', 'index.html'));
}

if (process.platform === 'darwin') {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { label: 'View', submenu: [{ role: 'togglefullscreen' }] },
    { role: 'windowMenu' }
  ]));
} else {
  Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
