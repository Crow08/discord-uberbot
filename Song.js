class Song {
  constructor() {
    this.title = "";
    this.artist = "";
    this.src = "";
    this.requester = "";
    this.rating = 0;
    this.url = "";
    this.srcType = {
      "YT": "yt",
      "SC": "sc",
      "SP": "sp"
    };
  }
}
module.exports = Song;
