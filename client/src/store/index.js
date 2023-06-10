import { createStore } from "vuex";
import * as kondor from "kondor-js";
import { getKanvasContract, getKoinContract } from "../utils/contracts";

export default createStore({
  state: {
    selectedColor: "#000000",
    preventNextClick: false,
    accountsList: [],
    currentAccount: {},
    tokenBalance: {},
    pixelsAmount: {},
  },
  getters: {
    getKoinBalance: () => async (address) => {
      const koinContract = getKoinContract(address);
      const koin = koinContract.functions;

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
          const koinContract = getKoinContract(address);
          const koin = koinContract.functions;

          const ret = await koin.balanceOf({
            owner: address,
          });
          let realKan = Number(ret.result.value) / 1e8;
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
      async (address, cache = true) => {
        if (!cache) {
          const kanvasContract = getKanvasContract(address);
          const kanvas = kanvasContract.functions;

          const ret = await kanvas.pixel_count_of({
            owner: address,
          });
          let pixelsAmount = Number(ret.result.value);
          state.pixelsAmount[address] = pixelsAmount;
        }

        return state.pixelsAmount[address];
      },
  },
  mutations: {
    setAccountsList(state, newAccountsList) {
      state.accountsList = newAccountsList;
    },
    setCurrentAccount(state, newCurrentAccount) {
      state.currentAccount = newCurrentAccount;
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
  actions: {},
  modules: {},
});
