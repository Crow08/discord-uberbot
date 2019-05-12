const AddCommand = require("./cmd/Command_Add");
const AddPLCommand = require("./cmd/Command_PL_Add");
const AutoPLCommand = require("./cmd/Command_AutoPL");
const AddSongToPLCommand = require("./cmd/Command_AddSongToPL");
const AddQueueToPLCommand = require("./cmd/Command_AddQueueToPL");
const ChatService = require("./ChatService");
const ClearCommand = require("./cmd/Command_Clear");
const DBService = require("./DBService");
const DeletePLCommand = require("./cmd/Command_PL_Delete");
const GetAutoPLCommand = require("./cmd/Command_GetAutoPL.js");
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
const ShuffleCommand = require("./cmd/Command_Shuffle");
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
    this.botPrefix = opt.botPrefix;
    console.log("Loading services...\n>");
    this.youtubeService = new YouTubeService(opt.youtubeApiKey);
    this.soundCloudService = new SoundCloudService(opt.scClientId);
    this.spotifyService = new SpotifyService(opt.spotifyClientId, opt.spotifyClientSecret);
    this.dbService = new DBService();
    this.queueService = new QueueService(500, this.dbService);
    this.chatService = new ChatService({}, this.discord, this.dbService, this.queueService);
    this.searchService = new SearchService(
      this.chatService, this.youtubeService, this.soundCloudService,
      this.spotifyService
    );
    this.voiceService = new VoiceService(
      {"bitRate": this.bitRate, "defVolume": this.defVolume}, this.baseClient,
      this.youtubeService, this.soundCloudService, this.spotifyService
    );
    this.playerService = new PlayerService(this.voiceService, this.queueService, this.chatService);
    console.log("services loaded!\n>");
    this.loadCommands();
    this.connectDB();
  }

  loadCommands() {
    console.log("Loading commands...\n>");
    this.commands.splice(
      0, 0,
      new AddCommand(this.chatService, this.queueService, this.searchService),
      new AddPLCommand(this.chatService, this.dbService, this.searchService),
      new AutoPLCommand(this.chatService, this.queueService),
      new AddSongToPLCommand(this.chatService, this.queueService, this.dbService),
      new AddQueueToPLCommand(this.chatService, this.queueService, this.dbService),
      new ClearCommand(this.chatService, this.queueService),
      new DeletePLCommand(this.chatService, this.dbService),
      new GetAutoPLCommand(this.chatService, this.queueService),
      new HelpCommand(this.chatService, this.commands, this.botPrefix),
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
      new ShuffleCommand(this.chatService, this.queueService),
      new SkipCommand(this.playerService),
      new StopCommand(this.playerService),
      new TestCommand(this.chatService, this.queueService, this.discord, this.dbService),
      new UploadCommand(this.chatService, this.queueService, this.searchService, this.dBService)
    );
    console.log("Commands loaded!\n>");
  }

  connectDB() {
    console.log("Connecting to DB...\n>");
    this.dbService.connectDB().
      then(() => console.log("DB Connected!\n>")).
      catch((err) => console.log(err));
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
