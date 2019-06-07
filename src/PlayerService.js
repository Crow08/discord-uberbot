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
      // Try to reset everything.
      this.chatService.simpleNote(msg, "Song ended to quickly: Try to reset voice.", this.chatService.msgType.FAIL);
      this.audioDispatcher.destroy();
      this.audioDispatcher = null;
      this.voiceService.disconnectVoiceConnection(msg);
      this.voiceService.getVoiceConnection(msg).
        then(() => this.playNext(msg)).
        catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
      return;
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
  playNow(song, msg) {
    if (this.audioDispatcher) {
      this.audioDispatcher.destroy();
      this.audioDispatcher = null;
    }
    this.voiceService.playStream(song, msg).
      then((dispatcher) => {
        this.queueService.addSongToHistory(song);
        this.audioDispatcher = dispatcher;
        const startTime = new Date();
        this.audioDispatcher.on("finish", () => this.handleSongEnd(msg, startTime));
        this.audioDispatcher.on("error", (error) => this.handleError(error, msg));
        this.chatService.simpleNote(msg, `Playing now: ${song.title}`, this.chatService.msgType.MUSIC);
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
        this.chatService.displaySong(msg, song, ratingFunc);
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
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
      this.queueService.addMultipleToQueue(songs);
    }
  }

  /**
   * Play the next song from the queue.
   * @private
   * @param {Message} msg - User message the playback was is invoked by.
   */
  playNext(msg) {
    this.queueService.getNextSong().
      then((song) => {
        if (song === null) {
          this.chatService.simpleNote(msg, "Queue is empty, playback finished!", this.chatService.msgType.MUSIC);
          this.voiceService.disconnectVoiceConnection(msg);
        } else {
          this.playNow(song, msg);
        }
      }).
      catch((err) => {
        this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL);
        this.voiceService.disconnectVoiceConnection(msg);
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
      this.chatService.simpleNote(msg, "Audio stream not found!", this.chatService.msgType.FAIL);
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
      this.chatService.simpleNote(msg, "Audio stream not found!", this.chatService.msgType.FAIL);
      return;
    }
    this.audioDispatcher.destroy();
    this.audioDispatcher = null;
    this.chatService.simpleNote(msg, "Playback stopped!", this.chatService.msgType.MUSIC);
  }

  /**
   * Skip current song.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  skip(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg, "Audio stream not found!", this.chatService.msgType.FAIL);
      return;
    }
    this.chatService.simpleNote(msg, "Skipping song!", this.chatService.msgType.MUSIC);
    this.audioDispatcher.end();
  }

  /**
   * Play the current song at a given Position in seconds.
   * @param {number} position number in seconds to restart the current stream at.
   * @param {Message} msg - User message the playback was is invoked by.
   */
  seek(position, msg) {
    if (this.audioDispatcher) {
      this.audioDispatcher.destroy();
      this.audioDispatcher = null;
    }
    this.voiceService.playStream(this.queueService.getHistorySong(0), msg, position).
      then((dispatcher) => {
        this.audioDispatcher = dispatcher;
        const startTime = new Date();
        this.audioDispatcher.on("finish", () => this.handleSongEnd(msg, startTime));
        this.audioDispatcher.on("error", (error) => this.handleError(error, msg));
      }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}
module.exports = PlayerService;
