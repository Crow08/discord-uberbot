### **TODO's:** ###

---

### Features: ###

##### Playlists #####
- merge playlist command
- add rating
	- implent autodelete
	- implement autoadd after upvote (to autoplaylist)
- add current queue to playlist
- add current song to playlist
- remove duplicates (dont delete songs with rating)
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