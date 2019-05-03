const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const Song = require("./Song");

class YoutubeService {

  getSongViaUrl(searchstring) {
    return new Promise((resolve, reject) => {
      ytdl.getBasicInfo(searchstring, {}, (err, info) => {
        if (err) {
          return reject(new Error("Something went wrong fetching the song!"));
        }
        const song = new Song();
        song.title = info.title;
        song.url = info.video_url;
        song.artist = info.author.name;
        song.src = song.srcType.YT;
        return resolve(song);
      });
    });
  }

  getSongsViaPlaylistUrl(searchstring) {
    const playid = searchstring.toString().split("list=")[1];
    return new Promise((resolve, reject) => {
      ytpl(playid, (err, playlist) => {
        if (err) {
          return reject(new Error("Something went wrong fetching that playlist!"));
        }
        if (playlist.items.length <= 0) {
          return reject(new Error("Couldn't get any songs from that playlist."));
        }
        const songs = [];
        playlist.items.forEach((info) => {
          const song = new Song();
          song.title = info.title;
          song.url = info.url_simple;
          song.artist = info.author.name;
          song.src = song.srcType.YT;
          songs.push(song);
        });
        return resolve(songs);
      });
    });
  }

  getSongViaSearchQuery(searchstring) {
    return new Promise((resolve, reject) => {
      ytsr(searchstring, {"limit": 1}).then((result) => {
        if (!result || !result.items || !result.items[0]) {
          return reject(new Error("Something went wrong. Try again!"));
        }
        const song = new Song();
        song.title = result.items[0].title;
        song.url = result.items[0].link;
        song.Author = result.items[0].author.name;
        song.src = song.srcType.YT;
        return resolve(song);
      });
    });
  }

  getSongsViaSearchQuery(searchstring, count) {
    return new Promise((resolve, reject) => {
      ytsr(searchstring, {"limit": count}).then((result) => {
        if (!result || !result.items || !result.items[0]) {
          return reject(new Error("Something went wrong. Try again!"));
        }
        const songs = [];
        for (let index = 0; index < result.items.length; index++) {
          if (result.items[index].type === "video") {
            const song = new Song();
            song.title = result.items[index].title;
            song.url = result.items[index].link;
            song.Author = result.items[index].author.name;
            song.src = song.srcType.YT;
            songs.push(song);
          }
        }
        return resolve(songs);
      });
    });
  }

  getStream(url) {
    return ytdl(url, {"filter": "audioonly"});
  }
}

module.exports = YoutubeService;
