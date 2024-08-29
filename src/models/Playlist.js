class Playlist {
    constructor(playlistName) {
        this.name = playlistName;
        this.songs = [];
        this.totalDuration = 0;
    }
}

module.exports = Playlist;