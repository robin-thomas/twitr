const moment = require('moment');

const IPFS = require('./ipfs.js');

const TWEET = {
  create: async (text, author, imgFile) => {
    const json = {
      text: text,
      author: author,
      created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    };

    try {
      return await IPFS.uploadTweet(json, imgFile);
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
