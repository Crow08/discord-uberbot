### **TODO:** ###

---

### Features: ###

##### Playlists #####
- .start command should clear queue and stop playback to be used while song is playing

##### Search #####
- Add a "did you mean"-feature for all failed searches with strings (closest name - Levenshtein distance / fuzzy search).

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

##### Report all the Errors ####
- `:x: | MongoError: ns not found`
	- native, non descriptive error when deleting a non existent playlist.
- *`Error [VOICE_PLAY_INTERFACE_BAD_TYPE]: Unknown stream type` -> (fixed?)*
	- *recreate: try .start &lt;playlist&gt; for consistent error*
- *`:x: | Error: input stream: No formats found with custom filter` -> (how to reproduce?)*

##### Feedback/Error/Misbehaviour - this one evening ####
- Upvote Song adds it to auto, but is allready auto -> weird chat
- special chars in songnames (ghost'n stuff)
- history shows each song 2 times
- .np creates additional empty field
- remove song from queue doesn´t give removed songname
- convert commands and payload to lowercase..always!
- .search listens to everyone. problem when multiple people use search simultaniously