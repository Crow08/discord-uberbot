const DBService = require("./DBService");
const QueueService = require("./QueueService");
const RatingService = require("./RatingService");
const SearchService = require("./SearchService");
const StreamSourceService = require("./StreamSourceService");
const VoiceService = require("./VoiceService");

const AddCommand = require("./cmd/Command_Add");
const AddPLCommand = require("./cmd/Command_PL_Add");
const AutoPLCommand = require("./cmd/Command_AutoPL");
const AddSongToPLCommand = require("./cmd/Command_AddSongToPL");
const AddQueueToPLCommand = require("./cmd/Command_AddQueueToPL");
const ChatService = require("./ChatService");
const ClearCommand = require("./cmd/Command_Clear");
const DeletePLCommand = require("./cmd/Command_PL_Delete");
const HelpCommand = require("./cmd/Command_Help");
const JoinCommand = require("./cmd/Command_Join");
const LeaveCommand = require("./cmd/Command_Leave");
const ListPLCommand = require("./cmd/Command_PL_List");
const LoadPLCommand = require("./cmd/Command_PL_Load");
const LoopCommand = require("./cmd/Command_Loop");
const MergePLCommand = require("./cmd/Command_PL_Merge");
const ListSongsCommand = require("./cmd/Command_List_Songs");
const NowPlayingCommand = require("./cmd/Command_NowPlaying");
const PauseCommand = require("./cmd/Command_Pause");
const PlayCommand = require("./cmd/Command_Play");
const PlayerService = require("./PlayerService");
const PlayNextCommand = require("./cmd/Command_PlayNext");
const PreferredSrcCommand = require("./cmd/Command_PreferredSrc");
const RemoveCommand = require("./cmd/Command_Remove");
const RemovePLCommand = require("./cmd/Command_PL_Remove");
const RenamePLCommand = require("./cmd/Command_PL_Rename");
const RenameSongCommand = require("./cmd/Command_Rename_Song");
const TestCommand = require("./cmd/Command_Test");
const SearchCommand = require("./cmd/Command_Search");
const SearchPLCommand = require("./cmd/Command_PL_Search");
const SeekCommand = require("./cmd/Command_Seek");
const ShowHistoryCommand = require("./cmd/Command_ShowHistory");
const ShowQueueCommand = require("./cmd/Command_ShowQueue");
const ShuffleCommand = require("./cmd/Command_Shuffle");
const SkipCommand = require("./cmd/Command_Skip");
const StartCommand = require("./cmd/Command_Start");
const StopCommand = require("./cmd/Command_Stop");
const UploadCommand = require("./cmd/Command_Upload");
const VolumeCommand = require("./cmd/Command_Volume");


/**
 * Class representing the music bot.
 */
class MusicClient {

  /**
   * Constructor.
   * @param {Client} client - Discord.js client object.
   * @param {MessageEmbed} DiscordMessageEmbed - Discord.js MessageEmbed class for creating rich embed messages.
   * @param {Object} opt - options and user settings for music client.
   */
  constructor(client, DiscordMessageEmbed, opt) {
    this.commands = [];
    this.baseClient = client;
    this.botPrefix = opt.botPrefix;
    console.log("\x1b[35m%s\x1b[0m", "> Loading services\n> ...");
    this.chatService = new ChatService(DiscordMessageEmbed);
    this.streamSourceService = new StreamSourceService(opt);
    this.searchService = new SearchService("SP", this.streamSourceService);
    this.voiceService = new VoiceService(opt, this.baseClient, this.streamSourceService);
    this.dbService = new DBService(opt.mongodbUrl, opt.mongodbUser, opt.mongodbPassword);
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
      new JoinCommand(this.voiceService),
      new HelpCommand(this.chatService, this.commands, this.botPrefix),
      new LeaveCommand(this.voiceService),
      new ListPLCommand(this.chatService, this.dbService),
      new ListSongsCommand(this.chatService, this.dbService),
      new LoadPLCommand(this.chatService, this.queueService),
      new LoopCommand(this.chatService, this.queueService),
      new MergePLCommand(this.chatService, this.dbService),
      new NowPlayingCommand(this.chatService, this.queueService, this.playerService),
      new PauseCommand(this.playerService),
      new PlayCommand(this.chatService, this.playerService, this.searchService),
      new PlayNextCommand(this.chatService, this.queueService),
      new PreferredSrcCommand(this.chatService, this.searchService),
      new RemoveCommand(this.chatService, this.queueService),
      new RemovePLCommand(this.chatService, this.dbService),
      new RenamePLCommand(this.chatService, this.dbService),
      new RenameSongCommand(this.chatService, this.dbService),
      new SearchCommand(this.chatService, this.playerService, this.queueService, this.searchService, this.dbService),
      new SearchPLCommand(this.chatService, this.dbService, this.ratingService),
      new SeekCommand(this.chatService, this.playerService),
      new ShowHistoryCommand(this.chatService, this.queueService, this.commands),
      new ShowQueueCommand(this.chatService, this.queueService),
      new ShuffleCommand(this.chatService, this.queueService),
      new SkipCommand(this.playerService),
      new StartCommand(this.playerService, this.searchService, this.chatService, this.queueService),
      new StopCommand(this.playerService),
      new TestCommand(this.chatService, this.voiceService, this.rawFileService, this.baseClient),
      new UploadCommand(this.chatService, this.queueService, this.searchService, this.dbService),
      new VolumeCommand(this.chatService, this.voiceService, this.playerService)
    );
    console.log("\x1b[35m%s\x1b[0m", "> Commands loaded!\n");
  }

  connectDB() {
    console.log("\x1b[35m%s\x1b[0m", "> Connecting to DB\n> ...");
    this.dbService.connectDB().
      then(() => console.log("\x1b[35m%s\x1b[0m", "> DB Connected!\n")).
      catch((err) => {
        throw err;
      });
  }

  execute(cmd, payload, msg) {
    let found = false;
    this.commands.forEach((command) => {
      if (!found && command.alias.includes(cmd)) {
        command.run(payload, msg);
        found = true;
      }
    });
    return found;
  }
}

module.exports = MusicClient;
