const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'QUANTUM NEXUS // Idle Clicker Simulator',
    backgroundColor: '#07090e',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    autoHideMenuBar: !isMac,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Deschide link-urile externe în browserul implicit al sistemului
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isMac) {
    const template = [
      {
        label: app.name,
        submenu: [
          { role: 'about', label: 'Despre Quantum Nexus' },
          { type: 'separator' },
          { role: 'hide', label: 'Ascunde' },
          { role: 'hideOthers', label: 'Ascunde Celelalte' },
          { role: 'unhide', label: 'Afișează Tot' },
          { type: 'separator' },
          { role: 'quit', label: 'Ieșire din Joc' }
        ]
      },
      {
        label: 'Editare',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' }
        ]
      },
      {
        label: 'Vizualizare',
        submenu: [
          { role: 'reload', label: 'Reîncarcă' },
          { role: 'togglefullscreen', label: 'Ecran Complet (Fullscreen)' },
          { role: 'toggleDevTools', label: 'Consolă Dezvoltator' }
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
