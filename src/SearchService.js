class SearchService {
  constructor(youtubeService, soundCloudService, spotifyService) {
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
  }

  search(payload, count = 1, preferedSrc = "YT") {
    return new Promise((resolve, reject) => {
      let searchstring = payload.trim();
      if (searchstring.includes("soundcloud.com")) {
        // SoundCloud url detected:
        this.soundCloudService.getSongViaUrl(searchstring).
          then((songs) => resolve({"note": "Get song from SounCloud url~", songs})).
          catch(reject);
      } else if (searchstring.includes("spotify.com")) {
        // Spotify url detected:
        this.spotifyService.getSongViaUrl(searchstring).
          // Spotify can only be used for searching => delegate to query search.
          then((preSongs) => this.querySearch(
            `${preSongs[0].title} ${preSongs[0].artist}`,
            count, preferedSrc === "SP" ? "YT" : preferedSrc
          ).
            then(({note, songs}) => resolve({"note": `Get song from Spotify url~\n${note}`, songs})).
            catch(reject)).
          catch(reject);
      } else if (searchstring.includes("youtu.be/") || searchstring.includes("youtube.com/")) {
        // YouTube url detected:
        if (searchstring.includes("&")) {
          searchstring = searchstring.split("&")[0];
        }
        if (searchstring.includes("watch") || searchstring.includes("youtu.be/")) {
          // YouTube video url detected:
          this.youtubeService.getSongViaUrl(searchstring).
            then((songs) => resolve({"note": "Get song from YouTube url~", songs})).
            catch(reject);
        } else if (searchstring.includes("playlist")) {
          // Youtube playlist url detected:
          this.youtubeService.getSongsViaPlaylistUrl(searchstring).
            then((songs) => resolve({"note": "Get songs from YouTube playlist url~", songs})).
            catch(reject);
        }
      } else {
        this.querySearch(payload, count, preferedSrc).
          then(resolve).
          catch(reject);
      }
    });
  }

  querySearch(payload, count = 1, preferedSrc = "YT") {
    return new Promise((resolve, reject) => {
      const searchstring = payload.trim();
      switch (preferedSrc) {
      case "YT":
        this.getSongsFromYTthenSC(searchstring, count).
          then(resolve).
          catch(reject);
        break;
      case "SC":
        this.getSongsFromSCthenYT(searchstring, count).
          then(resolve).
          catch(reject);
        break;
      case "SP":
        this.getSongsFromSPthenYTthenSC(searchstring, count).
          then(resolve).
          catch(reject);
        break;
      default:
        reject(new Error("Unkonown song Provider!"));
        break;
      }
    });
  }

  getSongsFromYTthenSC(searchstring, count) {
    return new Promise((resolve, reject) => {
      let note = "Get songs from YouTube search query~";
      this.youtubeService.getSongsViaSearchQuery(searchstring, count).
        then((songs) => resolve({note, songs})).
        catch((err) => {
          // Fallback on soundcloud query search:
          note = "Get songs from SoundCloud search query~";
          this.soundCloudService.getSongsViaSearchQuery(searchstring, count).
            then((songs) => resolve({"note": `${err}\n${note}`, songs})).
            catch((err2) => reject(new Error(`${err}\n${err2}`)));
        });
    });
  }

  getSongsFromSCthenYT(searchstring, count) {
    return new Promise((resolve, reject) => {
      let note = "Get songs from SoundCloud search query~";
      this.soundCloudService.getSongsViaSearchQuery(searchstring, count).
        then((songs) => resolve({note, songs})).
        catch((err) => {
          // Fallback on youtube query search:
          note = "Get songs from YouTube search query~";
          this.youtubeService.getSongsViaSearchQuery(searchstring, count).
            then((songs) => resolve({"note": `${err}\n${note}`, songs})).
            catch((err2) => reject(new Error(`${err}\n${err2}`)));
        });
    });
  }

  getSongsFromSPthenYTthenSC(searchstring, count) {
    return new Promise((resolve, reject) => {
      const preNote = "Get song title and artist from Spotify~";
      this.spotifyService.getSongsViaSearchQuery(searchstring).
        then((song) => this.getSongsFromYT_SP(`${song.title} ${song.artist}`, count).
          then(({note, songs}) => resolve({"note": `${preNote}\n${note}`, songs})).
          catch((err2) => reject(new Error(`${preNote}\n${err2}`)))).
        catch((err) => this.getSongsFromYT_SP(searchstring, count).
          then(({note, songs}) => resolve({"note": `${err}\n${note}`, songs})).
          catch((err2) => reject(new Error(`${err}\n${err2}`))));
    });
  }
}

module.exports = SearchService;
