const { app, BrowserWindow, session, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const http = require('http');
const { setupAdBlocker, getBlockedCount, resetBlockedCount, setShieldActive, getShieldActive } = require('./adblocker');

// Set custom userData path FIRST before any lock or session calls
try {
  const userDataPath = path.join(app.getPath('appData'), 'DozzoBrowser');
  app.setPath('userData', userDataPath);
} catch (e) {}

// Disable GPU disk cache collision warnings on Windows
app.commandLine.appendSwitch('disable-gpu-cache');

let mainWindow = null;

// Handle single instance smoothly to prevent disk cache collisions
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

const fs = require('fs');

// Register Widevine CDM for DRM audio/video streaming (Spotify Web, Netflix, etc.)
function configureWidevine() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const candidates = [
    path.join(localAppData, 'Microsoft/Edge/User Data/WidevineCdm/4.10.3112.0/_platform_specific/win_x64/widevinecdm.dll'),
    path.join(localAppData, 'Google/Chrome/User Data/WidevineCdm/4.10.3112.0/_platform_specific/win_x64/widevinecdm.dll'),
    'C:\\Program Files\\Google\\Chrome\\Application\\155.0.8059.85\\WidevineCdm\\_platform_specific\\win_x64\\widevinecdm.dll',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\155.0.4283.62\\WidevineCdm\\_platform_specific\\win_x64\\widevinecdm.dll'
  ];

  for (const cdmPath of candidates) {
    if (fs.existsSync(cdmPath)) {
      app.commandLine.appendSwitch('widevine-cdm-path', cdmPath);
      app.commandLine.appendSwitch('widevine-cdm-version', '4.10.3112.0');
      break;
    }
  }
}
configureWidevine();

// Audio, Autoplay & Media Switches
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('enable-features', 'PlatformEncryptedDolbyVision,AudioServiceOutOfProcess');

// Modern Chrome User-Agent to avoid Google/Spotify/Cloudflare blocking
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

async function waitForServer(url, timeoutMs = 15000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode < 500) resolve();
          else reject(new Error('Status ' + res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Borderless modern browser frame
    backgroundColor: '#0f0f0f',
    title: 'Dozzo Browser',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Set user agent
  mainWindow.webContents.setUserAgent(CHROME_USER_AGENT);

  const browserPartition = session.fromPartition('persist:dozzo-browser');
  browserPartition.setUserAgent(CHROME_USER_AGENT);

  // Handle media permissions (audio, microphone, mediaKeySystem / EME DRM, autoplay, etc.)
  const setupPermissions = (targetSession) => {
    targetSession.setPermissionRequestHandler((webContents, permission, callback) => {
      // Unconditionally allow microphone, media, audioCapture, notifications, DRM, etc.
      callback(true);
    });

    targetSession.setPermissionCheckHandler((webContents, permission) => {
      return true;
    });

    if (typeof targetSession.setDevicePermissionHandler === 'function') {
      targetSession.setDevicePermissionHandler(() => true);
    }
  };

  setupPermissions(session.defaultSession);
  setupPermissions(browserPartition);

  const notifyRenderer = (count, url) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('adblock-update', {
        blockedCount: count,
        lastBlockedUrl: url,
        isActive: getShieldActive()
      });
    }
  };

  setupAdBlocker(session.defaultSession, notifyRenderer);
  setupAdBlocker(browserPartition, notifyRenderer);

  // Setup download tracking
  const handleDownload = (targetSession) => {
    targetSession.on('will-download', (event, item) => {
      const id = Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      const fileName = item.getFilename();
      const totalBytes = item.getTotalBytes();

      const sendUpdate = (state) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('download-event', {
            id,
            fileName,
            totalBytes,
            receivedBytes: item.getReceivedBytes(),
            savePath: item.getSavePath(),
            state,
            url: item.getURL()
          });
        }
      };

      sendUpdate('progressing');

      item.on('updated', (e, state) => {
        sendUpdate(state);
      });

      item.once('done', (e, state) => {
        sendUpdate(state);
      });
    });
  };

  handleDownload(session.defaultSession);
  handleDownload(browserPartition);

  // Determine URL to load
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    waitForServer(devServerUrl, 4000).then((ready) => {
      if (ready && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(devServerUrl);
      } else if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle window maximize/unmaximize
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-changed', { isMaximized: true });
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-changed', { isMaximized: false });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Adblock IPC
ipcMain.handle('get-adblock-stats', () => {
  return {
    blockedCount: getBlockedCount(),
    isActive: getShieldActive()
  };
});

ipcMain.handle('toggle-shield', (event, active) => {
  return setShieldActive(active);
});

ipcMain.handle('reset-adblock-stats', () => {
  return resetBlockedCount();
});

ipcMain.on('open-devtools', () => {
  if (mainWindow) mainWindow.webContents.openDevTools({ mode: 'detach' });
});

ipcMain.on('open-path', (event, filePath) => {
  if (filePath) shell.openPath(filePath);
});

ipcMain.on('show-item-in-folder', (event, filePath) => {
  if (filePath) shell.showItemInFolder(filePath);
});

// Native Context Menu for webviews and webcontents
app.on('web-contents-created', (event, contents) => {
  contents.on('context-menu', (e, params) => {
    const menuTemplate = [];

    // Navigation items if applicable
    if (contents.canGoBack()) {
      menuTemplate.push({ label: 'Atrás', click: () => contents.goBack() });
    }
    if (contents.canGoForward()) {
      menuTemplate.push({ label: 'Adelante', click: () => contents.goForward() });
    }
    menuTemplate.push({ label: 'Recargar', click: () => contents.reload() });
    menuTemplate.push({ type: 'separator' });

    // Link items
    if (params.linkURL) {
      menuTemplate.push({
        label: 'Abrir enlace en nueva pestaña',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('open-new-tab-url', params.linkURL);
          }
        }
      });
      menuTemplate.push({
        label: 'Copiar dirección del enlace',
        role: 'copyLink',
        click: () => {
          require('electron').clipboard.writeText(params.linkURL);
        }
      });
      menuTemplate.push({ type: 'separator' });
    }

    // Editable text items
    if (params.isEditable) {
      menuTemplate.push({ label: 'Deshacer', role: 'undo' });
      menuTemplate.push({ label: 'Rehacer', role: 'redo' });
      menuTemplate.push({ type: 'separator' });
      menuTemplate.push({ label: 'Cortar', role: 'cut' });
      menuTemplate.push({ label: 'Copiar', role: 'copy' });
      menuTemplate.push({ label: 'Pegar', role: 'paste' });
      menuTemplate.push({ label: 'Seleccionar todo', role: 'selectAll' });
    } else if (params.selectionText) {
      menuTemplate.push({ label: 'Copiar', role: 'copy' });
      menuTemplate.push({
        label: `Buscar "${params.selectionText.trim().substring(0, 20)}..." en DuckDuckGo`,
        click: () => {
          const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(params.selectionText.trim())}`;
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('open-new-tab-url', searchUrl);
          }
        }
      });
    }

    menuTemplate.push({ type: 'separator' });
    menuTemplate.push({
      label: 'Inspeccionar elemento',
      click: () => contents.inspectElement(params.x, params.y)
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    menu.popup();
  });
});

// Auto-updater integration
let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch (e) {}

function setupAutoUpdater() {
  if (!autoUpdater || !app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-message', {
        status: 'update-available',
        version: info.version
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-message', {
        status: 'update-downloaded',
        version: info.version
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.warn('AutoUpdater warning:', err?.message || err);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  }, 6000);
}

ipcMain.on('install-update', () => {
  if (autoUpdater) {
    autoUpdater.quitAndInstall();
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
