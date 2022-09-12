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
    chatService.init(opt);
    streamSourceService.init(opt);
    searchService.init("SP");
    voiceService.init(opt);
    dbService.init(opt.mongodbUrl, opt.mongodbUser, opt.mongodbPassword);
    queueService.init(500);
    ratingService.init(opt.ratingCooldown);
    playerService.init();
    ttsService.init(opt, clientService.baseClient);
  }
};
