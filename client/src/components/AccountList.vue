<template>
  <div class="sp-accounts-list">
    <ul v-if="accountsList.length > 0" class="sp-accounts-list-items">
      <li
        v-for="account in accountsList"
        v-bind:key="account.address"
        class="sp-accounts-list-item"
      >
        <div class="sp-accounts-list-item__use">
          <div class="sp-accounts-list-item__path">
            {{ shortenName(account.name) }}
          </div>
          <div
            class="sp-accounts-list-item__address"
            @click="useAccount(account)"
            :class="{ 'sp-active': account.address == currentAccount }"
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
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { copyToClipboard } from "../utils/helpers";

export default defineComponent({
  name: "AccountList",
  data: function () {
    return {
      newAccount: {
        show: false,
        nextAvailable: true,
        pathIncrement: null,
      },
    };
  },
  emits: ["account-selected"],
  computed: {
    accountsList: function () {
      return this.$store.state.accountsList;
    },
    currentAccount: function () {
      return this.$store.state.currentAccount;
    },
  },
  methods: {
    copyAddress: function (address) {
      copyToClipboard(address);
    },
    shortenAddress: function (addr) {
      return addr.substr(0, 10) + "..." + addr.slice(-5);
    },
    shortenName: function (addr) {
      return addr.length > 9
        ? addr.substr(0, 5) + "..." + addr.slice(-3)
        : addr;
    },
    useAccount: async function (account) {
      await this.$store.commit("setCurrentAccount", account);
      this.$emit("account-selected");
    },
  },
});
</script>
