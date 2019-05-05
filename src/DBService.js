/* eslint-disable sort-keys */
const {MongoClient} = require("mongodb");

class DBService {
  constructor() {
    this.url = "mongodb://localhost:27017";
    this.dbName = "uberbot";
  }

  getPlaylist(plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}, (err1, client) => {
        if (err1) {
          console.log(`Error: unable to connect to MongoDB!\n${err1}`);
          reject(err1);
          return;
        }
        const db = client.db(this.dbName);
        const songsCollection = db.collection(plName);
        songsCollection.find({}).toArray((err2, songs) => {
          if (err2) {
            console.log(`Error: unable to find songs!\n${err2}`);
            reject(err2);
          } else {
            resolve(songs);
          }
          client.close();
        });
      });
    });
  }

  addSong(song, plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}, (err1, client) => {
        if (err1) {
          console.log(`Error: unable to connect to MongoDB!\n${err1}`);
          reject(err1);
          return;
        }
        const db = client.db(this.dbName);
        const songsCollection = db.collection(plName);
        songsCollection.insertOne(song, (err2) => {
          if (err2) {
            console.log(`Error: unable to insert song!\n${err2}`);
            reject(err2);
          } else {
            resolve();
          }

          client.close();
        });
      });
    });
  }

  addSongs(songs, plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}, (err1, client) => {
        if (err1) {
          console.log(`Error: unable to connect to MongoDB!\n${err1}`);
          reject(err1);
          return;
        }
        const db = client.db(this.dbName);
        const songsCollection = db.collection(plName);
        songsCollection.insertMany(songs, (err2) => {
          if (err2) {
            console.log(`Error: unable to insert songs!\n${err2}`);
            reject(err2);
          } else {
            resolve();
          }
          client.close();
        });
      });
    });
  }

  removeSong(song, plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}, (err1, client) => {
        if (err1) {
          console.log(`Error: unable to connect to MongoDB!\n${err1}`);
          reject(err1);
          return;
        }
        const db = client.db(this.dbName);
        // eslint-disable-next-line quote-props
        const info = db.collection(plName).deleteOne({title: {$regex: song, $options: "$i"}});
        resolve(info);
        client.close();
      });
    });
  }

  deletePlaylist(plName) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}, (err1, client) => {
        if (err1) {
          console.log(`Error: unable to delete playlist!\n${err1}`);
          reject(err1);
          return;
        }
        const db = client.db(this.dbName);
        const songsCollection = db.collection(plName);
        songsCollection.drop((err2) => {
          if (err2) {
            console.log(`Error: unable to find songs!\n${err2}`);
            reject(err2);
          } else {
            resolve();
          }
          client.close();
        });
      });
    });
  }

  listPlaylists() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(this.url, {"useNewUrlParser": true}, (err1, client) => {
        if (err1) {
          console.log(`Error: unable to connect to MongoDB!\n${err1}`);
          reject(err1);
          return;
        }
        const db = client.db(this.dbName);
        console.log("list PL");
        db.listCollections().toArray((err, collInfos) => {
          if (err) {
            console.log(`Something went wrong: ${err}`);
            reject(err);
            return;
          }
          const plNames = [];
          collInfos.forEach((playlist) => {
            plNames.push(playlist.name);
            client.close();
          });
          resolve(plNames);
        });
      });
    });
  }
}

module.exports = DBService;
