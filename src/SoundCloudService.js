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
          song.src = song.srcType.SC;
          return resolve(song);
        }
      );
    });
  }

  getSongViaSearchQuery(searchstring) {
    return new Promise((resolve, reject) => {
      request(
        `https://api.soundcloud.com/tracks?q=${encodeURIComponent(searchstring)}&limit=1&client_id=${this.clientId}`,
        (error, response, body) => {
          const info = JSON.parse(body);
          if (error || !info || info.length === 0) {
            return reject(new Error("Something went wrong. Try again!"));
          }
          if (!(info[0].streamable)) {
            return reject(new Error("Song is not Streamable from SoundCloud!"));
          }
          const song = new Song();
          song.title = info[0].title;
          song.url = info[0].stream_url;
          song.artist = info[0].user.username;
          song.src = song.srcType.SC;
          return resolve(song);
        }
      );
    });
  }

  getStream(url) {
    return request(`${url}?client_id=${this.clientId}`);
  }
}

module.exports = SoundCloudService;
