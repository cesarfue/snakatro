const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getScreenStream: () => ipcRenderer.invoke("get-screen-stream"),
  getScreenSource: () => ipcRenderer.invoke("get-screen-source"),
});

