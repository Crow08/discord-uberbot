const voiceService = require("../VoiceService");
const streamSourceService = require("../StreamSourceService");

const {SlashCommandBuilder} = require("discord.js");
const {createAudioPlayer, createAudioResource} = require("@discordjs/voice");

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));

// All the walrus sounds
const sounds = [
  "https://cdn.discordapp.com/attachments/561903849330442261/1025746215528304680/Villager_deny3.mp3",
  "https://cdn.discordapp.com/attachments/561903849330442261/1025746215939362927/Villager_idle1.mp3",
  "https://cdn.discordapp.com/attachments/561903849330442261/1025746216258109491/Villager_idle2.mp3",
  "https://cdn.discordapp.com/attachments/561903849330442261/1025746216589475870/Villager_idle3.mp3",
  "https://cdn.discordapp.com/attachments/561903849330442261/1025746216996315196/Villager_deny2.mp3"
];

const run = (interaction) => {
  streamSourceService.rawFileService.getStream(sounds[getRandomInt(sounds.length)]).
    then((sfx) => {
      voiceService.getVoiceConnection(interaction).
        then((voiceConnection) => {
          const audioPlayer = createAudioPlayer();
          const audioResource = createAudioResource(sfx, {"inlineVolume": true});
          audioResource.volume.setVolume(voiceService.volume / 100);
          voiceConnection.subscribe(audioPlayer);
          audioPlayer.play(audioResource);
        });
    }).
    catch(((err) => console.log(err)));
  interaction.reply("Hmmm...");
  setTimeout(() => interaction.deleteReply(), 5000);
};


module.exports = {
  "data": new SlashCommandBuilder().
    setName("villager").
    setDescription("get the classy 'hmmm' minecraft experience"),
  async execute(interaction) {
    await run(interaction);
  },
  "scope": "A"
};
