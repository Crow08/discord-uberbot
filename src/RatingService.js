class RateingService {
  constructor(dbService) {
    this.dbService = dbService;
  }

  rateSong(song, user, delta) {
    return new Promise((resolve, reject) => {
      if (typeof song.ratingLog === "undefined") {
        song.ratingLog = {};
      }
      // If user has ever rated this song.
      if (Object.prototype.hasOwnProperty.call(song.ratingLog, user)) {
        const ratedDeltaTime = Date.now() - song.ratingLog[user];
        const oneDayTime = 1000 * 60 * 60 * 24;
        // If last rating is less than one day ago.
        if (ratedDeltaTime < oneDayTime) {
          const cdHours = Math.floor((oneDayTime - ratedDeltaTime) / (1000 * 60 * 60));
          const cdMin = Math.floor((oneDayTime - ratedDeltaTime) / (1000 * 60)) - (cdHours * 60);
          const note = `${user}: Rating for this song is on cooldown. (${cdHours}h ${cdMin}min)`;
          reject(new Error(note));
          return;
        }
      }
      song.ratingLog[user] = Date.now();
      song.rating += delta;
      this.dbService.updateSongRating(song).
        then((rateResult) => {
          resolve(rateResult);
        }).
        catch(reject);
    });
  }
}

module.exports = RateingService;
