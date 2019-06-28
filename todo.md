### **TODO:** ###

---

### README.md ###
- Add announcement feature.
- Add some pictures (possibly gifs)

---

### Features: ###

##### Playlists #####
- .start command should clear queue and stop playback to be used while song is playing

##### Search #####
- Add a "did you mean"-feature for all failed searches with strings (closest name - Levenshtein distance / fuzzy search).

##### Misc #####
- reboot-command
- Ability to toggle user announcements on and off.
- User group to allow bot-interaction (protects from strangers and trolls)

##### Announcer #####

- .say "String"

- .sfx \<number>
	- list all numbers, if none given  
	1: Airhorn  
	2: Spaß Spaß Spaß  
	3: WC3 Voicelines (Das kann ich, Arbeit sit vollbracht, ich geh dann mal)  
	4: GLaDOS VoiceLines (https://theportalwiki.com/wiki/GLaDOS_voice_lines)  
	5: AOE 2 Voicelines (Yes, No, etc.)

- .joke
	- random joke

- .dadjoke
	- random dadjoke (god help us)

- .randomfact(takes first fact of this site)

```js
var http = require('http');

var options = {
    host: 'randomfactgenerator.net',
    path: '/'
}
var request = http.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
    console.log("request:");
    var array = data.split("id='z'");
    var line = array[1].substr(0, array[1].indexOf('<br'));
    line = line.replace('>','').replace('"','').replace('\\','')
    console.log(line);
    });
});
request.on('error', function (e) {
    console.log(e.message);
});
request.end();
```

---

### Known Bugs: ###

##### Error handling #####
- catch all promises and process accordingly.
- catch all fatal errors to prevent bot crash.
- Notify user every time, even after unsuccessful execution.

##### Strange behavior #####
- sometimes in playback no sound is played while stream seems to be active.
	- can be solved via voice reconnect of the bot.
	- hard to reproduce reliable.
- sometimes in stream does not end, when the song has ended playing.
	- can be solved via skip song.
	- hard to reproduce reliable.
