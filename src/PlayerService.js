const voiceService = require("./VoiceService");
const queueService = require("./QueueService");
const chatService = require("./ChatService");
const ratingService = require("./RatingService");
const {AudioPlayerStatus, createAudioPlayer} = require("@discordjs/voice");

/**
 * Class representing the music player.
 * The player is a active entity responsible for managing the playback of songs.
 */
class PlayerService {

  init() {
    this.playerIdObj = {"id": null};
    this.audioPlayers = new Map();
  }

  /**
   * Called when a song has ended. and starting the next song from queue oe auto playlist when available.
   * @private
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  handleSongEnd(interaction) {
    this.playNext(interaction);
  }

  /**
   * Called when an error has occurred during playback.
   * @param {Error} err - Error caused by playback.
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  handleError(err, interaction) {
    chatService.simpleNote(interaction, err, chatService.msgType.FAIL);
  }

  /**
   * Play the given song immediately.
   * If another song is already playing it ends immediately.
   * @param {Song} song - Song to be played.
   * @param {ChatInputCommandInteraction} interaction  - User message the playback was is invoked by.
   */
  async playNow(song, interaction) {
    const audioPlayer = this.getAudioPlayer(interaction);
    audioPlayer.stop();
    const result = await voiceService.playStream(audioPlayer, song, interaction);
    if (typeof result === Error) {
      await chatService.simpleNote(interaction, result, chatService.msgType.FAIL);
      if (voiceService.isVoiceConnected(interaction)) {
        this.playNext(interaction);
      }
    } else {
      queueService.addSongToHistory(song);
      await chatService.simpleNote(interaction, `Playing now: ${song.title}`, chatService.msgType.MUSIC);

      this.rebuildPlayer(interaction, song);
    }
  }

  /**
   * (Re-) builds the player with controls.
   * Can be used to move the player down in chat.
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  rebuildPlayer(interaction) {
    queueService.getCurrentSong().
      then((song) => {
        const reactionFunctions = this.buildReactionFunctions(interaction);
        chatService.updatePlayer(interaction, song, reactionFunctions, this.playerIdObj);
      }).
      catch((err) => {
        console.log(err);
      });
  }

  /**
   * Build object for reaction based player functions.
   * @private
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  buildReactionFunctions(interaction) {
    const ratingFunc = (rSong, user, delta, ignoreCd) => new Promise((resolve, reject) => {
      ratingService.rateSong(rSong, user, delta, ignoreCd).
        then(resolve).
        catch(reject).
        finally(() => {
          if (delta < 0) {
            this.skip(interaction);
          }
        });
    });
    const audioPlayer = this.getAudioPlayer(interaction);
    return {
      "⏩": () => this.skip(interaction),
      "⏪": () => this.back(interaction),
      "⏯": () => {
        if (!audioPlayer ||
          [AudioPlayerStatus.Paused, AudioPlayerStatus.AutoPaused].includes(audioPlayer.state.status)) {
          this.play(interaction);
        } else {
          this.pause(interaction);
        }
      },
      "⏹": () => this.stop(interaction),
      "👍": ratingFunc,
      "👎": ratingFunc,
      "🔀": () => {
        queueService.shuffleQueue();
        chatService.simpleNote(interaction, "Queue shuffled!", chatService.msgType.MUSIC);
      },
      "🔁": () => {
        queueService.mode = queueService.mode === "n" ? "ra" : "n";
        chatService.simpleNote(
          interaction, queueService.mode === "n" ? "No more looping!" : "Loop current queue!",
          chatService.msgType.MUSIC
        );
      }
    };
  }

  /**
   * Given a Array of songs, play the first one immediately and queue the rest.
   * If another song is already playing it ends immediately.
   * @param {Song[]} songs - Song to be played and queued.
   * @param {ChatInputCommandInteraction} interaction- User message the playback was is invoked by.
   */
  playMultipleNow(songs, interaction) {
    if (!songs && songs.length === 0) {
      chatService.simpleNote(interaction, "No songs Found!", chatService.msgType.FAIL);
      return;
    }
    this.playNow(songs[0], interaction).catch(console.error);
    if (songs.length > 1) {
      songs.splice(0, 1);
      queueService.addMultipleFairlyToQueue(songs);
    }
  }

  /**
   * Play the next song from the queue.
   * @private
   * @param {ChatInputCommandInteraction} interaction  - User message the playback was is invoked by.
   */
  playNext(interaction) {
    queueService.popNextSong().
      then((song) => {
        if (song === null) {
          this.getAudioPlayer(interaction).stop();
          chatService.simpleNote(interaction, "Queue is empty, playback finished!", chatService.msgType.MUSIC);
        } else {
          this.playNow(song, interaction).catch(console.error);
        }
      }).
      catch((err) => {
        chatService.simpleNote(interaction, err, chatService.msgType.FAIL);
      });
  }

  /**
   * Start playing if the playback ist stopped or resume playback if paused.
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  play(interaction) {
    const audioPlayer = this.getAudioPlayer(interaction);
    if (!audioPlayer || [AudioPlayerStatus.Idle, AudioPlayerStatus.AutoPaused].includes(audioPlayer.state.status)) {
      this.playNext(interaction);
    } else if (audioPlayer.state.status === AudioPlayerStatus.Paused) {
      audioPlayer.unpause();
      chatService.simpleNote(interaction, "Now playing!", chatService.msgType.MUSIC);
    } else {
      chatService.simpleNote(interaction, "Already playing!", chatService.msgType.FAIL);
    }
  }

  /**
   * Pause playback.
   * @param {ChatInputCommandInteraction} interaction  - User message the playback was is invoked by.
   */
  pause(interaction) {
    const audioPlayer = this.getAudioPlayer(interaction);
    if (!audioPlayer) {
      chatService.simpleNote(interaction, "There no playback to be paused!", chatService.msgType.FAIL);
    } else if (audioPlayer.state.status === AudioPlayerStatus.Paused) {
      chatService.simpleNote(interaction, "Playback already paused!", chatService.msgType.FAIL);
    } else {
      audioPlayer.pause(true);
      chatService.simpleNote(interaction, "Playback paused!", chatService.msgType.MUSIC);
    }
  }

  /**
   * Stop playback.
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  stop(interaction) {
    const audioPlayer = this.getAudioPlayer(interaction);
    if (audioPlayer.state.status === AudioPlayerStatus.Idle) {
      chatService.simpleNote(interaction, "Playback already stopped!", chatService.msgType.FAIL);
      return;
    }
    queueService.queue = [];
    audioPlayer.stop();
    chatService.simpleNote(interaction, "Playback stopped!", chatService.msgType.MUSIC);
  }

  /**
   * Skip current song.
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  skip(interaction) {
    const audioPlayer = this.getAudioPlayer(interaction);
    if (!audioPlayer) {
      this.playNext(interaction);
      return;
    }
    audioPlayer.stop();
  }

  /**
   * Play last song again.
   * @param {ChatInputCommandInteraction} interaction  - User message the playback was is invoked by.
   */
  back(interaction) {
    if (queueService.history.length >= 2) {
      chatService.simpleNote(interaction, "Loading last song!", chatService.msgType.MUSIC);
      // Add current playing song back to queue.
      queueService.queue.unshift(queueService.history[0]);
      // Add last song back to queue.
      queueService.queue.unshift(queueService.history[1]);
      // Remove current and last song from history.
      queueService.history.splice(0, 2);
      // Stop current track to play the new queue.
      this.getAudioPlayer(interaction).stop();
    } else {
      chatService.simpleNote(interaction, "No song in history!", chatService.msgType.FAIL);
    }
  }

  /**
   * Play the current song again.
   * @param {ChatInputCommandInteraction} interaction - User message the playback was is invoked by.
   */
  restart(interaction) {
    const audioPlayer = this.getAudioPlayer(interaction);
    voiceService.playStream(audioPlayer, queueService.getHistorySong(0), interaction).
      catch((error) => chatService.simpleNote(interaction, error, chatService.msgType.FAIL));
  }

  getAudioPlayer(interaction) {
    if (this.audioPlayers.has(interaction.guild.id)) {
      return this.audioPlayers.get(interaction.guild.id);
    }
    const audioPlayer = createAudioPlayer();
    this.audioPlayers.set(interaction.guild.id, audioPlayer);
    audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
        this.handleSongEnd(interaction);
      }
    });
    audioPlayer.on("error", (error) => this.handleError(error, interaction));
    return audioPlayer;
  }
}
module.exports = new PlayerService();
