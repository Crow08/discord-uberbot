const RawFileService = require("./RawFileService");
const SoundCloudService = require("./SoundCloudService");
const SpotifyService = require("./SpotifyService");
const TTSService = require("./TTSService");
const YouTubeService = require("./YouTubeService");

/**
 * Class representing a text to speech service.
 */
class StreamSourceService {

  /**
   * Constructor
   * @param {Object} opt - options and user settings for music sources.
   */
  constructor(opt) {
    this.youtubeService = new YouTubeService(opt.youtubeApiKey);
    this.soundCloudService = new SoundCloudService(opt.scClientId);
    this.spotifyService = new SpotifyService(opt.spotifyClientId, opt.spotifyClientSecret);
    this.rawFileService = new RawFileService();
    this.ttsService = new TTSService(opt.ttsApiKey);
  }
}

module.exports = StreamSourceService;
