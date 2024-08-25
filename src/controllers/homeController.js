const { ipcRenderer } = require('electron');
const path = require('path');
const Song = require('../models/Song.js');
const QueueSong = require('../models/QueueSong.js');

// DOM elements
const queueListElement = document.getElementById('queueList');
const audioPlayer = document.getElementById('audioPlayer');
const currentSongElement = document.getElementById('currentSong');
const playButton = document.getElementById('playButton');
const playButtonDisplay = playButton.querySelector('i');
const nextButton = document.getElementById('nextButton');
const previousButton = document.getElementById('prevButton');
const clearQueueButton = document.getElementById('clearQueueButton');
const progressBar = document.getElementById('progressBar');
const currentTimeElement = document.getElementById('currentTime');
const totalTimeElement = document.getElementById('totalTime');
const artistElement = document.getElementById('artist');
const albumElement = document.getElementById('album');
const songCoverElement = document.getElementById('songCover');
const searchInput = document.getElementById('searchInput');
const volumeSlider = document.getElementById('volumeSlider');
const volumeButton = document.getElementById('volumeButton');
const volumeButtonDisplay = volumeButton.querySelector('i');
const loopButton = document.getElementById('loopButton');

// State
let songs = [];
const musicQueue = [];
let loopState = 0 // 0 = loop off; 1 = looping entire track; 2 = looping single
let previousVolumeState;
let currentStartTime = null;
let pausedStartTime = null;
let totalPausedTime = 0;
let _musicFolderPath;

/**
 * Updates the queue list in the UI to reflect the current music queue.
 */
function updateQueueList() {
    if (musicQueue.length > 1) {
        clearQueueButton.classList.remove('inactive');
    } else {
        clearQueueButton.classList.add('inactive');
    }

    queueListElement.innerHTML = '';

    musicQueue.forEach((song, index) => {
        let songItem;
        if (index !== 0) {
            // Only add remove from queue functionality
            // if song index is greater than 0
            songItem = createSongItem(song, index, {
                onClick: (song, index) => removeFromQueue(index),
                iconClass: 'fa-minus',
            });
        } else {
            songItem = createSongItem(song, index);
        }
        queueListElement.appendChild(songItem);
    })
}

function addToQueue(song) {
    const queueSong = new QueueSong(song);
    musicQueue.push(queueSong);

    if (musicQueue.length === 1) {
        playButton.classList.remove('inactive');
        nextButton.classList.remove('inactive');
        previousButton.classList.remove('inactive');
        loopButton.classList.remove('inactive');
        volumeButton.classList.remove('inactive');
        playNextInQueue();
    }

    updateQueueList()
}

/**
 * Plays the next song in the queue.
 */
function playNextInQueue() {
    if (musicQueue.length > 0) {
        playQueueSong();
    }
}

/**
 * Plays the current song at the front of the queue.
 */
function playQueueSong() {
    const song = musicQueue[0];
    currentStartTime = new Date().getTime();
    audioPlayer.src = song.filePath;
    audioPlayer.volume = volumeSlider.value;
    currentSongElement.textContent = song.title;
    setupMarquee(currentSongElement);
    artistElement.textContent = song.artist
    albumElement.textContent = song.album
    songCoverElement.src = !song.albumCover ? "../assets/images/album_cover-default.png" : song.albumCover;
    audioPlayer.play();
    playButtonDisplay.classList.remove('fa-play');
    playButtonDisplay.classList.add('fa-pause');
}

/**
 * Removes a song from the queue at the specified index and updates the queue list.
 * If no index is provided, it removes the first song in the queue.
 * 
 * @param {number} index - The index of the song to remove from the queue.
 */
function removeFromQueue(index = 0) {
    if (musicQueue.length > 0 && index < musicQueue.length) {
        musicQueue.splice(index, 1);
        
        if (index === 0 && musicQueue.length > 0) {
            playNextInQueue();
        }

        updateQueueList();
    }
}

/**
 * Clears all songs from the queue and updates the queue list.
 */
function clearQueue() {
    musicQueue.length = 0;
    updateQueueList();
}

function clearLoadedSongs() {
    songList.innerHTML = '';
    songs = [];
}

/**
 * Loads a list of songs into the player, reading their ID3 tags for metadata.
 * @param {Array<string>} files - List of file names.
 */
function loadSongs(files) {
    clearQueue();
    clearLoadedSongs();

    files
        .forEach(({ file, duration }) => {
            readID3Tags(path.join(_musicFolderPath, file), (metadata) => {
                const song = new Song(_musicFolderPath, file, metadata, duration)
                songs.push(song);
                if (songs.length === files.length) {
                    console.log('All files received!');
                    songs.sort((a, b) => a.title.localeCompare(b.title));
                    songs.forEach((song, index) => {
                        const songItem = createSongItem(song, index, {
                            onClick: addToQueue,
                            iconClass: 'fa-plus',
                            onDoubleClick: addToQueue
                        });
                        songItem.id = `song-item-${index}`;
                        songList.appendChild(songItem);
                    });
                    showPopup('Suas músicas foram carregadas com sucesso.');
                }
            });
        });
}

function createSongItem(song, index, actionButtonConfig) {
    const songContainer = document.createElement('div');
    songContainer.classList.add('song-container');

    // Album cover image
    const albumCoverImg = document.createElement('img');
    albumCoverImg.classList.add('album-cover');
    albumCoverImg.src = !song.albumCover ? "../assets/images/album_cover-default.png" : song.albumCover;
    albumCoverImg.alt = 'Album cover';

    // Container for song title and artist name
    const songInfoContainer = document.createElement('div');
    songInfoContainer.classList.add('song-info-container');

    // Song title
    const songTitle = document.createElement('p');
    songTitle.classList.add('song-title');
    songTitle.textContent = song.title;
    setupMarquee(songTitle);

    // Artist name
    const artistName = document.createElement('p');
    artistName.classList.add('artist-name');
    artistName.textContent = song.artist;

    // Flexible action button
    const actionButton = document.createElement('span');
    actionButton.textContent = index + 1;

    if (actionButtonConfig && typeof actionButtonConfig.onClick === 'function') {
        actionButton.addEventListener('click', () => actionButtonConfig.onClick(song, index))
    }

    if (actionButtonConfig && actionButtonConfig.iconClass) {
        actionButton.addEventListener('pointerenter', () => {
            actionButton.textContent = '';
            actionButton.classList.add('fa');
            actionButton.classList.add(actionButtonConfig.iconClass);
        });
        actionButton.addEventListener('pointerout', () => {
            actionButton.textContent = index + 1;
            actionButton.classList.remove('fa');
            actionButton.classList.remove(actionButtonConfig.iconClass);
        });
    }

    if (actionButtonConfig && typeof actionButtonConfig.onDoubleClick === 'function') {
        songContainer.addEventListener('dblclick', () => actionButtonConfig.onDoubleClick(song, index));
    }

    // Append song title and artist name to the info container
    songInfoContainer.appendChild(songTitle);
    songInfoContainer.appendChild(artistName);

    // Append album cover and info container to the song container
    songContainer.appendChild(actionButton);
    songContainer.appendChild(albumCoverImg);
    songContainer.appendChild(songInfoContainer);

    return songContainer;
}

/**
 * Find the song with the given id in the songs array
 */
function findSongById(songId) {
    return songs.find(song => song.id === songId);
}

/**
 * Sets up event listeners for the player controls and audio player.
 */
function setupEventListeners() {
    playButton.addEventListener('click', togglePlayPause);
    nextButton.addEventListener('click', playNextTrack);
    previousButton.addEventListener('click', playPreviousTrack)
    clearQueueButton.addEventListener('click', clearButtonClicked);
    progressBar.addEventListener('click', seekPosition);
    audioPlayer.addEventListener('ended', onTrackEnd);
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    volumeSlider.addEventListener('input', changeVolume);
    volumeButton.addEventListener('click', toggleMute);
    loopButton.addEventListener('click', toggleLoop);
}

function togglePlayPause() {
    if (musicQueue.length > 0) {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButtonDisplay.classList.remove('fa-play');
            playButtonDisplay.classList.add('fa-pause');

            if (pausedStartTime) {
                const currentTime = new Date().getTime();
                totalPausedTime += currentTime - pausedStartTime;
                pausedStartTime = null;
            }
        } else {
            audioPlayer.pause();
            playButtonDisplay.classList.remove('fa-pause');
            playButtonDisplay.classList.add('fa-play');
            pausedStartTime = new Date().getTime();
        }
    }
}

function playNextTrack() {
    if (musicQueue.length > 1) {
        updateStats();
        removeFromQueue();
    }
}

function playPreviousTrack() {
    if (musicQueue.length > 0) {
        // if current song has played for more than 5 seconds
        // starts playing from the beginning instead
        if (audioPlayer.currentTime >= 5) {
            audioPlayer.currentTime = 0;
        }
        // TBA: actual way to play previous tracks
    }
}

function resetExhibition() {
    playButtonDisplay.classList.remove('fa-pause');
    playButtonDisplay.classList.add('fa-play');
    playButton.classList.add('inactive');
    nextButton.classList.add('inactive');
    previousButton.classList.add('inactive');
    loopButton.classList.add('inactive');
    volumeButton.classList.add('inactive')
    clearQueue();
}

function onTrackEnd() {
    updateStats();
    if (musicQueue.length > 1) {
        removeFromQueue();
    } else {
        resetExhibition();
    }
}

function seekPosition(e) {
    if (musicQueue.length > 0) {
        const progressBarWidth = progressBar.offsetWidth;
        const clickPosition = e.offsetX;
        const duration = audioPlayer.duration;

        const newTime = (clickPosition / progressBarWidth) * duration;
        audioPlayer.currentTime = newTime;
    }
}

function updateProgressBar() {
    requestAnimationFrame(() => {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        if (!isNaN(duration)) {
            progressBar.value = currentTime / duration;

            let minutes = Math.floor(currentTime / 60);
            let seconds = Math.floor(currentTime % 60);
            currentTimeElement.textContent = `${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            minutes = Math.floor(duration / 60);
            seconds = Math.floor(duration % 60);
            totalTimeElement.textContent = `${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    });
}

function clearButtonClicked() {
    if (musicQueue.length > 1) {
        musicQueue.splice(1);
        updateQueueList();
    }
}

function changeVolume() {
    let volume = parseFloat(volumeSlider.value);
    let maxVolume = parseFloat(volumeSlider.max);

    audioPlayer.volume = volume;

    if (audioPlayer.muted) {
        toggleMute();
    }

    if (volume === 0) {
        // Volume is 0%
        volumeButtonDisplay.setAttribute('class', 'fa fa-volume-xmark');
    } else if (volume <= (maxVolume * 0.65)) {
        // Volume is below 65% of the maximum
        volumeButtonDisplay.setAttribute('class', 'fa fa-volume-low');
    } else {
        volumeButtonDisplay.setAttribute('class', 'fa fa-volume-high');
    }

    previousVolumeState = volumeButtonDisplay.getAttribute('class');
}

function toggleMute() {
    if (musicQueue.length > 0) {
        audioPlayer.muted = !audioPlayer.muted;
        if (audioPlayer.muted) {
            previousVolumeState = volumeButtonDisplay.getAttribute('class');
            volumeButtonDisplay.setAttribute('class', 'fa fa-volume-xmark');
        } else {
            volumeButtonDisplay.setAttribute('class', previousVolumeState);
        }
    }
}

function toggleLoop() {
    if (!loopButton.classList.contains('inactive')) {
        loopState = (loopState + 1) % 3;

        if (loopState === 0) {
            loopButton.classList.remove('active-single')
            audioPlayer.loop = false;
        } else if (loopState === 1) {
            loopButton.classList.add('active-all')
            audioPlayer.loop = true;
        } else {
            loopButton.classList.remove('active-all')
            loopButton.classList.add('active-single')
            audioPlayer.loop = true;
        }
    }
}

function updateStats() {
    if (currentStartTime) {
        const currentSong = musicQueue[0];
        const currentTime = new Date().getTime();
        const timeListened = currentTime - currentStartTime - totalPausedTime; // Result will be given in miliseconds
        trackPlayback(currentSong, timeListened);
        updateMusicStats(currentSong.id, timeListened);
        currentStartTime = null;
        totalPausedTime = 0;
    }
}

/** 
 * Receive the list of music files from the main process. 
 */
async function loadMusicList(folderPath) {
    try {
        const data = await ipcRenderer.invoke('get-music-list', folderPath);
        const { files, musicFolderPath } = data;
        _musicFolderPath = musicFolderPath;

        loadSongs(files);
    } catch (error) {
        console.error("Error trying to load music list:", error);
        showPopup('Um erro ocorreu ao tentar carregar as músicas.');
    }
}

const filterSongs = debounce(function() {
    const filter = searchInput.value.toLowerCase();

    songs.forEach((song, index) => {
        const songItem = document.getElementById(`song-item-${index}`);
        const matchesFilter =
            song.title.toLowerCase().includes(filter) || 
            song.artist.toLowerCase().includes(filter) || 
            song.album.toLowerCase().includes(filter);
        
        if (matchesFilter) {
            songItem.classList.remove('fade-out');
            songItem.style.display = '';
        } else {
            songItem.classList.add('fade-out');
            setTimeout(() => {
                songItem.style.display = 'none';
            }, 300);
        }
    });
}, 300);

// Update the progress bar as the audio player plays.
audioPlayer.addEventListener('timeupdate', () => updateProgressBar());

// Search input handler.
searchInput.addEventListener('input', filterSongs);

// Sets event listeners upon loading DOM.
document.addEventListener('DOMContentLoaded', setupEventListeners);