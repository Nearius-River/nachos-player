let totalPlayCount = Number(localStorage.getItem('totalPlayCount')) || 0;
let totalPlayTime = Number(localStorage.getItem('totalPlayTime')) || 0;
let musicHistory = JSON.parse(localStorage.getItem('musicHistory')) || [];
let musicStats = JSON.parse(localStorage.getItem('musicStats')) || {};

function trackPlayback(song, duration = 0) {
    totalPlayCount++;
    localStorage.setItem('totalPlayCount', totalPlayCount);

    totalPlayTime += duration;
    localStorage.setItem('totalPlayTime', totalPlayTime);

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
    totalPlayCount = 0;
    totalPlayTime = 0;
    localStorage.setItem('musicStats', JSON.stringify(musicStats));
    localStorage.setItem('totalPlayCount', totalPlayCount);
    localStorage.setItem('totalPlayTime', totalPlayTime);
}

function clearMusicHistory() {
    musicHistory = [];
    localStorage.setItem('musicHistory', JSON.stringify(musicHistory));
}