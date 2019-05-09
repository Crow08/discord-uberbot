class PlayerService {
  constructor(voiceService, queueService, chatService, ratingService) {
    this.audioDispatcher = null;

    this.voiceService = voiceService;
    this.queueService = queueService;
    this.chatService = chatService;
    this.ratingService = ratingService;
  }

  handleSongEnd(reason, msg) {
    if (reason === "ignore") {
      return;
    }
    this.queueService.getNextSong(msg).
      then((song) => {
        this.playNow(song, msg);
      }).
      catch((err) => {
        console.log(err);
        this.chatService.simpleNote(msg, "Playback finished!", this.chatService.msgType.MUSIC);
        this.voiceService.disconnectVoiceConnection(msg);
      });
  }

  handleError(error, msg) {
    this.chatService.simpleNote(msg, "Error while playback!", this.chatService.msgType.FAIL);
    console.log(error);
  }

  playNow(song, msg) {
    if (this.audioDispatcher) {
      this.audioDispatcher.end("ignore");
    }
    this.voiceService.playStream(song, msg).then((dispatcher) => {
      this.queueService.addSongToHistory(song);
      this.audioDispatcher = dispatcher;
      this.audioDispatcher.on("end", (reason) => this.handleSongEnd(reason, msg));
      this.audioDispatcher.on("error", (error) => this.handleError(error, msg));
      this.chatService.simpleNote(msg, `Playing now: ${song.title}`, this.chatService.msgType.MUSIC);
      this.chatService.displaySong(msg, song, this.ratingService.rateSong);
    }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }

  playMultipleNow(songs, msg) {
    if (!songs && songs.length === 0) {
      this.chatService.simpleNote(msg, "No songs Found!", this.chatService.msgType.FAIL);
      return;
    }
    this.playNow(songs[0]);
    if (songs.length > 1) {
      this.queueService.addMultipleToQueue(this.queueService.queueSongs(songs.splice(0, 1)));
    }
  }

  play(msg) {
    if (!this.audioDispatcher || this.audioDispatcher.destroyed) {
      this.queueService.getNextSong().
        then((song) => {
          this.playNow(song, msg);
        }).
        catch((err) => this.chatService.simpleNote(msg, err, this.chatService.msgType.FAIL));
    } else if (this.audioDispatcher.paused) {
      this.audioDispatcher.resume();
      this.chatService.simpleNote(msg, "Now playing!", this.chatService.msgType.MUSIC);
    } else {
      this.chatService.simpleNote(msg, "Already playing!", this.chatService.msgType.FAIL);
    }
  }

  pause(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg, "Audiostream not found!", this.chatService.msgType.FAIL);
    } else if (this.audioDispatcher.paused) {
      this.chatService.simpleNote(msg, "Playback already paused!", this.chatService.msgType.FAIL);
    } else {
      this.audioDispatcher.pause();
      this.chatService.simpleNote(msg, "Playback paused!", this.chatService.msgType.MUSIC);
    }
  }

  stop(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg, "Audiostream not found!", this.chatService.msgType.FAIL);
      return;
    }
    this.audioDispatcher.end("ignore");
    this.audioDispatcher.destroyed = true;
    this.chatService.simpleNote(msg, "Playback stopped!", this.chatService.msgType.MUSIC);
  }

  next(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg, "Audiostream not found!", this.chatService.msgType.FAIL);
      return;
    }
    this.chatService.simpleNote(msg, "Skipping song!", this.chatService.msgType.MUSIC);
    this.audioDispatcher.end("skip");
  }

  seek(position, msg) {
    if (this.audioDispatcher) {
      this.audioDispatcher.end("ignore");
    }
    this.voiceService.playStream(this.queueService.getHistorySong(0), msg, position).then((dispatcher) => {
      this.audioDispatcher = dispatcher;
      this.audioDispatcher.on("end", (reason) => this.handleSongEnd(reason, msg));
      this.audioDispatcher.on("error", (error) => this.handleError(error, msg));
    }).
      catch((error) => this.chatService.simpleNote(msg, error, this.chatService.msgType.FAIL));
  }
}
module.exports = PlayerService;
