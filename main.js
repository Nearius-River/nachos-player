/**
 * Main application file for the Electron music player.
 *
 * This script creates the main application window, sets up event listeners,
 * and handles communication between the renderer process and the main process.
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let musicFolderPath = '';

// Makes use of dynamic import to bypass ES requirement
let mm;
(async () => {
    mm = await import('music-metadata');
})();

async function getDuration(filePath) {
    try {
        const metadata = await mm.parseFile(filePath);
        return metadata.format.duration;
    } catch (error) {
        console.log(`Erro ao obter metadados do arquivo ${filePath}:`, error);
        return 0;
    }
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icons', 'icon-nobg.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

async function selectMusicFolder(event) {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        musicFolderPath = result.filePaths[0];
        event.sender.send('music-folder-selected', musicFolderPath);
    }
}

ipcMain.on('select-music-folder', selectMusicFolder);

ipcMain.on('get-music-list', event => {
    if (musicFolderPath === '') {
        selectMusicFolder();
    }

    fs.readdir(musicFolderPath, async (err, files) => {
        if (!err) {
            const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
            const fileDurations = [];
    
            for (const file of mp3Files) {
                const filePath = path.join(musicFolderPath, file);
                const duration = await getDuration(filePath);
                fileDurations.push({ file, duration });
            }
            
            event.sender.send('music-list', { files: fileDurations, musicFolderPath });
        } else {
            console.log(err);
        }
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});