const ChatService = require("./ChatService");
const TTSService = require("./TTSService");
const RawFileService = require("./RawFileService");
const VoiceService = require("./VoiceService");

const HelpCommand = require("./cmd/Command_Help");
const JoinCommand = require("./cmd/Command_Join");
const LeaveCommand = require("./cmd/Command_Leave");
const PickupLineCommand = require("./cmd/Command_PickupLine");
const RandomFactCommand = require("./cmd/Command_RandomFact");
const RemindMeCommand = require("./cmd/Command_RemindMe");
const DramaticRebootCommand = require("./cmd/Command_DramaticReboot");
const SayCommand = require("./cmd/Command_Say");
const SfxCommand = require("./cmd/Command_Sfx");
const WalrusCommand = require("./cmd/Command_Walrus");
const YoMamaCommand = require("./cmd/Command_YoMama");

/**
 * Class representing the announcer bot.
 */
class AnnouncerClient {

  /**
   * Constructor.
   * @param {Client} client - Discord.js client object.
   * @param {MessageEmbed} DiscordMessageEmbed - Discord.js MessageEmbed class for creating rich embed messages.
   * @param {Object} opt - options and user settings for music client.
   */
  constructor(client, DiscordMessageEmbed, opt) {
    this.baseClient = client;
    this.botPrefix = opt.botPrefix;
    this.defaultTextChannel = opt.defaultTextChannel;
    this.defaultVoiceChannel = opt.defaultVoiceChannel;
    this.AddTime = opt.AddTime;
    this.chatService = new ChatService(DiscordMessageEmbed);
    this.RawFileService = new RawFileService();
    this.ttsService = new TTSService(opt, client);
    this.voiceService = new VoiceService(opt, this.baseClient, {});
    this.commands = [];
    this.commands.splice(
      0, 0,
      new HelpCommand(this.chatService, this.commands, this.botPrefix),
      new JoinCommand(this.voiceService),
      new LeaveCommand(this.voiceService),
      new PickupLineCommand(this.voiceService, this.ttsService),
      new RandomFactCommand(this.voiceService, this.ttsService),
      new RemindMeCommand(this.voiceService, this.ttsService),
      new DramaticRebootCommand(this.voiceService, this.RawFileService, this.chatService),
      new SayCommand(this.voiceService, this.ttsService),
      new SfxCommand(this.voiceService, this.RawFileService, this.chatService, this.ttsService),
      new WalrusCommand(this.voiceService, this.RawFileService),
      new YoMamaCommand(this.voiceService, this.ttsService)
    );
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

  ready() {
    if (this.defaultTextChannel) {
      this.baseClient.guilds.cache.forEach((guild) => {
        guild.channels.cache.get(this.defaultTextChannel).send("Cake will be available at the conclusion of the test.");
      });
    }
  }
}

module.exports = AnnouncerClient;
