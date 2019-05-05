const AddCommand = require("./cmd/Command_Add");
const AddPLCommand = require("./cmd/Command_PL_Add");
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
    this.youtubeService = new YouTubeService();
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

  // TODO: find shorter way to init all Commands
  // eslint-disable-next-line max-statements
  loadCommands() {
    console.log("Loading commands...\n>");
    const addCommand = new AddCommand(this.chatService, this.queueService, this.searchService);
    this.commands[addCommand.name] = addCommand;

    const addPLCommand = new AddPLCommand(this.chatService, this.dbService, this.searchService);
    this.commands[addPLCommand.name] = addPLCommand;

    const clearCommand = new ClearCommand(this.chatService, this.queueService);
    this.commands[clearCommand.name] = clearCommand;

    const deletePLCommand = new DeletePLCommand(this.chatService, this.dbService);
    this.commands[deletePLCommand.name] = deletePLCommand;

    const helpCommand = new HelpCommand(this.chatService, this.commands);
    this.commands[helpCommand.name] = helpCommand;

    const leaveCommand = new LeaveCommand(this.voiceService);
    this.commands[leaveCommand.name] = leaveCommand;

    const listPLCommand = new ListPLCommand(this.chatService, this.dbService, this.discord);
    this.commands[listPLCommand.name] = listPLCommand;

    const listSongsCommand = new ListSongsCommand(this.chatService, this.discord, this.dbService);
    this.commands[listSongsCommand.name] = listSongsCommand;

    const loadPLCommand = new LoadPLCommand(this.chatService, this.queueService);
    this.commands[loadPLCommand.name] = loadPLCommand;

    const nowPlayingCommand = new NowPlayingCommand(this.chatService, this.queueService, this.discord);
    this.commands[nowPlayingCommand.name] = nowPlayingCommand;

    const pauseCommand = new PauseCommand(this.playerService);
    this.commands[pauseCommand.name] = pauseCommand;

    const playCommand = new PlayCommand(this.chatService, this.playerService, this.searchService);
    this.commands[playCommand.name] = playCommand;

    const removeCommand = new RemoveCommand(this.chatService, this.queueService);
    this.commands[removeCommand.name] = removeCommand;

    const removePLCommand = new RemovePLCommand(this.chatService, this.dbService);
    this.commands[removePLCommand.name] = removePLCommand;

    const searchCmd = new SearchCommand(this.chatService, this.playerService, this.queueService, this.searchService);
    this.commands[searchCmd.name] = searchCmd;

    const searchPLCommand = new SearchPLCommand(this.chatService, this.dbService, this.discord);
    this.commands[searchPLCommand.name] = searchPLCommand;

    const seekCommand = new SeekCommand(this.playerService, this.chatService);
    this.commands[seekCommand.name] = seekCommand;

    const showQueueCommand = new ShowQueueCommand(this.chatService, this.queueService, this.discord);
    this.commands[showQueueCommand.name] = showQueueCommand;

    const skipCommand = new SkipCommand(this.playerService);
    this.commands[skipCommand.name] = skipCommand;

    const stopCommand = new StopCommand(this.playerService);
    this.commands[stopCommand.name] = stopCommand;

    const testCommand = new TestCommand(this.chatService, this.queueService, this.discord, this.dbService);
    this.commands[testCommand.name] = testCommand;

    const uploadCommand = new UploadCommand(this.chatService, this.dBService, this.searchService, this.queueService);
    this.commands[uploadCommand.name] = uploadCommand;
  }

  execute(cmd, payload, msg) {
    console.log(`CMD: ${cmd}\n>`);
    for (const key in this.commands) {
      if (Object.prototype.hasOwnProperty.call(this.commands, key)) {
        this.commands[key].alias.forEach((element) => {
          if (cmd === element) {
            this.commands[key].run(payload, msg);
          }
        });
      }
    }
  }
}

module.exports = MusicClient;
