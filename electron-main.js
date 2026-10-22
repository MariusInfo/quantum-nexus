const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Asigură că și versiunea Portable (.exe) folosește mereu același folder permanent în AppData
app.setAppUserModelId('com.quantumnexus.idle');
const userDataDir = path.join(app.getPath('appData'), 'QuantumNexus');
app.setPath('userData', userDataDir);
const storageBackupPath = path.join(userDataDir, 'quantum-nexus-data.json');

function readDiskBackup() {
  try {
    if (fs.existsSync(storageBackupPath)) {
      return JSON.parse(fs.readFileSync(storageBackupPath, 'utf8'));
    }
  } catch (e) {}
  return null;
}

function writeDiskBackup(data) {
  try {
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    fs.writeFileSync(storageBackupPath, JSON.stringify(data), 'utf8');
  } catch (e) {}
}

let mainWindow;
let syncInterval;

function createWindow() {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 360,
    minHeight: 600,
    title: 'QUANTUM NEXUS // Idle Clicker Simulator',
    backgroundColor: '#07090e',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    autoHideMenuBar: !isMac,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:quantumnexus',
      devTools: true
    }
  });

  // Restaurăm automat sesiunea Cloud și salvarea de pe discul PC/Mac la pornirea ferestrei
  mainWindow.webContents.on('dom-ready', async () => {
    const backup = readDiskBackup();
    try {
      await mainWindow.webContents.executeJavaScript(`
        localStorage.setItem('QUANTUM_NEXUS_INSTALLED', 'true');
        (function() {
          const btn1 = document.getElementById('btnInstallApp');
          if (btn1) btn1.style.display = 'none';
          const btn2 = document.getElementById('btnInstallAppStats');
          if (btn2) btn2.style.display = 'none';
        })();
      `);
      if (backup) {
        await mainWindow.webContents.executeJavaScript(`
          (function() {
            const diskData = ${JSON.stringify(backup)};
            if (diskData.session && !localStorage.getItem('QUANTUM_NEXUS_FIREBASE_SESSION')) {
              localStorage.setItem('QUANTUM_NEXUS_FIREBASE_SESSION', diskData.session);
            }
            if (diskData.save) {
              const curRaw = localStorage.getItem('QUANTUM_NEXUS_SAVE_V2');
              if (!curRaw) {
                localStorage.setItem('QUANTUM_NEXUS_SAVE_V2', diskData.save);
              } else {
                try {
                  const curObj = JSON.parse(curRaw);
                  const diskObj = JSON.parse(diskData.save);
                  if ((diskObj.lifetimeEnergy || 0) > (curObj.lifetimeEnergy || 0)) {
                    localStorage.setItem('QUANTUM_NEXUS_SAVE_V2', diskData.save);
                  }
                } catch (e) {}
              }
            }
            if (typeof loadGame === 'function') loadGame();
            if (typeof renderAll === 'function') renderAll();
            if (typeof initCloudSystem === 'function') initCloudSystem();
          })();
        `);
      }
    } catch (e) {}
  });

  async function syncStorageToDisk() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    try {
      const snapshot = await mainWindow.webContents.executeJavaScript(`
        ({
          session: localStorage.getItem('QUANTUM_NEXUS_FIREBASE_SESSION'),
          save: localStorage.getItem('QUANTUM_NEXUS_SAVE_V2')
        })
      `);
      if (snapshot && (snapshot.session || snapshot.save)) {
        const prev = readDiskBackup() || {};
        writeDiskBackup({
          session: snapshot.session !== null ? snapshot.session : prev.session,
          save: snapshot.save || prev.save
        });
      }
    } catch (e) {}
  }

  syncInterval = setInterval(syncStorageToDisk, 3000);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Salvează garantat pe disc localStorage (inclusiv sesiunea Cloud Save) la închidere
  mainWindow.on('close', () => {
    if (syncInterval) clearInterval(syncInterval);
    try {
      mainWindow.webContents.session.flushStorageData();
    } catch (e) {}
  });

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
