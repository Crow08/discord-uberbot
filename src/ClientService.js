const {Client, GatewayIntentBits, Collection} = require("discord.js");
const {ChannelType} = require("discord-api-types/v10");
const path = require("node:path");
const fs = require("node:fs");
const {joinVoiceChannel} = require("@discordjs/voice");

class ClientService {
  async init(settings) {
    this.baseClient = new Client({"intents": [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessageReactions
    ]});
    // Set up event listeners for Discord events like incoming messages.
    this.setDiscordEventListeners(settings);
    // Login to Discord.
    await this.baseClient.login(settings.token).
      then(() => console.log("Discord Login Successful")).
      catch((err) => console.error("Error logging in with discord:", err));
  }

  // Setup Listeners for Discord.js events on base client.
  setDiscordEventListeners(settings) {
    // Catch ready event, which will be called after login to Discord was successful.
    this.baseClient.once("ready", () => {
      // Disconnect from any voice channels currently connected to.
      this.baseClient.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => {
          if (channel.type === ChannelType.GuildVoice) {
            channel.members.forEach((member) => {
              if (member.id === guild.members.me.id && channel.id !== settings.defaultVoiceChannel) {
                this.joinVoice(guild, channel).disconnect();
              }
            });
            // (Re-) Join default channel.
            if (settings.defaultVoiceChannel && channel.id === settings.defaultVoiceChannel) {
              this.joinVoice(guild, channel);
            }
          }
        });
      });
    });

    this.baseClient.on("interactionCreate", async(interaction) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        return;
      }
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          "content": "There was an error while executing this command!",
          "ephemeral": true
        });
      }
    });

    this.baseClient.commands = new Collection();
    const cmdPath = path.join(__dirname, "cmd");
    const cmdFiles = fs.readdirSync(cmdPath).filter((file) => file.startsWith("Command_"));

    for (const cmdFile of cmdFiles) {
      const cmd = require(path.join(cmdPath, cmdFile));
      if (cmd.scope === "G" ||
        (cmd.scope === "A" && !settings.disableAnnouncer) ||
        (cmd.scope === "M" && !settings.disableBot)) {
        const commandName = cmdFile.substr(8, cmdFile.length - 11);
        this.baseClient.commands.set(commandName, cmd);
      }
    }

    // Print debug info from base client.
    this.baseClient.on("debug", (info) => {
      if (settings.debug) {
        console.log(info);
      }
    });
  }

  joinVoice(guild, channel) {
    return joinVoiceChannel({
      "adapterCreator": guild.voiceAdapterCreator,
      "channelId": channel.id,
      "guildId": guild.id
    });
  }
}

module.exports = new ClientService();
