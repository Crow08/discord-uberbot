const AddCommand = require("../cmd/Command_add");
const AddPLCommand = require("../cmd/Command_pl_add");
const AutoPLCommand = require("../cmd/Command_auto_pl");
const AddSongToPLCommand = require("../cmd/Command_add_song_to_pl");
const AddQueueToPLCommand = require("../cmd/Command_add_queue_to_pl");
const ClearCommand = require("../cmd/Command_clear");
const DeletePLCommand = require("../cmd/Command_pl_delete");
const HelpCommand = require("../cmd/Command_help");
const JoinCommand = require("../cmd/Command_join");
const LeaveCommand = require("../cmd/Command_leave");
const ListPLCommand = require("../cmd/Command_pl_list");
const LoadPLCommand = require("../cmd/Command_pl_load");
const LoopCommand = require("../cmd/Command_loop");
const MergePLCommand = require("../cmd/Command_pl_merge");
const ListSongsCommand = require("../cmd/Command_list_songs");
const NowPlayingCommand = require("../cmd/Command_now_playing");
const PauseCommand = require("../cmd/Command_pause");
const PlayCommand = require("../cmd/Command_play");
const PlayNextCommand = require("../cmd/Command_play_next");
const PreferredSrcCommand = require("../cmd/Command_preferred_src");
const RemoveCommand = require("../cmd/Command_remove");
const RemovePLCommand = require("../cmd/Command_pl_remove");
const RenamePLCommand = require("../cmd/Command_pl_rename");
const RenameSongCommand = require("../cmd/Command_rename_song");
const TestCommand = require("../cmd/Command_test");
const SearchCommand = require("../cmd/Command_search");
const SearchPLCommand = require("../cmd/Command_pl_search");
const SeekCommand = require("../cmd/Command_seek");
const ShowHistoryCommand = require("../cmd/Command_show_history");
const ShowQueueCommand = require("../cmd/Command_show_queue");
const ShuffleCommand = require("../cmd/Command_shuffle");
const SkipCommand = require("../cmd/Command_skip");
const StartCommand = require("../cmd/Command_pl_start");
const StopCommand = require("../cmd/Command_stop");
const UploadCommand = require("../cmd/_Command_upload._js");
const VolumeCommand = require("../cmd/Command_volume");

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
