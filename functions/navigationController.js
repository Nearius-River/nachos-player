document.getElementById('homeLink').addEventListener('click', () => {
    document.getElementById('home').classList.remove('hidden');
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('playlists').classList.add('hidden');
});

document.getElementById('settingsLink').addEventListener('click', () => {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('settings').classList.remove('hidden');
    document.getElementById('playlists').classList.add('hidden');
});

document.getElementById('playlistsLink').addEventListener('click', () => {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('settings').classList.add('hidden');
    document.getElementById('playlists').classList.remove('hidden');
});