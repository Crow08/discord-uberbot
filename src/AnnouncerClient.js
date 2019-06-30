const ChatService = require("./ChatService");
const TTSService = require("./TTSService");
const RawFileService = require("./RawFileService");
const VoiceService = require("./VoiceService");

const HelpCommand = require("./cmd/Command_Help");
const JoinCommand = require("./cmd/Command_Join");
const LeaveCommand = require("./cmd/Command_Leave");
const SayCommand = require("./cmd/Command_Say");
const SfxCommand = require("./cmd/Command_Sfx");

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
    this.chatService = new ChatService(DiscordMessageEmbed);
    this.RawFileService = new RawFileService();
    this.ttsService = new TTSService(opt, client);
    this.voiceService = new VoiceService(opt, this.baseClient, {});
    this.commands = [];
    this.commands.splice(
      0, 0,
      new HelpCommand(this.chatService, this.commands, this.botPrefix),
      new LeaveCommand(this.voiceService),
      new JoinCommand(this.voiceService),
      new SayCommand(this.voiceService, this.ttsService),
      new SfxCommand(this.voiceService, this.RawFileService, this.chatService, this.ttsService)
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
}

module.exports = AnnouncerClient;
