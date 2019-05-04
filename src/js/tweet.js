const moment = require('moment');
const faker = require('faker');

const IMG = require('./img.js');
const IPFS = require('./ipfs.js');
const NEAR = require('./near.js');

const TWEET = {
  createTweet: async (text, dataURI, accountId = 12345) => {
    try {
      // Validate.
      TWEET.validateTweet(text);

      faker.seed(accountId);
      const author = faker.random.words();

      // Upload the image to IPFS.
      const imgBlob = dataURI !== undefined ? IMG.dataURIToBlob(dataURI) : null;
      const imgUrl = await IPFS.uploadImage(imgBlob);

      const tweet = {
        text: text,
        author: author,
        created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        avatar: `https://avatars.dicebear.com/v2/gridy/${accountId}.svg`,
        img: imgUrl,
      };
      console.log(tweet);

      // save the tweet in the contract.
      await NEAR.contract.addTweet(
        tweet.text,
        tweet.author,
        tweet.created,
        tweet.avatar,
        tweet.img
      );

      // display it as row in UI (at the top).
      TWEET.displayTweets([tweet]);

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


  // hashes = [
  //   'QmYYaEWAdjkn2VdtAuBj6akHjkMeBjrCstyCn9LXfhgYTd',
  //   'Qma5nPiSyBRGwEj6VRPPV3MZCeog13LMDG9KCDgwFVegia'
  // ]
  downloadTweets: async () => {
    try {
      return await NEAR.contract.getTweets();
    } catch (err) {
      throw err;
    }
  },

  displayTweets: (tweets) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    for (const tweet of tweets) {
      const text = tweet.text.replace(urlRegex, (url) => {
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

      // Encode the tweet.
      const tweetEncoded = encodeURIComponent(JSON.stringify(tweet));

      const row = `<div class="row no-gutters">
                    <input type="hidden" class="tweet-encoded" values="${tweetEncoded}" />
                    <div class="col-md-1">
                      ${tweet.avatar !== undefined ? `<img src="${tweet.avatar}" style="width:30px;height:30px" />` :
                        `<svg height="30" width="30">
                          <circle cx="15" cy="15" r="14" stroke="black" stroke-width="1" fill="#1da1f2" />
                        </svg>`}
                    </div>
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
                      <div class="row" style="margin-top:10px;color:#8899a6;font-size:15px">
                        <div class="col">
                          <span>
                            <i class="far fa-heart tweet-action-like" style="cursor:pointer"></i>
                            &nbsp;&nbsp;${tweet.likes === undefined ? 0 : tweet.likes}
                          </span>
                    </div>
                  </div>`;

      $('#twitr-feed-timeline').prepend(row);
    }
  },

  toggleLike: async (tweetId) => {
    try {
      await NEAR.contract.toggleLike(tweetId);
    } catch (err) {
      throw err;
    }
  },
};

module.exports = TWEET;
