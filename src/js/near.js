const twitrLogin = $('#twitr-login');
const twitrAccountId = $('#near-accountid');

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
      twitrAccountId.html(accountId);

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

      // Loggedin
      if (NEAR.walletAccount.isSignedIn()) {
        twitrLogin.removeClass('twitr-login').addClass('twitr-logout');
        twitrLogin.html('Logout');
      } else {
        twitrLogin.removeClass('twitr-logout').addClass('twitr-login');
        twitrLogin.html('Login');
      }
    } catch (err) {
      throw err;
    }
  },

  login: () => {
    NEAR.walletAccount.requestSignIn(
      NEAR.contractId,
      NEAR.appTitle,
      NEAR.appUrl,
      NEAR.appUrl,
    );
  },

  logout: () => {
    // It removes the auth token from the local storage.
    NEAR.walletAccount.signOut();

    // Forcing redirect.
    window.location.replace(NEAR.appUrl);
  },
};

module.exports = NEAR;
