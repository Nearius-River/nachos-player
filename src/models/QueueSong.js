class QueueSong {
    constructor(song) {
        this.id = song.id;
        this.filePath = song.filePath;
        this.file = song.fileName;
        this.title = song.title;
        this.artist = song.artist;
        this.album = song.album;
        this.albumCover = song.albumCover;
    }
}

module.exports = QueueSong;