const Spotify = require("node-spotify-api");
const Song = require("./Song");

class SoundCloudService {
  constructor(spotifyClientId, spotifyClientSecret) {
    this.spotify = new Spotify({
      "id": spotifyClientId,
      "secret": spotifyClientSecret
    });
  }

  getSongViaSearchQuery(searchstring) {
    return new Promise((resolve, reject) => {
      this.spotify.search({"limit": 1, "query": searchstring, "type": "track"}, (err, data) => {
        if (err) {
          reject(new Error(err));
        }
        const song = new Song();
        song.title = data.tracks.items[0].name;
        song.url = data.tracks.items[0].uri;
        song.artist = data.tracks.items[0].artists[0].name;
        song.src = song.srcType.SP;
        resolve(song);
      });
    });
  }
}

module.exports = SoundCloudService;
