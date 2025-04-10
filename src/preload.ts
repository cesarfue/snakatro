const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    getScreenStream: () => ipcRenderer.invoke('get-screen-stream'),
    getScreenSource: () => ipcRenderer.invoke('get-screen-source')
  }
); 