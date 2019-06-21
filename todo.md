### **TODO:** ###

---

### Features: ###

##### Queue #####
- implement smart insert in queue (Fair-Queuing / Round Robin)

##### Playlists #####
- .start command should clear queue and stop playback to be used while song is playing
- music.youtube is already supported...

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
- Bot crashes, when it announces player and the queue is empy
	-recreate: Start bot, leave, join, leave, join

##### Strange behavior #####
- sometimes in playback no sound is played while stream seems to be active.
	- can be solved via voice reconnect of the bot.
	- hard to reproduce reliable.
- sometimes in stream does not end, when the song has ended playing.
	- can be solved via skip song.
	- hard to reproduce reliable.
- frequent channel switches crash playback of bot
	- must be because of the announce messages
	- .stop -> .p to fix it

##### Report all the Errors ####
- *`:x: | Error: input stream: No formats found with custom filter` -> (how to reproduce?)*

##### Feedback/Error/Misbehaviour - this one evening ####
- special chars in songnames (ghost'n stuff)