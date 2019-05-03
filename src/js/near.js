const NEAR = {
  walletAccount: null,
  contractId: null,
  appTitle: null,
  baseUrl: null,

  init: async () => {
    try {
      const config = await nearlib.dev.getConfig();
      console.log(config);
      NEAR.contractId = config.contractName;
      NEAR.baseUrl = config.appUrl;

      // Initializing Wallet based Account. It can work with NEAR DevNet wallet that
      // is hosted at https://wallet.nearprotocol.com
      // The wallet is managing the accounts and keys for the user using localStorage.
      // It never exposes the keys to the application, so in order to send transactions
      // on behalf of the user we need to talk to the wallet page.
      // To talk to the wallet we use the in-browser iframe messaging system and auth tokens.
      // Then wallet uses keys from the local storage under wallet.nearprotocol.com
      // and signs the transaction and returns it back to our app.
      NEAR.walletAccount = new nearlib.WalletAccount(
        NEAR.contractId,
        config.walletUrl
      );

      // Getting the Account ID. If unauthorized yet, it's just empty string.
      const accountId = NEAR.walletAccount.getAccountId();

      // Initializing near and near client from the nearlib.
      const near = new nearlib.Near(new nearlib.NearClient(
        NEAR.walletAccount,
        new nearlib.LocalNodeConnection(config.nodeUrl),
      ));

      // Initializing the contract.
      // For now we need to specify method names from the contract manually.
      // It also takes the Account ID which it would use for signing transactions.
      const contract = await near.loadContract(config.contractName, {
        viewMethods: ['getTweets'],
        changeMethods: ['addTweet'],
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
      NEAR.baseUrl + '/',
      NEAR.baseUrl + '/',
    );
  },

  logout: () => {
    // It removes the auth token from the local storage.
    NEAR.walletAccount.signOut();

    // Forcing redirect.
    window.location.replace(NEAR.baseUrl + '/');
  },
};

module.exports = NEAR;
