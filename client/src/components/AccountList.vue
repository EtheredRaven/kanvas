<template>
  <div class="sp-accounts-list">
    <ul v-if="accountList.length > 0" class="sp-accounts-list-items">
      <li
        v-for="account in accountList"
        v-bind:key="account.address"
        class="sp-accounts-list-item"
      >
        <div class="sp-accounts-list-item__use">
          <div class="sp-accounts-list-item__path">
            {{ account.pathIncrement || shortenName(account.name) }}
          </div>
          <div
            class="sp-accounts-list-item__address"
            @click="useAccount(account.address)"
            :class="{ 'sp-active': account.address == activeAccountAddress }"
          >
            {{ shortenAddress(account.address) }}
          </div>
          <div
            class="sp-accounts-list-item__copy"
            @click="copyAddress(account.address)"
          >
            <span class="sp-icon sp-icon-Copy" />
          </div>
        </div>
      </li>
    </ul>
    <div class="sp-accounts-new" v-if="activeWallet.name == 'Kondor'">
      <LinkIcon
        icon="Reload"
        text="Change linked accounts"
        v-on:click="changeKondorAccounts"
      />
    </div>
    <div class="sp-accounts-new" v-else-if="activeWallet.mnemonic">
      <LinkIcon
        icon="AddNew"
        text="Generate new address"
        v-on:click="createAccount"
      />
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import LinkIcon from "./LinkIcon";
import { copyToClipboard } from "../utils/helpers";

export default defineComponent({
  name: "AccountList",
  components: {
    LinkIcon,
  },
  emits: ["account-selected"],
  computed: {
    activeWallet: function () {
      return this.$store.state.activeWallet;
    },
    accountList: function () {
      return this.$store.state.activeWallet.accounts;
    },
    activeAccountAddress: function () {
      return this.$store.getters.activeAccountAddress;
    },
  },
  methods: {
    copyAddress: function (address) {
      copyToClipboard(address);
    },
    shortenName: function (addr) {
      return addr.length > 9
        ? addr.substr(0, 5) + "..." + addr.slice(-3)
        : addr;
    },
    shortenAddress: function (addr) {
      return addr.substr(0, 10) + "..." + addr.slice(-5);
    },
    useAccount: async function (address) {
      await this.$store.dispatch("switchAccount", address);
      this.$emit("account-selected");
    },
    createAccount: async function () {
      await this.$store.dispatch("addAccount");
    },
    async changeKondorAccounts() {
      await this.$store.dispatch("changeKondorAccounts");
    },
  },
});
</script>
