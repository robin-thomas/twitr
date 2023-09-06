# twitr
![](https://img.shields.io/badge/nodejs-8.10-blue.svg) [![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

## [Winner of NEAR Hack.One hackathon!!](https://near.org/blog/near-community-update-may-17th-2019)

# Demo videos
* [twitr](https://www.youtube.com/watch?v=7_YMK0GizTc)

# Table of Contents
1. [What is it?](#what-is-it)
2. [Features](#features)
3. [Architecture](#architecture)

# What is it?
**twitr** is a Twitter clone built using [NEAR protocol](https://nearprotocol.com/), which allows a developer to write and deploy scalable decentralized applications on a developer-friendly blockchain.

# Features
* Login with NEAR wallet. No other accounts/browser extensions necessary
* Like, retweet, edit or delete a tweet (needs to login)
* Public profile page for each user (see tweets and retweets of a user)
* Tweets can include images (stored in IPFS), links and hashtags. Both links and hashtags will be highlighted
* See the like & retweet count for each tweet (no need to login)
* Each tweet can include a maximum of 140 characters
* Notice the remaining characters to type in a tweet on circle progress
* Logged-in user can see his/her tweets without going to his/her profile page
* Infinity scrolling of tweets (as well as easy scrolling to the top of the page)
* Emoji support
* Search for tweets based on tweet text
* Deleted tweets will only be visible to the tweet owner

# Architecture
* The front-end code is written on JavaScript, HTML and CSS (in `/src/`)
* The back-end code is written on NodeJS (tested on v8.10.0) (`/index.js`)
* The contract code is written in AssemblyScript (in `/assembly/`)

**Free Software, Hell Yeah!**
