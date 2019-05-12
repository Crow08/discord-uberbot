/* eslint-disable max-lines-per-function */
class ChatService {
  constructor(DiscordRichEmbed) {
    this.DiscordRichEmbed = DiscordRichEmbed;
    this.msgType = {
      "FAIL": "fail",
      "INFO": "info",
      "MUSIC": "music",
      "SEARCH": "search"

    };
  }

  plainText(msg, text) {
    return msg.channel.send(text);
  }

  simpleNote(msg, text, type) {
    switch (type) {
    case this.msgType.INFO:
      return msg.channel.send(`:information_source: | ${text}`);
    case this.msgType.MUSIC:
      return msg.channel.send(`:musical_note: | ${text}`);
    case this.msgType.SEARCH:
      return msg.channel.send(`:mag: | ${text}`);
    case this.msgType.FAIL:
      return msg.channel.send(`:x: | ${text}`);
    default:
      return msg.channel.send(text);
    }
  }

  // RichEmbed-Wiki -> https://anidiots.guide/first-bot/using-embeds-in-messages
  // Previewer -> https://leovoel.github.io/embed-visualizer/
  richNote(msg, embed) {
    return msg.channel.send(embed);
  }

  pagedContent(msg, pages) {
    let page = 0;
    // Build choose menu.
    msg.channel.send(pages[0]).
      // Add reactions for page navigation.
      then((curPage) => curPage.react("⏪").then(() => curPage.react("⏩").then(() => {
        // Add listeners to reactions.
        const nextReaction = curPage.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏩" && user.id === msg.author.id,
          {"time": 120000}
        );
        const backReaction = curPage.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏪" && user.id === msg.author.id,
          {"time": 120000}
        );
        nextReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          if ((page + 1) < pages.length) {
            ++page;
            curPage.edit(pages[page]);
          }
        });
        backReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          if (page > 0) {
            --page;
            curPage.edit(pages[page]);
          }
        });
      })));
  }

  displaySong(msg, song, processRating) {
    // Build Song embed.
    msg.channel.send(this.buildSongEmbed(song)).
      // Add reactions for song rating.
      then((menuMsg) => menuMsg.react("⏫").then(() => menuMsg.react("⏬").then(() => menuMsg.react("💩").then(() => {
        // Add listeners to reactions.
        const upReaction = menuMsg.createReactionCollector(
          (reaction, user) => (reaction.emoji.name === "⏫" && (!user.bot)),
          {"time": 300000}
        );
        const downReaction = menuMsg.createReactionCollector(
          (reaction, user) => (reaction.emoji.name === "⏬" && (!user.bot)),
          {"time": 300000}
        );
        const poopReaction = menuMsg.createReactionCollector(
          (reaction, user) => (reaction.emoji.name === "💩" && (!user.bot)),
          {"time": 300000}
        );
        upReaction.on("collect", (reaction) => {
          reaction.users.filter((user) => !user.bot).forEach((user) => {
            reaction.remove(user);
            processRating(song, user, 1).
              then((note) => {
                menuMsg.edit(this.buildSongEmbed(song));
                if (note) {
                  this.simpleNote(msg, note, this.msgType.MUSIC);
                }
              }).
              catch((err) => this.simpleNote(msg, err, this.msgType.FAIL));
          });
        });
        downReaction.on("collect", (reaction) => {
          reaction.users.filter((user) => !user.bot).forEach((user) => {
            reaction.remove(user);
            processRating(song, user, -1).
              then((note) => {
                menuMsg.edit(this.buildSongEmbed(song));
                if (note) {
                  this.simpleNote(msg, note, this.msgType.MUSIC);
                }
              }).
              catch((err) => this.simpleNote(msg, err, this.msgType.FAIL));
          });
        });

        poopReaction.on("collect", (reaction) => {
          reaction.users.filter((user) => !user.bot).forEach((user) => {
            reaction.remove(user);
            processRating(song, user, -1000, true).
              then((note) => {
                menuMsg.edit(this.buildSongEmbed(song));
                if (note) {
                  this.simpleNote(msg, "Let me clean that 💩 for you", this.msgType.MUSIC);
                  this.simpleNote(msg, note, this.msgType.MUSIC);
                }
              }).
              catch((err) => this.simpleNote(msg, err, this.msgType.FAIL));
          });
        });

      }))));
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

  buildSongEmbed(song) {
    const embed = new this.DiscordRichEmbed();
    for (const key in song) {
      if (song[key] === "") {
        song[key] = "-";
      }
    }
    embed.setColor(890629);
    embed.addField("Title", song.title, true);
    embed.addField("Artist", song.artist, true);
    embed.addBlankField();
    embed.addField("Requester", song.requester, true);
    embed.addField("Rating", song.rating, true);
    embed.addField("Source", song.src, true);
    return embed;
  }
}

module.exports = ChatService;
