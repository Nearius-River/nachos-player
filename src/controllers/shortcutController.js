function handleKeyboardShortcuts(event) {
    const activeElement = document.activeElement;
    const isInputField = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable;

    if (isInputField) {
        return;
    }

    if (event.ctrlKey && event.code === 'KeyF') {
        event.preventDefault();
        searchInput.focus();
        return;
    }

    switch (event.code) {
        case 'Space':
            togglePlayPause();
            event.preventDefault();
            break;
        case 'ArrowRight':
            playNextTrack();
            break;
        case 'ArrowLeft':
            playPreviousTrack();
            break;
        case 'ArrowUp':
            increaseVolume();
            break;
        case 'ArrowDown':
            decreaseVolume();
            break;
        case 'KeyM':
            toggleMute();
            break;
        case 'F1':
            navigateTo('home');
            break;
        case 'F2':
            navigateTo('profile');
            displayStats()
            break;
        case 'F3':
            navigateTo('playlists');
            displayPlaylists()
            break;
        case 'F4':
            navigateTo('settings');
            break;
        default:
            break;
    }
}

document.addEventListener('keydown', handleKeyboardShortcuts);

function increaseVolume() {
    let currentVolume = parseFloat(volumeSlider.value);
    let maxVolume = parseFloat(volumeSlider.max);
    volumeSlider.value = currentVolume + (maxVolume * 0.05);
    changeVolume();
}

function decreaseVolume() {
    let currentVolume = parseFloat(volumeSlider.value);
    let maxVolume = parseFloat(volumeSlider.max);
    volumeSlider.value = currentVolume - (maxVolume * 0.05);
    changeVolume();
}