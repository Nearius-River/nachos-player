document.addEventListener('DOMContentLoaded', displayStats);

const totalPlayCountElement = document.getElementById('totalPlayCount');
const totalPlayTimeElement = document.getElementById('totalPlayTime');
const mostPlayedSongElement = document.getElementById('mostPlayedSong');
const lastPlayedSongElement = document.getElementById('lastPlayedSong');
const recentSongsElement = document.getElementById('recentSongs');

function displayStats() {
    totalPlayCountElement.textContent = totalPlayCount;
    totalPlayTimeElement.textContent = formatDuration(totalPlayTime / 1000);
    mostPlayedSongElement.textContent = Object.keys(musicStats).reduce
        ( (a, b) => musicStats[a].playCount > musicStats[b].playCount ? a :
        musicStats[a].playCount < musicStats[b].playCount ? b : a
        )
    lastPlayedSongElement.textContent = musicHistory[musicHistory.length - 1].title;
    
    musicHistory.forEach((song, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = song.title;
        recentSongsElement.appendChild(listItem);
    })
}