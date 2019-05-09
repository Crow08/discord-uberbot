class RateingService {
  constructor(dbService) {
    this.dbService = dbService;
  }

  rateSong(song, delta, user) {
    return new Promise((resolve, reject) => {
      // If user has ever rated this song.
      if (Object.prototype.hasOwnProperty.call(song.ratingLog, user)) {
        // If last rating is less than one day ago.
        const ratedDeltaTime = Date.now() - song.ratingLog[user];
        const oneDayTime = 1000 * 60 * 60 * 24;
        if (ratedDeltaTime > oneDayTime) {
          const note = `Rating for this song is on cooldown. (${(oneDayTime - ratedDeltaTime) / (1000 * 60)} min)`;
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
