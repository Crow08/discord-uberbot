const Spotify = require("node-spotify-api");
const Song = require("./Song");

class SoundCloudService {
  constructor(spotifyClientId, spotifyClientSecret) {
    this.spotify = new Spotify({
      "id": spotifyClientId,
      "secret": spotifyClientSecret
    });
  }

  getSongViaUrl(searchstring) {
    return new Promise((resolve, reject) => {
      if (!searchstring.includes("track/")) {
        reject(new Error("Spotify url is not invalid, only track urls are supported!"));
        return;
      }
      const trackId = searchstring.split("track/")[1].split("/")[0].split("?")[0];
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

  getSongsViaSearchQuery(searchstring, count = 1) {
    return new Promise((resolve, reject) => {
      this.spotify.search({"limit": count, "query": searchstring, "type": "track"}).
        then((err, data) => {
          if (err) {
            return reject(new Error(err));
          }
          if (typeof data === "undefined" || typeof data.tracks === "undefined" ||
            typeof data.tracks.items === "undefined") {
            return reject(new Error("Something went wrong. Try again! [SP]"));
          }
          if (data.tracks.items.length < 1) {
            return reject(new Error(`No results for Query: "${searchstring}"! [SP]`));
          }
          const songs = [];
          for (let index = 0; index < data.tracks.items.length; index++) {
            const song = new Song();
            song.title = data.tracks.items[0].name;
            song.url = "-";
            song.artist = data.tracks.items[0].artists[0].name;
            song.src = Song.srcType.SP;
          }
          return resolve(songs);
        }).
        catch(reject);
    });
  }
}

module.exports = SoundCloudService;
