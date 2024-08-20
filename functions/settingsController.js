document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('saveSettings').addEventListener('click', saveSettings);~
document.getElementById('selectFolderButton').addEventListener('click', () => {
    ipcRenderer.send('select-music-folder');
});

ipcRenderer.on('music-folder-selected', (event, folderPath) => {
    document.getElementById('selectedFolderPath').textContent = folderPath || 'Nenhuma pasta selecionada';
    if (folderPath !== '') {
        ipcRenderer.send('get-music-list', folderPath);
    }
});

function saveSettings() {
    const elementValues = {
        theme: document.getElementById('themeSelect').value,
        volume: document.getElementById('defaultVolume').value,
        autoUpdate: document.getElementById('autoUpdate').checked,
        selectedFolderPath: document.getElementById('selectedFolderPath').textContent
    }

    // Save settings on local storage
    localStorage.setItem('theme', elementValues.theme);
    localStorage.setItem('volume', elementValues.volume);
    localStorage.setItem('autoUpdate', elementValues.autoUpdate);
    localStorage.setItem('selectedFolderPath', elementValues.selectedFolderPath);

    applySettings();
}

function applySettings() {
    let storageSettings = {
        theme: localStorage.getItem('theme'),
        volume: localStorage.getItem('volume'),
        autoUpdate: localStorage.getItem('autoUpdate'),
        selectedFolderPath: localStorage.getItem('selectedFolderPath')
    }

    // Apply selected theme
    document.body.className = storageSettings.theme;

    // Apply volume preference
    document.getElementById('audioPlayer').volume = storageSettings.volume;
    document.getElementById('volumeSlider').value = storageSettings.volume;

    // Apply selected music folder path
    document.getElementById('selectedFolderPath').textContent =
        selectedFolderPath !== ''
            ? storageSettings.selectedFolderPath
            : 'Nenhuma pasta selecionada';
}

function loadSettings() {
    let storageSettings = {
        theme: localStorage.getItem('theme') || 'light',
        volume: localStorage.getItem('volume') || 50,
        autoUpdate: localStorage.getItem('autoUpdate') === 'true',
        selectedFolderPath: localStorage.getItem('selectedFolderPath') || ''
    }

    document.getElementById('themeSelect').value = storageSettings.theme;
    document.getElementById('defaultVolume').value = storageSettings.volume;
    document.getElementById('autoUpdate').checked = storageSettings.autoUpdate;
    document.getElementById('selectedFolderPath').textContent = storageSettings.selectedFolderPath;

    if (storageSettings.selectedFolderPath !== '') {
        // Request the list of music files from the main process.
        ipcRenderer.send('get-music-list', storageSettings.selectedFolderPath);
    }

    applySettings();
}