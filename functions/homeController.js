// functions/player.js

const { ipcRenderer } = require('electron');
const path = require('path');
const jsmediatags = require('jsmediatags');

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
const songCoverElement = document.getElementById('songCover');
const searchInput = document.getElementById('searchInput');
const volumeSlider = document.getElementById('volumeSlider');
const loopButton = document.getElementById('loopButton');

// State
let songs = [];
const musicQueue = [];
let loopState = 0 // 0 = loop off; 1 = looping entire track; 2 = looping single
let _musicFolderPath;

/**
 * Reads the ID3 tags from a given MP3 file.
 * @param {string} file - The file path.
 * @param {function} callback - Callback function to handle the metadata.
 */
function readID3Tags(file, callback) {
    jsmediatags.read(file, {
        onSuccess: function (tag) {
            const { title, artist, album, picture } = tag.tags;
            
            // Convert the picture data to an image file
            let albumCover = undefined;

            try {
                const { data, format } = picture;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                albumCover = `data:${data.format};base64,${window.btoa(base64String)}`;
            } catch (e) {
                console.warn('Could not convert the picture data for file', file);
            }

            // Send the data
            callback({ title, artist, album, albumCover });
        },
        onError: function (error) {
            console.error('Erro ao ler metadados:', error);
            callback(null);
        },
    });
}

/**
 * Sets up marquee effect for text overflow.
 * @param {HTMLElement} element - The element to apply the marquee effect to.
 */
function setupMarquee(element) {
    if (element.scrollWidth > element.clientWidth) {
        element.classList.add('marquee');
    } else {
        element.classList.remove('marquee');
    }
}

/**
 * Updates the queue list in the UI to reflect the current music queue.
 */
function updateQueueList() {
    if (musicQueue.length > 1) {
        clearQueueButton.classList.remove('hidden');
    } else {
        clearQueueButton.classList.add('hidden');
    }

    const existingListItems = queueListElement.children;
    const newListItems = musicQueue.map((song, index) => {
        const existingListItem = existingListItems[index];
        if (existingListItem) {
            existingListItem.querySelector('.song-name').textContent = `${song.title}`;
            return existingListItem;
        } else {
            const songContainer = document.createElement('div');
            const songNameContainer = document.createElement('div');
            songNameContainer.classList.add('song-name-container');

            const songNameDisplay = document.createElement('p');
            songNameDisplay.classList.add('song-name');
            songNameDisplay.textContent = `${song.title}`;
            
            const removeButton = document.createElement('span');
            removeButton.textContent = index + 1;

            // Only include remove functionality if it's not first song in the queue
            if (index != 0) {
                removeButton.addEventListener('click', () => removeFromQueueIndex(index));
                removeButton.addEventListener('pointerenter', () => {
                    removeButton.textContent = '';
                    removeButton.classList.add('fa');
                    removeButton.classList.add('fa-minus');
                });
                removeButton.addEventListener('pointerout', () => {
                    removeButton.textContent = index + 1;
                    removeButton.classList.remove('fa');
                    removeButton.classList.remove('fa-minus');
                });
            }
            
            songNameContainer.appendChild(songNameDisplay);
            songContainer.appendChild(removeButton);
            songContainer.appendChild(songNameContainer);

            return songContainer;
        }
    });

    // Only remove/add items that have changed
    const itemsToRemove = Array.from(existingListItems).filter((item, index) => index >= newListItems.length);
    itemsToRemove.forEach((item) => queueListElement.removeChild(item));
    newListItems.forEach((item, index) => {
        if (index >= existingListItems.length) {
            queueListElement.appendChild(item);
        }
    });
}

function addToQueue(song) {
    const queueSong = {
        filePath: song.filePath,
        file: song.fileName,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumCover: song.albumCover
    }

    musicQueue.push(queueSong);
    if (musicQueue.length === 1) {
        playButton.classList.remove('inactive');
        nextButton.classList.remove('inactive');
        previousButton.classList.remove('inactive');
        loopButton.classList.remove('inactive');
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
    audioPlayer.src = song.filePath;
    audioPlayer.volume = volumeSlider.value;
    currentSongElement.textContent = `${song.title}`;
    setupMarquee(currentSongElement);
    artistElement.textContent = song.artist
    songCoverElement.src = !song.albumCover ? "images/album_cover-default.png" : song.albumCover;
    audioPlayer.play();
    playButtonDisplay.classList.remove('fa-play');
    playButtonDisplay.classList.add('fa-pause');
}

/**
 * Removes the current song from the queue and updates the queue list.
 */
function removeFromQueue() {
    if (musicQueue.length > 0) {
        musicQueue.shift();
    }
    updateQueueList();
}

/**
 * Removes a song from the queue with the given index.
 */
function removeFromQueueIndex(index) {
    if (musicQueue.length > 0) {
        musicQueue.splice(index, 1);
    }
    updateQueueList();
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
                const songData = {
                    filePath: path.join(_musicFolderPath, file),
                    fileName: file,
                    title: metadata.title || file.replace('.mp3', ''),
                    artist: metadata.artist || 'artista desconhecido',
                    album: metadata.album || 'álbum desconhecido',
                    albumCover: metadata? metadata.albumCover : null,
                    duration: duration
                };
                songs.push(songData);
                if (songs.length === files.length) {
                    console.log('All files received!');
                    songs.forEach((song, index) => {
                        const songItem = createSongItem(song, index);
                        songItem.id = `song-item-${index}`;
                        songList.appendChild(songItem);
                    });
                }
            });
        });
}

function createSongItem(song, index) {
    const songNameContainer = document.createElement('div');
    songNameContainer.classList.add('song-name-container');

    const songNameDisplay = document.createElement('p');
    songNameDisplay.classList.add('song-name');
    songNameDisplay.textContent = song.title;
    setupMarquee(songNameDisplay);

    const songContainer = document.createElement('div');
    const addButton = document.createElement('span');
    addButton.textContent = index + 1;

    addButton.addEventListener('click', () => addToQueue(song));
    addButton.addEventListener('pointerenter', () => {
        addButton.textContent = '';
        addButton.classList.add('fa');
        addButton.classList.add('fa-plus');
    });
    addButton.addEventListener('pointerout', () => {
        addButton.textContent = index + 1;
        addButton.classList.remove('fa');
        addButton.classList.remove('fa-plus');
    });

    songNameContainer.appendChild(songNameDisplay);
    songContainer.appendChild(addButton);
    songContainer.appendChild(songNameContainer);

    return songContainer;
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
    loopButton.addEventListener('click', toggleLoop);
}

function togglePlayPause() {
    if (musicQueue.length > 0) {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButtonDisplay.classList.remove('fa-play');
            playButtonDisplay.classList.add('fa-pause');
        } else {
            audioPlayer.pause();
            playButtonDisplay.classList.remove('fa-pause');
            playButtonDisplay.classList.add('fa-play');
        }
    }
}

function playNextTrack() {
    if (musicQueue.length > 1) {
        removeFromQueue();
        playNextInQueue();
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

function onTrackEnd() {
    if (musicQueue.length > 1) {
        removeFromQueue();
        playNextInQueue();
    } else {
        playButtonDisplay.classList.remove('fa-pause');
        playButtonDisplay.classList.add('fa-play');
        playButton.classList.add('inactive');
        nextButton.classList.add('inactive');
        previousButton.classList.add('inactive');
        loopButton.classList.add('inactive');
        currentSongElement.textContent = 'Nenhuma música na fila!';
        artistElement.textContent = 'Informação do artista'
        clearQueue();
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
    audioPlayer.volume = volume;
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

// Receive the list of music files from the main process.
async function loadMusicList(folderPath) {
    try {
        const data = await ipcRenderer.invoke('get-music-list', folderPath);
        const { files, musicFolderPath } = data;
        _musicFolderPath = musicFolderPath;

        loadSongs(files);
        setupEventListeners();
    } catch (error) {
        console.error("Error trying to load music list:", error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
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
    // const songsItemContainer = document.querySelectorAll('#songList div');

    // songsItemContainer.forEach(item => {
    //     const songTitle = item.querySelector('.song-name').textContent.toLowerCase();
    //     if (songTitle.includes(filter)) {
    //         item.classList.remove('fade-out');
    //         item.style.display = '';
    //     } else {
    //         item.classList.add('fade-out');
    //         setTimeout(() => {
    //             item.style.display = 'none';
    //         }, 300); // Corresponding to the CSS animation duration
    //     }
    // });
}, 300);

// Update the progress bar as the audio player plays.
audioPlayer.addEventListener('timeupdate', () => updateProgressBar());

// Search input handler.
searchInput.addEventListener('input', filterSongs);