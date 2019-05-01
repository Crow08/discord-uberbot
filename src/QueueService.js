const shuffle = function shuffle(array) {
  let pos1 = 0,
    pos2 = 0,
    tmpVal = 0;
  for (pos1 = array.length - 1; pos1 > 0; pos1--) {
    pos2 = Math.floor(Math.random() * (pos1 + 1));
    tmpVal = array[pos1];
    array[pos1] = array[pos2];
    array[pos2] = tmpVal;
  }
  return array;
};

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

  getHistorySong(position) {
    const index = (this.history.length - position) < position ? this.history.length - position : position;
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

module.exports = QueueService;
