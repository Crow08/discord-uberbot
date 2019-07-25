const ytdlDiscord = require("ytdl-core-discord");
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
      ytdlDiscord.getBasicInfo(searchString, {}, (err, info) => {
        if (err) {
          return reject(err);
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
      ytpl(playId, {"limit": 1000}, (err, playlist) => {
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
      const maxResults = count === 1 ? 5 : count; // Auto choose from 5 to improve results.
      request(
        "https://www.googleapis.com/youtube/v3/search?" +
        "part=snippet&" +
        "type=video&" +
        "videoCategoryId=10&" + // https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=DE&key=
        "fields=items(id%2FvideoId%2Csnippet(channelTitle%2Ctitle))&" + // Cspell:disable-line
        `maxResults=${maxResults}&` +
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
          let songs = [];
          for (let index = 0; index < result.length; index++) {
            const song = new Song();
            song.title = this.htmlUnescape(result[index].snippet.title);
            song.url = `https://www.youtube.com/watch?v=${result[index].id.videoId}`;
            song.artist = this.htmlUnescape(result[index].snippet.channelTitle);
            song.src = Song.srcType.YT;
            songs.push(song);
          }

          if (songs.length > 0 && count === 1) {
            songs = [this.autoChoose(songs, searchString)];
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
    return ytdlDiscord(url);
  }

  /**
   * Automatically pick a song from a list of songs based on some disfavored strings.
   * Disfavored:["cover", "live", "remix", "mix", "parody", "hour", "extended"]
   * @private
   * @param {Song[]} songs results to auto choose from.
   * @param {string} query user search query string.
   */
  autoChoose(songs, query) {
    let exclude = ["cover", "live", "remix", "mix", "parody", "hour", "extended"];
    exclude = exclude.filter((term) => !query.includes(term));
    let hit = songs[0];
    songs.reverse().forEach((song) => {
      if (!new RegExp(exclude.join("|"), "u").test(song.title)) {
        hit = song;
      }
    });
    return hit;
  }

  /**
   * Unescape html escaped characters.
   * @private
   * @param {string} str string possibly containing html escaped characters.
   */
  htmlUnescape(str) {
    const map = {
      "&#39;": "'",
      "&amp;": "&",
      "&gt;": ">",
      "&lt;": "<",
      "&nbsp;": " ",
      "&quot;": "\""
    };
    return str.replace(/&#39;|&amp;|&gt;|&lt;|&nbsp;|&quot;/gu, (subStr) => map[subStr]);
  }
}

module.exports = YoutubeService;
