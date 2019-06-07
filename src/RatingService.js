const Song = require("./Song");

/**
 * Class representing a rating service.
 */
class RatingService {

  /**
   * Constructor.
   * @param {Number} ratingCooldown - time in seconds for the cooldown for rating the same song again.
   * @param {DBService} dbService  - DBService.
   * @param {QueueService} queueService - QueueService.
   */
  constructor(ratingCooldown, dbService, queueService) {
    this.ratingCooldown = ratingCooldown * 1000;
    this.dbService = dbService;
    this.queueService = queueService;
  }

  /**
   * Rate a song up or down and handle cooldown and other implications like adding or removing the song.
   * Special cases:
   * Upvoted and rating is higher than 0. => add to auto playlist.
   * Downvoted and song has a playlist and rating is lower than -1. => remove from playlist.
   * @param {Song} song - Song to be rated.
   * @param {string} user - User rating the song.
   * @param {number} delta - delta rating.
   * @param {boolean} ignoreCd - Ignore user specific cooldown for rating on song.
   */
  rateSong(song, user, delta, ignoreCd = false) {
    return new Promise((resolve, reject) => {
      if (typeof song.ratingLog === "undefined") {
        song.ratingLog = {};
      }
      const cd = this.getUserCdForSong(song, user);
      if (!ignoreCd && cd !== 0) {
        const cdHours = Math.floor(cd / (1000 * 60 * 60));
        const cdMin = Math.floor(cd / (1000 * 60)) - (cdHours * 60);
        reject(new Error(`${user}: Rating for this song is on cooldown. (${cdHours}h ${cdMin}min)`));
        return;
      }
      song.rating += delta;
      let note = "";
      // If upvote and rating is higher than 0 add song To auto playlist.
      this.checkAndAddToAutoPL(song, delta).
        then((autoPlNote) => {
          note = autoPlNote;
        }).
        catch((err) => console.log(err)).
        finally(() => {
          // If downvote and song has a playlist and rating is lower than -1.
          if (delta < 0 && song.playlist !== "-" && song.rating < -1) {
            this.removeFromPL(song).
              then(resolve).
              catch(reject);
          // If song has no playlist.
          } else if (song.playlist === "-") {
            resolve("Rating is volatile, song has no playlist or auto playlist to save the rating!");
          // If song has a playlist.
          } else {
            this.saveRating(user, song).
              then((plNote) => resolve(`${note}\n${plNote}`)).
              catch(reject);
          }
        });
    });
  }

  /**
   * Get current rating cooldown by song and user.
   * @private
   * @param {Song} song - Song to be rated.
   * @param {string} user - User name rating the song.
   */
  getUserCdForSong(song, user) {
    if (Object.prototype.hasOwnProperty.call(song.ratingLog, user)) {
      const ratedDeltaTime = Date.now() - song.ratingLog[user];
      if (ratedDeltaTime < this.ratingCooldown) {
        return this.ratingCooldown - ratedDeltaTime;
      }
    }
    return 0;
  }

  /**
   * Add song to auto playlist.
   * @private
   * @param {Song} song - Song to be Added.
   */
  checkAndAddToAutoPL(song, delta) {
    return new Promise((resolve, reject) => {
      if (delta > 0 && song.rating > 0) {
        this.queueService.getAutoPL().
          then((autoPL) => {
            const songCopy = new Song();
            songCopy.title = song.title;
            songCopy.artist = song.artist;
            songCopy.src = song.src;
            songCopy.requester = song.requester;
            songCopy.url = song.url;
            songCopy.playlist = autoPL;
            this.dbService.addSong(songCopy, autoPL).
              then(() => {
                song.playlist = song.playlist === "-" ? autoPL : song.playlist;
                resolve(`${song.title} added to auto playlist ${autoPL}!`);
              }).
              catch(reject);
          }).
          catch(reject);
      } else {
        resolve();
      }
    });
  }

  /**
   * Remove Song from its playlist.
   * @private
   * @param {Song} song - Song to be removed.
   */
  removeFromPL(song) {
    return new Promise((resolve, reject) => {
      this.dbService.removeSong(song, song.playlist).
        then((info) => {
          if (info.deletedCount === 0) {
            reject(new Error("Song already deleted!"));
          } else {
            resolve(`${song.title} removed from playlist ${song.playlist}!`);
            song.playlist = "-";
          }
        }).
        catch(reject);
    });
  }

  /**
   * Persist rating change in DB.
   * @private
   * @param {string} user - User causing the rating change.
   * @param {Song} song - Rated song.
   */
  saveRating(user, song) {
    return new Promise((resolve, reject) => {
      song.ratingLog[user] = Date.now();
      this.dbService.updateSongRating(song).
        then(() => resolve("Rating successfully saved!")).
        catch(reject);
    });
  }
}
module.exports = RatingService;
