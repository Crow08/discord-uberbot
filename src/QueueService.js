const dbService = require("./DBService");

/**
 * Class representing a queue service.
 * This Service is managing the queue of upcoming songs and the history of passed songs.
 * Also managing the auto playlist.
 */
class QueueService {

  init(historyLength) {
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
   * Get current Song which is position 0 of the history.
   * @returns {Song} - The current song.
   */
  getCurrentSong() {
    return new Promise((resolve, reject) => {
      if (this.history.length > 0) {
        resolve(this.history[0]);
      } else {
        reject(new Error("No current song available!"));
      }
    });
  }

  /**
   * Get next song which is position 0 of the queue.
   * @returns {Song} - The next song.
   */
  popNextSong() {
    return new Promise((resolve, reject) => {
      if (this.queue.length > 0) {
        const song = this.queue[0];
        if (this.mode === QueueService.queueMode.NORMAL) {
          // NORMAL: remove song first song from queue.
          this.queue.shift();
        } else if (this.mode === QueueService.queueMode.REPEAT_ALL) {
          // REPEAT_ALL: remove song first song from queue and reinsert it at the end.
          this.queue.shift();
          this.queue.push(song);
        }
        // REPEAT_ONE: Do nothing, leave current song at the top of the queue.
        resolve(song);
      } else {
        if (this.autoPL === null) {
          resolve(null);
          return;
        }
        dbService.getRandomSong(this.autoPL).
          then((song) => {
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
   * Add a song fairly to the queue.
   * Songs from requester with viewer songs gets added farther ahead in queue.
   * The resulting queue from only fairly added songs should contain songs form all requesters in Round Robin fashion.
   * @param {Song} song - The song to be added.
   * @param {ChatInputCommandInteraction} interaction
   */
  addFairlyToQueue(song, interaction) {
    song.requester = interaction.user.username;
    const songRequestBalanceHelper = {};
    songRequestBalanceHelper[song.requester] = 1;
    for (let index = 0; index < this.queue.length; index++) {
      const queuedSong = this.queue[index];
      if (Object.hasOwn(songRequestBalanceHelper, queuedSong.requester)) {
        songRequestBalanceHelper[queuedSong.requester] += 1;
      } else {
        songRequestBalanceHelper[queuedSong.requester] = 1;
      }
      if (songRequestBalanceHelper[queuedSong.requester] > songRequestBalanceHelper[song.requester]) {
        this.queue.splice(index, 0, song);
        return;
      }
    }
    this.queue.push(song);
  }

  /**
   * Add multiple songs fairly to the queue.
   * Songs from requester with viewer songs gets added farther ahead in queue.
   * The resulting queue from only fairly added songs should contain songs form all requesters in Round Robin fashion.
   * @param {Song[]} songs - Array of songs to be added.
   * @param {ChatInputCommandInteraction} interaction
   */
  addMultipleFairlyToQueue(songs, interaction) {
    songs.forEach((newSong) => {
      this.addFairlyToQueue(newSong, interaction);
    });
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
    this.queue = this.shuffle(this.queue);
  }

  /**
   * Adds the given playlist from the DB to the current queue.
   * @param {string} plName - playlist name to load.
   *    * @param {ChatInputCommandInteraction} interaction
   */
  loadPlaylist(plName, interaction) {
    return new Promise((resolve, reject) => {
      dbService.getPlaylist(plName).
        then((songs) => {
          this.addMultipleFairlyToQueue(this.shuffle(songs), interaction);
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
      dbService.listPlaylists().then((plNames) => {
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
   * Shuffles the given array and returns it.
   * @private
   * @param {Array} array - array to be shuffled
   * @returns {Array} - shuffled array.
   */
  shuffle(array) {
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
  }
}

module.exports = new QueueService();
