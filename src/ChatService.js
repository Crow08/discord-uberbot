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


  openSelectionMenu(songs, msg, isSelectionCmd, processSelectionCmd) {
    let page = 0;
    // Build choose menu.
    msg.channel.send(this.buildSelectionPage(songs, page)).
      // Add reactions for page navigation.
      then((menuMsg) => menuMsg.react("⏪").then(() => menuMsg.react("⏩").then(() => {
        // Add listeners to reactions.
        const nextReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏩" && user.id === msg.author.id,
          {"time": 120000}
        );
        const backReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏪" && user.id === msg.author.id,
          {"time": 120000}
        );
        nextReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          if ((page + 1) * 10 <= songs.length) {
            ++page;
            menuMsg.edit(this.buildSelectionPage(songs, page));
          }
        });
        backReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          if (page > 0) {
            --page;
            menuMsg.edit(this.buildSelectionPage(songs, page));
          }
        });
        // Add listener for response Message.
        msg.channel.awaitMessages(isSelectionCmd, {"errors": ["time"], "max": 1, "time": 120000}).
          then((collected) => {
            processSelectionCmd(collected);
            menuMsg.delete();
          }).
          // Timeout or error.
          catch(() => menuMsg.delete());
      })));
  }

  buildSelectionPage(songs, pageNo) {
    const first = 10 * pageNo;
    const last = first + 10 > songs.length - 1 ? songs.length - 1 : first + 10;
    let page = "";
    for (let index = first; index < last; index++) {
      page += `${index + 1}. ${songs[index].title}\n`;
    }
    return page;
  }
}

module.exports = ChatService;
