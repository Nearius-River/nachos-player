const playlists = JSON.parse(localStorage.getItem('playlists')) || [];
const Playlist = require('../models/Playlist.js');

document.getElementById('createPlaylistButton').addEventListener('click', () => {
    const playlistName = document.getElementById('playlistNameInput').value.trim();
    if (playlistName) {
        const newPlaylist = new Playlist(playlistName);
        playlists.push(newPlaylist);
        savePlaylists();
        displayPlaylists();
        showPopup('Nova playlist salva!');
        document.getElementById('playlistNameInput').value = '';
    }
});

function addSongToPlaylist(songName, playlistIndex) {
    const song = songs.find(m => m.title === songName.replace(/^\d+\.\s*/, ''));
    if (song) {
        playlists[playlistIndex].songs.push(song);
        playlists[playlistIndex].totalDuration += song.duration;
        showPopup(`Música ${song.title} adicionada à playlist ${playlists[playlistIndex].name}.`)
        savePlaylists();
        displayPlaylists();
    } else {
        showPopup('Música não encontrada na fila.');
    }
}

function savePlaylists() {
    try {
        localStorage.setItem('playlists', JSON.stringify(playlists));
    } catch (e) {
        console.error('Error trying to save a playlist:', e);
        showPopup('Um erro ocorreu tentando salvar a playlist.')
    }
}

function displayPlaylists() {
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = '';

    playlists.forEach((playlist, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('playlist-item');

        const playlistInfo = document.createElement('div');
        playlistInfo.classList.add('playlist-info');
        playlistInfo.addEventListener('click', () => toggleSongList(index));

        const playlistDisplay = document.createElement('div');
        playlistDisplay.classList.add('playlist-display');

        const playlistName = document.createElement('h3');
        playlistName.textContent = playlist.name;

        playlistDisplay.appendChild(playlistName);

        if (playlist.songs.length > 0) {
            for (let i = 0; i < Math.min(playlist.songs.length, 4); i++) {
                const playlistSongCover = document.createElement('img');
                playlistSongCover.classList.add('album-cover')
                playlistSongCover.src = playlist.songs[i].albumCover || "../assets/images/album_cover-default.png";
                playlistDisplay.appendChild(playlistSongCover);
            }
        }

        const playlistDuration = document.createElement('p');
        playlistDuration.textContent = `${playlist.songs.length} músicas, ${formatDuration(playlist.totalDuration)}`

        playlistInfo.appendChild(playlistDisplay);
        playlistInfo.appendChild(playlistDuration);

        const playAllButton = document.createElement('button');
        playAllButton.textContent = 'Reproduzir todas';
        playAllButton.classList.add('standard-button', 'play-all-button');
        playAllButton.addEventListener('click', () => playAllSongs(index));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('standard-button');
        deleteButton.classList.add('delete-playlist');
        deleteButton.addEventListener('click', () => {
            showConfirmation(`Excluir a playlist '${playlist.name}?'`, (confirmed) => {
                if (confirmed) {
                    deletePlaylist(index);
                } else {
                    return;
                }
            })
        });

        const songList = document.createElement('div');
        songList.classList.add('song-list');
        songList.style.display = 'none';

        playlist.songs.forEach((song, songIndex) => {
            const songItem = createSongItem(song, songIndex, {
                onClick: addToQueue,
                iconClass: 'fa-plus',
                onDoubleClick: addToQueue
            });
            songList.appendChild(songItem);
        });

        listItem.appendChild(playlistInfo);
        listItem.appendChild(playAllButton);
        listItem.appendChild(songList);
        listItem.appendChild(deleteButton);

        playlistList.appendChild(listItem);
    });
}

function toggleSongList(index) {
    const playlistListItems = document.querySelectorAll('#playlistList .playlist-item');
    const songList = playlistListItems[index].querySelector('.song-list');
    songList.style.display = songList.style.display === 'none' ? 'block' : 'none';
}

function playSong(songTitle, playlistIndex) {
    const playlist = playlists[playlistIndex];
    const song = playlist.songs.find(s => s.title === songTitle);
    if (song) {
        addToQueue(song);
        showPopup(`Adicionado "${song.title}" à fila de reprodução.`);
    }
}

function playAllSongs(playlistIndex) {
    const playlist = playlists[playlistIndex];
    playlist.songs.forEach(song => {
        addToQueue(song);
    });
    showPopup(`Adicionado todas as músicas da playlist "${playlist.name}" à fila de reprodução.`);
}

function removeSongFromPlaylist(playlistIndex, songIndex, songDuration) {
    const playlist = playlists[playlistIndex];
    playlist.songs.splice(songIndex, 1);
    playlist.totalDuration -= songDuration;
    showPopup('Música removida da playlist.');
    savePlaylists();
    displayPlaylists();
}

function deletePlaylist(index) {
    playlists.splice(index, 1);
    savePlaylists();
    displayPlaylists();
    showPopup('Playlist excluída com sucesso!');
}

document.addEventListener('contextmenu', (event) => {;
    if (event.target.classList.contains('song-container') || event.target.classList.contains('song-title') || event.target.classList.contains('artist-name') || event.target.classList.contains('album-cover')) {
        event.preventDefault();
        const contextMenu = document.getElementById('contextMenu');
        const playlistsSubMenu = document.getElementById('playlistsSubMenu');

        playlistsSubMenu.innerHTML = '';
        if (playlists.length > 0) {
            playlistsSubMenu.classList.remove('hidden');
            playlists.forEach((playlist, index) => {
                const playlistOption = document.createElement('li');
                playlistOption.textContent = playlist.name;
                playlistOption.addEventListener('click', () => addSongToPlaylist(event.target.textContent, index));
                playlistsSubMenu.appendChild(playlistOption);
            });
        } else {
            playlistsSubMenu.classList.add('hidden');
        }

        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.classList.remove('hidden');
    } else {
        document.getElementById('contextMenu').classList.add('hidden');
    }
});

document.addEventListener('click', () => {
    document.getElementById('contextMenu').classList.add('hidden');
});