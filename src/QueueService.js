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
    this.autoPL = null;
  }

  getNextSong() {
    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) {
        const song = this.queue.shift();
        this.addSongToHistory(song);
        resolve(song);
      } else {
        if (this.autoPL === null) {
          reject(new Error("Queue is empty!"));
          return;
        }
        this.dbService.getRandomSong(this.autoPL).
          then((song) => {
            this.addSongToHistory(song);
            resolve(song);
          }).
          catch((err) => reject(err));
      }
    });
  }

  addSongToHistory(song) {
    this.history.unshift(song);
    while (this.history.length > this.historyLength) {
      this.history.pop();
    }
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

  remove(position) {
    this.queue.splice(position, 1);
  }

  shuffleQueue() {
    this.queue = shuffle(this.queue);
  }

  loadPlaylist(plName) {
    return new Promise((resolve, reject) => {
      this.dbService.getPlaylist(plName).
        then((songs) => {
          this.queue = songs;
          resolve();
        }).
        catch((error) => reject(error));
    });
  }

  setAutoPL(plName) {
    return new Promise((resolve, reject) => {
      this.dbService.listPlaylists().then((plNames) => {
        if (plNames.includes(plName)) {
          this.autoPL = plName;
          resolve();
        } else {
          reject(new Error("Playlist name not found!"));
        }
      }).
        catch((err) => reject(err));
    });
  }

  unsetAutoPL() {
    this.autoPL = null;
  }
}

module.exports = QueueService;
