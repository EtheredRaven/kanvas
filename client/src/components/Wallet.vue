<template>
  <div class="sp-wallet">
    <div
      class="sp-wallet-menu sp-rounded sp-shadow"
      :class="{ 'sp-opened': opened }"
      v-if="accountsList.length > 0"
      v-click-outside="
        () => {
          opened = false;
        }
      "
    >
      <div class="sp-wallet-menu__toggle" v-on:click="opened = !opened">
        <span
          class="sp-icon"
          :class="{ 'sp-icon-DownCaret': !opened, 'sp-icon-UpCaret': opened }"
        />
      </div>
      <div class="sp-wallet-menu-items">
        <template v-if="currentAccount">
          <div class="sp-wallet-menu-item" v-on:click="opened = !opened">
            <div
              class="sp-wallet-menu-item__avatar"
              v-html="getAvatar(currentAccount.name)"
            ></div>
            <div
              class="sp-wallet-menu-item__avatar-shadow"
              v-html="getAvatar(currentAccount.name)"
            ></div>
            <div class="sp-wallet-menu-item__info">
              <span class="sp-text sp-bold sp-active">{{
                currentAccount.name
              }}</span>
              <br />
              <span
                class="sp-text"
                :alt="currentAccount"
                :title="currentAccount"
              >
                {{ shortAddress }}
              </span>
            </div>
            <div class="sp-wallet-menu-item__status"></div>
          </div>
        </template>
        <template v-if="accountsList">
          <div class="sp-wallet-menu__accounts">
            <AccountList v-on:accountSelected="() => (opened = false)" />
          </div>
        </template>
      </div>
    </div>
    <KanvasButton @click="connectKondor" v-else>Connect Kondor</KanvasButton>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import KanvasButton from "./KanvasButton";
import AccountList from "./AccountList";
import avatar from "gradient-avatar";
import MD5 from "crypto-js/md5";
import * as kondor from "kondor-js";

export default defineComponent({
  name: "Wallet",
  components: {
    KanvasButton,
    AccountList,
  },
  data: function () {
    return {
      opened: false,
    };
  },
  computed: {
    accountsList: function () {
      return this.$store.state.accountsList;
    },
    currentAccount: function () {
      return this.$store.state.currentAccount;
    },
    shortAddress: function () {
      if (this.currentAccount) {
        return (
          this.currentAccount.address.substr(0, 10) +
          "..." +
          this.currentAccount.address.slice(-5)
        );
      } else {
        return null;
      }
    },
  },
  methods: {
    connectKondor: async function () {
      let accounts;
      try {
        accounts = await kondor.getAccounts();
      } catch (error) {
        console.error(error);
      }
      if (accounts.length) {
        this.$store.commit("setAccountsList", accounts);
        this.$store.commit("setCurrentAccount", accounts[0]);

        this.$socket.emit("subscribe_wallet_update", accounts);
      }
    },
    getAvatar: function (name) {
      return avatar(MD5(name) + "", 64);
    },
  },
});
</script>
