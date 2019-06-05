const shuffle = (array) => {
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

/**
 * Class representing a queue service.
 * This Service is managing the queue of upcoming songs and the history of passed songs.
 * Also managing the auto playlist.
 */
class QueueService {

  /**
   * Constructor.
   * @param {Number} historyLength - Max number of songs saved in the history.
   * @param {DBService} dbService - DBService.
   */
  constructor(historyLength, dbService) {
    this.dbService = dbService;
    this.queue = [];
    this.history = [];
    this.historyLength = historyLength;
    this.autoPL = null;

    this.mode = QueueService.queueMode.NORMAL;
  }

  /**
   * Source type defining the origin of the song.
   * @static
   */
  static get queueMode() {
    return {
      "NORMAL": "n",
      "REPEAT_ALL": "ra",
      "REPEAT_ONE": "ro"
    };
  }

  /**
   * Get current Song with is position 0 of the history.
   * @returns {Song} - The current song.
   */
  getCurrentSong() {
    return new Promise((resolve, reject) => {
      resolve(this.history[0]).catch(reject);
    });
  }

  /**
   * Get next song which is position 0 of the queue.
   * @returns {Song} - The next song.
   */
  getNextSong() {
    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) {
        const song = this.queue[0];
        if (this.mode === QueueService.queueMode.NORMAL) {
          // NORMAL: remove song first song from queue.
          this.queue.shift();
        } else if (this.mode === QueueService.queueMode.REPEAT_ALL) {
          // REPEAT_ALL: remove song first song from queue and reinsert it at the end.
          this.queue.shift();
          this.addToQueue(song);
        }
        // REPEAT_ONE: Do nothing, leave current song at the top of the queue.

        this.addSongToHistory(song);
        resolve(song);
      } else {
        if (this.autoPL === null) {
          resolve(null);
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

  /**
   * Add a song to the top of the history.
   * Add a song at position 0 and trim the history if its longer than its max size.
   * @param {Song} song - The song to be added.
   */
  addSongToHistory(song) {
    this.history.unshift(song);
    while (this.history.length > this.historyLength) {
      this.history.pop();
    }
  }

  /**
   * Gets a specific song from the history with its position.
   * 0 ist the song least added to the history.
   * @param {number} position - Index of history to get song from.
   * @returns {Song} - The chosen history song.
   */
  getHistorySong(position) {
    const index = (this.history.length - position) < position ? this.history.length - position : position;
    return this.history[index];
  }

  /**
   * Add a song to the end of the queue.
   * @param {Song} song - The song to be added.
   */
  addToQueue(song) {
    this.queue.push(song);
  }

  /**
   * Add multiple songs to the end of the queue.
   * @param {Song[]} songs - Array of songs to be added.
   */
  addMultipleToQueue(songs) {
    this.queue = this.queue.concat(songs);
  }

  /**
   * Clear the current queue.
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Remove the given position from the queue.
   * @param {number} position - position to remove.
   */
  remove(position) {
    this.queue.splice(position, 1);
  }

  /**
   * Shuffles the current queue.
   */
  shuffleQueue() {
    this.queue = shuffle(this.queue);
  }

  /**
   * Adds the given playlist from the DB to the current queue.
   * @param {string} plName - playlist name to load.
   */
  loadPlaylist(plName) {
    return new Promise((resolve, reject) => {
      this.dbService.getPlaylist(plName).
        then((songs) => {
          this.addMultipleToQueue(shuffle(songs));
          resolve();
        }).
        catch((error) => reject(error));
    });
  }

  /**
   * Set the current auto playlist.
   * @param {string} plName - name of the auto playlist.
   */
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

  /**
   * Gets the current auto playlist name.
   * @returns {string} - current auto playlist name.
   */
  getAutoPL() {
    return new Promise((resolve, reject) => {
      if (this.autoPL === null) {
        reject(new Error("Auto playlist not set!"));
      } else {
        resolve(this.autoPL);
      }
    });
  }

  /**
   * Unset auto playlist.
   */
  unsetAutoPL() {
    this.autoPL = null;
  }

  /**
   * Move the given song by index to the top of the queue to play next.
   * @param {number} songNumber - index in the queue of song to move.
   */
  prioritizeSong(songNumber) {
    let message = "";
    if (this.queue.length === 0) {
      message = "Editing a non-existing queue, smart move!";
    } else if (songNumber >= this.queue.length || songNumber <= 0) {
      message = "Maybe try with a number that exists, will ya?";
    } else if (songNumber === 0) {
      message = `${this.queue[0].title} will already play next`;
    } else {
      this.queue.splice(0, 0, this.queue.splice(songNumber, 1)[0]);
      message = `Next up: ${this.queue[0].title} - ${this.queue[0].artist}`;
    }
    return (message);
  }
}

module.exports = QueueService;
