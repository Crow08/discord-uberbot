/** Class representing a song object. */
class Song {

  /**
   * Constructor.
   */
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

  /**
   * Source type defining the origin of the song.
   * @static
   */
  static get srcType() {
    return {
      "SC": "sc",
      "SP": "sp",
      "YT": "yt"
    };
  }
}
module.exports = Song;
