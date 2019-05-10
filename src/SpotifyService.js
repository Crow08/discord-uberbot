const Spotify = require("node-spotify-api");
const Song = require("./Song");

class SoundCloudService {
  constructor(spotifyClientId, spotifyClientSecret) {
    this.spotify = new Spotify({
      "id": spotifyClientId,
      "secret": spotifyClientSecret
    });
  }

  getSongsViaSearchQuery(searchstring, count = 1) {
    return new Promise((resolve, reject) => {
      this.spotify.search({"limit": count, "query": searchstring, "type": "track"}, (err, data) => {
        if (err) {
          return reject(new Error(err));
        }
        if (typeof data === "undefined" || typeof data.tracks === "undefined" ||
          typeof data.tracks.items === "undefined") {
          return reject(new Error("Something went wrong. Try again!"));
        }
        if (data.tracks.items.length < 1) {
          return reject(new Error("No results!"));
        }
        const songs = [];
        for (let index = 0; index < data.tracks.items.length; index++) {
          const song = new Song();
          song.title = data.tracks.items[0].name;
          song.url = data.tracks.items[0].uri;
          song.artist = data.tracks.items[0].artists[0].name;
          song.src = song.srcType.SP;
        }
        return resolve(songs);
      });
    });
  }
}

module.exports = SoundCloudService;
