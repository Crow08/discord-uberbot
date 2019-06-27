const AddCommand = require("../cmd/Command_Add");
const AddPLCommand = require("../cmd/Command_PL_Add");
const AutoPLCommand = require("../cmd/Command_AutoPL");
const AddSongToPLCommand = require("../cmd/Command_AddSongToPL");
const AddQueueToPLCommand = require("../cmd/Command_AddQueueToPL");
const ClearCommand = require("../cmd/Command_Clear");
const DeletePLCommand = require("../cmd/Command_PL_Delete");
const HelpCommand = require("../cmd/Command_Help");
const JoinCommand = require("../cmd/Command_Join");
const LeaveCommand = require("../cmd/Command_Leave");
const ListPLCommand = require("../cmd/Command_PL_List");
const LoadPLCommand = require("../cmd/Command_PL_Load");
const LoopCommand = require("../cmd/Command_Loop");
const MergePLCommand = require("../cmd/Command_PL_Merge");
const ListSongsCommand = require("../cmd/Command_List_Songs");
const NowPlayingCommand = require("../cmd/Command_NowPlaying");
const PauseCommand = require("../cmd/Command_Pause");
const PlayCommand = require("../cmd/Command_Play");
const PlayNextCommand = require("../cmd/Command_PlayNext");
const PreferredSrcCommand = require("../cmd/Command_PreferredSrc");
const RemoveCommand = require("../cmd/Command_Remove");
const RemovePLCommand = require("../cmd/Command_PL_Remove");
const RenamePLCommand = require("../cmd/Command_PL_Rename");
const RenameSongCommand = require("../cmd/Command_Rename_Song");
const TestCommand = require("../cmd/Command_Test");
const SearchCommand = require("../cmd/Command_Search");
const SearchPLCommand = require("../cmd/Command_PL_Search");
const SeekCommand = require("../cmd/Command_Seek");
const ShowHistoryCommand = require("../cmd/Command_ShowHistory");
const ShowQueueCommand = require("../cmd/Command_ShowQueue");
const ShuffleCommand = require("../cmd/Command_Shuffle");
const SkipCommand = require("../cmd/Command_Skip");
const StartCommand = require("../cmd/Command_Start");
const StopCommand = require("../cmd/Command_Stop");
const UploadCommand = require("../cmd/Command_Upload");
const VolumeCommand = require("../cmd/Command_Volume");

const commands = [
  new AddCommand(),
  new AddPLCommand(),
  new AutoPLCommand(),
  new AddSongToPLCommand(),
  new AddQueueToPLCommand(),
  new ClearCommand(),
  new DeletePLCommand(),
  new JoinCommand(),
  new HelpCommand(),
  new LeaveCommand(),
  new ListPLCommand(),
  new ListSongsCommand(),
  new LoadPLCommand(),
  new LoopCommand(),
  new MergePLCommand(),
  new NowPlayingCommand(),
  new PauseCommand(),
  new PlayCommand(),
  new PlayNextCommand(),
  new PreferredSrcCommand(),
  new RemoveCommand(),
  new RemovePLCommand(),
  new RenamePLCommand(),
  new RenameSongCommand(),
  new SearchCommand(),
  new SearchPLCommand(),
  new SeekCommand(),
  new ShowHistoryCommand(),
  new ShowQueueCommand(),
  new ShuffleCommand(),
  new SkipCommand(),
  new StartCommand(),
  new StopCommand(),
  new TestCommand(),
  new UploadCommand(),
  new VolumeCommand()
];

const wordWrap = (input, maxWidth) => {
  const result = [];
  let str = input;
  while (str.length > maxWidth) {
    let found = false;
    // Break line at first whitespace of the line.
    for (let index = maxWidth - 1; index >= 0; index--) {
      if (str.charAt(index).match(/^\s$/u)) {
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

const buildRow = (text) => {
  let line = "";
  let firstSubLine = true;
  const subLines = text.split("\n");
  subLines.forEach((rawSubLine) => {
    wordWrap(rawSubLine, firstSubLine ? 60 : 52).forEach((subLine) => {
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

// Create commands Table:
let tableText = "```prolog\n+----------------------------Commands--------------------------+\n";
commands.forEach((command) => {
  const {help, usage, alias} = command;
  // Ignore undefined commands
  if (typeof alias !== "undefined" && !alias.includes("test")) {
    tableText += buildRow(`Alias:  ${alias.join(", ")}`);
    tableText += buildRow(`Usage:  ${usage.replace("<prefix>", "!")}`);
    tableText += buildRow(`About:  ${help}`);
    tableText += "+--------------------------------------------------------------+\n";
  }
});
tableText += "```";
console.log(tableText);
