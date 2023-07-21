<template>
  <div class="sp-wallet">
    <WalletMenu
      v-if="walletsList.length > 0 && !create"
      v-on:createNew="create = true"
    />
    <KanvasButton
      v-else-if="walletsList.length == 0 && !create"
      v-on:click="create = true"
      >Access wallet</KanvasButton
    >
    <WalletCreate title="Access wallet" v-else v-on:close="create = false">
      Create or import an existing wallet
    </WalletCreate>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import WalletMenu from "./WalletMenu";
import WalletCreate from "./WalletCreate";
import KanvasButton from "./KanvasButton";

export default defineComponent({
  name: "Wallet",
  components: {
    KanvasButton,
    WalletMenu,
    WalletCreate,
  },
  data: function () {
    return {
      create: false,
    };
  },
  computed: {
    walletsList: function () {
      return this.$store.state.walletsList;
    },
  },
});
</script>
