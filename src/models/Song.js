class Song {
    constructor(_musicFolderPath, file, metadata, duration) {
        this.id = generateHash(path.join(_musicFolderPath, file));
        this.filePath = path.join(_musicFolderPath, file);
        this.fileName = file;
        this.title = metadata.title || file.replace('.mp3', '');
        this.artist = metadata.artist || 'artista desconhecido';
        this.album = metadata.album || 'álbum desconhecido';
        this.albumCover = metadata ? metadata.albumCover : null;
        this.duration = duration;
    }
}

module.exports = Song;