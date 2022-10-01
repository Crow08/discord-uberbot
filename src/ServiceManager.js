const clientService = require("./ClientService");
const voiceService = require("./VoiceService");
const chatService = require("./ChatService");
const streamSourceService = require("./StreamSourceService");
const searchService = require("./SearchService");
const dbService = require("./DBService");
const queueService = require("./QueueService");
const ratingService = require("./RatingService");
const playerService = require("./PlayerService");
const ttsService = require("./TTSService");

module.exports = {
  "setup": async(opt) => {
    await clientService.init(opt);
    streamSourceService.init(opt);
    chatService.init(opt);
    voiceService.init(opt);
    if (!opt.disableBot) {
      dbService.init(opt.mongodbUrl, opt.mongodbUser, opt.mongodbPassword);
      queueService.init(500);
      searchService.init("sp");
      ratingService.init(opt.ratingCooldown);
      playerService.init();
    }
    if (!opt.disableAnnouncer) {
      ttsService.init(opt, clientService.baseClient);
    }
  }
};
