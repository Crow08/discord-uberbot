class ChatService {
  constructor(options) {
    this.options = options;
    this.msgType = {
      "INFO": "info",
      "MUSIC": "music",
      "SEARCH": "search",
      "FAIL": "fail"
    };
  }

  simpleNote(channel, text, type) {
    switch (type) {
    case this.msgType.INFO:
      return channel.send(`:information_source: | ${text}`);
    case this.msgType.MUSIC:
      return channel.send(`:musical_note: | ${text}`);
    case this.msgType.SEARCH:
      return channel.send(`:mag: | ${text}`);
    case this.msgType.FAIL:
      return channel.send(`:x: | ${text}`);
    default:
      return channel.send(text);
    }
  }
}

module.exports = ChatService;
