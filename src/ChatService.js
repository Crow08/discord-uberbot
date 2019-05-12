class ChatService {
  constructor(options, discord, dbService, queueService) {
    this.options = options;
    this.discord = discord;
    this.dbService = dbService;
    this.queueService = queueService;
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

  displaySong(msg, song) {
    this.openRatingMenu(song, msg, (ratedSong) => {
      this.dbService.updateSongRating(ratedSong).
        then((rateResult) => {
          console.log(rateResult);
        }).
        catch((err) => console.log(err));
    });
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

  openRatingMenu(song, msg, processRating) {
    // Build choose menu.
    msg.channel.send(this.buildSongEmbed(song)).
      // Add reactions for page navigation.
      then((menuMsg) => menuMsg.react("⏫").then(() => menuMsg.react("⏬").then(() => {
        // Add listeners to reactions.
        const upReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏫" && user.id === msg.author.id,
          {"time": 120000}
        );
        const downReaction = menuMsg.createReactionCollector(
          (reaction, user) => reaction.emoji.name === "⏬" && user.id === msg.author.id,
          {"time": 120000}
        );
        upReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          ++song.rating;
          processRating(song);
          menuMsg.edit(this.buildSongEmbed(song));
          // Adds upvoted song to autoPlaylist
          this.queueService.getAutoPL().then((autoPL) => {
            console.log(autoPL);
            this.dbService.addSong(song, autoPL).then((result) => {
              console.log(result);
            });
          }).
            catch((err) => {
              this.simpleNote(msg.channel, err, this.msgType.FAIL);
            });
        });
        downReaction.on("collect", (reaction) => {
          reaction.remove(msg.author);
          --song.rating;
          processRating(song);
          menuMsg.edit(this.buildSongEmbed(song));
          // Removes song from autoplaylist if rating too bad
          if (song.rating <= -2) {
            this.dbService.removeSong(song.title, song.playlist).then((result) => {
              console.log(result);
            });
          }
        });
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
    const embed = new this.discord.RichEmbed();
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
