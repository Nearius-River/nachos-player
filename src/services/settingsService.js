class SettingsService {
    constructor() {
        this.defaultSettings = {
            theme: 'dark',
            volume: 0.25,
            autoUpdate: false,
            selectedFolderPath: ''
        };
    }

    loadSettings() {
        return {
            theme: localStorage.getItem('theme') || this.defaultSettings.theme,
            volume: parseFloat(localStorage.getItem('volume')) || this.defaultSettings.volume,
            autoUpdate: localStorage.getItem('autoUpdate') === 'true',
            selectedFolderPath: localStorage.getItem('selectedFolderPath') || this.defaultSettings.selectedFolderPath
        };
    }

    saveSettings(settings) {
        try {
            localStorage.setItem('theme', settings.theme);
            localStorage.setItem('volume', settings.volume);
            localStorage.setItem('autoUpdate', settings.autoUpdate);
            localStorage.setItem('selectedFolderPath', settings.selectedFolderPath);
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    }

    applySettings(settings) {
        toggleTheme(settings.theme);
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.volume = settings.volume;
        }
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = settings.volume;
        }
        changeVolume();
        document.getElementById('selectedFolderPath').textContent =
            settings.selectedFolderPath !== '' ? settings.selectedFolderPath : 'Nenhuma pasta selecionada';
    }
}

module.exports = new SettingsService();