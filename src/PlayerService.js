class PlayerService {
  constructor(voiceService, queueService, chatService) {
    this.audioDispatcher = null;

    this.voiceService = voiceService;
    this.queueService = queueService;
    this.chatService = chatService;
  }

  handleSongEnd(reason, msg) {
    if (reason === "ignore") {
      return;
    }
    const song = this.queueService.getNextSong(msg);
    if (song) {
      this.playNow(song, msg);
    } else {
      this.chatService.simpleNote(msg.channel, "Playback finished!", this.chatService.msgType.MUSIC);
      this.voiceService.disconnectVoiceConnection(msg);
    }
  }

  handleError(error, msg) {
    this.chatService.simpleNote(msg.channel, "Error while playback!", this.chatService.msgType.FAIL);
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
      this.chatService.simpleNote(msg.channel, `Playing now: ${song.title}`, this.chatService.msgType.MUSIC);
    }).
      catch((error) => this.chatService.simpleNote(msg.channel, error, this.chatService.msgType.FAIL));
  }

  playMultipleNow(songs, msg) {
    if (!songs && songs.length === 0) {
      this.chatService.simpleNote(msg.channel, "No songs Found!", this.chatService.msgType.FAIL);
      return;
    }
    this.playNow(songs[0]);
    if (songs.length > 1) {
      this.queueService.addMultipleToQueue(this.queueService.queueSongs(songs.splice(0, 1)));
    }
  }

  play(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg.channel, "Audiostream not found!", this.chatService.msgType.FAIL);
      return;
    }
    if (!this.audioDispatcher.paused) {
      this.chatService.simpleNote(msg.channel, "Already playing!", this.chatService.msgType.FAIL);
      return;
    }
    this.audioDispatcher.resume();
    this.chatService.simpleNote(msg.channel, "Now playing!", this.chatService.msgType.MUSIC);
  }

  pause(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg.channel, "Audiostream not found!", this.chatService.msgType.FAIL);
      return;
    }
    if (this.audioDispatcher.paused) {
      this.chatService.simpleNote(msg.channel, "Playback already paused!", this.chatService.msgType.FAIL);
      return;
    }
    this.audioDispatcher.pause();
    this.chatService.simpleNote(msg.channel, "Playback paused!", this.chatService.msgType.MUSIC);
  }

  stop(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg.channel, "Audiostream not found!", this.chatService.msgType.FAIL);
      return;
    }
    this.audioDispatcher.end("ignore");
    this.chatService.simpleNote(msg.channel, "Playback stopped!", this.chatService.msgType.MUSIC);
  }

  next(msg) {
    if (!this.audioDispatcher) {
      this.chatService.simpleNote(msg.channel, "Audiostream not found!", this.chatService.msgType.FAIL);
      return;
    }
    this.chatService.simpleNote(msg.channel, "Skipping song!", this.chatService.msgType.MUSIC);
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
      catch((error) => this.chatService.simpleNote(msg.channel, error, this.chatService.msgType.FAIL));
  }
}
module.exports = PlayerService;
