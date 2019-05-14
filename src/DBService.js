const {MongoClient} = require("mongodb");

class DBService {
  constructor() {
    this.url = "mongodb://localhost:27017";
    this.dbName = "uberbot";
    this.client = null;
    this.db = null;
  }

  connectDB() {
    // If client conncetion exists.
    if (this.client !== null) {
      // Disconnect first before opening a new connection.
      return new Promise((resolve, reject) => {
        this.disconnectDB().
          then(() => {
            this.connectDB().
              then(resolve).
              catch(reject);
          }).
          catch((err) => {
            // Try to connect regardless.
            console.log(err);
            this.client = null;
            this.db = null;
            this.connectDB().
              then(resolve).
              catch(reject);
          });
      });
    }
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}).
        then((client) => {
          this.client = client;
          this.db = client.db(this.dbName);
          resolve();
        }).
        catch(reject);
    });
  }

  isConnected() {
    return this.client !== null && this.client.isConnected();
  }

  disconnectDB() {
    return new Promise((resolve, reject) => {
      this.client.close().
        then(() => {
          this.client = null;
          this.db = null;
          resolve();
        }).
        catch(reject);
    });
  }

  addSong(song, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        insertOne(song).
        then(() => {
          resolve();
          this.db.collection(plName).
            createIndex("title").
            catch((err) => console.log(err));
        }).
        catch(reject);
    });
  }

  addSongs(songs, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        insertMany(songs).
        then(() => {
          resolve();
          this.db.collection(plName).
            createIndex("title").
            catch((err) => console.log(err));
        }).
        catch(reject);
    });
  }

  removeSong(title, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        deleteOne({title},).
        then(resolve).
        catch(reject);
    });
  }

  findSong(song, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        findOne({"title": {"$options": "$i", "$regex": song}}).
        then(resolve).
        catch(reject);
    });
  }

  updateSongRating(song) {
    return new Promise((resolve, reject) => {
      this.db.collection(song.playlist).findOneAndUpdate(
        {"title": song.title},
        {"$set": {
          "rating": song.rating,
          "ratingLog": song.ratingLog
        }}
      ).
        then(resolve).
        catch(reject);
    });
  }

  getPlaylist(plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        find({}).
        toArray().
        then(resolve).
        catch(reject);
    });
  }

  getRandomSong(plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        aggregate([{"$sample": {"size": 1}}]).
        toArray().
        then((songs) => {
          if (songs[0]) {
            resolve(songs[0]);
          } else {
            reject(new Error("playlist seems to be empty!"));
          }
        }).
        catch(reject);
    });
  }

  deletePlaylist(plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        drop().
        then(resolve).
        catch(reject);
    });
  }

  listPlaylists() {
    return new Promise((resolve, reject) => {
      this.db.listCollections().
        toArray().
        then((collInfos) => resolve(collInfos.map((playlist) => playlist.name))).
        catch(reject);
    });
  }

  mergePlaylists(source, target) {
    return new Promise((resolve, reject) => {
      this.db.collection(source).find().
        forEach((song) => {
          this.db.collection(target).insert(song);
        }).
        then(resolve).
        catch(reject);
    });
  }
}

module.exports = DBService;
