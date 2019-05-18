### **TODO's:** ###

---

### Features: ###

##### Playlists #####
- add rating
	- skip song on downvote (and skip on shit)
	- add are you sure on poop-emoji
- paging for list_songs (.ls <playlist>)

##### Queue ##### 
- loop with options (song / queue / none)
- shuffle playback (useful for autoplaylists, which cant be shuffled)

##### Play song ##### 
- raw-MP3-support

##### Misc #####
- add doSth-Command start (load playlist and play - just sth to start the music in a lazy way)
- sort commands in services alphabetical
- add cooldown for ALL commands!

---

#### Known Bugs: #### 

##### Error handling ##### 
- catch all promises and process accordingly. 
- catch all fatal errors to prevent bot crash.
- Notify user every time, even after unsuccessful execution.

##### Report all the Errors ####
- Error: `Error: [object Object]`
	- Cause/reproduce: when adding a song
- Error: `Error [VOICE_PLAY_INTERFACE_BAD_TYPE]: Unknown stream type
    at VoiceConnection.play (E:\Bot\discord-uberbot\node_modules\discord.js\src\client\voice\util\PlayInterface.js:84:11)
    at getVoiceConnection.then (E:\Bot\discord-uberbot\src\VoiceService.js:24:66)
    at process._tickCallback (internal/process/next_tick.js:68:7)`
	- Cause/reproduce:
		- when skipping last song into autoplaylist
		- .p on active autoplaylist
		- .s active autoplaylist song
		-
- Error: `(node:4764) UnhandledPromiseRejectionWarning: RangeError: Source is too large
    at Uint16Array.set (<anonymous>)
    at OpusScript.encode (E:\Bot\discord-uberbot\node_modules\opusscript\index.js:51:16)
    at Encoder._encode (E:\Bot\discord-uberbot\node_modules\prism-media\src\opus\Opus.js:54:25)
    at Encoder._transform (E:\Bot\discord-uberbot\node_modules\prism-media\src\opus\Opus.js:137:30)
    at Encoder.Transform._read (_stream_transform.js:190:10)
    at Encoder.Transform._write (_stream_transform.js:178:12)
    at doWrite (_stream_writable.js:410:12)
    at writeOrBuffer (_stream_writable.js:394:5)
    at Encoder.Writable.write (_stream_writable.js:294:11)
    at VolumeTransformer.ondata (_stream_readable.js:689:20)
    at VolumeTransformer.emit (events.js:189:13)
    at addChunk (_stream_readable.js:284:12)
    at readableAddChunk (_stream_readable.js:265:11)
    at VolumeTransformer.Readable.push (_stream_readable.js:220:10)
    at VolumeTransformer.Transform.push (_stream_transform.js:151:32)
    at VolumeTransformer._transform (E:\Bot\discord-uberbot\node_modules\prism-media\src\core\VolumeTransformer.js:78:10)
    at VolumeTransformer.Transform._read (_stream_transform.js:190:10)
    at VolumeTransformer.Transform._write (_stream_transform.js:178:12)
    at doWrite (_stream_writable.js:410:12)
    at writeOrBuffer (_stream_writable.js:394:5)
    at VolumeTransformer.Writable.write (_stream_writable.js:294:11)
    at Socket.ondata (_stream_readable.js:689:20)
	(node:4764) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch
	block, or by rejecting a promise which was not handled with .catch(). (rejection id: 3)`
	- Cause/reproduce: 
		- .p dangerous
		- .p heart afire
		- .p tried again, couldn't reproduce O_o

##### needs reporting #####
- autopl not found (is there, but `Cannot send an empty message`)
- plload not found (no error at all, despite non-existant pl)

##### Strange behavior ##### 
- sometimes in playback no sound is played while stream seems to be active.
	- can be solved via voice reconnect of the bot.
	- hard to reproduce reliable
- Stream ends immediately after start
	- can be solved via retry
	- hard to reproduce reliable
- Stream ends, Bot leaves Chat
	- .p new song on allready playing song

---

### Misc. ###

##### Availability ##### 
- host Database or DB + Bot. (openshift / heroku)