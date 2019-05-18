### **TODO's:** ###

---

### Features: ###

##### Playlists #####
- add rating
	- skip song on downvote (and skip on shit)
	- add are you sure on poop-emoji
- paging for list_songs (.ls <playlist>)

##### Queue ##### 
- loop with options (song / queue / none)
- shuffle playback (useful for auto playlists, which cant be shuffled)

#### History ####
- show history
- replay sth from history

##### Play song ##### 
- raw-MP3-support

##### Misc #####
- add cooldown for ALL commands!

---

#### Known Bugs: #### 

##### Error handling ##### 
- catch all promises and process accordingly. 
- catch all fatal errors to prevent bot crash.
- Notify user every time, even after unsuccessful execution.

##### Report all the Errors ####

##### needs reporting #####

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