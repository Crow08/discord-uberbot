### **TODO's:** ###

---

### Features: ###

##### Playlists #####
- add rating
	- skip song on downvote (and skip on shit)
	- add are you sure on poop-emoji
- paging for list_songs (.ls &lt;playlist&gt;)
- .start command should clear queue and stop playback to be used while song is playing
- remove song from playlist command has to use artist and title. 

##### Queue #####
- loop with options (song / queue / none)

##### History #####
- show history
- replay sth from history
- paging for history

##### Search #####
- search command followup to add song to playlist.
- improve search for youtube by choosing automatically from a small number for songs
	- disfavor songs with "cover" / "live" / "remix"
- rewrite search menu to use pagedContent and awaitCommand instead of openSelectionMenu.

##### Play song #####
- raw-MP3-support

##### DB #####

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
- `TypeError: Cannot read property 'src' of undefined`
	- recreate:
		- .search
		- .p rockabye / or any other command like .add
- `:x: | Error: input stream: No formats found with custom filter`

##### needs reporting #####
- .search no feedback when add is used

##### Strange behavior #####
- .search + >> last page is empty
- sometimes in playback no sound is played while stream seems to be active.
	- can be solved via voice reconnect of the bot.
	- hard to reproduce reliable
- Stream ends immediately after start
	- can be solved via retry
	- hard to reproduce reliable

---

### Misc. ###

##### Structure #####
Combine GetAutoPLCommand and AutoPLCommand.

##### Dependencies #####
- replace "ytdl-core" with "ytdl-core-discord" https://www.npmjs.com/package/ytdl-core-discord
