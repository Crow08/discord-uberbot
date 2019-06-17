### **TODO:** ###

---

### Features: ###

##### Queue #####
- implement limit for max adds to queue (like .limit 10)

##### Playlists #####
- .start command should clear queue and stop playback to be used while song is playing

##### Search #####
- Add a "did you mean"-feature for all failed searches with strings (closest name - Levenshtein distance / fuzzy search).

##### Misc #####
- Voice-Message on join, take voiceline out of huge list of cool quotes
- Don´t refresh player when Bot is not in channel/when player is allready at bottom

---

#### Known Bugs: ####

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
- *Stream ends immediately after start -> (fixed?)*
	- *can be solved via retry.*
	- *hard to reproduce reliable.*
- *Can't play because its "already playing" -> (fixed? / how to reproduce?)*
	- *workaround with .stop -> .play*
- Bot will remember everything and spams chat after successfully joined
	- implement something that deletes cache
- Bot goes crazy, if you are not in a voice chanel, because it cant join
	- implement default channel to join

##### Report all the Errors ####
- *`Error [VOICE_PLAY_INTERFACE_BAD_TYPE]: Unknown stream type` -> (fixed?)*
	- *recreate: try .start &lt;playlist&gt; for consistent error*
- *`:x: | Error: input stream: No formats found with custom filter` -> (how to reproduce?)*

##### Feedback/Error/Misbehaviour - this one evening ####
- special chars in songnames (ghost'n stuff)