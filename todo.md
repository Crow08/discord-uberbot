### **TODO:** ###

---

### README.md ###

- Add some pictures (possibly gifs)

---

### Features: ###

##### Playlists #####

##### Search #####
- Add a "did you mean"-feature for all failed searches with strings (closest name - Levenshtein distance / fuzzy search).

##### Misc #####
- reboot-command
- Ability to toggle user announcements on and off.
- User group to allow bot-interaction (protects from strangers and trolls)

##### Announcer #####
- more SFX?

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
