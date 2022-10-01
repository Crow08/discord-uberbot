const Spotify = require("node-spotify-api");
const Song = require("./Song");

/**
 * Class representing a Spotify service.
 */
class SoundCloudService {

  /**
   * Constructor.
   * @param {string} spotifyClientId - Client id to authenticate Spotify requests.
   * @param {string} spotifyClientSecret -Client secret to authenticate Spotify requests.
   */
  constructor(spotifyClientId, spotifyClientSecret) {
    this.spotify = new Spotify({
      "id": spotifyClientId,
      "secret": spotifyClientSecret
    });
  }

  /**
   * Get songs via playlist url.
   * @param {string} payload - Url to get song from.
   * @param {number} offset - Offset for playlist entries and paging.
   * @param {number} limit - Playlist entries(max is 100)
   * @param {Song[]} songs - optional initial song list.
   * @returns {Promise<Song[]>} - Songs from playlist url.
   */
  getSongsViaPlaylistUrl(payload, offset = 0, limit = 100, songs = []) {
    return new Promise((resolve, reject) => {
      const playlistId = payload.toString().split("playlist/")[1].split("/")[0].split("?")[0];

      this.spotify.
        request(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?` +
        `offset=${offset}&limit=${limit}&fields=items(track(name,artists)),next`).
        then((data) => {
          if (typeof data === "undefined") {
            reject(new Error("Something went wrong. Try again! [SP]"));
            return;
          } else if (typeof data.items === "undefined" || data.items.length <= 0) {
            reject(new Error("Playlist cannot be read, make sure the playlist is public! [SP]"));
            return;
          }

          data.items.forEach((info) => {
            const song = new Song();
            song.title = info.track.name;
            song.url = "-";
            song.artist = info.track.artists[0].name;
            song.src = Song.srcType.SP;
            songs.push(song);
          });

          if (data.next === null) {
            resolve(songs);
          } else {
            this.getSongsViaPlaylistUrl(payload, data.next.split("offset=")[1], data.next.split("limit=")[1], songs).
              then(resolve).
              catch(reject);
          }
        }).
        catch(reject);
    });
  }

  /**
   * Get song via url (without url).
   * @param {string} searchString - Url to get song from.
   * @returns {Promise<Song>} - Song from url.
   */
  getSongViaUrl(searchString) {
    return new Promise((resolve, reject) => {
      const trackId = searchString.split("track/")[1].split("/")[0].split("?")[0];
      this.spotify.
        request(`https://api.spotify.com/v1/tracks/${trackId}`).
        then((data) => {
          if (typeof data === "undefined") {
            return reject(new Error("Something went wrong. Try again! [SP]"));
          }
          const song = new Song();
          song.title = data.name;
          song.url = "-";
          song.artist = data.artists[0].name;
          song.src = Song.srcType.SP;
          return resolve([song]);
        }).
        catch(reject);
    });
  }

  /**
   * Get songs via query (without url).
   * @param {string} searchString - Url to get song from.
   * @param {number} count - Number of songs to be fetched.
   * @returns {Promise<Song[]>} - Array of songs from url.
   */
  getSongsViaSearchQuery(searchString, count = 1) {
    return new Promise((resolve, reject) => {
      this.spotify.search({"limit": count, "query": searchString, "type": "track"}).
        then((data) => {
          if (typeof data === "undefined" || typeof data.tracks === "undefined" ||
            typeof data.tracks.items === "undefined") {
            return reject(new Error("Something went wrong. Try again! [SP]"));
          }
          if (data.tracks.items.length < 1) {
            return reject(new Error(`No results for Query: "${searchString}"! [SP]`));
          }
          const songs = [];
          for (let index = 0; index < data.tracks.items.length; index++) {
            const song = new Song();
            song.title = data.tracks.items[0].name;
            song.url = "-";
            song.artist = data.tracks.items[0].artists[0].name;
            song.src = Song.srcType.SP;
            songs.push(song);
          }
          return resolve(songs);
        }).
        catch(reject);
    });
  }
}

module.exports = SoundCloudService;
