const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

// Get the user data directory for saves
const userDataPath = app.getPath('userData');
const savesDirectory = path.join(userDataPath, 'saves');

// Ensure saves directory exists
if (!fs.existsSync(savesDirectory)) {
  fs.mkdirSync(savesDirectory, { recursive: true });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'), // Optional: add an icon
    title: 'Combat Pad - Pathfinder'
  });

  // Check if we're in development or production
  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, load from the Vite dev server
    mainWindow.loadURL('http://localhost:5173');

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Save game state
ipcMain.handle('save-game-state', async (event, data) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `save-${timestamp}.json`;
    const filePath = path.join(savesDirectory, filename);

    const saveData = {
      characters: data.characters,
      monsters: data.monsters,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
    return { success: true, filename };
  } catch (error) {
    console.error('Error saving game state:', error);
    return { success: false, error: error.message };
  }
});

// Load the most recent save file
ipcMain.handle('load-game-state', async () => {
  try {
    const files = fs.readdirSync(savesDirectory)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(savesDirectory, file),
        timestamp: fs.statSync(path.join(savesDirectory, file)).mtime
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (files.length === 0) {
      return { success: false, error: 'No save files found' };
    }

    const mostRecentFile = files[0];
    const fileContent = fs.readFileSync(mostRecentFile.path, 'utf8');
    const saveData = JSON.parse(fileContent);

    return {
      success: true,
      data: {
        characters: saveData.characters || [],
        monsters: saveData.monsters || []
      },
      filename: mostRecentFile.name
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    return { success: false, error: error.message };
  }
});

// Get all available save files
ipcMain.handle('get-save-files', async () => {
  try {
    const files = fs.readdirSync(savesDirectory)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(savesDirectory, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          timestamp: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return { success: true, files };
  } catch (error) {
    console.error('Error getting save files:', error);
    return { success: false, error: error.message };
  }
});

// Load specific save file
ipcMain.handle('load-save-file', async (event, filename) => {
  try {
    const filePath = path.join(savesDirectory, filename);
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const saveData = JSON.parse(fileContent);

    return {
      success: true,
      data: {
        characters: saveData.characters || [],
        monsters: saveData.monsters || []
      },
      filename
    };
  } catch (error) {
    console.error('Error loading save file:', error);
    return { success: false, error: error.message };
  }
});

// Delete save file
ipcMain.handle('delete-save-file', async (event, filename) => {
  try {
    const filePath = path.join(savesDirectory, filename);
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting save file:', error);
    return { success: false, error: error.message };
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process code 