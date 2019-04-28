const AddCommand = require("./cmd/Command_Add");
const ClearCommand = require("./cmd/Command_Clear");
const LeaveCommand = require("./cmd/Command_Leave");
const PLCommand = require("./cmd/Command_PL");
const AddPLCommand = require("./cmd/Command_PL_Add");
const ClearPLCommand = require("./cmd/Command_PL_Clear");
const RemovePLCommand = require("./cmd/Command_PL_Remove");
const PauseCommand = require("./cmd/Command_Pause");
const PlayCommand = require("./cmd/Command_Play");
const RemoveCommand = require("./cmd/Command_Remove");
const SearchCommand = require("./cmd/Command_Search");
const SkipCommand = require("./cmd/Command_Skip");
const StopCommand = require("./cmd/Command_Stop");
const ChatService = require("./ChatService");
const VoiceService = require("./VoiceService");
const PlayerService = require("./PlayerService");
const DBService = require("./DBService");
const QueueService = require("./QueueService");
const SearchService = require("./SearchService");
const YouTubeService = require("./YouTubeService");
const SoundCloudService = require("./SoundCloudService");
const SpotifyService = require("./SpotifyService");

class MusicClient {
  constructor(client, opt) {
    this.commands = [];
    this.baseClient = client;
    this.defVolume = (typeof opt !== "undefined" && typeof opt.defVolume !== "undefined") ? opt.defVolume : 50;
    this.bitRate = (typeof opt !== "undefined" && typeof opt.bitRate !== "undefined") ? opt.bitRate : "96000";
    console.log("Loading services...\n>");
    this.chatService = new ChatService({});
    this.youtubeService = new YouTubeService();
    this.soundCloudService = new SoundCloudService(opt.scClientId);
    this.spotifyService = new SpotifyService(opt.spotifyClientId, opt.spotifyClientSecret);
    this.searchService = new SearchService(this.chatService, this.youtubeService, this.soundCloudService, this.spotifyService);
    this.voiceService = new VoiceService(this.bitRate, this.defVolume, this.baseClient, this.youtubeService, this.soundCloudService, this.spotifyService);
    this.dbService = new DBService();
    this.queueService = new QueueService(this.dbService);
    this.playerService = new PlayerService(this.voiceService, this.queueService, this.chatService);
    this.loadCommands();
  }

  loadCommands() {
    console.log("Loading commands...\n>");
    const addCommand = new AddCommand(this.chatService, this.queueService, this.searchService);
    this.commands[addCommand.name] = addCommand;
    const clearCommand = new ClearCommand(this.chatService, this.queueService);
    this.commands[clearCommand.name] = clearCommand;
    const leaveCommand = new LeaveCommand(this.voiceService);
    this.commands[leaveCommand.name] = leaveCommand;
    const pLCommand = new PLCommand();
    this.commands[pLCommand.name] = pLCommand;
    const addPLCommand = new AddPLCommand();
    this.commands[addPLCommand.name] = addPLCommand;
    const clearPLCommand = new ClearPLCommand();
    this.commands[clearPLCommand.name] = clearPLCommand;
    const removePLCommand = new RemovePLCommand();
    this.commands[removePLCommand.name] = removePLCommand;
    const pauseCommand = new PauseCommand(this.playerService);
    this.commands[pauseCommand.name] = pauseCommand;
    const playCommand = new PlayCommand(this.chatService, this.playerService, this.searchService);
    this.commands[playCommand.name] = playCommand;
    const removeCommand = new RemoveCommand();
    this.commands[removeCommand.name] = removeCommand;
    const searchCommand = new SearchCommand();
    this.commands[searchCommand.name] = searchCommand;
    const stopCommand = new StopCommand(this.playerService);
    this.commands[stopCommand.name] = stopCommand;
    const skipCommand = new SkipCommand(this.playerService);
    this.commands[skipCommand.name] = skipCommand;
  }

  execute(cmd, payload, msg) {
    console.log(`CMD: ${cmd}\n>`);
    if (cmd in this.commands) {
      this.commands[cmd].run(payload, msg);
    }
  }
}

module.exports = MusicClient;
