class ChatService {
  constructor(DiscordMessageEmbed) {
    this.DiscordMessageEmbed = DiscordMessageEmbed;
    this.msgType = {
      "FAIL": "fail",
      "INFO": "info",
      "MUSIC": "music",
      "SEARCH": "search"
    };
  }

  simpleNote(msg, text, type) {
    this.debugPrint(text);
    if (typeof msg.channel === "undefined") {
      return new Promise((resolve) => resolve({"delete": () => null}));
    }
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
      return msg.channel.send(`${text}`);
    }
  }

  // MessageEmbed API -> https://discord.js.org/#/docs/main/master/class/MessageEmbed
  // Previewer -> https://leovoel.github.io/embed-visualizer/
  send(msg, content) {
    this.debugPrint(content);
    if (typeof msg.channel === "undefined") {
      return new Promise((resolve) => resolve({"delete": () => null}));
    }
    return msg.channel.send(content);
  }

  pagedContent(msg, pages) {
    this.debugPrint(pages);
    if (typeof msg.channel === "undefined") {
      return;
    }
    let page = 0;
    // Build choose menu.
    msg.channel.send(pages[0]).
      // Add reactions for page navigation.
      then((curPage) => this.postReactionEmojis(curPage, ["⏪", "⏩"]).then(() => {
        // Add listeners to reactions.
        const nextReaction = curPage.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏩" && user.id === msg.author.id,
          {"time": 120000}
        );
        const backReaction = curPage.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏪" && user.id === msg.author.id,
          {"time": 120000}
        );
        // Handle reactions.
        nextReaction.on("collect", (reaction) => {
          reaction.users.remove(msg.author);
          if ((page + 1) < pages.length) {
            ++page;
            curPage.edit(pages[page]);
          }
        });
        backReaction.on("collect", (reaction) => {
          reaction.users.remove(msg.author);
          if (page > 0) {
            --page;
            curPage.edit(pages[page]);
          }
        });
      }));
  }

  displaySong(msg, song, processRating) {
    this.debugPrint(song);
    if (typeof msg.channel === "undefined") {
      return;
    }
    // Build Song embed.
    msg.channel.send(this.buildSongEmbed(song)).
      // Add reactions for song rating.
      then((songMsg) => this.postReactionEmojis(songMsg, ["⏫", "⏬", "💩"]).
        then(() => {
        // Add listeners to reactions.
          const upReaction = songMsg.createReactionCollector(
            (reaction, user) => (reaction.emoji.name === "⏫" && (!user.bot)),
            {"time": 300000}
          );
          const downReaction = songMsg.createReactionCollector(
            (reaction, user) => (reaction.emoji.name === "⏬" && (!user.bot)),
            {"time": 300000}
          );
          const poopReaction = songMsg.createReactionCollector(
            (reaction, user) => (reaction.emoji.name === "💩" && (!user.bot)),
            {"time": 300000}
          );
          // Handle reactions.
          upReaction.on("collect", (reaction) => {
            this.handleRatingReaction(reaction, song, 1, processRating);
          });
          downReaction.on("collect", (reaction) => {
            this.handleRatingReaction(reaction, song, -1, processRating);
          });
          poopReaction.on("collect", (reaction) => {
            const note = "Let me clean that 💩 for you";
            this.simpleNote(reaction.message, note, this.msgType.MUSIC);
            this.handleRatingReaction(reaction, song, -1000, processRating, true);
          });
        }));
  }

  postReactionEmojis(msg, emojiList) {
    return new Promise((resolve, reject) => {
      msg.react(emojiList.shift()).
        then(() => {
          if (emojiList.length > 0) {
            // Send all reactions recursively.
            this.postReactionEmojis(msg, emojiList).
              then(resolve).
              catch(reject);
          } else {
            resolve();
          }
        }).
        catch(reject);
    });
  }

  handleRatingReaction(reaction, song, delta, processRating, ignoreCd = false) {
    reaction.users.filter((user) => !user.bot).forEach((user) => {
      reaction.users.remove(user);
      processRating(song, user, delta, ignoreCd).
        then((note) => {
          reaction.message.edit(this.buildSongEmbed(song));
          if (note) {
            this.simpleNote(reaction.message, note, this.msgType.MUSIC);
          }
        }).
        catch((err) => this.simpleNote(reaction.message, err, this.msgType.FAIL));
    });
  }

  openSelectionMenu(songs, msg, isSelectionCmd, processSelectionCmd) {
    this.debugPrint(songs);
    if (typeof msg.channel === "undefined") {
      return;
    }
    let page = 0;
    // Build choose menu.
    msg.channel.send(this.buildSelectionPage(songs, page)).
      // Add reactions for page navigation.
      then((menuMsg) => this.postReactionEmojis(menuMsg, ["⏪", "⏩"]).then(() => {
        // Add listeners to reactions.
        const nextReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏩" && user.id === msg.author.id,
          {"time": 120000}
        );
        const backReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏪" && user.id === msg.author.id,
          {"time": 120000}
        );
        // Handle reactions.
        nextReaction.on("collect", (reaction) => {
          reaction.users.remove(msg.author);
          if ((page + 1) * 10 <= songs.length) {
            ++page;
            menuMsg.edit(this.buildSelectionPage(songs, page));
          }
        });
        backReaction.on("collect", (reaction) => {
          reaction.users.remove(msg.author);
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
      }));
  }

  validateInput(validate, execute, msg, list) {
    msg.channel.awaitMessages(validate, {"errors": ["time"], "max": 1, "time": 120000}).
      then((collected) => {
        execute(collected, list, msg);
      }).
      // Timeout or error.
      catch((err) => this.simpleNote(msg.channel, err, this.msgType.FAIL));
    console.log();
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
    const embed = new this.DiscordMessageEmbed();
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

  debugPrint(content) {
    if (content instanceof Error) {
      console.log("\x1b[31m%s\x1b[0m", content.stack);
    } else if (typeof content === "object") {
      console.log("\x1b[36m%s\x1b[0m", JSON.stringify(content, null, 4).replace(/\\n/gu, "\n"));
    } else {
      console.log("\x1b[36m%s\x1b[0m", content);
    }
  }
}

module.exports = ChatService;
