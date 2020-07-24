# **Discord-UberBot** #

[![version](https://img.shields.io/github/package-json/v/Crow08/discord-uberbot.svg)](/package.json)
[![dependencies](https://david-dm.org/Crow08/discord-uberbot.svg)](/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/Crow08/discord-uberbot/badge.svg)](https://snyk.io/test/github/Crow08/discord-uberbot)
[![license](https://img.shields.io/github/license/Crow08/discord-uberbot.svg)](/LICENSE.md)  
The UberBot is fully charged with music bot goodness! A feature rich bot for playing music and only that.

---

### Remarkable Features: ###

- Can play songs from many sources:
  - SoundCloud links (tracks / playlists) or search queries.
  - YouTube links (tracks / playlists) or search queries.
  - From direct links to music files.
  - Spotify can only be used for resolving links (tracks / playlists) or to query search for songs.  
  (no music streaming from Spotify atm)

- Persistent playlists:
  - Create as many playlist as you like.
  - Automatic prevention of duplicate songs in a playlists.
  - Set one playlist as a fallback auto playlist, to never stop the music!

- Rating system:
  - All songs can be rated once a day by each user.
  - A downvoted song gets skipped immediately.
  - If a songs rating falls below -2 it gets removed entirely.
  - If a song gets upvoted it will be added to the defined auto playlist.

- Import songs
  - Import songs by uploading txt files with links or queries oer line.
  - Import songs via csv file to additional define the exact title and artist of the song.
  
### Announcer: ###
- Brings some sweet robotic voice to your server. Uses WaveNets Text-to-Speech
- Disabled in default bot, because announcing sth will pause the current song and skip it afterwards, can be activated though.
- Best to be run standalone in another instance as extra bot (Paramter to be added)

#### Features ####
- Announces joining users with some witty voicelines
- Comments on users that dare to leave
- \<prefix\>say - Says everything you want it to say
- \<prefix\>randomfact - tells you a random fact
- \<prefix\>yomama - cracks a random Yo Mama joke
- \<prefix\>pickupline - provides you a random pickupline

---

### Full Command List ###

```prolog
+----------------------------Commands--------------------------+
| Alias:  add, a                                               |
| Usage:  !add <url | query>                                   |
| About:  add a song to the current queue by url or query.     |
+--------------------------------------------------------------+
| Alias:  pladd                                                |
| Usage:  !pladd <pl name> <url | query>                       |
| About:  add a song to the specified playlist by url or       |
|         query.                                               |
+--------------------------------------------------------------+
| Alias:  autopl, apl, auto                                    |
| Usage:  !autopl [<playlist name>|"unset"]                    |
| About:  get or set a playlist name to be the auto playlist.  |
|         (playlist name to set, no parameter to get and       |
|         "unset" to unset).                                   |
+--------------------------------------------------------------+
| Alias:  addsongtopl, as2pl, as2p                             |
| Usage:  !addsongtopl <playlist>                              |
| About:  adds current song to given playlist                  |
+--------------------------------------------------------------+
| Alias:  addqueuetopl, aq2pl, aq2p                            |
| Usage:  !addqueuetopl <playlist>                             |
| About:  adds queue to given playlist                         |
+--------------------------------------------------------------+
| Alias:  clear                                                |
| Usage:  !clear                                               |
| About:  delete all songs from current queue.                 |
+--------------------------------------------------------------+
| Alias:  pldelete                                             |
| Usage:  !pldelete <pl name>                                  |
| About:  deletes a playlist permanently.                      |
+--------------------------------------------------------------+
| Alias:  join                                                 |
| Usage:  !join                                                |
| About:  ask bot nicely to join your channel                  |
+--------------------------------------------------------------+
| Alias:  help, ?, medic                                       |
| Usage:  !help                                                |
| About:  list all implemented commands                        |
+--------------------------------------------------------------+
| Alias:  leave                                                |
| Usage:  !leave                                               |
| About:  leave the current voice channel.                     |
+--------------------------------------------------------------+
| Alias:  pllist, l                                            |
| Usage:  !pllist                                              |
| About:  lists available playlists                            |
+--------------------------------------------------------------+
| Alias:  listsongs, ls                                        |
| Usage:  !listsongs <playlist>                                |
| About:  lists all songs of the specified playlist            |
+--------------------------------------------------------------+
| Alias:  plload                                               |
| Usage:  !plload <pl name>                                    |
| About:  load a playlist replacing the current queue.         |
+--------------------------------------------------------------+
| Alias:  loop                                                 |
| Usage:  !loop [1]                                            |
| About:  toggle loop mode of the queue.                       |
|         add 1 to loop only the current song.                 |
+--------------------------------------------------------------+
| Alias:  plmerge, merge                                       |
| Usage:  !merge <sourcepl> <targetpl>                         |
| About:  copies one playlist into another!                    |
+--------------------------------------------------------------+
| Alias:  nowplaying, np                                       |
| Usage:  !nowplaying                                          |
| About:  returns first song in history (current song)         |
+--------------------------------------------------------------+
| Alias:  pause                                                |
| Usage:  !pause                                               |
| About:  pause current playback.                              |
+--------------------------------------------------------------+
| Alias:  play, p                                              |
| Usage:  !play <url | query>                                  |
| About:  play a song by url or query.                         |
+--------------------------------------------------------------+
| Alias:  playnext, pn                                         |
| Usage:  !playnext <queue position>                           |
| About:  moves song at given position to top                  |
+--------------------------------------------------------------+
| Alias:  preferdsrc, searchsrc, src                           |
| Usage:  !preferdsrc [yt|sc|sp]                               |
| About:  set a source to be the default source for all        |
|         searches.                                            |
|         (valid sources to set are:                           |
|         "yt":youtube,"sc":soundcloud,"sp":spotify.           |
|         no parameter to get current source)                  |
+--------------------------------------------------------------+
| Alias:  remove                                               |
| Usage:  !remove <queue number>                               |
| About:  removes a song from the current queue.               |
+--------------------------------------------------------------+
| Alias:  plremove, plrm                                       |
| Usage:  !plremove <pl name> <song name>                      |
| About:  remove given song from given playlist                |
+--------------------------------------------------------------+
| Alias:  plrename, rename                                     |
| Usage:  !rename <playlist> <new name>                        |
| About:  renames given playlist                               |
+--------------------------------------------------------------+
| Alias:  rename, renamesong, r                                |
| Usage:  !rename <"t"|"a"> <playlist name> <song number>      |
|         <new name>                                           |
| About:  rename title or artist of song.                      |
|         (first parameter "t" for title and "a" for artist.)  |
+--------------------------------------------------------------+
| Alias:  search                                               |
| Usage:  !search <query>                                      |
|         => "cancel" |                                        |
|         ["play"|"add"] <song number> |                       |
|          "pladd" <pl name> <song number>                     |
| About:  search for a song and choose from multiple results.  |
+--------------------------------------------------------------+
| Alias:  plsearch, pls                                        |
| Usage:  !plsearch <pl name> <song name>                      |
| About:  search given song in given playlist                  |
+--------------------------------------------------------------+
| Alias:  seek                                                 |
| Usage:  !seek <number>                                       |
| About:  seek playback position.                              |
+--------------------------------------------------------------+
| Alias:  showhistory, h, history                              |
| Usage:  !showhistory                                         |
| About:  displays all songs from current history.             |
+--------------------------------------------------------------+
| Alias:  showqueue, q, queue                                  |
| Usage:  !showqueue                                           |
| About:  displays all songs from current queue.               |
+--------------------------------------------------------------+
| Alias:  shuffle                                              |
| Usage:  !shuffle                                             |
| About:  shuffle the current queue.                           |
+--------------------------------------------------------------+
| Alias:  skip, s                                              |
| Usage:  !skip                                                |
| About:  skip current song.                                   |
+--------------------------------------------------------------+
| Alias:  start                                                |
| Usage:  !start <pl name>                                     |
| About:  loads a playlist shuffles it and starts playing.     |
+--------------------------------------------------------------+
| Alias:  stop                                                 |
| Usage:  !stop                                                |
| About:  stop current playback.                               |
+--------------------------------------------------------------+
| Alias:  upload                                               |
| Usage:  !upload [<playlist name>]                            |
|         => attach file to the message                        |
|         txt files with a query each row or csv files with 3  |
|         columns per row <query>;<artist>;<title>             |
| About:  add a songs from a file to the queue or to a         |
|         playlist.                                            |
+--------------------------------------------------------------+
| Alias:  volume, vol, v                                       |
| Usage:  !volume <number>                                     |
| About:  sets volume, or returns volume if no parameter given |
+--------------------------------------------------------------+
```

---

### Installation: ###

1. Install node (with npm >= 10) and mongodb on the host computer.
2. Install git
3. Run `npm install` in the project directory.  
(On Windows you may need to install [windows build tools](https://www.npmjs.com/package/windows-build-tools) first: `npm install -g windows-build-tools`)
4. Copy the `settings.example.json` and rename it to `settings.json`
5. Open `settings.json` and replace the dummy values with your actual credentials:  
discord bot token, YouTube API key, SoundCloud client id and Spotify client id and secret.
6. Run `npm run start` in the project directory.
7. Enjoy your amazing bot!

---

### Hosting ###

Works great with [heroku](https://www.heroku.com) (free).  
The settings and credentials can be set via heroku environment variables.  
We recommend to host the DB on an external server like [MongoDB Cloud](https://cloud.mongodb.com/) (free).  
Add the mongoDB url, username and password to your setting.json
