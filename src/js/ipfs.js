const ipfsApi = require('ipfs-http-client');

const ipfs = new ipfsApi({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

const IPFS = {
  upload: (file) => {
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
  },

  getDownloadUrl: (hash) => {
    return `https://ipfs.infura.io/ipfs/${hash}`;
  }
};

module.exports = IPFS;
