const ipfsApi = require('ipfs-http-client');

const ipfs = new ipfsApi({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

const upload = (blob) => {
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
    reader.readAsArrayBuffer(blob);
  });
};

const IPFS = {
  uploadImage: async (imgBlob) => {
    try {
      // Upload the image to IPFS and get its url.
      const imgHash = await upload(imgBlob);
      return `https://ipfs.infura.io/ipfs/${imgHash}`;

    } catch (err) {
      throw err;
    }
  },
};

module.exports = IPFS;
