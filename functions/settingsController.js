document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('saveSettings').addEventListener('click', saveSettings);~
document.getElementById('selectFolderButton').addEventListener('click', async () => {
    const folderPath = await ipcRenderer.invoke('select-music-folder');

    document.getElementById('selectedFolderPath').textContent = folderPath || 'Nenhuma pasta selecionada';
    if (folderPath !== '') {
        loadMusicList(folderPath);
    }
});

function saveSettings() {
    const elementValues = {
        theme: document.getElementById('themeSelect').value,
        volume: document.getElementById('defaultVolume').value,
        autoUpdate: document.getElementById('autoUpdate').checked,
        selectedFolderPath: document.getElementById('selectedFolderPath').textContent
    }

    // Try to save settings on local storage
    try {
        localStorage.setItem('theme', elementValues.theme);
        localStorage.setItem('volume', elementValues.volume);
        localStorage.setItem('autoUpdate', elementValues.autoUpdate);
        localStorage.setItem('selectedFolderPath', elementValues.selectedFolderPath);
        showPopup('Configurações salvas com sucesso!');
    } catch (e) {
        console.error('Error saving settings:', e);
        showPopup('Um erro ocorreu, e as configurações não puderam ser salvas!');
    }

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
        loadMusicList(storageSettings.selectedFolderPath);
    }

    applySettings();
}