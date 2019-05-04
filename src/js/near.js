const NEAR = {
  walletAccount: null,
  contractId: 'metanear-dev-005',
  appTitle: 'twitr',
  contract: null,
  baseUrl: 'https://wallet.nearprotocol.com/',
  nodeUrl: 'https://studio.nearprotocol.com/devnet',
  appUrl: 'https://twitr-near.herokuapp.com/',

  init: async () => {
    try {
      NEAR.walletAccount = new nearlib.WalletAccount(
        NEAR.contractId,
        NEAR.baseUrl
      );

      // Getting the Account ID. If unauthorized yet, it's just empty string.
      const accountId = NEAR.walletAccount.getAccountId();

      // Initializing near and near client from the nearlib.
      const near = new nearlib.Near(new nearlib.NearClient(
        NEAR.walletAccount,
        new nearlib.LocalNodeConnection(NEAR.nodeUrl),
      ));

      // Initializing the contract.
      // For now we need to specify method names from the contract manually.
      // NEAR.contract = await near.loadContract(NEAR.contractId, {
      //   viewMethods: ['getTweets'],
      //   changeMethods: ['addTweet'],
      //   sender: accountId,
      // });

      NEAR.contract = await near.loadContract(NEAR.contractId, {
        viewMethods: ["lookAround", "getPlayer", "getCellInfo", "getRenderInfo", "getImageUrl"],
        changeMethods: ["move", "deploy", "init", "addCellInfo", "addRenderInfo", "addImageUrl"],
        sender: accountId,
      });
    } catch (err) {
      throw err;
    }
  },

  login: () => {
    NEAR.walletAccount.requestSignIn(
      NEAR.contractId,
      NEAR.appTitle,
      NEAR.appUrl,
      NEAR.baseUrl,
    );
  },

  logout: () => {
    // It removes the auth token from the local storage.
    NEAR.walletAccount.signOut();

    // Forcing redirect.
    window.location.replace(NEAR.baseUrl);
  },
};

module.exports = NEAR;
