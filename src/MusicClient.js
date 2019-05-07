const AddCommand = require("./cmd/Command_Add");
const AddPLCommand = require("./cmd/Command_PL_Add");
const AutoPLCommand = require("./cmd/Command_AutoPL");
const ChatService = require("./ChatService");
const ClearCommand = require("./cmd/Command_Clear");
const DBService = require("./DBService");
const DeletePLCommand = require("./cmd/Command_PL_Delete");
const HelpCommand = require("./cmd/Command_Help");
const LeaveCommand = require("./cmd/Command_Leave");
const ListPLCommand = require("./cmd/Command_PL_List");
const LoadPLCommand = require("./cmd/Command_PL_Load");
const ListSongsCommand = require("./cmd/Command_List_Songs");
const NowPlayingCommand = require("./cmd/Command_NowPlaying");
const PauseCommand = require("./cmd/Command_Pause");
const PlayerService = require("./PlayerService");
const PlayCommand = require("./cmd/Command_Play");
const QueueService = require("./QueueService");
const RemoveCommand = require("./cmd/Command_Remove");
const RemovePLCommand = require("./cmd/Command_PL_Remove");
const TestCommand = require("./cmd/Command_Test");
const SearchCommand = require("./cmd/Command_Search");
const SearchService = require("./SearchService");
const SearchPLCommand = require("./cmd/Command_PL_Search");
const SeekCommand = require("./cmd/Command_Seek");
const ShowQueueCommand = require("./cmd/Command_ShowQueue");
const SkipCommand = require("./cmd/Command_Skip");
const SoundCloudService = require("./SoundCloudService");
const SpotifyService = require("./SpotifyService");
const StopCommand = require("./cmd/Command_Stop");
const UploadCommand = require("./cmd/Command_Upload");
const VoiceService = require("./VoiceService");
const YouTubeService = require("./YouTubeService");


class MusicClient {
  constructor(client, discord, opt) {
    this.commands = [];
    this.baseClient = client;
    this.discord = discord;
    this.defVolume = (typeof opt !== "undefined" && typeof opt.defVolume !== "undefined") ? opt.defVolume : 50;
    this.bitRate = (typeof opt !== "undefined" && typeof opt.bitRate !== "undefined") ? opt.bitRate : "96000";
    console.log("Loading services...\n>");
    this.chatService = new ChatService({}, this.discord);
    this.youtubeService = new YouTubeService(opt.youtubeApiKey);
    this.soundCloudService = new SoundCloudService(opt.scClientId);
    this.spotifyService = new SpotifyService(opt.spotifyClientId, opt.spotifyClientSecret);
    this.searchService = new SearchService(
      this.chatService, this.youtubeService, this.soundCloudService,
      this.spotifyService
    );
    this.voiceService = new VoiceService(
      {"bitRate": this.bitRate, "defVolume": this.defVolume}, this.baseClient,
      this.youtubeService, this.soundCloudService, this.spotifyService
    );
    this.dbService = new DBService();
    this.queueService = new QueueService(500, this.dbService);
    this.playerService = new PlayerService(this.voiceService, this.queueService, this.chatService);
    this.loadCommands();
  }

  loadCommands() {
    console.log("Loading commands...\n>");
    this.commands = [
      new AddCommand(this.chatService, this.queueService, this.searchService),
      new AddPLCommand(this.chatService, this.dbService, this.searchService),
      new AutoPLCommand(this.chatService, this.queueService),
      new ClearCommand(this.chatService, this.queueService),
      new DeletePLCommand(this.chatService, this.dbService),
      new HelpCommand(this.chatService, this.commands),
      new LeaveCommand(this.playerService, this.voiceService),
      new ListPLCommand(this.chatService, this.dbService, this.discord),
      new ListSongsCommand(this.chatService, this.discord, this.dbService),
      new LoadPLCommand(this.chatService, this.queueService),
      new NowPlayingCommand(this.chatService, this.queueService, this.discord),
      new PauseCommand(this.playerService),
      new PlayCommand(this.chatService, this.playerService, this.searchService),
      new RemoveCommand(this.chatService, this.queueService),
      new RemovePLCommand(this.chatService, this.dbService),
      new SearchCommand(this.chatService, this.playerService, this.queueService, this.searchService),
      new SearchPLCommand(this.chatService, this.dbService, this.discord),
      new SeekCommand(this.chatService, this.playerService),
      new ShowQueueCommand(this.chatService, this.queueService, this.discord),
      new SkipCommand(this.playerService),
      new StopCommand(this.playerService),
      new TestCommand(this.chatService, this.queueService, this.discord, this.dbService),
      new UploadCommand(this.chatService, this.queueService, this.searchService, this.dBService)
    ];
  }

  execute(cmd, payload, msg) {
    console.log(`CMD: ${cmd}\n>`);
    this.commands.forEach((command) => {
      if (command.alias.includes(cmd)) {
        command.run(payload, msg);
      }
    });
  }
}

module.exports = MusicClient;
