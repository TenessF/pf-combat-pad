const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Save game state
  saveGameState: (data) => ipcRenderer.invoke('save-game-state', data),

  // Load game state
  loadGameState: () => ipcRenderer.invoke('load-game-state'),

  // Get available save files
  getSaveFiles: () => ipcRenderer.invoke('get-save-files'),

  // Load specific save file
  loadSaveFile: (filename) => ipcRenderer.invoke('load-save-file', filename),

  // Delete save file
  deleteSaveFile: (filename) => ipcRenderer.invoke('delete-save-file', filename),

  // Example: send a message to the main process
  sendMessage: (message) => ipcRenderer.send('message', message),

  // Example: receive a message from the main process
  onMessage: (callback) => ipcRenderer.on('message', callback),

  // Example: invoke a method in the main process and get a response
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),

  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Security: disable nodeIntegration and enable contextIsolation
// This prevents the renderer process from accessing Node.js APIs directly 