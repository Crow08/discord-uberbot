const MongoClient = require("mongodb").MongoClient;

class DBService {
  constructor() {
    this.url = "mongodb://localhost:27017";
    this.dbName = "uberbot";
  }

  getPlaylist(plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, (err, client) => {
        if (err) {
          reject(err);
        }
        const db = client.db(this.dbName);
        const songsCollection = db.collection(plName);
        songsCollection.find({}).toArray((e, songs) => {
          if (e) {
            reject(e);
          }
          resolve(songs);
        });
        client.close();
      });
    });
  }

  addSong(song, plName) {
    MongoClient.connect(this.url, (err, client) => {
      if (err) {
        console.log(err);
        return;
      }
      const db = client.db(this.dbName);
      const songsCollection = db.collection(plName);
      songsCollection.insertOne(song);
      client.close();
    });
  }

  addSongs(songs, plName) {
    MongoClient.connect(this.url, (err, client) => {
      if (err) {
        console.log(err);
        return;
      }
      const db = client.db(this.dbName);
      const songsCollection = db.collection(plName);
      songsCollection.insertMany(songs);
      client.close();
    });
  }
}

module.exports = DBService;
