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
  - Import songs via csv file to additional define the exact title and artist od the song.

---

### Full Command List ###

```prolog
+----------------------------Commands--------------------------+
| Name:   add                                                  |
| Usage:  !add <url | query>                                   |
| About:  add a song to the current queue by url or query.     |
| Alias:  add, a                                               |
+--------------------------------------------------------------+
| Name:   pladd                                                |
| Usage:  !pladd <pl name> <url | query>                       |
| About:  add a song to the specified playlist by url or       |
|         query.                                               |
+--------------------------------------------------------------+
| Name:   autopl                                               |
| Usage:  !autopl [<playlist name>|"unset"]                    |
| About:  get or set a playlist name to be the auto playlist.  |
|         (playlist name to set, no parameter to get and       |
|         "unset" to unset).                                   |
| Alias:  autopl, apl, auto                                    |
+--------------------------------------------------------------+
| Name:   addsongtopl                                          |
| Usage:  !addsongtopl <playlist>                              |
| About:  adds current song to given playlist                  |
| Alias:  addsongtopl, as2pl, as2p                             |
+--------------------------------------------------------------+
| Name:   addqueuetopl                                         |
| Usage:  !addqueuetopl <playlist>                             |
| About:  adds queue to given playlist                         |
| Alias:  addqueuetopl, aq2pl, aq2p                            |
+--------------------------------------------------------------+
| Name:   clear                                                |
| Usage:  !clear                                               |
| About:  delete all songs from current queue.                 |
+--------------------------------------------------------------+
| Name:   pldelete                                             |
| Usage:  !pldelete <pl name>                                  |
| About:  deletes a playlist permanently.                      |
+--------------------------------------------------------------+
| Name:   getautopl                                            |
| Usage:  !auto                                                |
| About:  returns name of current auto playlist                |
+--------------------------------------------------------------+
| Name:   help                                                 |
| Usage:  !help                                                |
| About:  list all implemented commands                        |
| Alias:  help, ?                                              |
+--------------------------------------------------------------+
| Name:   leave                                                |
| Usage:  !leave                                               |
| About:  leave the current voice channel.                     |
+--------------------------------------------------------------+
| Name:   pllist                                               |
| Usage:  !pllist                                              |
| About:  lists available playlists                            |
| Alias:  pllist, l                                            |
+--------------------------------------------------------------+
| Name:   listsongs                                            |
| Usage:  !listsongs <playlist>                                |
| About:  lists all songs of the specified playlist            |
| Alias:  listsongs, ls                                        |
+--------------------------------------------------------------+
| Name:   plload                                               |
| Usage:  !plload <pl name>                                    |
| About:  load a playlist replacing the current queue.         |
+--------------------------------------------------------------+
| Name:   loop                                                 |
| Usage:  !loop [1]                                            |
| About:  toggle loop mode of the queue.                       |
|         add 1 to loop only the current song.                 |
+--------------------------------------------------------------+
| Name:   merge                                                |
| Usage:  !merge <sourcepl> <targetpl>                         |
| About:  copies one playlist into another!                    |
+--------------------------------------------------------------+
| Name:   nowplaying                                           |
| Usage:  !nowplaying                                          |
| About:  returns first song in history (current song)         |
| Alias:  nowplaying, np                                       |
+--------------------------------------------------------------+
| Name:   pause                                                |
| Usage:  !pause                                               |
| About:  pause current playback.                              |
+--------------------------------------------------------------+
| Name:   play                                                 |
| Usage:  !play <url | query>                                  |
| About:  play a song by url or query.                         |
| Alias:  play, p                                              |
+--------------------------------------------------------------+
| Name:   playnext                                             |
| Usage:  !playnext <queue position>                           |
| About:  moves song at given position to top                  |
| Alias:  playnext, pn                                         |
+--------------------------------------------------------------+
| Name:   preferdsrc                                           |
| Usage:  !preferdsrc [yt|sc|sp]                               |
| About:  set a source to be the default source for all        |
|         searches.                                            |
|         (valid sources to set are:                           |
|         "yt":youtube,"sc":soundcloud,"sp":spotify.           |
|         no parameter to get current source)                  |
| Alias:  preferdsrc, searchsrc, src                           |
+--------------------------------------------------------------+
| Name:   remove                                               |
| Usage:  !remove <queue number>                               |
| About:  removes a song from the current queue.               |
+--------------------------------------------------------------+
| Name:   plremove                                             |
| Usage:  !plremove <pl name> <song name>                      |
| About:  remove given song from given playlist                |
| Alias:  plremove, plrm                                       |
+--------------------------------------------------------------+
| Name:   plrename                                             |
| Usage:  !rename <playlist> <new name>                        |
| About:  renames given playlist                               |
| Alias:  plrename, rename                                     |
+--------------------------------------------------------------+
| Name:   rename                                               |
| Usage:  !rename <"t"|"a"> <playlist name> <song number>      |
|         <new name>                                           |
| About:  rename title or artist of song.                      |
|         (first parameter "t" for title and "a" for artist.)  |
| Alias:  rename, renamesong, r                                |
+--------------------------------------------------------------+
| Name:   search                                               |
| Usage:  !search <query>                                      |
|         => "cancel" |                                        |
|         ["play"|"add"] <song number> |                       |
|          "pladd" <pl name> <song number>                     |
| About:  search for a song and choose from multiple results.  |
+--------------------------------------------------------------+
| Name:   plsearch                                             |
| Usage:  !plsearch <pl name> <song name>                      |
| About:  search given song in given playlist                  |
| Alias:  plsearch, pls                                        |
+--------------------------------------------------------------+
| Name:   seek                                                 |
| Usage:  !seek <number>                                       |
| About:  seek playback position.                              |
+--------------------------------------------------------------+
| Name:   showhistory                                          |
| Usage:  !showhistory                                         |
| About:  displays all songs from current history.             |
| Alias:  showhistory, h, history                              |
+--------------------------------------------------------------+
| Name:   showqueue                                            |
| Usage:  !showqueue                                           |
| About:  displays all songs from current queue.               |
| Alias:  showqueue, q, queue                                  |
+--------------------------------------------------------------+
| Name:   shuffle                                              |
| Usage:  !shuffle                                             |
| About:  shuffle the current queue.                           |
+--------------------------------------------------------------+
| Name:   skip                                                 |
| Usage:  !skip                                                |
| About:  skip current song.                                   |
| Alias:  skip, s                                              |
+--------------------------------------------------------------+
| Name:   start                                                |
| Usage:  !start <pl name>                                     |
| About:  loads a playlist shuffles it and starts playing.     |
+--------------------------------------------------------------+
| Name:   stop                                                 |
| Usage:  !stop                                                |
| About:  stop current playback.                               |
+--------------------------------------------------------------+
| Name:   upload                                               |
| Usage:  !upload [<playlist name>]                            |
|         => attach file to the message                        |
|         txt files with a query each row or csv files with 3  |
|         columns per row <query>;<artist>;<title>             |
| About:  add a songs from a file to the queue or to a         |
|         playlist.                                            |
+--------------------------------------------------------------+
| Name:   volume                                               |
| Usage:  !volume <number>                                     |
| About:  sets volume, or returns volume if no parameter given |
| Alias:  volume, vol, v                                       |
+--------------------------------------------------------------+
```

---

### Installation: ###

1. Install node (with npm >= 10) and mongodb on the host computer.
2. Run `npm install` in the project directory.  
(On Windows you may need to install [windows build tools](https://www.npmjs.com/package/windows-build-tools) first: `npm install -g windows-build-tools`)
3. Copy the `settings.example.json` and rename it to `settings.json`
4. Open `settings.json` and replace the dummy values with your actual credentials:  
discord bot token, YouTube API key, SoundCloud client id and Spotify client id and secret.
5. Run `npm run start` in the project directory.
6. Enjoy your bot!

---

### Hosting ###

Works great with [heroku](https://www.heroku.com) (free).  
The settings and credentials can be set via heroku environment variables.  
We recommend to host the DB on an external server like [MongoDB Cloud](https://cloud.mongodb.com/) (free).  
Add the mongoDB url, username and password to your setting.json
