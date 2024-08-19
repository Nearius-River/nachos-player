document.getElementById('saveSettings').addEventListener('click', saveSettings);~

document.getElementById('selectFolderButton').addEventListener('click', () => {
    ipcRenderer.send('select-music-folder');
});

function saveSettings() {
    const theme = document.getElementById('themeSelect').value;
    const volume = document.getElementById('defaultVolume').value;
    const autoUpdate = document.getElementById('autoUpdate').checked;
    const selectedFolderPath = document.getElementById('selectedFolderPath').textContent;

    // Save settings on local storage
    localStorage.setItem('theme', theme);
    localStorage.setItem('volume', volume);
    localStorage.setItem('autoUpdate', autoUpdate);
    localStorage.setItem('selectedFolderPath', selectedFolderPath);

    applySettings();
}

function applySettings() {
    const theme = localStorage.getItem('theme');
    const volume = localStorage.getItem('volume');
    const autoUpdate = localStorage.getItem('autoUpdate') === 'true';
    const selectedFolderPath = localStorage.getItem('selectedFolderPath');

    // Apply selected theme
    document.body.className = theme;

    // Apply volume preference
    document.getElementById('audioPlayer').volume = volume;
    document.getElementById('volumeSlider').value = volume;

    // Apply selected music folder path
    document.getElementById('selectedFolderPath').textContent = selectedFolderPath || 'Nenhuma pasta selecionada';
}

function loadSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const volume = localStorage.getItem('volume') || 50;
    const autoUpdate = localStorage.getItem('autoUpdate') === 'true';

    document.getElementById('themeSelect').value = theme;
    document.getElementById('defaultVolume').value = volume;
    document.getElementById('autoUpdate').checked = autoUpdate;

    applySettings();
}

ipcRenderer.on('music-folder-selected', (event, folderPath) => {
    document.getElementById('selectedFolderPath').textContent = folderPath || 'Nenhuma pasta selecionada';
    ipcRenderer.send('get-music-list');
});

// Load settings upon initializing app
loadSettings();