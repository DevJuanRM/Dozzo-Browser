const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

let adblockScriptContent = '';
let devInspectorScriptContent = '';
try {
  const scriptPath = path.join(__dirname, 'youtube-adblock.js');
  adblockScriptContent = fs.readFileSync(scriptPath, 'utf8');
} catch (err) {
  console.error('Failed to load adblock script:', err);
}

try {
  const inspectorPath = path.join(__dirname, 'dev-inspector.js');
  devInspectorScriptContent = fs.readFileSync(inspectorPath, 'utf8');
} catch (err) {
  console.error('Failed to load dev inspector script:', err);
}

contextBridge.exposeInMainWorld('browserAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  shrink: () => ipcRenderer.send('window-shrink'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  openNewWindow: (data) => ipcRenderer.send('open-new-window', data),

  // Privacy & Adblocker
  getAdblockStats: () => ipcRenderer.invoke('get-adblock-stats'),
  toggleShield: (active) => ipcRenderer.invoke('toggle-shield', active),
  resetAdblockStats: () => ipcRenderer.invoke('reset-adblock-stats'),
  fetchRss: (url) => ipcRenderer.invoke('fetch-rss', url),
  onAdblockUpdate: (callback) => {
    const subscription = (event, stats) => callback(stats);
    ipcRenderer.on('adblock-update', subscription);
    return () => ipcRenderer.removeListener('adblock-update', subscription);
  },

  // Helper scripts & Webview Preload
  getAdblockScript: () => adblockScriptContent,
  getDevInspectorScript: () => devInspectorScriptContent,
  getWebviewPreloadUrl: () => {
    try {
      return pathToFileURL(path.join(__dirname, 'webview-preload.js')).href;
    } catch (e) {
      return '';
    }
  },
  getUserAgent: () =>
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',

  // DevTools
  openDevTools: () => ipcRenderer.send('open-devtools'),

  // Downloads & Shell
  openPath: (path) => ipcRenderer.send('open-path', path),
  showItemInFolder: (path) => ipcRenderer.send('show-item-in-folder', path),
  onDownloadEvent: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('download-event', subscription);
    return () => ipcRenderer.removeListener('download-event', subscription);
  },
  onOpenNewTabUrl: (callback) => {
    const subscription = (event, url) => callback(url);
    ipcRenderer.on('open-new-tab-url', subscription);
    return () => ipcRenderer.removeListener('open-new-tab-url', subscription);
  },

  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdaterMessage: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('updater-message', subscription);
    return () => ipcRenderer.removeListener('updater-message', subscription);
  }
});
