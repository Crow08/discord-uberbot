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
const PlayCommand = require("./cmd/Command_Play");
const PlayerService = require("./PlayerService");
const PlayNextCommand = require("./cmd/Command_PlayNext");
const QueueService = require("./QueueService");
const RatingService = require("./RatingService");
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
const StartCommand = require("./cmd/Command_Start");
const StopCommand = require("./cmd/Command_Stop");
const UploadCommand = require("./cmd/Command_Upload");
const VoiceService = require("./VoiceService");
const YouTubeService = require("./YouTubeService");


class MusicClient {
  constructor(client, DiscordRichEmbed, opt) {
    this.commands = [];
    this.baseClient = client;
    this.botPrefix = opt.botPrefix;
    console.log("\x1b[35m%s\x1b[0m", "> Loading services\n> ...");
    this.chatService = new ChatService(DiscordRichEmbed);
    this.youtubeService = new YouTubeService(opt.youtubeApiKey);
    this.soundCloudService = new SoundCloudService(opt.scClientId);
    this.spotifyService = new SpotifyService(opt.spotifyClientId, opt.spotifyClientSecret);
    this.searchService = new SearchService(this.youtubeService, this.soundCloudService, this.spotifyService);
    this.voiceService = new VoiceService(
      {"bitRate": opt.bitRate, "defVolume": opt.defVolume}, this.baseClient, this.youtubeService,
      this.soundCloudService, this.spotifyService
    );
    this.dbService = new DBService();
    this.queueService = new QueueService(500, this.dbService);
    this.ratingService = new RatingService(opt.ratingCooldown, this.dbService, this.queueService);
    this.playerService = new PlayerService(this.voiceService, this.queueService, this.chatService, this.ratingService);
    console.log("\x1b[35m%s\x1b[0m", "> services loaded!\n");
    this.loadCommands();
    this.connectDB();
  }

  loadCommands() {
    console.log("\x1b[35m%s\x1b[0m", "> Loading commands\n> ...");
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
      new ListPLCommand(this.chatService, this.dbService),
      new ListSongsCommand(this.chatService, this.dbService),
      new LoadPLCommand(this.chatService, this.queueService),
      new NowPlayingCommand(this.chatService, this.queueService, this.ratingService),
      new PauseCommand(this.playerService),
      new PlayCommand(this.chatService, this.playerService, this.searchService),
      new PlayNextCommand(this.chatService, this.queueService),
      new RemoveCommand(this.chatService, this.queueService),
      new RemovePLCommand(this.chatService, this.dbService),
      new SearchCommand(this.chatService, this.playerService, this.queueService, this.searchService),
      new SearchPLCommand(this.chatService, this.dbService, this.ratingService),
      new SeekCommand(this.chatService, this.playerService),
      new ShowQueueCommand(this.chatService, this.queueService),
      new ShuffleCommand(this.chatService, this.queueService),
      new SkipCommand(this.playerService),
      new StartCommand(this.playerService, this.searchService, this.chatService, this.queueService),
      new StopCommand(this.playerService),
      new TestCommand(this.chatService, this.queueService, this.dbService),
      new UploadCommand(this.chatService, this.queueService, this.searchService, this.dbService)
    );
    console.log("\x1b[35m%s\x1b[0m", "> Commands loaded!\n");
  }

  connectDB() {
    console.log("\x1b[35m%s\x1b[0m", "> Connecting to DB\n> ...");
    this.dbService.connectDB().
      then(() => console.log("\x1b[35m%s\x1b[0m", "> DB Connected!\n")).
      catch((err) => console.log(err));
  }

  execute(cmd, payload, msg) {
    let found = false;
    this.commands.forEach((command) => {
      if (!found && command.alias.includes(cmd)) {
        console.log("\x1b[33m%s\x1b[0m", `> CMD: ${cmd}\n`);
        command.run(payload, msg);
        found = true;
      }
    });
    if (!found) {
      console.log("\x1b[33m%s\x1b[0m", `> unrecognized command name:  ${cmd}\n`);
    }
  }
}

module.exports = MusicClient;
