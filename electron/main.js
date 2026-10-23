const { app, BrowserWindow, session, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const http = require('http');
const { setupAdBlocker, getBlockedCount, resetBlockedCount, setShieldActive, getShieldActive } = require('./adblocker');

// Disable development security warning logs in renderer console
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

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
  const searchRoots = [
    path.join(localAppData, 'Microsoft/Edge/User Data/WidevineCdm'),
    path.join(localAppData, 'Google/Chrome/User Data/WidevineCdm'),
    'C:\\Program Files\\Google\\Chrome\\Application',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application'
  ];

  for (const root of searchRoots) {
    if (!fs.existsSync(root)) continue;
    try {
      const items = fs.readdirSync(root);
      for (const item of items) {
        const candidateDll = path.join(root, item, '_platform_specific/win_x64/widevinecdm.dll');
        if (fs.existsSync(candidateDll)) {
          let version = item;
          try {
            const manifestPath = path.join(root, item, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
              if (manifest.version) version = manifest.version;
            }
          } catch (e) {}

          app.commandLine.appendSwitch('widevine-cdm-path', candidateDll);
          app.commandLine.appendSwitch('widevine-cdm-version', version);
          app.commandLine.appendSwitch('no-verify-widevine-cdm');
          app.commandLine.appendSwitch('enable-widevine');
          return;
        }
      }
    } catch (e) {}
  }
}
configureWidevine();

// Built-in Secure DNS (DoH) & Direct Cloudflare IP routing for Censored Domains (e.g. Polymarket blocks in Colombia)
app.commandLine.appendSwitch('dns-over-https-mode', 'secure');
app.commandLine.appendSwitch('dns-over-https-templates', 'https://1.1.1.1/dns-query');
app.commandLine.appendSwitch(
  'host-resolver-rules',
  'MAP polymarket.com 172.64.153.51, MAP *.polymarket.com 172.64.153.51, MAP gamma-api.polymarket.com 172.64.153.51, MAP clob.polymarket.com 172.64.153.51'
);

// Audio, Autoplay & Media Switches (Widevine & Spotify Web Enabled)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-features', 'PlatformEncryptedDolbyVision,AudioServiceOutOfProcess,EncryptedMediaExtensions,WidevineCdm,SharedArrayBuffer,DnsOverHttps');

// Modern Chrome User-Agent to avoid Google/Spotify/Cloudflare blocking
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

// Global userAgent fallback ensures all webviews default to clean Chrome UA without "Electron"
try {
  app.userAgentFallback = CHROME_USER_AGENT;
} catch (e) {}

app.on('web-contents-created', (event, contents) => {
  try {
    contents.setUserAgent(CHROME_USER_AGENT);
  } catch (e) {}

  // Prevent raw unstyled OS windows from spawning when opening links in new tabs/windows
  contents.setWindowOpenHandler((details) => {
    const rawUrl = details.url;
    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      // Only process intentional top-level user clicks (not background ad frames or tracking beacons)
      const isTopLevel = details.disposition === 'new-window' || details.disposition === 'foreground-tab' || details.disposition === 'background-tab';
      if (isTopLevel && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('open-new-tab-url', rawUrl);
      }
    }
    return { action: 'deny' };
  });
});

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

function createWindow(initialUrl = '') {
  const win = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Borderless modern browser frame
    backgroundColor: '#000000',
    title: 'Dozzo Browser',
    icon: path.join(__dirname, '../public/icon-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Start browser fully maximized like any standard desktop browser
  try {
    win.maximize();
  } catch (_) {}

  if (!mainWindow) {
    mainWindow = win;
  }

  // Ensure Widevine plugins, media keys and script access are active inside webviews
  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    webPreferences.plugins = true;
    webPreferences.contextIsolation = false;
    webPreferences.webSecurity = true;
  });

  // Set user agent
  win.webContents.setUserAgent(CHROME_USER_AGENT);

  const browserPartition = session.fromPartition('persist:dozzo-browser');
  browserPartition.setUserAgent(CHROME_USER_AGENT);

  // Ensure all headers match official Chrome 133 release and completely strip Electron signatures
  const configureSessionHeaders = (targetSession) => {
    targetSession.webRequest.onBeforeSendHeaders((details, callback) => {
      const headers = { ...details.requestHeaders };

      // Ensure User-Agent is authentic Chrome without Electron
      headers['User-Agent'] = CHROME_USER_AGENT;
      delete headers['user-agent'];

      // Provide authentic Chromium 133 Client Hints
      headers['sec-ch-ua'] = '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"';
      headers['sec-ch-ua-mobile'] = '?0';
      headers['sec-ch-ua-platform'] = '"Windows"';
      delete headers['Sec-CH-UA'];
      delete headers['Sec-CH-UA-Mobile'];
      delete headers['Sec-CH-UA-Platform'];

      callback({ cancel: false, requestHeaders: headers });
    });
  };

  configureSessionHeaders(session.defaultSession);
  configureSessionHeaders(browserPartition);

  // Handle media permissions (audio, microphone, mediaKeySystem / EME DRM, autoplay, etc.)
  const setupPermissions = (targetSession) => {
    targetSession.setPermissionRequestHandler((webContents, permission, callback) => {
      // Prevent repeated system passkey / security key dialog loops on Google auth
      if (permission === 'identity-credentials') {
        return callback(false);
      }
      callback(true);
    });

    targetSession.setPermissionCheckHandler((webContents, permission) => {
      if (permission === 'identity-credentials') {
        return false;
      }
      return true;
    });

    if (typeof targetSession.setDevicePermissionHandler === 'function') {
      targetSession.setDevicePermissionHandler(() => true);
    }
  };

  setupPermissions(session.defaultSession);
  setupPermissions(browserPartition);

  // WebRTC privacy: Bind to default public interface only (protects LAN IP without blocking UDP/QUIC)
  try {
    session.defaultSession.setWebRTCIPHandlingPolicy('default_public_interface_only');
    browserPartition.setWebRTCIPHandlingPolicy('default_public_interface_only');
  } catch (e) {}

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

  // Determine URL to load (with optional initialUrl parameter for detached tabs)
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  const queryParam = initialUrl ? `?initialUrl=${encodeURIComponent(initialUrl)}` : '';

  if (devServerUrl) {
    waitForServer(devServerUrl, 4000).then((ready) => {
      if (ready && !win.isDestroyed()) {
        win.loadURL(devServerUrl + queryParam);
      } else if (!win.isDestroyed()) {
        win.loadFile(path.join(__dirname, '../dist/index.html'), initialUrl ? { query: { initialUrl } } : undefined);
      }
    });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), initialUrl ? { query: { initialUrl } } : undefined);
  }

  // Handle window maximize/unmaximize
  win.on('maximize', () => {
    win.webContents.send('window-state-changed', { isMaximized: true });
  });
  win.on('unmaximize', () => {
    win.webContents.send('window-state-changed', { isMaximized: false });
  });

  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  return win;
}

// Window control IPC (supports all windows independently)
ipcMain.on('window-minimize', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  if (targetWin) targetWin.minimize();
});

ipcMain.on('window-maximize', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  if (targetWin) {
    if (targetWin.isMaximized()) {
      targetWin.unmaximize();
    } else {
      targetWin.maximize();
    }
  }
});

ipcMain.on('window-shrink', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  if (targetWin) {
    if (targetWin.isMaximized()) {
      targetWin.unmaximize();
      targetWin.setSize(1000, 680);
      targetWin.center();
    } else {
      const [w, h] = targetWin.getSize();
      // If already small windowed (around 1000x680), 1 click immediately restores/maximizes
      if (w <= 1060 && h <= 740) {
        targetWin.maximize();
      } else {
        targetWin.setSize(1000, 680);
        targetWin.center();
      }
    }
  }
});

ipcMain.on('window-close', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  if (targetWin) targetWin.close();
});

ipcMain.handle('window-is-maximized', (event) => {
  const targetWin = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  return targetWin ? targetWin.isMaximized() : false;
});

// Multi-window: Drag tab out to separate monitor / new window
ipcMain.on('open-new-window', (event, data) => {
  const win = createWindow(data?.url || '');
  if (data && typeof data.screenX === 'number' && typeof data.screenY === 'number') {
    setTimeout(() => {
      if (win && !win.isDestroyed()) {
        try {
          win.setPosition(Math.round(data.screenX - 200), Math.round(data.screenY - 20));
        } catch (e) {}
      }
    }, 100);
  }
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

ipcMain.handle('fetch-rss', async (event, url) => {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': CHROME_USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    return null;
  }
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

ipcMain.on('open-external', (event, url) => {
  const target = (typeof url === 'string' && url.trim())
    ? url.trim()
    : 'https://github.com/DevJuanRM/Dozzo-Browser/releases/latest';
  try {
    shell.openExternal(target);
  } catch (err) {
    console.error('Failed to open external url:', err);
  }
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
      label: 'Reproductor en miniatura (Picture-in-Picture)',
      click: () => {
        contents.executeJavaScript(`
          (async function() {
            try {
              let v = document.elementFromPoint(${params.x}, ${params.y})?.closest('video') || document.querySelector('video');
              if (v) {
                if (document.pictureInPictureElement) {
                  await document.exitPictureInPicture();
                } else if (document.pictureInPictureEnabled) {
                  await v.requestPictureInPicture();
                }
              }
            } catch (err) {}
          })();
        `);
      }
    });
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
  if (!autoUpdater) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-message', {
        status: 'update-available',
        version: info.version,
        releaseNotes: info.releaseNotes || '',
        releaseDate: info.releaseDate || ''
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

  autoUpdater.on('update-not-available', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-message', {
        status: 'update-not-available'
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.warn('AutoUpdater warning:', err?.message || err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-message', {
        status: 'error',
        error: err?.message || String(err)
      });
    }
  });

  // Check 5 seconds after startup if packaged
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    }, 5000);

    // Periodic check every 30 minutes
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    }, 30 * 60 * 1000);
  }
}

ipcMain.handle('check-for-updates', async () => {
  if (!autoUpdater) return { success: false, reason: 'autoUpdater not available' };
  try {
    const res = await autoUpdater.checkForUpdates();
    return { success: true, updateInfo: res?.updateInfo };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
});

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
