const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require("discord.js");
const {ButtonStyle} = require("discord-api-types/v10");
const queueService = require("./QueueService");
const {
  createAudioPlayer,
  AudioPlayerStatus
} = require("@discordjs/voice");

/**
 * Class representing a chat service.
 */
class ChatService {

  init(settings) {
    this.playerMsgs = new Map();
    this.defaultTextChannel = settings.defaultTextChannel;

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
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   * @param {string|Error} text - The text to be displayed in this note (can be of type Error).
   * @param {string} type - Message type defined by {@link ChatService#msgType}.
   */
  simpleNote(interaction, text, type, reply = false) {
    this.debugPrint(text);
    if (typeof interaction.channel === "undefined") {
      return this.buildDummyMessage();
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
    return reply ? interaction.reply(ret.join("\n")) : interaction.channel.send(ret.join("\n"));
  }

  /**
   * Send either plain text or a MessageEmbed in markdown style.
   * @see {@link https://discord.js.org/#/docs/main/master/class/MessageEmbed} MessageEmbed API.
   * @see {@link https://leovoel.github.io/embed-visualizer/} MessageEmbed previewer.
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   * @param {string|MessageEmbed} content -The content to be sent as a discord message.
   */
  send(interaction, content) {
    this.debugPrint(content);
    if (typeof interaction.channel === "undefined") {
      return this.buildDummyMessage();
    }
    if (typeof content === "string") {
      return interaction.channel.send(content);
    }
    return interaction.channel.send({"embeds": [content]});


  }

  /**
   * Display paged content with reaction based navigation.
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   * @param {string[]|MessageEmbed[]} pages - Pages to be displayed.
   */
  pagedContent(interaction, pages) {
    this.debugPrint(pages);
    if (typeof interaction.channel === "undefined") {
      return this.buildDummyMessage();
    }
    return new Promise((resolve, reject) => {
      let page = 0;
      // Build choose menu.
      let content = {"content": pages[0]};
      if (typeof pages[0] !== "string") {
        content = {"embeds": [pages[0]]};
      }
      content.components = [
        new ActionRowBuilder().
          addComponents(new ButtonBuilder().
            setCustomId("bwd").
            setLabel("⏪").
            setStyle(ButtonStyle.Primary),
          new ButtonBuilder().
            setCustomId("fwd").
            setLabel("⏩").
            setStyle(ButtonStyle.Primary)
          )
      ];
      interaction.channel.send(content).
        // Add reactions for page navigation.
        then((curPage) => {
          // Add listeners to reactions.
          const reactionCollector = curPage.createMessageComponentCollector({"filter":
              (btnInteraction) => (["bwd", "fwd"].includes(btnInteraction.customId) &&
                btnInteraction.user.id === interaction.user.id), "time": 120000});
          // Handle reactions.
          reactionCollector.on("collect", (btnInteraction) => {
            switch (btnInteraction.customId) {
            case "bwd":
              page = (page > 0) ? --page : pages.length - 1;
              break;
            case "fwd":
              page = (page + 1) < pages.length ? ++page : 0;
              break;
            default:
              break;
            }
            curPage.edit(pages[page]);
            btnInteraction.deferUpdate();
          });
          // Timeout.
          reactionCollector.on("end", () => curPage.reactions.removeAll());
          resolve(curPage);
        }).
        catch(reject);
    });
  }

  /**
   * Display a song in pretty markdown and add reaction based user rating.
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   * @param {Song} song - Song to be displayed.
   * @param {function} processRating - Function to be invoked if rating was given.
   */
  displaySong(interaction, song, processRating) {
    this.debugPrint(song);
    if (typeof interaction.channel === "undefined") {
      return this.buildDummyMessage();
    }
    const {downVoteEmojiId, downVoteEmojiName, upVoteEmojiId, upVoteEmojiName} = this.getRatingEmojis(interaction);
    return new Promise((resolve, reject) => {
    // Build Song embed.
      interaction.channel.send(this.buildSongEmbed(song)).
        // Add reactions for song rating.
        then((songMsg) => this.postReactionEmojis(songMsg, [upVoteEmojiId, downVoteEmojiId]).
          then(() => {
          // Add listeners to reactions.
            const reactionCollector = songMsg.createReactionCollector(
              (reaction, user) => ([upVoteEmojiName, downVoteEmojiName].includes(reaction.emoji.name) && (!user.bot)),
              {"time": 600000}
            );
            // Handle reactions.
            reactionCollector.on("collect", (reaction) => {
              switch (reaction.emoji.name) {
              case upVoteEmojiName:
                this.handleRatingReaction(reaction, song, 1, processRating);
                break;
              case downVoteEmojiName:
                this.handleRatingReaction(reaction, song, -1, processRating);
                break;
              default:
                break;
              }
            });
            reactionCollector.on("end", () => songMsg.reactions.removeAll());
            resolve(songMsg);
          }).
          catch(reject)).
        catch(reject);
    });
  }

  /**
   * Display a song in pretty markdown and add reaction based user rating.
   * @param {ChatInputCommandInteraction} interaction- User message this function is invoked by.
   * @param {Song} song - Song to be displayed.
   * @param {function} reactionFunc - Function to be invoked if a reaction was given.
   */
  updatePlayer(interaction, song, reactionFunc) {
    this.debugPrint(song);
    if (typeof interaction.channel === "undefined") {
      return this.buildDummyMessage();
    }
    const {downVoteEmojiId, downVoteEmojiName, upVoteEmojiId, upVoteEmojiName} = this.getRatingEmojis(interaction);
    // Build Song embed.
    return new Promise((resolve, reject) => {
      const content = {"embeds": [this.buildSongEmbed(song)]};
      content.components = [
        new ActionRowBuilder().
          addComponents(new ButtonBuilder().
            setCustomId(upVoteEmojiName).
            setEmoji(upVoteEmojiId).
            setStyle(ButtonStyle.Primary),
          new ButtonBuilder().
            setCustomId(downVoteEmojiName).
            setEmoji(downVoteEmojiId).
            setStyle(ButtonStyle.Primary)
          ),
        new ActionRowBuilder().
          addComponents(
            new ButtonBuilder().
              setCustomId("⏪").
              setLabel("⏪").
              setStyle(ButtonStyle.Primary),
            new ButtonBuilder().
              setCustomId("⏯").
              setLabel("⏯").
              setStyle(ButtonStyle.Primary),
            new ButtonBuilder().
              setCustomId("⏩").
              setLabel("⏩").
              setStyle(ButtonStyle.Primary),
            new ButtonBuilder().
              setCustomId("🔀").
              setLabel("🔀").
              setStyle(ButtonStyle.Primary),
            new ButtonBuilder().
              setCustomId("🔁").
              setLabel("🔁").
              setStyle(ButtonStyle.Primary)
          )
      ];
      const oldPlayerMsg = this.getPlayerMsg(interaction);
      if (oldPlayerMsg === null) {
        interaction.channel.send(content).
          // Add reactions for song rating.
          then((playerMsg) => {
            this.playerMsgs.set(interaction.guild.id, playerMsg);
            this.addBtnListener(interaction, downVoteEmojiName, upVoteEmojiName, reactionFunc);
          }).
          catch(console.error);
      } else {
        oldPlayerMsg.edit(content);
      }
    });
  }

  /**
   * Add Reaction controls to player and refreshes listener recursively until message is destroyed.
   * @private
   * @param {ChatInputCommandInteraction} interaction - Player Messages the Reactions are attached to.
   * @param {string} downVoteEmojiName - name of the custom upvote emoji.
   * @param {string} upVoteEmojiName - name of the custom upvote emoji.
   * @param {function} reactionFunctions - Function to be invoked if a reaction was given.
   */
  addBtnListener(interaction, downVoteEmojiName, upVoteEmojiName, reactionFunctions) {
    const btnIds = [downVoteEmojiName, upVoteEmojiName, "⏪", "⏯", "⏩", "🔀", "🔁"];
    const btnCollector = this.getPlayerMsg(interaction).createMessageComponentCollector({"filter":
        (btnInteraction) => btnIds.includes(btnInteraction.customId), "time": 120000});
    // Handle reactions.
    btnCollector.on("collect", (btnInteraction) => this.handleBtnAction(
      btnInteraction,
      downVoteEmojiName,
      upVoteEmojiName,
      reactionFunctions
    ));
    btnCollector.on("end", () => {
      this.addBtnListener(interaction, downVoteEmojiName, upVoteEmojiName, reactionFunctions);
    });
  }

  handleBtnAction(interaction, downVoteEmojiName, upVoteEmojiName, reactionFunctions){
    switch (interaction.customId) {
    case downVoteEmojiName:
      this.handleRatingReaction(interaction, -1, reactionFunctions["👎"]);
      break;
    case upVoteEmojiName:
      this.handleRatingReaction(interaction, 1, reactionFunctions["👍"]);
      break;
    default:
      if (typeof reactionFunctions[interaction.customId] !== "undefined") {
        this.handleReaction(reactionFunctions[interaction.customId]);
      }
      break;
    }
    interaction.deferUpdate();
  }

  /**
   * Function to get a tuple of voting emoji names and IDs with defaults (👍/👎).
   * @todo make custom emojis configurable.
   * @private
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   */
  getRatingEmojis(interaction) {
    let upVoteEmojiId = "👍";
    let upVoteEmojiName = "👍";
    const upVoteEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "sparkle_heart");
    if (typeof upVoteEmoji !== "undefined") {
      upVoteEmojiId = upVoteEmoji.id;
      upVoteEmojiName = upVoteEmoji.name;
    }
    let downVoteEmojiId = "👎";
    let downVoteEmojiName = "👎";
    const downVoteEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "turd");
    if (typeof downVoteEmoji !== "undefined") {
      downVoteEmojiId = downVoteEmoji.id;
      downVoteEmojiName = downVoteEmoji.name;
    }
    return {downVoteEmojiId, downVoteEmojiName, upVoteEmojiId, upVoteEmojiName};
  }

  /**
   * Create a collector for messages and execute followup commands.
   * @param {ChatInputCommandInteraction} interaction - User message this function is invoked by.
   * @param {function} filter - function to filter the collected messages and determine which ones should be processed.
   * @param {function} process - Function to be invoked if a message passed the filter.
   * @param {function} timeout - Function to be invoked if a timeout occurs.
   */
  awaitCommand(interaction, filter, process, timeout = () => null) {
    interaction.channel.awaitMessages(
      (resp) => resp.author.id === interaction.user.id && filter(resp),
      {"errors": ["time"], "max": 1, "time": 120000}
    ).
      then(process).
      // Timeout or error.
      catch((err) => {
        if (err instanceof Error) {
          this.simpleNote(interaction, err, this.msgType.FAIL);
          return;
        }
        timeout();
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
  handleRatingReaction(reaction, delta, processRating, ignoreCd = false) {
    reaction.users.cache.filter((user) => !user.bot).forEach((user) => {
      reaction.users.cache.delete(user);
      queueService.getCurrentSong().then((song) => {
        processRating(song, user, delta, ignoreCd).
          then((note) => {
            reaction.message.edit(this.buildSongEmbed(song));
            if (note) {
              this.simpleNote(reaction.message, note, this.msgType.MUSIC);
            }
          }).
          catch((err) => this.simpleNote(reaction.message, err, this.msgType.FAIL));
      });
    });
  }

  /**
   * Process reactions.
   * @private
   * @param {function} processFunction - Function to be invoked if rating was given.
   */
  handleReaction(processFunction) {
    processFunction();
  }

  /**
   * Build a MessageEmbed for a song with markdown.
   * @private
   * @param {Song} song - Song to be displayed.
   */
  buildSongEmbed(song) {
    const embed = new EmbedBuilder();
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
    embed.addFields(
      {"name": "Title", "value": `\`\`\`${song.title}\`\`\``},
      {"inline": true, "name": "Artist", "value": `\`\`\`${song.artist}\`\`\``},
      {"inline": true, "name": "Source", "value": `\`\`\`${source}\`\`\``},
      {"inline": true, "name": "Requester", "value": `\`\`\`${song.requester}\`\`\``},
      {"inline": true, "name": "Rating", "value": `\`\`\`DIFF\n${song.rating > 0 ? "+" : ""}${song.rating}\`\`\``},
      {"inline": true, "name": "Playlist", "value": `\`\`\`${song.playlist}\`\`\``}
    );
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

  /**
   * Build a dummy message to prevent crashes when executing commands from the console.
   * @private
   */
  buildDummyMessage() {
    return new Promise((resolve) => {
      resolve({"delete": () => null});
    });
  }

  getPlayerMsg(interaction) {
    if (this.playerMsgs.has(interaction.guild.id)) {
      return this.playerMsgs.get(interaction.guild.id);
    }
    return null;
  }
}

module.exports = new ChatService();
