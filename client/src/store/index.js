import { createStore as createVuexStore } from "vuex";
import * as kondor from "kondor-js";
import { Signer } from "koilib";
import { getKanvasContract, getKoinContract } from "../utils/contracts";
import CryptoJS from "crypto-js";
import HDKoinos from "../utils/HDKoinos";

export const createStore = (app) => {
  return createVuexStore({
    state: {
      selectedColor: "#000000",
      preventNextClick: false,
      walletsList: JSON.parse(window.localStorage.getItem("wallets")) || [],
      activeWallet: null,
      activeAccount: null,
      tokenBalance: {},
      pixelsAmount: {},
      kanvasContract: getKanvasContract(),
      koinContract: getKoinContract(),
    },
    getters: {
      getKoinBalance: (state) => async (address) => {
        const koin = state.koinContract;

        const ret = await koin.balanceOf({
          owner: address,
        });
        let realKoin = Number(ret.result.value) / 1e8;

        return realKoin;
      },
      getTokenBalance:
        (state) =>
        async (address, cache = true) => {
          if (!cache) {
            const kan = state.kanvasContract;

            const ret = await kan.balance_of({
              owner: address,
            });
            let realKan = Number(ret?.result?.value || 0) / 1e8;
            state.tokenBalance[address] = realKan;
          }

          return state.tokenBalance[address];
        },
      getMana: () => async (address) => {
        let rc = await kondor.provider.getAccountRc(address);
        let initialMana = Number(rc) / 1e8;
        let mana = Number(initialMana.toFixed(8));

        return mana;
      },
      getPixelsAmount:
        (state) =>
        async (account, cache = true) => {
          if (!cache) {
            const kanvas = state.kanvasContract;

            const ret = await kanvas.pixel_count_of({
              owner: account.address,
            });
            let pixelsAmount = Number(ret?.result?.value || 0);
            state.pixelsAmount[account.address] = pixelsAmount;
          }

          return state.pixelsAmount[account.address];
        },
      nameAvailable: (state) => {
        return function (name) {
          return (
            state.walletsList.findIndex(function (x) {
              return x.name == name;
            }) == -1 && name != "Kondor"
          );
        };
      },
      loggedIn: (state) => {
        return state.activeWallet !== null;
      },
      walletName: (state) => {
        return state.activeWallet ? state.activeWallet.name : null;
      },
      lastWallet: (state) => {
        if (state.activeWallet) {
          return state.activeWallet.name;
        } else {
          return window.localStorage.getItem("lastWallet");
        }
      },
      getWalletAsStoredFormat: () => {
        return function (wallet) {
          let storedWallet;
          if (wallet.name && wallet.password) {
            storedWallet = {
              name: wallet.name,
              wallet: CryptoJS.AES.encrypt(
                JSON.stringify(wallet),
                wallet.password
              ).toString(),
            };
          } else if (wallet.name == "Kondor") {
            storedWallet = {
              name: wallet.name,
              wallet: JSON.stringify(wallet),
            };
          }

          return storedWallet;
        };
      },
    },
    mutations: {
      setActiveWallet(state, newActiveWallet) {
        state.activeWallet = newActiveWallet;
        window.localStorage.setItem("lastWallet", newActiveWallet.name);
      },
      setActiveAccount(state, newActiveAccount) {
        state.activeAccount = newActiveAccount;
        let newSigner =
          state.activeWallet.name == "Kondor"
            ? kondor.getSigner(newActiveAccount.address)
            : Signer.fromWif(newActiveAccount.privateKey, true);
        state.kanvasContract = getKanvasContract(newSigner);
        state.koinContract = getKoinContract(newSigner);
      },
      setTokenBalance(state, data) {
        state.tokenBalance[data.address] = data.balance;
      },
      setPixelsAmount(state, data) {
        state.pixelsAmount[data.address] = data.amount;
      },
      preventNextClick(state, val = true) {
        state.preventNextClick = val;
      },
      changeColor(state, newColor) {
        state.selectedColor = newColor;
      },
    },
    actions: {
      storeWallets({ state, getters }, walletToUpdate) {
        if (walletToUpdate) {
          let newStoredWallet = getters.getWalletAsStoredFormat(walletToUpdate);
          let walletIndex = state.walletsList.findIndex(
            (w) => w.name == walletToUpdate.name
          );
          state.walletsList[walletIndex] = newStoredWallet;
        }

        window.localStorage.setItem(
          "wallets",
          JSON.stringify(state.walletsList)
        );
      },
      addWallet({ state, commit, getters, dispatch }, wallet) {
        commit("setActiveWallet", wallet);

        let newStoredWallet = getters.getWalletAsStoredFormat(
          state.activeWallet
        );
        state.walletsList.push(newStoredWallet);

        dispatch("storeWallets");
      },
      createWalletWithMnemonic(
        { dispatch },
        { name, mnemonicOrKey, password, isMnemonic = true }
      ) {
        let wallet = {
          name: name,
          password: password,
          pathIncrement: 0,
          accounts: [],
        };
        wallet[isMnemonic ? "mnemonic" : "privateKey"] = mnemonicOrKey;

        dispatch("addAccount", wallet);
        dispatch("addWallet", wallet);
        dispatch("unlockWallet", wallet);
      },
      unlockWallet({ state, commit }, { name, password }) {
        let encryptedWallet =
          state.walletsList[
            state.walletsList.findIndex(function (x) {
              return x.name === name;
            })
          ].wallet;

        let wallet;
        if (name == "Kondor") {
          wallet = JSON.parse(encryptedWallet);
        } else {
          wallet = JSON.parse(
            CryptoJS.AES.decrypt(encryptedWallet, password).toString(
              CryptoJS.enc.Utf8
            )
          );
        }

        commit("setActiveWallet", wallet);
        commit("setActiveAccount", wallet.accounts[0]);
      },
      signOut({ state }) {
        state.activeWallet = null;
        state.activeAccount = null;
      },
      switchAccount({ state, commit }, address) {
        let accountIndex = state.activeWallet.accounts.findIndex(function (
          acc
        ) {
          return acc.address == address;
        });
        commit("setActiveAccount", state.activeWallet.accounts[accountIndex]);
      },
      addAccount({ state, dispatch }, wallet) {
        !wallet && (wallet = state.activeWallet);

        let newAccount;
        if (wallet.mnemonic) {
          let hd = new HDKoinos(wallet.mnemonic);
          newAccount = hd.deriveKeyAccount(wallet.pathIncrement);
          newAccount.accIndex = wallet.pathIncrement;
          wallet.pathIncrement++;
        } else if (wallet.privateKey) {
          newAccount = {
            name: "Account",
            privateKey: wallet.privateKey,
            address: Signer.fromWif(wallet.privateKey).getAddress(),
          };
        }

        wallet.accounts.push(newAccount);

        dispatch("storeWallets", wallet);
      },
      deleteWallet({ state }, walletName) {
        state.walletsList = state.walletsList.filter(
          (w) => w.name != walletName
        );
      },
      async changeKondorAccounts({ state, commit, dispatch }) {
        let accounts;
        try {
          accounts = await kondor.getAccounts();
        } catch (error) {
          console.error(error);
        }
        if (accounts.length) {
          dispatch("deleteWallet", "Kondor");
          dispatch("addWallet", {
            name: "Kondor",
            accounts: accounts,
          });
          commit("setActiveAccount", state.activeWallet.accounts[0]);

          app.config.globalProperties.$socket.emit(
            "subscribe_wallet_update",
            accounts
          );
        } else {
          app.config.globalProperties.$error(
            "No Kondor account was selected !"
          );
        }
      },
    },
    modules: {},
  });
};
