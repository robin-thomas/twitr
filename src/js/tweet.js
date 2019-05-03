const moment = require('moment');

const IMG = require('./img.js');
const IPFS = require('./ipfs.js');

const TWEET = {
  create: async (text, dataURI, author = 'Robin') => {
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

  validate: (text) => {
    try {
      if (text === null || text === undefined || text.trim().length === 0) {
        throw new Error('Tweet text cannot be empty!');
      }
    } catch (err) {
      throw err;
    }
  },

  downloadList: async (hashes) => {
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
};

module.exports = TWEET;
