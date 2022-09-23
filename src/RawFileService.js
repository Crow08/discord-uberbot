const request = require("request");
const Song = require("./Song");

/**
 * Class representing a raw file service.
 */
class RawFileService {

  /**
   * Get song via url.
   * @param {string} payload - Url to get song from.
   * @returns {Promise<Song>} - Song from url.
   */
  getSongViaUrl(payload) {
    return new Promise((resolve, reject) => {
      request(payload, {"method": "HEAD"}, (error, response) => {
        if (error) {
          return reject(error);
        }
        if (!response.headers["content-type"].startsWith("audio/")) {
          return reject(new Error("link does not point directly to a valid audio file"));
        }

        const urlParts = payload.split("/");
        // Try to extract the filename.
        const filename = urlParts[urlParts.length - 1];
        const song = new Song();
        song.title = filename.substr(0, filename.lastIndexOf("."));
        song.url = payload;
        song.artist = "-";
        song.src = Song.srcType.RAW;
        return resolve([song]);
      });
    });
  }

  /**
   * Get audio stream from url.
   * @param {string} url - Url to get audio stream from.
   */
  getStream(url) {
    return new Promise((resolve) => {
      resolve(url);
    });
  }
}

module.exports = RawFileService;
