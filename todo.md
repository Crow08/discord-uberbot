### **TODO:** ###

---

### Features: ###

##### Playlists #####
- .start command should clear queue and stop playback to be used while song is playing
- remove song from playlist command has to use artist and title. 
- .ls should report if playlist wasn't found
	- bonus points: did you mean (closest name - Levenshtein / Fuzzy Search)?

##### Search #####
- search command followup to add song to playlist.
- improve search for youtube by choosing automatically from a small number for songs
	- disfavor songs with "cover" / "live" / "remix"
- say something, when "cancel" is used

---

#### Known Bugs: ####

##### Error handling #####
- catch all promises and process accordingly.
- catch all fatal errors to prevent bot crash.
- Notify user every time, even after unsuccessful execution.

##### Report all the Errors ####
- `Error [VOICE_PLAY_INTERFACE_BAD_TYPE]: Unknown stream type`
	- recreate:
		- try .start &lt;playlist&gt; for consistent error
- `:x: | Error: input stream: No formats found with custom filter`

##### Strange behavior #####
- sometimes in playback no sound is played while stream seems to be active.
	- can be solved via voice reconnect of the bot.
	- hard to reproduce reliable.
- sometimes in stream does not end even if song has ended playing.
	- can be solved via skip song.
	- hard to reproduce reliable.
- Stream ends immediately after start -> (fixed?)
	- can be solved via retry.
	- hard to reproduce reliable.
- Can't play because its "already playing" -> (fixed? / how to reproduce?)
	- workaround with .stop -> .play
