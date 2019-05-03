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
      const query = encodeURIComponent(searchstring);
      request(
        `https://api.soundcloud.com/tracks?q=${query}&limit=1&client_id=${this.clientId}`,
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

  getSongsViaSearchQuery(searchstring, count) {
    return new Promise((resolve, reject) => {
      const query = encodeURIComponent(searchstring);
      request(
        `https://api.soundcloud.com/tracks?q=${query}&limit=${count}&client_id=${this.clientId}`,
        (error, response, body) => {
          const info = JSON.parse(body);
          if (error || !info || info.length === 0) {
            return reject(new Error("Something went wrong. Try again!"));
          }
          const songs = [];
          for (let index = 0; index < info.length; index++) {
            if ((info[index].streamable)) {
              const song = new Song();
              song.title = info[index].title;
              song.url = info[index].stream_url;
              song.artist = info[index].user.username;
              song.src = song.srcType.SC;
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
