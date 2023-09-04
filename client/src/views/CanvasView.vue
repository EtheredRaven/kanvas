<script>
import Wallet from "../components/Wallet";
import CanvasComponent from "../components/CanvasComponent";
import ColorPicker from "../components/ColorPicker.vue";
import ManaBar from "@/components/ManaBar.vue";
import SavingButton from "@/components/SavingButton.vue";

export default {
  components: {
    CanvasComponent,
    ColorPicker,
    ManaBar,
    SavingButton,
    Wallet,
  },
  computed: {
    currentAccount: function () {
      return this.$store.state.activeAccount;
    },
    pixelsToPlace() {
      return this.$store.state.pixelsToPlace;
    },
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
  },
};
</script>

<template>
  <div>
    <Wallet
      ref="wallet"
      v-on:dropdown-opened="$refs.menu.closeDropdown()"
      @click="preventNextClick"
    />
    <div v-if="currentAccount && currentAccount.address">
      <ColorPicker />
      <SavingButton
        v-bind:tooltip="pixelsToPlace.length ? pixelsToPlace.length : ''"
        tooltipColor="#9B0046"
        textColor="white"
      />
    </div>
    <CanvasComponent />
    <ManaBar />
  </div>
</template>
