const moment = require('moment');

const IMG = require('./img.js');
const IPFS = require('./ipfs.js');

const TWEET = {
  create: async (text, author, dataURI) => {
    const json = {
      text: text,
      author: author,
      created: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
    };

    try {
      const imgBlob = IMG.dataURIToBlob(dataURI);

      return await IPFS.uploadTweet(json, imgBlob);
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
