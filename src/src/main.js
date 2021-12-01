import {createApp} from 'vue'
import App from './App.vue'
import getConfig from './config.js';
import * as nearAPI from 'near-api-js';

async function initContract() {
  const nearConfig = getConfig(process.env.NODE_ENV || 'testnet');

  // Initializing connection to the NEAR TestNet
  const near = await nearAPI.connect({
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(window.localStorage, "santa-")
    },
    ...nearConfig
  });

  // Needed to access wallet
  const walletConnection = new nearAPI.WalletConnection(near);
  console.log(walletConnection);

  // Load in account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = await new nearAPI.Contract(walletConnection.account(), nearConfig.contractName, {
    viewMethods: ["allMessages"],
    changeMethods: ["addMessage", "myMessages", "myGift", "addGift", "myGiftHistory", "santaSay"],
    sender: walletConnection.getAccountId()
  });

  return {contract, currentUser, nearConfig, walletConnection};
}

initContract().then(async (contractData) => {
    window.contract = contractData.contract;
    window.currentUser = contractData.currentUser;
    window.nearConfig = contractData.nearConfig;
    window.wallet = contractData.walletConnection;

    const app = createApp(App)
    app.mount('#app');
  }
)




