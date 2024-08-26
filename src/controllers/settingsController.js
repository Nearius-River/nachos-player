const SettingsService = require('../services/settingsService');

document.addEventListener('DOMContentLoaded', () => {
    const settings = SettingsService.loadSettings();
    applySettingsToUI(settings);
    SettingsService.applySettings(settings);
});

document.getElementById('saveSettings').addEventListener('click', () => {
    const newSettings = {
        theme: document.getElementById('themeSelect').value,
        volume: parseFloat(document.getElementById('defaultVolume').value),
        autoUpdate: document.getElementById('autoUpdate').checked,
        selectedFolderPath: document.getElementById('selectedFolderPath').textContent
    };

    if (SettingsService.saveSettings(newSettings)) {
        showPopup('Configurações salvas com sucesso!');
        SettingsService.applySettings(newSettings);
    } else {
        showPopup('Um erro ocorreu, e as configurações não puderam ser salvas!');
    }
});

document.getElementById('selectFolderButton').addEventListener('click', async () => {
    const folderPath = await ipcRenderer.invoke('select-music-folder');
    document.getElementById('selectedFolderPath').textContent = folderPath || 'Nenhuma pasta selecionada';
    if (folderPath !== '' && folderPath !== localStorage.getItem('selectedFolderPath')) {
        loadMusicList(folderPath);
    }
});

function applySettingsToUI(settings) {
    document.getElementById('themeSelect').value = settings.theme;
    document.getElementById('defaultVolume').value = settings.volume;
    document.getElementById('autoUpdate').checked = settings.autoUpdate;
    document.getElementById('selectedFolderPath').textContent = settings.selectedFolderPath;
    ipcRenderer.invoke('update-music-folder', settings.selectedFolderPath);

    if (settings.selectedFolderPath !== '') {
        loadMusicList(settings.selectedFolderPath);
    }
}