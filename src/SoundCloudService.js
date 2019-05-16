const request = require("request");
const Song = require("./Song");

class SoundCloudService {
  constructor(clientId) {
    this.clientId = clientId;
  }

  getSongViaUrl(payload) {
    return new Promise((resolve, reject) => {
      request(
        `http://api.soundcloud.com/resolve?url=${payload}&client_id=${this.clientId}`,
        (error, response, body) => {
          if (error) {
            return reject(new Error("Something went wrong fetching the song!"));
          }
          const info = JSON.parse(body);
          if (!info.streamable) {
            return reject(new Error("Song is not Streamable from SoundCloud!"));
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

  getSongsViaSearchQuery(searchstring, count = 1) {
    return new Promise((resolve, reject) => {
      request(
        "https://api.soundcloud.com/tracks?" +
        `q=${encodeURIComponent(searchstring)}&` +
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
            return reject(new Error(`No results for Query: "${searchstring}"! [SC]`));
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

  getStream(url) {
    return request(`${url}?client_id=${this.clientId}`);
  }
}

module.exports = SoundCloudService;
