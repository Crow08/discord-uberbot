### **TODO's:** ###

---

### Features: ###

##### Playlists #####
- add rating
	- skip song on downvote
- remove duplicates (dont delete songs with rating)
- method duplicate tester (checks playlist before adding song)
	- maybe extend addSong
- implement requester

##### Queue ##### 
- loop with options (song / queue / none)

##### Play song ##### 
- raw-MP3-support

---

#### Known Bugs: #### 

##### Error handling ##### 
- catch all promises and process accordingly. 
- catch all fatal errors to prevent bot crash.
- Notify user every time, even after unsuccessful execution.
- Error when Playback is finished (when autoplaylist isn't set)

##### Strange behavior ##### 
- sometimes in playback no sound is played while stream seems to be active.
	- can be solved via voice reconnect of the bot.
	- hard to reproduce reliable
- Stream ends immediately after start
	- can be solved via retry
	- hard to reproduce reliable

---

### Misc. ###

##### Availability ##### 
- host Database or DB + Bot. (openshift / heroku)