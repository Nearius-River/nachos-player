let totalPlayCount = localStorage.getItem('totalPlayCount') || 0;
let totalPlayTime = localStorage.getItem('totalPlayTime') || 0;
let musicHistory = JSON.parse(localStorage.getItem('musicHistory')) || [];
let musicStats = JSON.parse(localStorage.getItem('musicStats')) || {};

function trackPlayback(song, duration = 0) {
    totalPlayCount++;
    localStorage.setItem('totalPlayCount', totalPlayCount);

    totalPlayTime += duration;
    localStorage.setItem('totalPlayTime', duration);

    musicHistory.unshift(song);
    if (musicHistory.length > 10) {
        musicHistory.pop();
    }
    localStorage.setItem('musicHistory', JSON.stringify(musicHistory));
}

function updateMusicStats(songId, timeListened) {
    if (!musicStats[songId]) {
        musicStats[songId] = { totalTime: 0, playCount: 0 };
    }
    musicStats[songId].totalTime += timeListened;
    musicStats[songId].playCount += 1;

    localStorage.setItem('musicStats', JSON.stringify(musicStats));
}

function clearMusicStats() {
    musicStats = {};
    localStorage.setItem('musicStats', JSON.stringify(musicStats));
}