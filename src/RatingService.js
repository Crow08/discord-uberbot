/** Class representing a rating service. */
class RatingService {
  constructor(ratingCooldown, dbService, queueService) {
    this.ratingCooldown = ratingCooldown * 1000;
    this.dbService = dbService;
    this.queueService = queueService;
  }

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
      // If upvote and song has no playlist and rating is higher than -2.
      if (delta > 0 && song.playlist === "-" && (song.rating + delta) > -2) {
        this.addToAutoPL(song).
          then((note) => {
            this.saveRating(user, song, delta).
              then(() => resolve(note)).
              catch(reject);
          }).
          catch(reject);
      // If downvote and song has a playlist and rating is lower than -1.
      } else if (delta < 0 && song.playlist !== "-" && (song.rating + delta) < -1) {
        song.rating += delta;
        this.removeFromPL(song).
          then(resolve).
          catch(reject);
      // If song has no playlist.
      } else if (song.playlist === "-") {
        song.rating += delta;
        resolve();
      // If song has a playlist.
      } else {
        this.saveRating(user, song, delta).
          then(resolve).
          catch(reject);
      }
    });
  }

  getUserCdForSong(song, user) {
    if (Object.prototype.hasOwnProperty.call(song.ratingLog, user)) {
      const ratedDeltaTime = Date.now() - song.ratingLog[user];
      if (ratedDeltaTime < this.ratingCooldown) {
        return this.ratingCooldown - ratedDeltaTime;
      }
    }
    return 0;
  }

  addToAutoPL(song) {
    return new Promise((resolve, reject) => {
      this.queueService.getAutoPL().
        then((autoPL) => {
          this.dbService.addSong(song, autoPL).
            then(() => {
              song.playlist = autoPL;
              resolve(`${song.title} added to auto playlist ${autoPL}!`);
            }).
            catch(reject);
        }).
        catch(reject);
    });
  }

  removeFromPL(song) {
    return new Promise((resolve, reject) => {
      this.dbService.removeSong(song.title, song.playlist).
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

  saveRating(user, song, delta) {
    return new Promise((resolve, reject) => {
      song.ratingLog[user] = Date.now();
      song.rating += delta;
      this.dbService.updateSongRating(song).
        then(() => resolve()).
        catch(reject);
    });
  }
}
module.exports = RatingService;
