const totalPlayCountElement = document.getElementById('totalPlayCount');
const totalPlayTimeElement = document.getElementById('totalPlayTime');
const mostPlayedSongElement = document.getElementById('mostPlayedSong');
const lastPlayedSongElement = document.getElementById('lastPlayedSong');
const recentSongsElement = document.getElementById('recentSongs');
const clearMusicHistoryElement = document.getElementById('clearMusicHistory');
const clearMusicStatsElement = document.getElementById('clearMusicStats')

function displayStats() {
    // Reset display
    totalPlayCountElement.textContent = '';
    totalPlayTimeElement.textContent = '';
    mostPlayedSongElement.textContent = '';
    lastPlayedSongElement.textContent = '';
    recentSongsElement.innerHTML = '';

    totalPlayCountElement.textContent = totalPlayCount;
    totalPlayTimeElement.textContent = formatDuration(totalPlayTime / 1000);

    try {
        mostPlayedSongElement.textContent = Object.keys(musicStats).reduce
            ((a, b) => musicStats[a].playCount > musicStats[b].playCount ? a :
                musicStats[a].playCount < musicStats[b].playCount ? b : a
            );
    } catch {}

    const songId = Number(mostPlayedSongElement.textContent);
    mostPlayedSongElement.textContent = findSongById(songId) ? findSongById(songId).title : 'Sem dados ainda!';

    if (musicHistory.length > 0) {
        clearMusicHistoryElement.classList.remove('inactive');
        lastPlayedSongElement.textContent = musicHistory[0].title;
        musicHistory.forEach((song, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = song.title;
            recentSongsElement.appendChild(listItem);
        })
    } else {
        clearMusicHistoryElement.classList.add('inactive');
        lastPlayedSongElement.textContent = 'Sem dados ainda!';
    }

    if (Object.keys(musicStats).length > 0) {
        clearMusicStatsElement.classList.remove('inactive');
    } else {
        clearMusicStatsElement.classList.add('inactive');
    }
}

clearMusicHistoryElement.addEventListener('click', async () => {
    if (musicHistory.length > 0) {
        showConfirmation('Essa ação irá remover as últimas 10 músicas que foram salvas no histórico. Confirmar?', (confirmed) => {
            if (confirmed) {
                clearMusicHistory();
                displayStats();
                showPopup('Seu histórico foi limpo.');
                clearMusicHistoryElement.classList.add('inactive');
            } else {
                return;
            }
        });
    }
});

clearMusicStatsElement.addEventListener('click', async () => {
    if (Object.keys(musicStats).length > 0) {
        showConfirmation('Essa ação irá limpar as estatísticas de reprodução (tempo reproduzido, total de reproduções) de TODAS as músicas. Confirmar?', (confirmed) => {
            if (confirmed) {
                clearMusicStats();
                displayStats();
                showPopup('As estatísticas de reprodução foram limpas.');
                clearMusicStatsElement.classList.add('inactive');
            } else {
                return;
            }
        });
    };
});