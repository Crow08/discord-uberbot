# discord-uberbot
[![version](https://img.shields.io/github/package-json/v/Crow08/discord-uberbot.svg)](/package.json)
[![dependencies](https://david-dm.org/Crow08/discord-uberbot.svg)](/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/Crow08/discord-uberbot/badge.svg)](https://snyk.io/test/github/Crow08/discord-uberbot)
[![license](https://img.shields.io/github/license/Crow08/discord-uberbot.svg)](/LICENSE.md)  
Jet another Discord Musicbot but this one has an attached DB for saving and managing playlists.

---

### **Info** ###
Work in Progress!

Requires: node.js, mongoDB

please check installation notes

try .help to get started

---

### Features: ###

##### Play Songs #####
- plays songs from Soundcloud and Youtube
    - play from Url or search query
    - or check first 30 entries before selecting song
- pause, skip, forward, stop playback
- add Songs to queue
- shuffle queue

##### Playlists #####
- create custom Playlists
- add songs from playback, queue or other playlists
- upload playlists via .txt
- merge playlists
- features autoplaylists (who need´s silence anyway?)
- rate your songs
    - autoremove if rating too bad (soon)

---

### Installation: ###
- install node
- clone the repo
- npm install that bad boy
- fill settings.example.json with your tokens and rename to settings.json
- run index.js
- debug until it works (O_o)?
