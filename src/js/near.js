const NEAR = {
  init: async () => {
    try {
      config = await nearlib.dev.getConfig();
      contractId = config.contractName;
      baseUrl = config.appUrl;
    } catch (err) {
      throw err;
    }
  },
};
