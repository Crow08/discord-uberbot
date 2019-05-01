class ChatService {
  constructor(options) {
    this.options = options;
    this.msgType = {
      "FAIL": "fail",
      "INFO": "info",
      "MUSIC": "music",
      "SEARCH": "search"

    };
  }

  basicNote(channel, text) {
    return channel.send(`${text}`);
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

  // RichEmbed-Wiki -> https://anidiots.guide/first-bot/using-embeds-in-messages
  // Previewer -> https://leovoel.github.io/embed-visualizer/
  richNote(channel, embed) {
    return channel.send(embed);
  }
}

module.exports = ChatService;
