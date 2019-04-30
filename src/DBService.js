const {MongoClient} = require("mongodb");

class DBService {
  constructor() {
    this.url = "mongodb://localhost:27017";
    this.dbName = "uberbot";
  }

  getPlaylist(plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, (err1, client) => {
        if (err1) {
          reject(err1);
        }
        const db = client.db(this.dbName),
          songsCollection = db.collection(plName);
        songsCollection.find({}).toArray((err2, songs) => {
          if (err2) {
            reject(err2);
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
      const db = client.db(this.dbName),
        songsCollection = db.collection(plName);
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
      const db = client.db(this.dbName),
        songsCollection = db.collection(plName);
      songsCollection.insertMany(songs);
      client.close();
    });
  }
}

module.exports = DBService;
