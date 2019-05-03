const moment = require('moment');

const IMG = require('./img.js');
const IPFS = require('./ipfs.js');

const TWEET = {
  createTweet: async (text, dataURI, author = 'Robin') => {
    try {
      // Validate.
      TWEET.validate(text);

      // Construct the tweet object.
      const json = {
        text: text,
        author: author,
        created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      };
      const imgBlob = dataURI !== undefined ? IMG.dataURIToBlob(dataURI) : null;

      const tweet = await IPFS.uploadTweet(json, imgBlob);
      console.log(tweet);

      // TODO: save the tweet in the contract.

    } catch (err) {
      throw err;
    }
  },

  validateTweet: (text) => {
    try {
      if (text === null || text === undefined || text.trim().length === 0) {
        throw new Error('Tweet text cannot be empty!');
      }
    } catch (err) {
      throw err;
    }
  },

  downloadTweets: async (hashes = ['QmYYaEWAdjkn2VdtAuBj6akHjkMeBjrCstyCn9LXfhgYTd']) => {
    try {
      let results = [];

      for (const hash of hashes) {

        let result = null;
        try {
          result = await IPFS.downloadTweet(hash);
        } catch (err) {
          continue;
        }

        if (result) {
          results.push(result);
        }
      }

      return results;
    } catch (err) {
      throw err;
    }
  },

  displayTweets: (tweets) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    for (const tweet of tweets) {
      const tweetText = 'Find me at http://www.example.com and also at http://stackoverflow.com Hello all are you aaaa';

      const text = tweetText.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url.substring(0, 15)}...</a>`;
      });

      const author = tweet.author;
      const img = tweet.img;

      // Construct the timestamp.
      const end = moment.utc();
      const start = moment.utc(tweet.created);
      let created = moment.duration(end.diff(start)).asHours();
      if (created > 24) {
        created = start.local().format('MMM D');
      } else if (created < 1) {
        created = moment.duration(end.diff(start)).asMinutes();
        created = Math.ceil(created);
        created += 'm';
      } else {
        created = `${Math.ceil(created)}h`;
      }

      const row = `<div class="row no-gutters">
                    <div class="col-md-1"></div>
                    <div class="col-md-11">
                      <div class="row">
                        <div class="col">
                          <span style="color:white;font-weight:bold">${author}</span>
                          <span style="color:#8899a6;font-size:13px">&nbsp;&nbsp;&#8226;&nbsp;&nbsp;${created}</span>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col" style="color:white;font-size:15px">${text}</div>
                      </div>
                      ${img !== undefined ? `<div class="row"><div class="col">
                                              <img style="margin-top:10px;width:100%;border-radius:10px;border:1px solid #38444d"
                                                   src="${img}" />
                                             </div></div>` : ''}
                    </div>
                  </div>`;

      $('#twitr-feed-timeline').prepend(row);
    }
  },
};

module.exports = TWEET;
