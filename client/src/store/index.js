import { createStore as createVuexStore } from "vuex";
import * as kondor from "kondor-js";
import { Signer } from "koilib";
import {
  getKanvasContract,
  getKoinContract,
  defaultProvider,
} from "../utils/contracts";
import CryptoJS from "crypto-js";
import HDKoinos from "../utils/HDKoinos";
import {
  ChainIds,
  Methods,
  WalletConnectKoinos,
} from "@armana/walletconnect-koinos-sdk-js";

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
      getKoinBalance:
        (state) =>
        async (address = state.activeAccount.address) => {
          const koin = state.koinContract;

          const ret = await koin.balanceOf({
            owner: address,
          });
          let realKoin = Number(ret.result.value) / 1e8;

          return realKoin;
        },
      getTokenBalance:
        (state) =>
        async (address = state.activeAccount.address, cache = true) => {
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
      getMana:
        (state) =>
        async (address = state.activeAccount.address) => {
          let rc = await defaultProvider.getAccountRc(address);
          let initialMana = Number(rc) / 1e8;
          let mana = Number(initialMana.toFixed(8));

          return mana;
        },
      getPixelsAmount:
        (state) =>
        async (address = state.activeAccount.address, cache = true) => {
          if (!cache) {
            const kanvas = state.kanvasContract;

            const ret = await kanvas.pixel_count_of({
              owner: address,
            });
            let pixelsAmount = Number(ret?.result?.value || 0);
            state.pixelsAmount[address] = pixelsAmount;
          }

          return state.pixelsAmount[address];
        },
      nameAvailable: (state) => {
        return function (name) {
          return (
            state.walletsList.findIndex(function (x) {
              return x.name == name;
            }) == -1 &&
            name != "Kondor" &&
            name != "WalletConnect"
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
          } else if (
            wallet.name == "Kondor" ||
            wallet.name == "WalletConnect"
          ) {
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
        let newSigner;
        if (state.activeWallet.name == "Kondor") {
          newSigner = kondor.getSigner(newActiveAccount.address);
        } else if (state.activeWallet.name == "WalletConnect") {
          newSigner = window.walletConnectKoinos.getSigner(
            newActiveAccount.address
          );
        } else {
          newSigner = Signer.fromWif(newActiveAccount.privateKey, true);
        }

        state.kanvasContract = getKanvasContract(newSigner);
        state.koinContract = getKoinContract(newSigner);
        app.config.globalProperties.$socket.emit(
          "subscribe_wallet_update",
          newActiveAccount.address
        );
      },
      setTokenBalance(state, data) {
        state.tokenBalance[data.address] = data.balance;
      },
      setPixelsAmount(state, data) {
        if (!data.address) data.address = state.activeAccount?.address || "0";
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
      async createWalletWithMnemonic(
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
        await dispatch("unlockWallet", wallet);
      },
      async unlockWallet({ state, commit, dispatch }, { name, password }) {
        let encryptedWallet =
          state.walletsList[
            state.walletsList.findIndex(function (x) {
              return x.name === name;
            })
          ].wallet;

        let wallet;
        if (name == "Kondor" || name == "WalletConnect") {
          wallet = JSON.parse(encryptedWallet);
          if (name == "WalletConnect") {
            // If one already exists, pair it
            await dispatch("pairWalletConnectAccounts", false);
          }
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
          app.config.globalProperties.$error(error);
        }
        if (accounts.length) {
          dispatch("deleteWallet", "Kondor");
          dispatch("addWallet", {
            name: "Kondor",
            accounts: accounts,
          });
          commit("setActiveAccount", state.activeWallet.accounts[0]);
        } else {
          app.config.globalProperties.$error(
            "No Kondor account was selected !"
          );
        }
      },
      async pairWalletConnectAccounts(
        { state, commit, dispatch },
        newConnection = true
      ) {
        const projectId = "52f899f5d7d7e95a07c00ea404e71902";

        window.walletConnectKoinos = new WalletConnectKoinos({
          projectId,
          metadata: {
            name: "Kanvas",
            description:
              "The first collaborative and decentralized canvas, based on the first feeless smart-contract blockchain, Koinos !",
            url: "kanvas-app.com",
            icons: [
              "https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg",
            ],
          },
          modalOptions: {
            explorerRecommendedWalletIds: "NONE",
            enableExplorer: false,
          },
        });

        const walletConnectParams = [
          [ChainIds.Mainnet],
          [Methods.SignAndSendTransaction, Methods.WaitForTransaction],
        ];

        if (newConnection) {
          // Timeout to take time to propagate the disconnection
          dispatch("deleteWallet", "WalletConnect");
          await window.walletConnectKoinos.disconnect();
          setTimeout(async () => {
            const accounts = await window.walletConnectKoinos.connect(
              ...walletConnectParams
            );

            if (accounts.length) {
              let newAccounts = accounts.map((accAddress, index) => {
                return { address: accAddress, name: "Account " + index };
              });
              dispatch("addWallet", {
                name: "WalletConnect",
                accounts: newAccounts,
              });
              commit("setActiveAccount", state.activeWallet.accounts[0]);
            } else {
              app.config.globalProperties.$error(
                "No WalletConnect account was selected !"
              );
            }
          }, 1000);
        } else {
          await window.walletConnectKoinos.connect(...walletConnectParams);
        }
      },
    },
    modules: {},
  });
};
