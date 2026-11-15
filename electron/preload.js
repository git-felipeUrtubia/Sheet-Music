// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

const desktopApi = {
  getExercisesByLevel: (level) => ipcRenderer.invoke("db:get-exercises", level),
  saveProgress: (exerciseId, bpm) => ipcRenderer.invoke("db:save-progress", exerciseId, bpm),
  getCatalog: () => ipcRenderer.invoke("db:get-catalog"),
  getScoreXml: (scoreId) => ipcRenderer.invoke("db:get-score-xml", scoreId),
  getProgress: () => ipcRenderer.invoke("db:get-progress"),
};

contextBridge.exposeInMainWorld("electronDB", desktopApi);
contextBridge.exposeInMainWorld("electronAPI", desktopApi);