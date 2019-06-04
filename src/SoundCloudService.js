const request = require("request");
const Song = require("./Song");

/**
 * Class representing a SoundCloud service.
 */
class SoundCloudService {

  /**
   * Constructor.
   * @param {string} clientId - Client id to authenticate SoundCloud requests.
   */
  constructor(clientId) {
    this.clientId = clientId;
  }

  /**
   * Get song via url.
   * @param {string} payload - Url to get song from.
   * @returns {Song} - Song from url.
   */
  getSongViaUrl(payload) {
    return new Promise((resolve, reject) => {
      request(
        `http://api.soundcloud.com/resolve?url=${payload}&client_id=${this.clientId}`,
        (error, response, body) => {
          if (error) {
            return reject(error);
          }
          const info = JSON.parse(body);
          if (!info.streamable) {
            return reject(new Error("Song is not streamable from SoundCloud!"));
          }
          const song = new Song();
          song.title = info.title;
          song.url = info.stream_url;
          song.artist = info.user.username;
          song.src = Song.srcType.SC;
          return resolve([song]);
        }
      );
    });
  }

  /**
   * Get songs via query.
   * @param {string} payload - Url to get song from.
   * @param {number} count - Number of songs to be fetched.
   * @returns {Song[]} - Array of songs from url.
   */
  getSongsViaSearchQuery(searchString, count = 1) {
    return new Promise((resolve, reject) => {
      request(
        "https://api.soundcloud.com/tracks?" +
        `q=${encodeURIComponent(searchString)}&` +
        `limit=${count}&` +
        `client_id=${this.clientId}`,
        (error, response, body) => {
          if (error) {
            return reject(error);
          }
          const result = JSON.parse(body);
          if (!result) {
            return reject(new Error("Something went wrong. Try again! [SC]"));
          }
          if (result.length < 1) {
            return reject(new Error(`No results for Query: "${searchString}"! [SC]`));
          }
          const songs = [];
          for (let index = 0; index < result.length; index++) {
            if ((result[index].streamable)) {
              const song = new Song();
              song.title = result[index].title;
              song.url = result[index].stream_url;
              song.artist = result[index].user.username;
              song.src = Song.srcType.SC;
              songs.push(song);
            }
          }
          return resolve(songs);
        }
      );
    });
  }

  /**
   * Get audio stream from url.
   * @param {string} url - Url to get audio stream from.
   */
  getStream(url) {
    return new Promise((resolve) => resolve(`${url}?client_id=${this.clientId}`));
  }
}

module.exports = SoundCloudService;
