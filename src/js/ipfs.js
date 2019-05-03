const ipfsApi = require('ipfs-http-client');

const ipfs = new ipfsApi({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

const upload = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new window.FileReader();
    reader.onloadend = async () => {
      const buffer = await Buffer.from(reader.result);

      await ipfs.add(buffer, (err, ipfsHash) => {
        if (err) {
          reject(err);
        } else {
          resolve(ipfsHash[0].hash);
        }
      });
    }
    reader.readAsArrayBuffer(file);
  });
};

const IPFS = {
  uploadTweet: async (json, imgFile) => {
    try {
      // Upload the image to IPFS and get its url.
      const imgHash = await upload(imgFile);
      const imgUrl = `https://ipfs.infura.io/ipfs/${imgHash}`;

      // Upload the tweet to IPFS.
      json.img = imgUrl;
      const buffer = Buffer.from(JSON.stringify(json));
      const hash = await ipfs.add(buffer);

      return hash[0].hash;

    } catch (err) {
      throw err;
    }
  },

  downloadTweet: async (hash) => {
    try {
      const results = await ipfs.get(hash);
      return JSON.parse(results[0].content.toString());
    } catch (err) {
      throw err;
    }
  },
};

module.exports = IPFS;
