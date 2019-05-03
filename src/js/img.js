const IMG = {
  dataURIToBlob: (dataURI) => {
    // Convert the image dataURI to blob.
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);

    let _ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; ++i) {
      _ia[i] = byteString.charCodeAt(i);
    }

    const dataView = new DataView(arrayBuffer);
    return new Blob([dataView], { type: mimeString });
  },
};

module.exports = IMG;
