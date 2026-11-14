// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronDB", {
  getExercisesByLevel: (level) => ipcRenderer.invoke("db:get-exercises", level),
  saveProgress: (exerciseId, bpm) => ipcRenderer.invoke("db:save-progress", exerciseId, bpm),
  getCatalog: () => ipcRenderer.invoke("db:get-catalog"),
  getScoreXml: (scoreId) => ipcRenderer.invoke("db:get-score-xml", scoreId),
});