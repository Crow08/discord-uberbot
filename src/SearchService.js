/**
 * Class representing a search service.
 */
class SearchService {

  /**
   * Constructor.
   * @param {YoutubeService} youtubeService - YoutubeService.
   * @param {SoundCloudService} soundCloudService - SoundCloudService.
   * @param {SpotifyService} spotifyService - SpotifyService.
   */
  constructor(defaultSrc, youtubeService, soundCloudService, spotifyService, rawFileService) {
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
    this.rawFileService = rawFileService;
    this.defaultSrc = defaultSrc;
  }

  /**
   * Search for a song using urls or queries on the preferred source and fallbacks.
   * @param {string} payload - Payload containing song url or query.
   * @param {number} count - Count of desired results.
   * @param {"yt"|"sc"|"sp"} preferredSrc - Preferred source for searching song when using queries.
   * <br>&nbsp;&nbsp;"yt" : YouTube | "sc" : SoundCloud |"sp" : Spotify
   * @returns {Object} - returns an Object containing a note  and an Array of songs {"note": string, "songs": Song[]}
   */
  search(payload, count = 1, preferredSrc = this.defaultSrc) {
    return new Promise((resolve, reject) => {
      const searchString = payload.trim();
      if (searchString.includes("soundcloud.com")) {
        // SoundCloud url detected:
        this.handleSoundCloudUrl(searchString).
          then(resolve).
          catch(reject);
      } else if (searchString.includes("spotify.com")) {
        // Spotify url detected:
        this.handleSpotifyUrl(searchString, preferredSrc).
          then(resolve).
          catch(reject);
      } else if (searchString.includes("youtu.be/") || searchString.includes("youtube.com/")) {
        // YouTube url detected:
        this.handleYouTubeUrl(searchString).
          then(resolve).
          catch(reject);
      } else if (searchString.includes("http://") || searchString.includes("https://")) {
        // Unknown url detected:
        this.handleRawFileUrl(searchString).
          then(resolve).
          catch(reject);
      } else {
        // The query is not a URL:
        this.querySearch(payload, count, preferredSrc).
          then(resolve).
          catch(reject);
      }
    });
  }

  /**
   * Do a direct query search skipping checks for urls.
   * @param {string} payload - Payload containing song query.
   * @param {number} count - Count of desired results.
   * @param {"yt"|"sc"|"sp"} preferredSrc - Preferred source for searching song when using queries.
   * <br>&nbsp;&nbsp;"yt" : YouTube | "sc" : SoundCloud |"sp" : Spotify
   */
  querySearch(payload, count = 1, preferredSrc = this.defaultSrc) {
    return new Promise((resolve, reject) => {
      const searchString = payload.trim();
      switch (preferredSrc) {
      case "YT":
        this.getSongsFromYtThenSc(searchString, count).
          then(resolve).
          catch(reject);
        break;
      case "SC":
        this.getSongsFromScThenYt(searchString, count).
          then(resolve).
          catch(reject);
        break;
      case "SP":
        this.getSongsFromSpThenYtThenSc(searchString, count).
          then(resolve).
          catch(reject);
        break;
      default:
        reject(new Error("Unknown song Provider!"));
        break;
      }
    });
  }

  /**
   * Helper function to handle Spotify urls.
   * @private
   * @param {string} searchString - Payload containing a Spotify track or playlist url.
   * @param {"yt"|"sc"|"sp"} preferredSrc - Preferred source for searching song when using queries.
   * <br>&nbsp;&nbsp;"yt" : YouTube | "sc" : SoundCloud |"sp" : Spotify
   */
  handleSpotifyUrl(searchString, preferredSrc) {
    return new Promise((resolve, reject) => {
      if (searchString.includes("track/")) {
        // Spotify song url detected:
        this.spotifyService.getSongViaUrl(searchString).
        // Spotify can only be used for searching => delegate to query search.
          then((preSongs) => this.querySearch(
            `${preSongs[0].title} ${preSongs[0].artist}`,
            1, preferredSrc === "SP" ? "YT" : preferredSrc
          ).
            then(({note, songs}) => {
              songs.map((song) => {
                song.title = preSongs[0].title;
                song.artist = preSongs[0].artist;
                return song;
              });
              resolve({"note": `Get song from Spotify url~\n${note}`, songs});
            }).
            catch(reject)).
          catch(reject);
      } else if (searchString.includes("playlist/")) {
        // Spotify playlist url detected:
        this.spotifyService.getSongsViaPlaylistUrl(searchString).
        // Spotify can only be used for searching => delegate to query search.
          then((preSongs) => {
            this.searchSpSongsRecursively(preSongs, [], preferredSrc).
              then((songs) => {
                resolve({"note": `Get ${songs.length} songs from Spotify playlist url~`, songs});
              }).
              catch(reject);
          }).
          catch(reject);
      } else {
        reject(new Error("Spotify url is invalid, only track and playlist urls are supported!"));
      }
    });
  }

  /**
   * Helper function to handle Youtube urls.
   * @private
   * @param {string} searchString - Payload containing a Youtube track or playlist url.
   */
  handleYouTubeUrl(searchString) {
    let query = searchString;
    return new Promise((resolve, reject) => {
      if (query.includes("&")) {
        query = query.split("&")[0];
      }
      if (query.includes("watch") || query.includes("youtu.be/")) {
        // YouTube video url detected:
        this.youtubeService.getSongViaUrl(query).
          then((songs) => resolve({"note": "Get song from YouTube url~", songs})).
          catch(reject);
      } else if (query.includes("playlist")) {
        // Youtube playlist url detected:
        this.youtubeService.getSongsViaPlaylistUrl(query).
          then((songs) => resolve({"note": `Get ${songs.length} songs from YouTube playlist url~`, songs})).
          catch(reject);
      } else {
        reject(new Error("Youtube url is invalid, only track and playlist urls are supported!"));
      }
    });
  }

  /**
   * Helper function to handle SoundCloud urls.
   * @private
   * @param {string} searchString - Payload containing a SoundCloud track url.
   */
  handleSoundCloudUrl(searchString) {
    return new Promise((resolve, reject) => {
      if (searchString.includes("sets/")) {
        this.soundCloudService.getSongsViaPlaylistUrl(searchString).
          then((songs) => resolve({"note": `Get ${songs.length} songs from SoundCloud playlist url~`, songs})).
          catch(reject);
      } else {
        this.soundCloudService.getSongViaUrl(searchString).
          then((songs) => resolve({"note": "Get song from SoundCloud url~", songs})).
          catch(reject);
      }
    });
  }

  /**
   * Helper function to handle raw file urls.
   * @private
   * @param {string} searchString - Payload containing a link to a raw song file.
   */
  handleRawFileUrl(searchString) {
    return new Promise((resolve, reject) => {
      this.rawFileService.getSongViaUrl(searchString).
        then((songs) => resolve({"note": "Get song from File url~", songs})).
        catch(reject);
    });
  }

  /**
   * Do Search from Youtube then SoundCloud.
   * @private
   * @param {string} payload - Payload containing song query.
   * @param {number} count - Count of desired results.
   */
  getSongsFromYtThenSc(searchString, count) {
    return new Promise((resolve, reject) => {
      let note = "Get songs from YouTube search query~";
      this.youtubeService.getSongsViaSearchQuery(searchString, count).
        then((songs) => resolve({note, songs})).
        catch((err) => {
          // Fallback on soundcloud query search:
          note = "Get songs from SoundCloud search query~";
          this.soundCloudService.getSongsViaSearchQuery(searchString, count).
            then((songs) => resolve({"note": `${err}\n${note}`, songs})).
            catch((err2) => reject(new Error(`${err}\n${err2}`)));
        });
    });
  }

  /**
   * Do Search from SoundCloud then Youtube.
   * @private
   * @param {string} payload - Payload containing song query.
   * @param {number} count - Count of desired results.
   */
  getSongsFromScThenYt(searchString, count) {
    return new Promise((resolve, reject) => {
      let note = "Get songs from SoundCloud search query~";
      this.soundCloudService.getSongsViaSearchQuery(searchString, count).
        then((songs) => resolve({note, songs})).
        catch((err) => {
          // Fallback on youtube query search:
          note = "Get songs from YouTube search query~";
          this.youtubeService.getSongsViaSearchQuery(searchString, count).
            then((songs) => resolve({"note": `${err}\n${note}`, songs})).
            catch((err2) => reject(new Error(`${err}\n${err2}`)));
        });
    });
  }

  /**
   * Do Search from Spotify the Youtube then SoundCloud.
   * Spotify is only for searching and to get the exact song title and artist.
   * @private
   * @param {string} payload - Payload containing song query.
   * @param {number} count - Count of desired results.
   */
  getSongsFromSpThenYtThenSc(searchString, count) {
    return new Promise((resolve, reject) => {
      const preNote = "Get song title and artist from Spotify~";
      this.spotifyService.getSongsViaSearchQuery(searchString).
        then((preSongs) => this.getSongsFromYtThenSc(`${preSongs[0].title} ${preSongs[0].artist}`, count).
          then(({note, "songs": rawSongs}) => {
            const songs = rawSongs.map((song) => {
              song.title = preSongs[0].title;
              song.artist = preSongs[0].artist;
              return song;
            });
            resolve({"note": `${preNote}\n${note}`, songs});
          }).
          catch((err2) => reject(new Error(`${preNote}\n${err2}`)))).
        catch((err) => this.getSongsFromYtThenSc(searchString, count).
          then(({note, songs}) => resolve({"note": `${err}\n${note}`, songs})).
          catch((err2) => reject(new Error(`${err}\n${err2}`))));
    });
  }

  /**
   * Helper function to get an array of Spotify songs from another Source.
   * @private
   * @param {Song[]} inSongs Spotify songs without stream url
   * @param {Song[]} outSongs Streamable songs.
   * @param {"yt"|"sc"|"sp"} preferredSrc - Preferred source for searching song when using queries.
   * <br>&nbsp;&nbsp;"yt" : YouTube | "sc" : SoundCloud |"sp" : Spotify
   */
  searchSpSongsRecursively(inSongs, outSongs, preferredSrc) {
    return new Promise((resolve, reject) => {
      if (inSongs.length <= 0) {
        resolve(outSongs);
      }
      const curSong = inSongs.pop();
      this.querySearch(`${curSong.title} ${curSong.artist}`, 1, preferredSrc).
        then(({"songs": rawSongs}) => {
          const songs = rawSongs.map((song) => {
            song.title = curSong.title;
            song.artist = curSong.artist;
            return song;
          });
          this.searchSpSongsRecursively(inSongs, outSongs.concat(songs), preferredSrc).
            then(resolve).
            catch(reject);
        }).
        catch(() => {
          this.searchSpSongsRecursively(inSongs, outSongs, preferredSrc).
            then(resolve).
            catch(reject);
        });
    });
  }
}

module.exports = SearchService;
