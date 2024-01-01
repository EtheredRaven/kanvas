import { createStore as createVuexStore } from "vuex";
import * as kondor from "kondor-js";
import { Signer, utils } from "koilib";
import {
  getKanvasContract,
  getKanvasGodsContract,
  getKoinContract,
  provider,
  getNicknamesContract,
} from "../utils/contracts";
import { getMockupContract, getMockupWallet } from "../utils/demo";
import CryptoJS from "crypto-js";
import HDKoinos from "../utils/HDKoinos";
import {
  ChainIds,
  Methods,
  WalletConnectKoinos,
} from "@armana/walletconnect-koinos-sdk-js";
import Cookies from "js-cookie";
import { getKapProfileContract } from "../utils/contracts";

const kapProfile = getKapProfileContract();
const nicknamesContract = getNicknamesContract();

export const createStore = (app) => {
  return createVuexStore({
    state: {
      tools: {
        DRAW: 1,
        ERASE: 2,
      },
      selectedColor:
        window.localStorage.getItem("last-canvas-color") || "rgba(0, 0, 0, 1)",
      selectedTool: 1,
      zoomLevel: 1,
      walletsList: JSON.parse(window.localStorage.getItem("wallets")) || [
        getMockupWallet(),
      ],
      activeWallet: null,
      activeAccount: null,
      pixelsToPlace: [],
      pixelsToErase: [],
      addressesData: {},
      pixelsAmount: {},
      showOnlyOwnedPixels: false,
      kanvasContract: getKanvasContract(),
      kanvasGodsContract: getKanvasGodsContract(),
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
            const ret = await state.kanvasContract.balance_of({
              owner: address,
            });
            let realKan = Number(ret?.result?.value || 0) / 1e8;
            state.addressesData[address].tokenBalance = realKan;
          }

          return state.addressesData[address].tokenBalance;
        },
      getKanvasGodsList:
        (state) =>
        async (address = state.activeAccount.address, cache = true) => {
          if (!cache) {
            const kanvasGodsResult = await state.kanvasGodsContract.tokens_of({
              owner: address,
            });
            state.addressesData[address].kanvasGodsList =
              kanvasGodsResult?.result?.token_id?.map((id) => Number(id)) || [];

            // Store it in a cookie for this address to make it default value next time it loads
            state.addressesData[address].kanvasGodsList.length &&
              Cookies.set(
                "kanvasGodsList" + address,
                state.addressesData[address].kanvasGodsList
              );
          }

          return state.addressesData[address].kanvasGodsList;
        },
      getBestKanvasGodId: (state) => {
        return function (address = state.activeAccount.address) {
          let kanvasGodsList = state.addressesData[address].kanvasGodsList;
          if (!kanvasGodsList || !kanvasGodsList.length) return 0;
          let minId = Math.min(...kanvasGodsList.map((x) => parseInt(x)));
          return minId;
        };
      },
      getPixelsPerTx:
        (state) =>
        async (address = state.activeAccount.address, cache = true) => {
          if (!cache) {
            const pixelsPerTxResult =
              await state.kanvasContract.pixels_per_tx_of({
                owner: address,
              });
            state.addressesData[address].pixelsPerTx = Number(
              pixelsPerTxResult?.result?.value
            );
          }

          return state.addressesData[address].pixelsPerTx;
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
            state.addressesData[address].pixelsAmount = pixelsAmount;
          }

          return state.addressesData[address].pixelsAmount;
        },
      getMana:
        (state) =>
        async (address = state.activeAccount.address) => {
          let rc = await provider.getAccountRc(address);
          let initialMana = Number(rc) / 1e8;
          let mana = Number(initialMana.toFixed(8));

          return mana;
        },
      getKapName: () => async (hoveredPixelOwner) => {
        if (!hoveredPixelOwner) return null;
        let cacheName = Cookies.get(hoveredPixelOwner);
        if (cacheName) return cacheName == "null" ? null : cacheName;
        else {
          const { result } = await kapProfile.get_profile({
            address: hoveredPixelOwner,
          });

          let hoveredAccountName = result?.name || null;

          if (!hoveredAccountName) {
            const { result } =
              await nicknamesContract.functions.get_tokens_by_owner({
                owner: hoveredPixelOwner,
                start: "",
                limit: 20,
              });

            const tokenIds = result?.token_ids || [];
            const names = tokenIds.map((tId) => {
              return new TextDecoder().decode(utils.toUint8Array(tId.slice(2)));
            });

            if (names && names.length) hoveredAccountName = "@" + names[0];
          }
          Cookies.set(hoveredPixelOwner, hoveredAccountName, {
            expires: 7,
          });
          return hoveredAccountName;
        }
      },
      nameAvailable: (state) => {
        return function (name) {
          return (
            state.walletsList.findIndex(function (x) {
              return x.name == name;
            }) == -1 &&
            name != "Kondor" &&
            name != "WalletConnect" &&
            name != "Demo"
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
        let storedLastWallet = window.localStorage.getItem("lastWallet");
        if (state.activeWallet) {
          return state.activeWallet.name;
        } else if (storedLastWallet) {
          return storedLastWallet;
        } else {
          return "Demo";
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
      getCachedData(state) {
        // Get cached nft list from cookies to store it in the state for a given address
        return function (address = state.activeAccount.address) {
          let cachedData = Cookies.get("kanvasGodsList" + address);
          if (cachedData) {
            state.addressesData[address].nftList = JSON.parse(cachedData);
          }
        };
      },
    },
    mutations: {
      setSelectedTool(state, newSelectedTool) {
        state.selectedTool = newSelectedTool;
      },
      setShowOnlyOwnedPixels(state, newShowOnlyOwnedPixels) {
        state.showOnlyOwnedPixels = newShowOnlyOwnedPixels;
      },
      setZoomLevel(state, newZoomLevel) {
        state.zoomLevel = newZoomLevel;
      },
      addPixelToPlace(state, pixelToPlace) {
        state.pixelsToPlace = [...state.pixelsToPlace, pixelToPlace];
      },
      addPixelsToPlace(state, pixelsToPlace) {
        state.pixelsToPlace = [...state.pixelsToPlace, ...pixelsToPlace];
      },
      addPixelToErase(state, pixelToErase) {
        state.pixelsToErase = [...state.pixelsToErase, pixelToErase];
      },
      removePixelToPlace(state, pixelToPlace) {
        let i = state.pixelsToPlace.indexOf(pixelToPlace);
        if (i > -1) {
          let startArray = i == 0 ? [] : state.pixelsToPlace.slice(0, i);
          let endArray =
            i == state.pixelsToPlace.length - 1
              ? []
              : state.pixelsToPlace.slice(i + 1, state.pixelsToPlace.length);
          state.pixelsToPlace = [...startArray, ...endArray];
        }
      },
      removePixelsToPlace(state) {
        state.pixelsToPlace = [];
      },
      removePixelsToErase(state) {
        state.pixelsToErase = [];
      },
      setActiveWallet(state, newActiveWallet) {
        state.activeWallet = newActiveWallet;
        window.localStorage.setItem("lastWallet", newActiveWallet.name);
      },
      setActiveAccountNonce(state, newNonce) {
        state.activeAccount.nonce = newNonce;
      },
      setTokenBalance(state, data) {
        state.addressesData[data.address].tokenBalance = data.balance;
      },
      setPixelsAmount(state, data) {
        if (!data.address) data.address = state.activeAccount?.address || "0";
        state.addressesData[data.address].pixelsAmount = data.amount;
      },
      changeColor(state, newColor) {
        state.selectedColor = newColor;
      },
    },
    actions: {
      storeWallets({ state, getters }, walletToUpdate) {
        if (walletToUpdate) {
          let newStoredWallet = getters.getWalletAsStoredFormat(walletToUpdate);
          if (newStoredWallet) {
            let walletIndex = state.walletsList.findIndex(
              (w) => w.name == walletToUpdate.name
            );
            state.walletsList[walletIndex] = newStoredWallet;
          }
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
        } else if (name == "Demo") {
          wallet = encryptedWallet;
        } else {
          wallet = JSON.parse(
            CryptoJS.AES.decrypt(encryptedWallet, password).toString(
              CryptoJS.enc.Utf8
            )
          );
        }

        commit("setActiveWallet", wallet);
        await dispatch("setActiveAccount", wallet.accounts[0]);
      },
      signOut({ state }) {
        state.activeWallet = null;
        state.activeAccount = null;
      },
      async setActiveAccount({ state, getters }, newActiveAccount) {
        state.activeAccount = newActiveAccount;
        /*state.activeAccount.nonce = await provider.getNonce(
          newActiveAccount.address
        );*/

        if (!state.addressesData[newActiveAccount.address])
          state.addressesData[newActiveAccount.address] = {};

        let newSigner;
        if (state.activeWallet.name == "Demo") {
          state.kanvasContract = getMockupContract();
        } else {
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
        }

        getters.getKanvasGodsList(state.activeAccount.address, false);
        getters.getPixelsPerTx(state.activeAccount.address, false);

        // Call functions that may be need on the phaser side when the account is changed (caching data and things like that)
        window.Client.game.graphics.performAccountChangeUpdate();

        state.koinContract = getKoinContract(newSigner);
        app.config.globalProperties.$socket.emit(
          "subscribe_wallet_update",
          newActiveAccount.address
        );
      },
      async switchAccount({ state, dispatch }, address) {
        let accountIndex = state.activeWallet.accounts.findIndex(function (
          acc
        ) {
          return acc.address == address;
        });
        await dispatch(
          "setActiveAccount",
          state.activeWallet.accounts[accountIndex]
        );
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
      async deleteWalletConnect({ dispatch }) {
        if (window.walletConnectKoinos) {
          dispatch("deleteWallet", "WalletConnect");
          await window.walletConnectKoinos.disconnect();
        }
      },
      async changeKondorAccounts({ state, dispatch }) {
        let accounts;
        try {
          accounts = await kondor.getAccounts();
        } catch (error) {
          app.config.globalProperties.$error(error);
          return false;
        }
        if (accounts.length) {
          setTimeout(async () => {
            dispatch("deleteWallet", "Kondor");
            dispatch("addWallet", {
              name: "Kondor",
              accounts: accounts,
            });
            await dispatch("setActiveAccount", state.activeWallet.accounts[0]);
          }, 300);
          return true;
        } else {
          app.config.globalProperties.$error(
            "No Kondor account was selected !"
          );
          return false;
        }
      },
      async pairWalletConnectAccounts(
        { state, dispatch },
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
            icons: ["https://kanvas-app.com/app/img/icon100x100.png"],
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
          await dispatch("deleteWalletConnect");
          // Wait for 1 second with a Promise
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
            await dispatch("setActiveAccount", state.activeWallet.accounts[0]);
          } else {
            app.config.globalProperties.$error(
              "No WalletConnect account was selected !"
            );
          }
        } else {
          await window.walletConnectKoinos.connect(...walletConnectParams);
        }
      },
    },
    modules: {},
  });
};
