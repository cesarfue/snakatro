import { app, BrowserWindow, screen, ipcMain, desktopCapturer } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

async function getScreenSource() {
  try {
    const sources = await desktopCapturer.getSources({ types: ["screen"] });
    const screenSource = sources[0];
    
    if (!screenSource) {
      throw new Error('No screen source found');
    }

    return screenSource.id;
  } catch (err) {
    console.error('Failed to get screen source:', err);
    throw err;
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    resizable: true,
    transparent: false,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  // mainWindow.setOpacity(0.2);
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // Enable DevTools
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Handle screen capture request
ipcMain.handle('get-screen-source', async () => {
  try {
    const sourceId = await getScreenSource();
    return sourceId;
  } catch (err) {
    console.error('Failed to get screen source:', err);
    throw err;
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
