const request = require("request");
const {Readable} = require("stream");

/**
 * Class representing a text to speech service.
 */
class TTSService {

  constructor(ttsApiKey) {
    this.ttsApiKey = ttsApiKey;
  }

  /**
   *  Get text to Speech stream for given text.
   * @param {string} text text to convert
   */
  getStream(text) {
    return new Promise((resolve, reject) => {
      request.post({
        "body": `{"input":{"text":"${text}"},` +
          "\"voice\":{\"languageCode\":\"en-US\",\"name\":\"en-US-Wavenet-F\"}," +
          "\"audioConfig\":{\"audioEncoding\":\"OGG_OPUS\",\"pitch\":0,\"speakingRate\":1}}",
        "headers": {"content-type": "text/plain"},
        "url": "https://texttospeech.googleapis.com/v1beta1/text:synthesize?" +
          `key=${this.ttsApiKey}`
      }, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        const content = JSON.parse(body);
        if (typeof content.audioContent === "undefined") {
          return reject(new Error("Audio content not found!"));
        }
        const buff = Buffer.from(content.audioContent, "base64");
        const stream = new Readable();
        stream.push(buff);
        stream.push(null);
        return resolve(stream);
      });
    });
  }
}

module.exports = TTSService;
