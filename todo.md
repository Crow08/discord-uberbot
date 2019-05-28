### **TODO's:** ###

---

### Features: ###

##### Playlists #####
- add rating
	- skip song on downvote (and skip on shit)
	- add are you sure on poop-emoji
- paging for list_songs (.ls &lt;playlist&gt;)
- .start command should clear queue and stop playback to be used while song is playing

##### Queue #####
- loop with options (song / queue / none)

##### History #####
- show history
- replay sth from history
- paging for history

##### Search #####
- add song to playlist

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
- **ffmpeg-binaries@4.0.0** -> **decompress-tarxz@2.1.1** -> lzma-native@3.0.8 -> node-pre-gyp@0.6.39  
has vulnerabilities because it is bundling outdated modules (needed for encoding non opus codecs)  
fixed at: lzma-native@>=4.0.0 -> node-pre-gyp@>=0.7.0
