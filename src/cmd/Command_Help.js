const chatService = require("../ChatService");
const clientService = require("../ClientService");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");


/**
 * Word wrap a String, converting it to an array of strings with a maximum line length.
 * @private
 * @param {string} input - String to be wrapped.
 * @param {number} maxWidth - Maximum number of character per line.
 * @returns {string[]} String Array representing wrapped lines.
 */
const wordWrap = (input, maxWidth) => {
  const result = [];
  let str = input;
  while (str.length > maxWidth) {
    let found = false;
    // Break line at first whitespace of the line.
    for (let index = maxWidth - 1; index >= 0; index--) {
      if (str.charAt(index).
        match(/^\s$/u)) {
        result.push(str.slice(0, index));
        str = str.slice(index + 1);
        found = true;
        break;
      }
    }
    // Break line at maxWidth position, the word is too long to wrap.
    if (!found) {
      result.push(str.slice(0, maxWidth));
      str = str.slice(maxWidth);
    }
  }
  result.push(str);
  return result;
};

/**
 * Function to build a formatted row for the help text.
 * Row gets automatically wrapped and indented if its content is too long.
 * @private
 * @param {string} text - help text for row.
 * @returns {string} formatted string for row.
 */
const buildRow = (text) => {
  let line = "";
  let firstSubLine = true;
  const subLines = text.split("\n");
  subLines.forEach((rawSubLine) => {
    wordWrap(rawSubLine, firstSubLine ? 60 : 52).
      forEach((subLine) => {
        if (firstSubLine) {
          firstSubLine = false;
          line += `| ${subLine.padEnd(60, " ")} |\n`;
        } else {
          line += `|         ${subLine.padEnd(52, " ")} |\n`;
        }
      });
  });
  return line;
};

const run = (interaction) => {
  const embed = new EmbedBuilder();
  embed.setDescription("⠀\n⠀\n***Anyone called for a medic?***");
  embed.setColor("Red");
  embed.setThumbnail("https://cdn.discordapp.com/avatars/543844387835215873/baeabaa2290c3b584b4f771bf86ed5ca.png");
  chatService.send(interaction, embed);
  // Create help pages:
  const maxLines = 30; // 2000 chars per message limit from discord API (30*65 chars).
  let pages = [];
  let helpPage = "```prolog\n+----------------------------Commands--------------------------+\n";
  let helpText = "";
  clientService.baseClient.commands.forEach((command) => {
    helpText = "";
    const {description, name} = command.data;
    // Ignore undefined commands
    if (typeof name !== "undefined") {
      helpText += buildRow(`Name:  ${name}`);
      helpText += buildRow(`Description:  ${description}`);
      // Check if page is full.
      if (helpPage.split("\n").length + helpText.split("\n").length > maxLines) {
        helpPage = helpPage.substr(0, helpPage.length - 65); // Remove separation line to make room for paging.
        const paging = `Page ${pages.length + 1} / #MAX#`;
        helpPage += `+------------------------- ${paging} -------------------------+\n\`\`\``;
        pages.push(helpPage); // Add full page.
        helpPage = "```prolog\n+----------------------------Commands--------------------------+\n";
      }
      helpPage += `${helpText}+--------------------------------------------------------------+\n`;
    }
  });
  // Add last page.
  helpPage = helpPage.substr(0, helpPage.length - 65); // Remove separation line to make room for paging.
  const paging = `Page ${pages.length + 1} / #MAX#`;
  helpPage += `+------------------------- ${paging} -------------------------+\n\`\`\``;
  pages.push(helpPage); // Add last page.
  // Replace max page placeholder with the actual page count.
  pages = pages.map((page) => page.replace("#MAX#", pages.length));

  chatService.pagedContent(interaction, pages);
};

module.exports = {
  "data": new SlashCommandBuilder().
    setName("help").
    setDescription("list all implemented commands"),
  async execute(interaction) {
    await run(interaction);
  }
};
