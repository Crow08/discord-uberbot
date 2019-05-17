/** Class representing a song object. */
class Song {
  constructor() {
    this.title = "";
    this.artist = "";
    this.src = "";
    this.requester = "";
    this.rating = 0;
    this.ratingLog = {};
    this.url = "";
    this.playlist = "";
  }

  static get srcType() {
    return {
      "SC": "sc",
      "SP": "sp",
      "YT": "yt"
    };
  }
}
module.exports = Song;
