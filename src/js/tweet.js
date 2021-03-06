const moment = require('moment');

const IMG = require('./img.js');
const IPFS = require('./ipfs.js');
const NEAR = require('./near.js');

const TWEET = {
  createTweet: async (text, dataURI = null) => {
    try {
      // Validate.
      TWEET.validateTweet(text);

      const accountId = NEAR.getAccount();

      // Upload the image to IPFS.
      const imgUrl = dataURI !== undefined && dataURI !== null && dataURI !== '#' && dataURI.trim().length > 0 ?
        await IPFS.uploadImage(IMG.dataURIToBlob(dataURI)) : '';

      const tweet = {
        id: -1, /* set in contract */
        sender: '',  /* set in contract */
        text: text,
        author: accountId,
        created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        avatar: `https://avatars.dicebear.com/v2/gridy/${accountId}.svg`,
        img: imgUrl,
      };

      // save the tweet in the contract.
      const result = await NEAR.contract.addTweet({
        tweet: tweet,
      });
      const tweetCreated = result.lastResult;
      console.log(tweetCreated);

      // display it as row in UI (at the top).
      TWEET.displayTweets([tweetCreated], true /* prepend */);

    } catch (err) {
      throw err;
    }
  },

  updateTweet: async (id, text, dataURI = null) => {
    try {
      // Validate.
      TWEET.validateTweet(text);

      // Upload the image to IPFS.
      const isIPFSLink = /^https:\/\/ipfs.infura.io\/ipfs\//.test(dataURI);
      const imgUrl = dataURI !== null && dataURI !== '#' ?
        (isIPFSLink !== true ? await IPFS.uploadImage(IMG.dataURIToBlob(dataURI)) : dataURI) : '';

      // update the tweet in the contract.
      const result = await NEAR.contract.editTweet({
        id: id,
        text: text,
        created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        img: imgUrl,
      });

      return result.lastResult;

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

  downloadTweets: async (tweetId = null) => {
    try {
      let tweets = await NEAR.contract.getTweets({
        sender: NEAR.getAccount(),
        end: tweetId,
      });
      tweets = tweets.filter(t => t.deleted !== true);

      // fix likes & retweets history.
      for (let tweet of tweets) {
        tweet.likeHistory = tweet.likeHistory
                                 .filter(v => v !== `likes:${tweet.id}::.count`)
                                 .map(v => v.replace(`likes:${tweet.id}::`, ''));
        tweet.retweetHistory = tweet.retweetHistory
                                    .filter(v => v !== `retweets:${tweet.id}::.count`)
                                    .map(v => v.replace(`retweets:${tweet.id}::`, ''));
      }

      return tweets;
    } catch (err) {
      throw err;
    }
  },

  getTweetsOfAccount: async (accountId = null) => {
    try {
      let tweets = await NEAR.contract.getTweetsOfAccount({
        accountId: accountId || NEAR.getAccount(),
      });

      if (accountId !== null) {
        tweets = tweets.filter(t => t.deleted !== true);
      }

      console.log(tweets);

      // fix likes & retweets history.
      for (let tweet of tweets) {
        tweet.likeHistory = tweet.likeHistory
                                 .filter(v => v !== `likes:${tweet.id}::.count`)
                                 .map(v => v.replace(`likes:${tweet.id}::`, ''));
        tweet.retweetHistory = tweet.retweetHistory
                                    .filter(v => v !== `retweets:${tweet.id}::.count`)
                                    .map(v => v.replace(`retweets:${tweet.id}::`, ''));
      }

      return tweets;
    } catch (err) {
      throw err;
    }
  },

  searchTweets: async (keyword, accountId = null) => {
    try {
      let tweets = await NEAR.contract.searchTweets({
        keyword: keyword,
        accountId: accountId || NEAR.getAccount(),
      });

      // fix likes & retweets history.
      for (let tweet of tweets) {
        tweet.likeHistory = tweet.likeHistory
                                 .filter(v => v !== `likes:${tweet.id}::.count`)
                                 .map(v => v.replace(`likes:${tweet.id}::`, ''));
        tweet.retweetHistory = tweet.retweetHistory
                                    .filter(v => v !== `retweets:${tweet.id}::.count`)
                                    .map(v => v.replace(`retweets:${tweet.id}::`, ''));
      }

      return tweets;
    } catch (err) {
      throw err;
    }
  },

  tweetDecode: (tweetText) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hashtagRegex = /(^|\s)(#[a-z\d-]+)/ig;
    const newlineRegex = /(?:\r\n|\r|\n)/g;

    let text = tweetText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
    text = text.replace(hashtagRegex, (hashtag) => {
      return `<a href="#" class="tweet-hashtag">${hashtag}</a>`;
    });
    text = twemoji.parse(text);

    return text.replace(newlineRegex, '<br />');
  },

  tweetTime: (created) => {
    const end = moment.utc();
    const start = moment.utc(created);

    created = moment.duration(end.diff(start)).asHours();
    if (created > 24) {
      created = start.local().format('MMM D');
    } else if (created < 1) {
      created = moment.duration(end.diff(start)).asMinutes();
      created = Math.ceil(created);
      created += 'm';
    } else {
      created = `${Math.ceil(created)}h`;
    }

    return created;
  },

  displayTweets: (tweets, prepend = false, profile = false) => {
    let ele = $('#twitr-feed-timeline').find('.simplebar-content');
    if (ele.length === 0) {
      ele = $('#twitr-feed-timeline');
    }

    for (const tweet of tweets) {
      const author = tweet.author;
      const img = tweet.img;

      // Construct the tweet text & timestamp.
      const text = TWEET.tweetDecode(tweet.text);
      const created = TWEET.tweetTime(tweet.created);

      // Encode the tweet.
      const tweetEncoded = encodeURIComponent(JSON.stringify(tweet));

      const row = `<div class="row no-gutters tweets-row${tweet.deleted ? ' tweets-deleted' : ''}"
                        id="tweet-display-id-${tweet.id}"
                        ${tweet.deleted ? 'title="Deleted tweet"' : ''}>
                    <input type="hidden" class="tweet-encoded" value="${tweetEncoded}" />
                    <div class="col-md-1">
                      ${tweet.avatar !== undefined ? `<img src="${tweet.avatar}" style="width:30px;height:30px" />` :
                        `<svg height="30" width="30">
                          <circle cx="15" cy="15" r="14" stroke="black" stroke-width="1" fill="#1da1f2" />
                        </svg>`}
                    </div>
                    <div class="col-md-11">
                      <div class="row">
                        <div class="col">
                          <a href="#" class="profile-link" style="color:white;font-weight:bold">${author}</a>
                          <span class="tweet-created-time" style="color:#8899a6;font-size:13px">&nbsp;&nbsp;&#8226;&nbsp;&nbsp;${created}</span>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col tweet-parsed-text" style="color:white;font-size:15px">${text}</div>
                      </div>
                      ${img !== '' ? `<div class="row"><div class="col">
                                              <img style="margin-top:10px;width:100%;border-radius:10px;border:1px solid #38444d"
                                                   src="${img}" />
                                             </div></div>` : ''}
                      <div class="row" style="margin-top:10px;color:#8899a6;font-size:15px">
                        <div class="col-md-2">
                          <span>
                            ${tweet.likes === undefined ?
                              `<i class="fas fa-heart tweet-action-like" title="Like tweet"></i>
                                <span>&nbsp;&nbsp;0</span>` :
                              `<i class="fas fa-heart tweet-action-like ${tweet.hasLiked ? 'tweet-action-liked':''}" title="Like tweet"></i>
                                <span ${tweet.hasLiked ? 'style="color:#1da1f2"' : ''}>&nbsp;&nbsp;${tweet.likes}</span>`}
                          </span>
                        </div>
                        <div class="col-md-2">
                          <span>
                            ${tweet.retweets === undefined ?
                              `<i class="fas fa-retweet tweet-action-retweet" title="Retweet"></i>
                                <span>&nbsp;&nbsp;0</span>` :
                              `<i class="fas fa-retweet tweet-action-retweet ${tweet.hasRetweeted ? 'tweet-action-retweeted':''}" title="Retweet"></i>
                                <span ${tweet.hasRetweeted ? 'style="color:#1da1f2"' : ''}>&nbsp;&nbsp;${tweet.retweets}</span>`}
                          </span>
                        </div>
                        <div class="col-md-2">
                          <span>
                            ${tweet.sender === NEAR.getAccount() && tweet.deleted === false ?
                              '<i class="fas fa-edit tweet-edit" title="Edit tweet"></i>' : ''}
                          </span>
                        </div>
                        ${profile !== true ? `
                          <div class="col-md-2">
                            <span>
                              ${tweet.sender === NEAR.getAccount() ?
                                '<i class="fas fa-trash-alt tweet-delete" title="Delete tweet"></i>' : ''}
                            </span>
                          </div>` : ''
                        }
                      </div>
                    </div>
                  </div>`;

      if (prepend === false) {
        ele.append(row);
      } else {
        ele.prepend(row);
      }
    }
  },

  toggleLike: async (tweetId) => {
    try {
      const result = await NEAR.contract.toggleLike({
        id: tweetId,
      });

      return result.lastResult;
    } catch (err) {
      throw err;
    }
  },

  retweet: async (tweetId) => {
    try {
      const accountId = NEAR.getAccount();

      const result = await NEAR.contract.retweet({
        id: tweetId,
        created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        author: accountId,
        avatar: `https://avatars.dicebear.com/v2/gridy/${accountId}.svg`,
      });

      return result.lastResult;
    } catch (err) {
      throw err;
    }
  },

  deleteTweet: async (tweetId) => {
    try {
      await NEAR.contract.deleteTweet({
        id: tweetId,
      });
    } catch (err) {
      throw err;
    }
  },
};

module.exports = TWEET;
