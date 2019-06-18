### **TODO:** ###

---

### Features: ###

##### Queue #####
- implement smart insert in queue (Fair-Queuing / Round Robin)

##### Playlists #####
- .start command should clear queue and stop playback to be used while song is playing

##### Search #####
- Add a "did you mean"-feature for all failed searches with strings (closest name - Levenshtein distance / fuzzy search).

##### Misc #####
- Don´t refresh player when Bot is not in channel
- reboot-command
- join channel command (now useful for announcement functionality.)

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

##### Report all the Errors ####
- *`:x: | Error: input stream: No formats found with custom filter` -> (how to reproduce?)*

##### Feedback/Error/Misbehaviour - this one evening ####
- special chars in songnames (ghost'n stuff)