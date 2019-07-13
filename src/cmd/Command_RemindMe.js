const Command = require("./Command.js");

/**
 * Temporary class for testing commands.
 * @extends Command
 * @Category Commands
 */
class RemindMeCommand extends Command {

  /**
   * Constructor.
   * @param {VoiceService} voiceService - VoiceService.
   * @param {TTSService} ttsService - TTSService.
   */
  constructor(voiceService, ttsService) {
    super(
      ["remindme", "remind"],
      "let the bot remind you (must be today)",
      "<prefix>remindme 2h|23:20 time to go to bed"
    );
    this.ttsService = ttsService;
    this.voiceService = voiceService;
  }

  /**
   * Function to execute this command.
   * @param {String} payload - Payload from the user message with additional information.
   * @param {Message} msg - User message this function is invoked by.
   */
  run(payload, msg) {
    const timer = payload.split(" ")[0];
    const reminder = payload.substr(timer.length + 1);
    if (typeof payload === "undefined" || payload.length === 0 || payload.split(" ").length < 2) {
      this.say("A reminder is wasted on you, when you can´t even type the command correctly", msg);
      return;
    }
    // Check if time is valid
    const time = this.evaluateTimer(timer);
    if (time) {
      if (isNaN(time)) {
        // Say the witty error response that got returned
        this.say(time, msg);
      } else {
        // Everything alright, set reminder
        this.say(this.generateMessage(time), msg);
        setTimeout(
          () => {
            this.say(reminder, msg);
          },
          time
        );
      }
    } else {
      // Really wrong format
      this.say("What are you even trying?", msg);
    }
    msg.delete({"timeout": 10000});
  }

  say(payload, msg) {
    this.voiceService.getVoiceConnection(msg).
      then((voiceConnection) => {
        this.ttsService.announceMessage(payload, voiceConnection);
      }).
      catch((err) => console.log(err));
  }

  evaluateTimer(timer) {
    let time = this.checkPeriod(timer);
    if (time) {
      return (time);
    }
    time = this.checkDate(timer);
    if (time) {
      return (time);
    }
    return (false);
  }

  checkDate(time) {
    if (time.includes(":") && time.length === 5) {
      const hours = time.split(":")[0];
      const minutes = time.split(":")[1];
      if (hours < 24 && hours >= 0 && minutes < 60 && minutes >= 0) {
        // Date is valid - make date string
        const now = new Date(Date.now());
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = now.getFullYear();
        const month = months[now.getMonth()];
        const day = now.getDate();
        const date = Date.parse(`${day} ${month} ${year} ${hours}:${minutes}`);
        // Return time difference in ms
        return (date - now);
      }
      return ("What kind of clock are you using?");
    }
    // No check was successful, what shit did the user type?
    return (false);
  }

  checkPeriod(time) {
    this.time = time;
    if (this.time[this.time.length - 1] === "h") {
      this.time = this.time.slice(0, -1);
      if (isNaN(this.time)) {
        return ("How about you try with a number next time?");
      }
      return (this.time * 1000 * 60 * 60);
    }
    if (this.time[this.time.length - 1] === "m") {
      this.time = this.time.slice(0, -1);
      if (isNaN(this.time)) {
        return (`Ok, I will remind you in ${this.time} minutes. Wait what? Try that again.`);
      }
      return (this.time * 1000 * 60);
    }
    if (this.time[this.time.length - 1] === "s") {
      this.time = this.time.slice(0, -1);
      if (isNaN(this.time)) {
        return ("Numbers, do you know them?");
      }
      return (this.time * 1000);
    }
    return (false);
  }

  generateMessage(time) {
    if (time > (1000 * 60 * 60 * 6)) {
      return ("I can't remember things that long, I already forgot your name");
    }
    const timer = new Date(Date.now() + time);
    const hours = (`0${timer.getHours()}`).slice(-2);
    const minutes = (`0${timer.getMinutes()}`).slice(-2);
    const message = `Ok, I will remind you at ${hours}:${minutes}`;
    return (message);
  }
}
module.exports = RemindMeCommand;
