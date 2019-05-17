/** Class representing a search service. */
class SearchService {
  constructor(youtubeService, soundCloudService, spotifyService) {
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
    this.defaultSrc = "SP";
  }

  search(payload, count = 1, preferredSrc = this.defaultSrc) {
    return new Promise((resolve, reject) => {
      let searchString = payload.trim();
      if (searchString.includes("soundcloud.com")) {
        // SoundCloud url detected:
        this.soundCloudService.getSongViaUrl(searchString).
          then((songs) => resolve({"note": "Get song from SoundCloud url~", songs})).
          catch(reject);
      } else if (searchString.includes("spotify.com")) {
        // Spotify url detected:
        this.spotifyService.getSongViaUrl(searchString).
          // Spotify can only be used for searching => delegate to query search.
          then((preSongs) => this.querySearch(
            `${preSongs[0].title} ${preSongs[0].artist}`,
            count, preferredSrc === "SP" ? "YT" : preferredSrc
          ).
            then(({note, songs}) => resolve({"note": `Get song from Spotify url~\n${note}`, songs})).
            catch(reject)).
          catch(reject);
      } else if (searchString.includes("youtu.be/") || searchString.includes("youtube.com/")) {
        // YouTube url detected:
        if (searchString.includes("&")) {
          searchString = searchString.split("&")[0];
        }
        if (searchString.includes("watch") || searchString.includes("youtu.be/")) {
          // YouTube video url detected:
          this.youtubeService.getSongViaUrl(searchString).
            then((songs) => resolve({"note": "Get song from YouTube url~", songs})).
            catch(reject);
        } else if (searchString.includes("playlist")) {
          // Youtube playlist url detected:
          this.youtubeService.getSongsViaPlaylistUrl(searchString).
            then((songs) => resolve({"note": "Get songs from YouTube playlist url~", songs})).
            catch(reject);
        }
      } else {
        this.querySearch(payload, count, preferredSrc).
          then(resolve).
          catch(reject);
      }
    });
  }

  querySearch(payload, count = 1, preferredSrc = this.defaultSrc) {
    return new Promise((resolve, reject) => {
      const searchString = payload.trim();
      switch (preferredSrc) {
      case "YT":
        this.getSongsFromYTthenSC(searchString, count).
          then(resolve).
          catch(reject);
        break;
      case "SC":
        this.getSongsFromSCthenYT(searchString, count).
          then(resolve).
          catch(reject);
        break;
      case "SP":
        this.getSongsFromSPthenYTthenSC(searchString, count).
          then(resolve).
          catch(reject);
        break;
      default:
        reject(new Error("Unknown song Provider!"));
        break;
      }
    });
  }

  getSongsFromYTthenSC(searchString, count) {
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

  getSongsFromSCthenYT(searchString, count) {
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

  getSongsFromSPthenYTthenSC(searchString, count) {
    return new Promise((resolve, reject) => {
      const preNote = "Get song title and artist from Spotify~";
      this.spotifyService.getSongsViaSearchQuery(searchString).
        then((preSongs) => this.getSongsFromYTthenSC(`${preSongs[0].title} ${preSongs[0].artist}`, count).
          then(({note, songs}) => resolve({"note": `${preNote}\n${note}`, songs})).
          catch((err2) => reject(new Error(`${preNote}\n${err2}`)))).
        catch((err) => this.getSongsFromYTthenSC(searchString, count).
          then(({note, songs}) => resolve({"note": `${err}\n${note}`, songs})).
          catch((err2) => reject(new Error(`${err}\n${err2}`))));
    });
  }
}

module.exports = SearchService;
