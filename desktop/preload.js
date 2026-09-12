
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  platform: process.platform,
  version: '1.6.0',
  sendNotification: (title, body) => {
    ipcRenderer.send('desktop-notification', { title, body });
  },
  syncNow: (syncCode) => {
    ipcRenderer.send('desktop-sync-now', { syncCode });
  },
  onSyncTriggered: (callback) => {
    ipcRenderer.on('trigger-cloud-sync', () => callback());
  }
});
