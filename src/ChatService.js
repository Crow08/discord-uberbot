/**
 * Class representing a chat service.
 */
class ChatService {

  /**
   * Constructor.
   * @param {MessageEmbed} DiscordMessageEmbed - Discord.js MessageEmbed class for creating rich embed messages.
   */
  constructor(DiscordMessageEmbed) {
    this.DiscordMessageEmbed = DiscordMessageEmbed;

    /** @property {Enum} msgType - Message Type for simple Note */
    this.msgType = {
      "FAIL": "fail",
      "INFO": "info",
      "MUSIC": "music",
      "SEARCH": "search"
    };
  }

  /**
   * Send a simple note to Discord with an emoji depending of the given message Type.
   * @param {Message} msg - User message this function is invoked by.
   * @param {string|Error} text - The text to be displayed in this note (can be of type Error).
   * @param {string} type - Message type defined by {@link ChatService#msgType}.
   */
  simpleNote(msg, text, type) {
    this.debugPrint(text);
    if (typeof msg.channel === "undefined") {
      return new Promise((resolve) => resolve({"delete": () => null}));
    }
    const ret = [];
    text.toString().split("\n").
      forEach((line) => {
        switch (type) {
        case this.msgType.INFO:
          ret.push(`:information_source: | ${line}`);
          return;
        case this.msgType.MUSIC:
          ret.push(`:musical_note: | ${line}`);
          return;
        case this.msgType.SEARCH:
          ret.push(`:mag: | ${line}`);
          return;
        case this.msgType.FAIL:
          ret.push(`:x: | ${line}`);
          return;
        default:
          ret.push(line);
        }
      });
    return msg.channel.send(ret.join("\n"));
  }

  /**
   * Send either plain text or a MessageEmbed in markdown style.
   * @see {@link https://discord.js.org/#/docs/main/master/class/MessageEmbed} MessageEmbed API.
   * @see {@link https://leovoel.github.io/embed-visualizer/} MessageEmbed previewer.
   * @param {Message} msg - User message this function is invoked by.
   * @param {string|MessageEmbed} content -The content to be sent as a discord message.
   */
  send(msg, content) {
    this.debugPrint(content);
    if (typeof msg.channel === "undefined") {
      return new Promise((resolve) => resolve({"delete": () => null}));
    }
    return msg.channel.send(content);
  }

  /**
   * Display paged content with reaction based navigation.
   * @param {Message} msg - User message this function is invoked by.
   * @param {string[]|MessageEmbed[]} pages - Pages to be displayed.
   */
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
          page = (page + 1) < pages.length ? ++page : 0;
          curPage.edit(pages[page]);
        });
        backReaction.on("collect", (reaction) => {
          reaction.users.remove(msg.author);
          page = (page > 0) ? --page : pages.length - 1;
          curPage.edit(pages[page]);
        });
        nextReaction.on("end", () => curPage.reactions.removeAll());
        backReaction.on("end", () => curPage.reactions.removeAll());
      }));
  }

  /**
   * Display a song in pretty markdown and add reaction based user rating.
   * @param {Message} msg - User message this function is invoked by.
   * @param {Song} song - Song to be displayed.
   * @param {function} processRating - Function to be invoked if rating was given.
   */
  displaySong(msg, song, processRating) {
    this.debugPrint(song);
    if (typeof msg.channel === "undefined") {
      return;
    }
    // Build Song embed.
    msg.channel.send(this.buildSongEmbed(song)).
      // Add reactions for song rating.
      then((songMsg) => this.postReactionEmojis(songMsg, ["👍", "👎"]).
        then(() => {
        // Add listeners to reactions.
          const reactionCollector = songMsg.createReactionCollector(
            (reaction, user) => (["👍", "👎"].includes(reaction.emoji.name) && (!user.bot)),
            {"time": 600000}
          );
          // Handle reactions.
          reactionCollector.on("collect", (reaction) => {
            switch (reaction.emoji.name) {
            case "👍":
              this.handleRatingReaction(reaction, song, 1, processRating);
              break;
            case "👎":
              this.handleRatingReaction(reaction, song, -1, processRating);
              break;
            default:
              break;
            }
          });
          reactionCollector.on("end", () => songMsg.reactions.removeAll());
        }));
  }

  /**
   * Display a song in pretty markdown and add reaction based user rating.
   * @param {Message} msg - User message this function is invoked by.
   * @param {Song} song - Song to be displayed.
   * @param {function} reactionFunctions - Function to be invoked if a reaction was given.
   */
  displayPlayer(msg, song, reactionFunctions) {
    this.debugPrint(song);
    if (typeof msg.channel === "undefined") {
      return new Promise((resolve) => resolve({"delete": () => null}));
    }
    // Build Song embed.
    return new Promise((resolve, reject) => msg.channel.send(this.buildSongEmbed(song)).
      // Add reactions for song rating.
      then((playerMsg) => this.postReactionEmojis(playerMsg, ["👍", "👎", "⏪", "⏯", "⏩", "⏹", "🔀", "🔁"]).
        then(() => {
        // Add listeners to reactions.
          const reactionCollector = playerMsg.createReactionCollector(
            (reaction, user) => (["👍", "👎", "⏪", "⏯", "⏩", "⏹", "🔀", "🔁"].includes(reaction.emoji.name) &&
              (!user.bot)),
            {"time": 600000}
          );
          // Handle reactions.
          reactionCollector.on("collect", (reaction) => {
            switch (reaction.emoji.name) {
            case "👍":
              this.handleRatingReaction(reaction, song, 1, reactionFunctions[reaction.emoji.name]);
              break;
            case "👎":
              this.handleRatingReaction(reaction, song, -1, reactionFunctions[reaction.emoji.name]);
              break;
            default:
              this.handleReaction(reaction, reactionFunctions[reaction.emoji.name]);
              break;
            }
          });
          reactionCollector.on("end", () => {
            if (!playerMsg.deleted) {
              playerMsg.delete();
              this.displayPlayer(msg, song, reactionFunctions);
            }
          });
          resolve(playerMsg);
        }).
        catch(reject)).
      catch(reject));
  }

  /**
   * Create a collector for messages and execute followup commands.
   * @param {Message} msg - User message this function is invoked by.
   * @param {function} filter - function to filter the collected messages and determine which ones should be processed.
   * @param {function} process - Function to be invoked if a message passed the filter.
   */
  awaitCommand(msg, filter, process) {
    msg.channel.awaitMessages(
      (resp) => resp.author.id === msg.author.id && filter(resp),
      {"errors": ["time"], "max": 1, "time": 120000}
    ).
      then(process).
      // Timeout or error.
      catch((err) => {
        if (err instanceof Error) {
          this.simpleNote(msg, err, this.msgType.FAIL);
          return;
        }
        const note = "Did you fell asleep? My attention span lasts only for 2 min... oh a kitten :heart_eyes:";
        this.simpleNote(msg, note, this.msgType.INFO);
      });
  }

  /**
   * React with an array of Emojis to a given message
   * @private
   * @param {Message} msg - User message this function is invoked by.
   * @param {string[]} emojiList Ordered list of emojis to post.
   */
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

  /**
   * Process reaction based user rating.
   * @private
   * @param {MessageReaction} reaction - given user reaction.
   * @param {Song} song - Song to be rated.
   * @param {number} delta - Delta rating score.
   * @param {function} processRating - Function to be invoked if rating was given.
   * @param {boolean} ignoreCd - Flag to indicate if the cooldown should be ignored.
   */
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

  /**
   * Process reactions.
   * @private
   * @param {MessageReaction} reaction - given user reaction.
   * @param {function} processFunction - Function to be invoked if rating was given.
   */
  handleReaction(reaction, processFunction) {
    reaction.users.filter((user) => !user.bot).forEach((user) => {
      reaction.users.remove(user);
      processFunction();
    });
  }

  /**
   * Build a MessageEmbed for a song with markdown.
   * @private
   * @param {Song} song - Song to be displayed.
   */
  buildSongEmbed(song) {
    const embed = new this.DiscordMessageEmbed();
    for (const key in song) {
      if (song[key] === "") {
        song[key] = "-";
      }
    }

    let source = "unknown source";
    source = song.src === "yt" ? "YouTube" : source;
    source = song.src === "sc" ? "SoundCloud" : source;
    source = song.src === "sp" ? "Spotify" : source;
    source = song.src === "raw" ? "raw file" : source;

    embed.setColor(890629);
    embed.addField("Title", `\`\`\`${song.title}\`\`\``);
    embed.addField("Artist", `\`\`\`${song.artist}\`\`\``, true);
    embed.addField("Source", `\`\`\`${source}\`\`\``, true);
    embed.addField("Requester", `\`\`\`${song.requester}\`\`\``, true);
    embed.addField("Rating", `\`\`\`DIFF\n${song.rating > 0 ? "+" : ""}${song.rating}\`\`\``, true);
    embed.addField("Playlist", `\`\`\`${song.playlist}\`\`\``, true);
    return embed;
  }

  /**
   * Print color coded debug information for all chat interactions to console log.
   * @private
   * @param {string|MessageEmbed|Error} content Content to be logged.
   */
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
