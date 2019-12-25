const request = require("request");
const {Readable} = require("stream");
const voiceLines = require("../voiceLines.json");

/**
 * Class representing a text to speech service.
 */
class TTSService {

  constructor(options, client) {
    this.ttsApiKey = options.ttsApiKey;
    this.client = client;
    this.phoneticNicknames = options.phoneticNicknames;
    this.setupVoiceStateListener();
    this.defaultTextChannel = options.defaultTextChannel;
  }

  /**
   *  Get text to Speech stream for given text.
   * @param {string} text text to convert
   */
  getStream(text) {
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
          return reject(new Error("Audio content not found!"));
        }
        const buff = Buffer.from(content.audioContent, "base64");
        const stream = new Readable();
        stream.push(buff);
        stream.push(null);
        return resolve(stream);
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
      const voiceConnection = this.client.voice.connections.find((val) => val.channel.guild.id === newState.guild.id);

      if (typeof voiceConnection !== "undefined") {
        const newUser = newState.member.displayName;
        if (newUserChannel && oldUserChannel && newUserChannel.id === oldUserChannel.id) {
          // Do nothing!
        } else if (newUserChannel && newUserChannel.id === voiceConnection.channel.id) {
          // User joins voice channel of bot
          const line = Math.floor(Math.random() * voiceLines.join.length);
          const messageJoin = voiceLines.join[line].replace(/#User/gu, this.phoneticNicknameFor(newUser));
          this.announceMessage(messageJoin, voiceConnection);
          if (this.defaultTextChannel) {
            this.client.guilds.forEach((guild) => {
              guild.channels.get(this.defaultTextChannel).send(`${this.phoneticNicknameFor(newUser)} joined the channel (${this.formatDate(1)})`);
            });
          }
          
        } else if (oldUserChannel && oldUserChannel.id === voiceConnection.channel.id) {
          // User leaves voice channel of bot
          const line = Math.floor(Math.random() * voiceLines.leave.length);
          const messageLeave = voiceLines.leave[line].replace(/#User/gu, this.phoneticNicknameFor(newUser));
          this.announceMessage(messageLeave, voiceConnection);
          if (this.defaultTextChannel) {
            this.client.guilds.forEach((guild) => {
              guild.channels.get(this.defaultTextChannel).send(`${this.phoneticNicknameFor(newUser)} left the channel (${this.formatDate(1)})`);
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
    if (this.phoneticNicknames && userName in this.phoneticNicknames) {
      return this.phoneticNicknames[userName];
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
    this.getStream(message).
      then((stream) => {
        const oldDispatcher = voiceConnection.dispatcher;
        const dispatcher = voiceConnection.play(stream);
        dispatcher.on("end", () => {
          if (oldDispatcher && !oldDispatcher.paused) {
            oldDispatcher.end();
          }
        });
      }).
      catch((err) => {
        if (voiceConnection.dispatcher && !voiceConnection.dispatcher.paused) {
          voiceConnection.dispatcher.end();
        }
        console.log(err);
      });
  }
   
 formatDate(addhour) {
    let date = Date.now() 
    let Time = Date.now()
    if (typeof addhour != "number" || Number.isNaN(addhour) == true) {
      addhour = 0;
    }
    Time = Time + addhour * 3600000
        date = new Date(Time)
    let day = date.getDate().toString().padStart(2,'0');
    let month = parseInt(date.getMonth().toString().padStart(2,'0')) + 1;
    let year = date.getFullYear();
    let hour = date.getHours().toString().padStart(2,'0');
    let minutes = date.getMinutes().toString().padStart(2,'0');
    let seconds = date.getSeconds().toString().padStart(2,'0');
    
    let actual_date = day + "." + month + "." + year;
    return day + "." + month + "." + year + " " + hour + ":" + minutes + ":" + seconds;

  }  
}

module.exports = TTSService;
