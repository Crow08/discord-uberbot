const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const request = require("request");
const Song = require("./Song");

/**
 * Class representing a YouTube service.
 */
class YoutubeService {

  /**
   * Constructor.
   * @param {string} apiKey - api Key to authenticate YouTube requests.
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Get song via url.
   * @param {string} payload - Url to get song from.
   * @returns {Song} - Song from url.
   */
  getSongViaUrl(searchString) {
    return new Promise((resolve, reject) => {
      ytdl.getBasicInfo(searchString, {}, (err, info) => {
        if (err) {
          return reject(new Error("Something went wrong fetching the song!"));
        }
        const song = new Song();
        song.title = info.title;
        song.url = info.video_url;
        song.artist = info.author.name;
        song.src = Song.srcType.YT;
        return resolve([song]);
      });
    });
  }

  /**
   * Get songs via playlist url.
   * @param {string} payload - Url to get song from.
   * @returns {Song[]} - Songs from playlist url.
   */
  getSongsViaPlaylistUrl(searchString) {
    const playId = searchString.toString().split("list=")[1];
    return new Promise((resolve, reject) => {
      ytpl(playId, (err, playlist) => {
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
          song.src = Song.srcType.YT;
          songs.push(song);
        });
        return resolve(songs);
      });
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
        "https://www.googleapis.com/youtube/v3/search?" +
        "part=snippet&" +
        "type=video&" +
        "videoCategoryId=10&" + // https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=DE&key=
        "fields=items(id%2FvideoId%2Csnippet(channelTitle%2Ctitle))&" +
        `maxResults=${count}&` +
        `q=${encodeURIComponent(searchString)}&` +
        `key=${this.apiKey}`,
        (error, response, body) => {
          if (error) {
            return reject(error);
          }
          if (typeof body === "undefined" || typeof JSON.parse(body).items === "undefined") {
            return reject(new Error("Something went wrong. Try again! [YT]"));
          }
          const result = JSON.parse(body).items;
          if (result.length < 1) {
            return reject(new Error(`No results for Query: "${searchString}"! [YT]`));
          }
          const songs = [];
          for (let index = 0; index < result.length; index++) {
            const song = new Song();
            song.title = result[index].snippet.title;
            song.url = `https://www.youtube.com/watch?v=${result[index].id.videoId}`;
            song.artist = result[index].snippet.channelTitle;
            song.src = Song.srcType.YT;
            songs.push(song);
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
    const stream = ytdl(url, {"filter": "audioonly"});
    if (!stream) {
      throw new Error(`con not get Stream [url: ${url} stream:${stream}]`);
    }
    return stream;
  }
}

module.exports = YoutubeService;
