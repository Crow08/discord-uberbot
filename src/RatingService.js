/* eslint-disable max-lines-per-function */
class RateingService {
  constructor(dbService, queueService) {
    this.dbService = dbService;
    this.queueService = queueService;
  }

  rateSong(song, user, delta, ignoreCd = false) {
    console.log(">>>>>>>>>"+ignoreCd);
    return new Promise((resolve, reject) => {
      if (typeof song.ratingLog === "undefined") {
        song.ratingLog = {};
      }
      // If user has ever rated this song.
      if (Object.prototype.hasOwnProperty.call(song.ratingLog, user)) {
        const ratedDeltaTime = Date.now() - song.ratingLog[user];
        const oneDayTime = 1;//1000 * 60 * 60 * 24;
        // If last rating is less than one day ago.
        if (ratedDeltaTime < oneDayTime && !ignoreCd) {
          const cdHours = Math.floor((oneDayTime - ratedDeltaTime) / (1000 * 60 * 60));
          const cdMin = Math.floor((oneDayTime - ratedDeltaTime) / (1000 * 60)) - (cdHours * 60);
          const note = `${user}: Rating for this song is on cooldown. (${cdHours}h ${cdMin}min)`;
          reject(new Error(note));
          return;
        }
      }
      // If upvote and song has no playlist.
      if (delta > 0 && song.playlist === "-" && (song.rating + delta) > -2) {
        // Adds upvoted song to autoPlaylist
        this.queueService.getAutoPL().then((autoPL) => {
          this.dbService.addSong(song, autoPL).then(() => {
            song.ratingLog[user] = Date.now();
            song.rating += delta;
            this.dbService.updateSongRating(song).
              then(() => resolve(`${song.title} added to autoplaylist ${autoPL}!`)).
              catch(reject);
          });
        }).
          catch(reject);
      // If upvote and song has a playlist.
      } else if (delta > 0) {
        song.ratingLog[user] = Date.now();
        song.rating += delta;
        this.dbService.updateSongRating(song).
          then(() => resolve()).
          catch(reject);
      // If downvote and song has a playlist and rating is lower than -1.
      } else if (delta < 0 && (song.rating + delta) <= -2 && song.playlist !== "-") {
        this.dbService.removeSong(song.title, song.playlist).then((info) => {
          if (info.deletedCount === 0) {
            reject(new Error("Song already deleted!"));
          } else {
            song.rating += delta;
            resolve(`${song.title} removed from playlist ${song.playlist}!`);
            song.playlist = "-";
          }
        }).
          catch(reject);
      // If downvote and song has a playlist and rating is higher than -2.
      } else if (delta < 0 && song.playlist !== "-") {
        song.ratingLog[user] = Date.now();
        song.rating += delta;
        this.dbService.updateSongRating(song).
          then(() => resolve()).
          catch(reject);
      // If downvote and song has no playlist.
      } else {
        song.rating += delta;
        resolve();
      }
    });
  }
}
module.exports = RateingService;
