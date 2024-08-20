const playlists = JSON.parse(localStorage.getItem('playlists')) || [];

document.getElementById('createPlaylistButton').addEventListener('click', () => {
    const playlistName = document.getElementById('playlistNameInput').value.trim();
    if (playlistName) {
        const newPlaylist = {
            name: playlistName,
            songs: [],
            totalDuration: 0
        };
        playlists.push(newPlaylist);
        savePlaylists();
        displayPlaylists();
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
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

function displayPlaylists() {
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = '';

    playlists.forEach((playlist, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('playlist-item');

        const playlistInfo = document.createElement('div');
        playlistInfo.innerHTML = `<h3>${playlist.name}</h3><p>${playlist.songs.length} músicas, ${formatDuration(playlist.totalDuration)}</p>`;
        playlistInfo.addEventListener('click', () => toggleSongList(index));

        const playAllButton = document.createElement('button');
        playAllButton.textContent = 'Reproduzir todas';
        playAllButton.classList.add('standard-button');
        playAllButton.classList.add('play-all-button');
        playAllButton.addEventListener('click', () => playAllSongs(index));

        const deleteButton = document.createElement('span');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-playlist');
        deleteButton.addEventListener('click', () => deletePlaylist(index));

        const songList = document.createElement('ul');
        songList.classList.add('song-list');

        playlist.songs.forEach((song, songIndex) => {
            const songItem = document.createElement('li');
            songItem.classList.add('song-item');
            songItem.innerHTML = `<span>${song.title} - ${song.artist}</span>
                                  <div class="controls">
                                      <button class="standard-button play-button" onclick="playSong('${song.title}', ${index})">Reproduzir</button>
                                      <button class="standard-button remove-button" onclick="removeSongFromPlaylist(${index}, ${songIndex})">Remover</button>
                                  </div>`;
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
        showPopup(`Adicionando "${song.title}" à fila de reprodução.`);
    }
}

function playAllSongs(playlistIndex) {
    const playlist = playlists[playlistIndex];
    playlist.songs.forEach(song => {
        addToQueue(song);
    });
    showPopup(`Adicionando todas as músicas da playlist "${playlist.name}" à fila de reprodução.`);
}

function removeSongFromPlaylist(playlistIndex, songIndex) {
    const playlist = playlists[playlistIndex];
    playlist.songs.splice(songIndex, 1);
    showPopup('Música removida da playlist.');
    savePlaylists();
    displayPlaylists();
}

function deletePlaylist(index) {
    const confirmation = confirm(`Tem certeza de que deseja excluir a playlist "${playlists[index].name}"?`);
    if (confirmation) {
        playlists.splice(index, 1);
        savePlaylists();
        displayPlaylists();
        showPopup('Playlist excluída com sucesso!');
    }
}

function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${Math.floor(seconds)}s`;
}

document.addEventListener('contextmenu', (event) => {
    if (event.target.classList.contains('song-name')) {
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

document.addEventListener('DOMContentLoaded', () => {
    displayPlaylists();
});