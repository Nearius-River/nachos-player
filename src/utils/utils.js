const jsmediatags = require('jsmediatags');

/**
 * Generates a hash code for a given file path.
 *
 * This function uses a simple hash algorithm, similar to the djb2 algorithm,
 * to generate a hash code from the characters in the file path.
 *
 * @param {string} filePath - The file path to generate a hash for.
 * @returns {number} The generated hash code.
 *
 * @example
 * const filePath = '/path/to/file.txt';
 * const hash = generateHash(filePath);
 * console.log(hash); // Output: 123456789 (example hash code)
 */
function generateHash(filePath) {
    let hash = 0;
    for (let i = 0; i < filePath.length; i++) {
        const char = filePath.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash;
}


/**
 * Formats a given duration as: hours, minutes, seconds.
 * @param {number} duration - The duration in seconds.
 * @returns {string} The formatted string.
 */
function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${Math.floor(seconds)}s`;
}

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
            } catch {}

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
 * Delays a function to prevent excessive execution.
 * @param {function} func - The function to delay.
 * @param {number} wait - The wait time in milliseconds.
 * @returns {function} The delayed function.
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
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
 * Toggles the application theme (e.g.: dark, light, etc).
 */
function toggleTheme(theme) {
    document.body.className = theme;
}