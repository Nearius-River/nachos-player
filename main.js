const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

// Dynamically import the 'music-metadata' module
let mm;
(async () => {
    mm = await import('music-metadata');
})();

let mainWindow;

/**
 * Create the main application window.
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'src', 'assets', 'icons', 'icon-nobg_rounded.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('src/views/index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * Get the duration of a music file using the music-metadata module.
 * @param {string} filePath - The path to the music file.
 * @returns {Promise<number>} - The duration of the file in seconds.
 */
async function getDuration(filePath) {
    try {
        const metadata = await mm.parseFile(filePath);
        return metadata.format.duration || 0;
    } catch (error) {
        console.error(`Failed to retrieve metadata for file: ${filePath}`, error);
        return 0;
    }
}

/**
 * Select a music folder via the dialog module and send the selected path to the renderer.
 */
let lastResult = null
ipcMain.handle('select-music-folder', async () => {
    
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
        if (result.filePaths[0] !== lastResult) lastResult = result.filePaths[0];
        return lastResult
    }
    return lastResult;
});

// Handles the event only once to update the folder path on the main renderer.
ipcMain.handleOnce('update-music-folder', async (event, folderPath) => {
    lastResult = folderPath;
    return true;
});

/**
 * Retrieve the list of mp3 files and their durations from the selected music folder.
 * @param {string} musicFolderPath - The path to the music folder.
 * @returns {Promise<Array<{ file: string, duration: number }>>} - List of mp3 files and their durations.
 */
async function getMusicList(musicFolderPath) {
    try {
        const files = await fs.promises.readdir(musicFolderPath);
        const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');

        const fileDurations = await Promise.all(
            mp3Files.map(async (file) => {
                const filePath = path.join(musicFolderPath, file);
                const duration = await getDuration(filePath);
                return { file, duration };
            })
        );

        return fileDurations;
    } catch (error) {
        console.error(`Failed to read music folder: ${musicFolderPath}`, error);
        return [];
    }
}

/**
 * Handle the 'get-music-list' event from the renderer process.
 */
ipcMain.handle('get-music-list', async (event, musicFolderPath) => {
    const musicList = await getMusicList(musicFolderPath);
    return { files: musicList, musicFolderPath };
});

/**
 * Event listener for when all windows are closed.
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

/**
 * Event listener for when the application is reactivated (macOS).
 */
app.on('activate', () => {
    if (mainWindow === null) createWindow();
});

// Initialize the app
app.on('ready', createWindow);