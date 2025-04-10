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
    const sources = await desktopCapturer.getSources({
      types: ["window"],
      thumbnailSize: { width: 0, height: 0 }, // Don't need thumbnails
    });
    const previousWindow = sources[1]; // Skip our own window (index 0)

    if (!previousWindow) {
      throw new Error("No previous window found");
    }
    return previousWindow.id;
  } catch (err) {
    console.error("Failed to get window source:", err);
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
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // Enable DevTools
  //mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.handle("get-screen-source", async () => {
  try {
    const sourceId = await getScreenSource();
    return sourceId;
  } catch (err) {
    console.error("Failed to get window source:", err);
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
