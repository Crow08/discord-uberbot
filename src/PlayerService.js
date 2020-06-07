/**
 * Class representing the music player.
 * The player is a active entity responsible for managing the playback of songs.
 */
class PlayerService {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {QueueService} queueService - QueueService.
   * @param {ChatService} chatService - ChatService.
   * @param {RatingService} ratingService - RatingService.
   */
  constructor(voiceService, queueService, chatService, ratingService) {
    this.audioDispatcher = null;

    this.voiceService = voiceService;
    this.queueService = queueService;
    this.chatService = chatService;
    this.ratingService = ratingService;

    this.playerIdObj = {"id": null};
    this.skipCount = 0;
  }

  /**
   * Called when a song has ended. and starting the next song from queue oe auto playlist when available.
   * @private
   * @param {Message} msg - User message the playback was is invoked by.
   * @param {number} startTime - time in ms when the ending song hast been started.
   */
  handleSongEnd(msg, startTime) {
    const delta = (new Date()) - startTime;
    if (delta < 2000) {
      if (this.skipCount >= 3) {
        this.stop(msg);
        return;
      }
      // Try to reset everything.
      this.chatService.simpleNote(msg, "Song ended to quickly: Try to reset voice.", this.chatService.msgType.FAIL);
      this.endStream();
      setTimeout(() => {
        this.voiceService.disconnectVoiceConnection(msg);
        setTimeout(() => {
          this.voiceService.getVoiceConnection(msg).
            then(() => this.playNext(msg)).
            catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
        }, 2000);
      }, 2000);
      ++this.skipCount;
      return;
    }
    if (this.skipCount > 0) {
      --this.skipCount;
    }
    this.playNext(msg);
  }

  /**
   * Called when an error has occurred during playback.
   * @param {Error} err - Error caused by playback.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  handleError(err, msg) {
    this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
  }

  /**
   * Play the given song immediately.
   * If another song is already playing it ends immediately.
   * @param {Song} song - Song to be played.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  async playNow(song, msg) {
    this.endStream();
    const dispatcherResult = await this.voiceService.playStream(song, msg);
    if (typeof dispatcherResult === Error) {
      this.chatService.simpleNote(msg, dispatcherResult, this.chatService.msgType.FAIL);
      if (this.voiceService.isVoiceConnected(msg)) {
        this.playNext(msg);
      }
    } else if (typeof dispatcherResult === "undefined") {
      this.chatService.simpleNote(msg, "Something went wrong dispatching this Stream!", this.chatService.msgType.FAIL);
      if (this.voiceService.isVoiceConnected(msg)) {
        this.playNext(msg);
      }
    } else {
      this.queueService.addSongToHistory(song);
      this.audioDispatcher = dispatcherResult;
      const startTime = new Date();
      this.audioDispatcher.once("finish", () => this.handleSongEnd(msg, startTime));
      this.audioDispatcher.on("error", (error) => this.handleError(error, msg));
      this.chatService.simpleNote(msg, `Playing now: ${song.title}`, this.chatService.msgType.MUSIC);

      this.rebuildPlayer(msg, song);
    }
  }

  /**
   * (Re-) builds the player with controls.
   * Can be used to move the player down in chat.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  rebuildPlayer(msg) {
    this.queueService.getCurrentSong().
      then((song) => {
        const reactionFunctions = this.buildReactionFunctions(msg);
        if (this.playerIdObj.id) {
          msg.channel.messages.fetch(this.playerIdObj.id).
            then((curPlayer) => {
              if (curPlayer) {
                curPlayer.delete();
                this.playerIdObj.id = null;
              }
            }).
            finally(() => {
              this.chatService.displayPlayer(msg, song, reactionFunctions, this.playerIdObj);
            });
        } else {
          this.chatService.displayPlayer(msg, song, reactionFunctions, this.playerIdObj);
        }
      }).
      catch((err) => {
        console.log(err);
      });
  }

  /**
   * Build object for reaction based player functions.
   * @private
   * @param {Message} msg - User message the playback was is invoked by.
   */
  buildReactionFunctions(msg) {
    const ratingFunc = (rSong, user, delta, ignoreCd) => new Promise((resolve, reject) => {
      this.ratingService.rateSong(rSong, user, delta, ignoreCd).
        then(resolve).
        catch(reject).
        finally(() => {
          if (delta < 0) {
            this.skip(msg);
          }
        });
    });
    const reactionFunctions = {
      "⏩": () => this.skip(msg),
      "⏪": () => this.back(msg),
      "⏯": () => {
        if (!this.audioDispatcher || this.audioDispatcher.paused) {
          this.play(msg);
        } else {
          this.pause(msg);
        }
      },
      "⏹": () => this.stop(msg),
      "👍": ratingFunc,
      "👎": ratingFunc,
      "🔀": () => {
        this.queueService.shuffleQueue();
        this.chatService.simpleNote(msg, "Queue shuffled!", this.chatService.msgType.MUSIC);
      },
      "🔁": () => {
        this.queueService.mode = this.queueService.mode === "n" ? "ra" : "n";
        this.chatService.simpleNote(
          msg, this.queueService.mode === "n" ? "No more looping!" : "Loop current queue!",
          this.chatService.msgType.MUSIC
        );
      }
    };
    return reactionFunctions;
  }

  /**
   * Given a Array of songs, play the first one immediately and queue the rest.
   * If another song is already playing it ends immediately.
   * @param {Song[]} songs - Song to be played and queued.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  playMultipleNow(songs, msg) {
    if (!songs && songs.length === 0) {
      this.chatService.simpleNote(msg, "No songs Found!", this.chatService.msgType.FAIL);
      return;
    }
    this.playNow(songs[0], msg);
    if (songs.length > 1) {
      songs.splice(0, 1);
      this.queueService.addMultipleFairlyToQueue(songs);
    }
  }

  /**
   * Play the next song from the queue.
   * @private
   * @param {Message} msg - User message the playback was is invoked by.
   */
  playNext(msg) {
    this.queueService.popNextSong().
      then((song) => {
        if (song === null) {
          this.endStream();
          this.chatService.simpleNote(msg, "Queue is empty, playback finished!", this.chatService.msgType.MUSIC);
        } else {
          this.playNow(song, msg);
        }
      }).
      catch((err) => {
        this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
      });
  }

  /**
   * Start playing if the playback ist stopped or resume playback if paused.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  play(msg) {
    if (!this.audioDispatcher || this.audioDispatcher.writableLength <= 0) {
      this.playNext(msg);
    } else if (this.audioDispatcher.paused) {
      this.audioDispatcher.resume();
      this.chatService.simpleNote(msg, "Now playing!", this.chatService.msgType.MUSIC);
    } else {
      this.chatService.simpleNote(msg, "Already playing!", this.chatService.msgType.FAIL);
    }
  }

  /**
   * Pause playback.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  pause(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg, "There no playback to be paused!", this.chatService.msgType.FAIL);
    } else if (this.audioDispatcher.paused) {
      this.chatService.simpleNote(msg, "Playback already paused!", this.chatService.msgType.FAIL);
    } else {
      this.audioDispatcher.pause(true);
      this.chatService.simpleNote(msg, "Playback paused!", this.chatService.msgType.MUSIC);
    }
  }

  /**
   * Stop playback.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  stop(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg, "Playback already stopped!", this.chatService.msgType.FAIL);
      return;
    }
    this.endStream();
    this.chatService.simpleNote(msg, "Playback stopped!", this.chatService.msgType.MUSIC);
  }

  /**
   * Skip current song.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  skip(msg) {
    if (!this.audioDispatcher) {
      this.playNext(msg);
      return;
    }
    this.chatService.simpleNote(msg, "Skipping song!", this.chatService.msgType.MUSIC);
    this.audioDispatcher.end();
  }

  /**
   * Play last song again.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  back(msg) {
    if (this.queueService.history.length >= 2) {
      this.chatService.simpleNote(msg, "Loading last song!", this.chatService.msgType.MUSIC);
      // Add current playing song back to queue.
      this.queueService.queue.unshift(this.queueService.history[0]);
      // Get last song
      const lastSong = this.queueService.history[1];
      // Remove current and last song from history.
      this.queueService.history.splice(0, 2);
      this.playNow(lastSong, msg);
    } else {
      this.chatService.simpleNote(msg, "No song in history!", this.chatService.msgType.FAIL);
    }
  }

  /**
   * Play the current song at a given Position in seconds.
   * @param {number} position number in seconds to restart the current stream at.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  seek(position, msg) {
    this.endStream();
    this.voiceService.playStream(this.queueService.getHistorySong(0), msg, position).
      then((dispatcher) => {
        this.audioDispatcher = dispatcher;
        const startTime = new Date();
        this.audioDispatcher.on("finish", () => this.handleSongEnd(msg, startTime));
        this.audioDispatcher.on("error", (error) => this.handleError(error, msg));
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }

  /**
   * Destroys the audio dispatcher if necessary.
   * @private
   */
  endStream() {
    if (this.audioDispatcher) {
      this.audioDispatcher.destroy();
      this.audioDispatcher = null;
    }
  }
}
module.exports = PlayerService;
