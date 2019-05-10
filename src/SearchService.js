class SearchService {
  constructor(youtubeService, soundCloudService, spotifyService) {
    this.youtubeService = youtubeService;
    this.soundCloudService = soundCloudService;
    this.spotifyService = spotifyService;
  }

  search(payload, count = 1, preferedSrc = "YT") {
    return new Promise((resolve, reject) => {
      let note = "";
      let searchstring = payload.trim();
      if (searchstring.includes("soundcloud.com")) {
      // SoundCloud url detected:
        note += "Get song from SounCloud url~";
        this.soundCloudService.getSongViaUrl(searchstring).
          then((songs) => resolve({note, songs})).
          catch(reject);
      } else if (searchstring.includes("youtu.be/") || searchstring.includes("youtube.com/")) {
      // YouTube url detected:
        if (searchstring.includes("&")) {
          searchstring = searchstring.split("&")[0];
        }
        if (searchstring.includes("watch") || searchstring.includes("youtu.be/")) {
        // YouTube video url detected:
          note += "Get song from YouTube url~";
          this.youtubeService.getSongViaUrl(searchstring).
            then((songs) => resolve({note, songs})).
            catch(reject);
        } else if (searchstring.includes("playlist")) {
        // Youtube playlist url detected:
          note += "Get songs from YouTube playlist url~";
          this.youtubeService.getSongsViaPlaylistUrl(searchstring).
            then((songs) => resolve({note, songs})).
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
      let note = "";
      const searchstring = payload.trim();
      switch (preferedSrc) {
      case "YT":
        note += "Get songs from YouTube search query~";
        this.youtubeService.getSongsViaSearchQuery(searchstring, count).
          then((songs) => resolve({note, songs})).
          catch((err) => {
            note += `\n${err}\n`;
            // Fallback on soundcloud query search:
            note += "Get songs from SoundCloud search query~";
            this.soundCloudService.getSongsViaSearchQuery(searchstring, count).
              then((songs) => resolve({note, songs})).
              catch(reject);
          });
        break;
      case "SC":
        note += "Get songs from SoundCloud search query~";
        this.soundCloudService.getSongsViaSearchQuery(searchstring, count).
          then((songs) => resolve({note, songs})).
          catch((err) => {
            note += `\n${err}\n`;
            // Fallback on youtube query search:
            note += "Get songs from YouTube search query~";
            this.youtubeService.getSongsViaSearchQuery(searchstring, count).
              then((songs) => resolve({note, songs})).
              catch(reject);
          });
        break;
      case "SP":
        note += "Unable to get songs from Spotify~";
        reject(note);
        break;
      default:
        note += "Unkonown song Provider~";
        reject(note);
        break;
      }
    });
  }
}

module.exports = SearchService;
