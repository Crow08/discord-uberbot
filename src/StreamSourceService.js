const RawFileService = require("./RawFileService");
const SoundCloudService = require("./SoundCloudService");
const SpotifyService = require("./SpotifyService");
const YouTubeService = require("./YouTubeService");

/**
 * Class representing a text to speech service.
 */
class StreamSourceService {

  init(opt) {
    this.youtubeService = new YouTubeService(opt.youtubeApiKey);
    this.soundCloudService = new SoundCloudService(opt.scClientId);
    this.spotifyService = new SpotifyService(opt.spotifyClientId, opt.spotifyClientSecret);
    this.rawFileService = new RawFileService();
  }
}

module.exports = new StreamSourceService();
