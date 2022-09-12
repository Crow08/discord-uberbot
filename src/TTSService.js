const request = require("request");
const {Readable} = require("stream");
const voiceLines = require("../voiceLines.json");
const {getVoiceConnection,
  createAudioResource,
  createAudioPlayer
} = require("@discordjs/voice");

/**
 * Class representing a text to speech service.
 */
class TTSService {

  init(options, client) {
    this.ttsApiKey = options.ttsApiKey;
    this.client = client;
    this.phoneticNicknames = options.phoneticNicknames;
    this.setupVoiceStateListener();
    this.defaultTextChannel = options.defaultTextChannel;
    this.AddTime = options.AddTime;
  }

  /**
   *  Get text to Speech stream for given text.
   * @param {string} text text to convert
   */
  getAudioResource(text) {
    return new Promise((resolve, reject) => {
      request.post({
        "body": `{"input":{"ssml":"<speak>${text}</speak>"},` +
          "\"voice\":{\"languageCode\":\"en-US\",\"name\":\"en-US-Wavenet-F\"}," +
          "\"audioConfig\":{\"audioEncoding\":\"OGG_OPUS\",\"pitch\":0,\"speakingRate\":1}}",
        "headers": {"content-type": "text/plain"},
        "url": "https://texttospeech.googleapis.com/v1beta1/text:synthesize?" +
          `key=${this.ttsApiKey}`
      }, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        const content = JSON.parse(body);
        if (typeof content.audioContent === "undefined") {
          const htmlError = content.error ? `${content.error.code} : ${content.error.message}` : "";
          return reject(new Error(`Audio content not found! ${htmlError}`));
        }
        const buff = Buffer.from(content.audioContent, "base64");
        const stream = new Readable();
        stream.push(buff);
        stream.push(null);
        return resolve(createAudioResource(stream));
      });
    });
  }

  /**
   * Setup user join or leave events with announcer tts voice.
   * @private
   */
  setupVoiceStateListener() {
    this.client.on("voiceStateUpdate", (oldState, newState) => {
      if (newState.member.user.bot) {
        return; // Ignore bots.
      }
      const newUserChannel = newState.channel;
      const oldUserChannel = oldState.channel;
      const voiceConnection = getVoiceConnection(oldState.guild.id);

      if (typeof voiceConnection !== "undefined") {
        const newUser = newState.member.displayName;
        if (newUserChannel && oldUserChannel && newUserChannel.id === oldUserChannel.id) {
          // Do nothing!
        } else if (newUserChannel && newUserChannel.id === voiceConnection.joinConfig.channelId) {
          // User joins voice channel of bot
          const line = Math.floor(Math.random() * voiceLines.join.length);
          const messageJoin = voiceLines.join[line].replace(/#User/gu, this.phoneticNicknameFor(newUser));
          this.announceMessage(messageJoin, voiceConnection);
          if (this.defaultTextChannel) {
            this.client.guilds.cache.forEach((guild) => {
              guild.channels.cache.get(this.defaultTextChannel).send(`${newUser} joined the channel (${this.formattedDate()})`);
            });
          }

        } else if (oldUserChannel && oldUserChannel.id === voiceConnection.joinConfig.channelId) {
          // User leaves voice channel of bot
          const line = Math.floor(Math.random() * voiceLines.leave.length);
          const messageLeave = voiceLines.leave[line].replace(/#User/gu, this.phoneticNicknameFor(newUser));
          this.announceMessage(messageLeave, voiceConnection);
          if (this.defaultTextChannel) {
            this.client.guilds.cache.forEach((guild) => {
              guild.channels.cache.get(this.defaultTextChannel).send(`${newUser} left the channel (${this.formattedDate()})`);
            });
          }
        }
      }
    });
  }

  /**
   * Lookup phonetic nickname.
   * @private
   * @param {string} userName Username to process.
   */
  phoneticNicknameFor(userName) {
    if (this.phoneticNicknames) {
      for (const [phoneticNicknameKey, phoneticNicknameValue] of Object.entries(this.phoneticNicknames)) {
        if (userName.includes(phoneticNicknameKey)) {
          return phoneticNicknameValue;
        }
      }
    }
    return userName;
  }

  /**
   * Announce the given message via tts to the given connection.
   * @private
   * @param {string} message Message to announce.
   * @param {VoiceConnection} voiceConnection Discord.js Voice connection to announce to.
   */
  announceMessage(message, voiceConnection) {
    this.getAudioResource(message).
      then((audioResource) => {
        const player = createAudioPlayer();
        const subscription = voiceConnection.subscribe(player);
        player.play(audioResource);
        player.on("idle", () => {
          subscription.unsubscribe();
          player.stop();
        });
      }).
      catch((err) => {
        if (voiceConnection.dispatcher && !voiceConnection.dispatcher.paused) {
          voiceConnection.dispatcher.end();
        }
        console.log(err);
      });
  }

  formattedDate() {
    return new Date().toLocaleString("de-DE", {timeZone: 'Europe/Berlin'});
  }
}

module.exports = new TTSService();
