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

- We need a system to order the sfx. Like a table, with groups (WC3, Portal, etc.)

- Voice some errors (caused by wrong input) through Announcer (for ultimate devastation)
    - maybe only user errors with announcer-bot (already added some)

- .joke
	- random joke

- .dadjoke
	- random dadjoke (god help us)

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
