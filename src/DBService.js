const {MongoClient} = require("mongodb");

/**
 * Class representing a database service.
 * The playlists ares saved as MongoDB collections with the same name as the playlist.
 * In the collection the songs are stored as @see {Song} Objects.
 */
class DBService {

  /**
   * Constructor.
   * @param {string} mongoUrl - Optional string representing the external mongodb url.
   * @param {string} username - Optional string representing the external mongodb username.
   * @param {string} password - Optional string representing the external mongodb password.
   */
  constructor(mongoUrl, username, password) {
    this.url = mongoUrl ? `mongodb+srv://${username}:${password}@${mongoUrl}` : "mongodb://localhost:27017";
    this.dbName = "uberbot";
    this.client = null;
    this.db = null;
  }

  /**
   * Escape all regex characters from string.
   * @private
   * @param {string} text - text with with some regex characters.
   */
  escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/gu, "\\$&");
  }

  /**
   * Connection to MongoDB.
   * If a connection is already established disconnect first.
   */
  connectDB() {
    // If client connection exists.
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

  /**
   * Check if connection to mongoDB is established.
   */
  isConnected() {
    return this.client !== null && this.client.isConnected();
  }

  /**
   * Disconnect from MongoDB.
   */
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

  /**
   * Add a song to a playlist and save it to MongoDB.
   * If the playlist doesn't exist it will be created.
   * @param {Song} song - song to be added.
   * @param {string} plName - playlist name to add to.
   */
  addSong(song, plName) {
    return new Promise((resolve, reject) => {
      song.playlist = plName;
      this.db.collection(plName).
        insertOne(song).
        then(() => {
          resolve();
          this.db.collection(plName).
            createIndex({"artist": 1, "title": 1}, {"unique": true}).
            catch(reject);
        }).
        catch(reject);
    });
  }

  /**
   * Add multiple songs to a playlist and save it to MongoDB.
   * If the playlist doesn't exist it will be created.
   * The playlist is represented as a collection with the same name as the playlist.
   * @param {Song[]} songs - song to be added.
   * @param {string} plName - playlist name to add to.
   */
  addSongs(songs, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        insertMany(songs.map((song) => {
          song.playlist = plName;
          return song;
        })).
        then(() => {
          resolve();
          this.db.collection(plName).
            createIndex({"artist": 1, "title": 1}, {"unique": true}).
            catch(reject);
        }).
        catch(reject);
    });
  }

  /**
   * Remove song from playlist.
   * If it was the last song of the playlist the playlist and MongoDB collection will be removed.
   * @param {Song} song - song to be removed.
   * @param {string} plName - playlist name to remove from.
   */
  removeSong(song, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        deleteOne({"artist": song.artist, "title": song.title}).
        then(resolve).
        catch(reject);
    });
  }

  /**
   * Rename a playlist with the given names.
   * The playlist and corresponding MongoDB collection will be removed.
   * @param {string} plName - playlist name to be renamed.
   * @param {string} newName - new name for the renamed playlist.
   */
  renamePL(plName, newName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).rename(newName).
        then(resolve).
        catch(reject);
    });
  }

  /**
   * Rename the artist or title of a song in a playlist.
   * @param {string} plName - playlist name to change the name in.
   * @param {Song} song - Song to be renamed.
   * @param {"a"|"t"} flag - "a" to rename the artist and "t" to rename the title (defaults to renaming title)
   * @param {string} newName - new name for artist or title.
   */
  renameSong(plName, song, flag, newName) {
    return new Promise((resolve, reject) => {

      this.db.collection(plName).findOneAndUpdate(
        {"artist": song.artist, "title": song.title},
        {"$set": flag === "a" ? {"artist": newName} : {"title": newName}}
      ).
        then(resolve).
        catch(reject);
    });
  }

  /**
   * Find a song by title in a playlist with fuzzy search.
   * @param {string} title - query to search titles with.
   * @param {string} plName - playlist to search in.
   */
  findSong(title, plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        findOne({"title": {"$options": "$i", "$regex": this.escapeRegExp(title)}}).
        then(resolve).
        catch(reject);
    });
  }

  /**
   * Update a songs rating.
   * @param {Song} song - Song Object with updated Rating information.
   */
  updateSongRating(song) {
    return new Promise((resolve, reject) => {
      this.db.collection(song.playlist).findOneAndUpdate(
        {"artist": song.artist, "title": song.title},
        {"$set": {
          "rating": song.rating,
          "ratingLog": song.ratingLog
        }}
      ).
        then(resolve).
        catch(reject);
    });
  }

  /**
   * Get all songs of a playlist as array.
   * @param {string} plName - Playlist name to get songs from.
   * @returns {Songs[]} - Array of all songs
   */
  getPlaylist(plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        find({}).
        toArray().
        then((result) => {
          if (result.length === 0) {
            reject(new Error("Playlist doesn't exist or is empty."));
            return;
          }
          resolve(result);
        }).
        catch(reject);
    });
  }

  /**
   * Get a random Song from a Playlist.
   * @param {string} plName - playlist name to get the song from.
   * @returns {Song} - A random Song from the collection.
   */
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

  /**
   * Delete an entire playlist and the corresponding MongoBD collection.
   * @param {string} plName - playlist name to be removed.
   */
  deletePlaylist(plName) {
    return new Promise((resolve, reject) => {
      this.db.collection(plName).
        drop().
        then(resolve).
        catch(reject);
    });
  }

  /**
   * Gets all playlist names as string.
   * @returns {string[]} - Array containing all playlist names.
   */
  listPlaylists() {
    return new Promise((resolve, reject) => {
      this.db.listCollections().
        toArray().
        then((collInfos) => resolve(collInfos.map((playlist) => playlist.name))).
        catch(reject);
    });
  }

  /**
   * Merge two playlists by copying one into the other.
   * @param {string} source - name of the playlist to be copied from.
   * @param {string} target - name of the playlist to be merged into.
   */
  mergePlaylists(source, target) {
    return new Promise((resolve, reject) => {
      this.db.collection(source).find().
        forEach((song) => {
          this.db.collection(target).insertOne(song);
        }).
        then(resolve).
        catch(reject);
    });
  }
}

module.exports = DBService;
