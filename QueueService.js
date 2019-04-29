class QueueService {
  constructor(historyLength, dbService) {
    this.dbService = dbService;
    this.queue = [];
    this.history = [];
    this.historyLength = historyLength;
  }

  getNextSong() {
    const song = this.queue.shift();
    this.history.unshift(song);
    while (this.history.length > this.historyLength) {
      this.history.pop();
    }
    return song;
  }

  addSongToHistory(song) {
    this.history.unshift(song);
  }

  getHistorySong(i) {
    const index = (this.history.length - i) < i ? this.history.length - i : i;
    return this.history[index];
  }

  addToQueue(song) {
    this.queue.push(song);
  }

  addMultipleToQueue(songs) {
    this.queue.concat(songs);
  }

  clearQueue() {
    this.queue = [];
  }

  shuffleQueue() {
    this.queue = shuffle(this.queue);
  }

  loadPlaylist(plName) {
    this.queue = this.dbService.getPlaylist(plName);
  }
}

function shuffle(a) {
  let i, j, x;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

module.exports = QueueService;
