<template>
  <div>
    <Wallet
      ref="wallet"
      v-on:dropdown-opened="$refs.menu.closeDropdown()"
      @click="preventNextClick"
    />
    <div v-if="currentAccount && currentAccount.address">
      <ColorPicker />
      <div class="actionButtonsContainer topActionButtonsContainer">
        <SavingButton
          v-bind:tooltip="pixelsToPlace.length || pixelsToErase.length || ''"
        />
      </div>
      <div class="actionButtonsContainer bottomActionButtonsContainer">
        <EraseButton />
        <DrawButton />
      </div>
    </div>
    <CanvasComponent />
    <ManaBar />
  </div>
</template>

<script>
import Wallet from "@/components/Wallet";
import CanvasComponent from "@/components/CanvasComponent";
import ColorPicker from "@/components/ColorPicker.vue";
import ManaBar from "@/components/ManaBar.vue";
import SavingButton from "@/components/SavingButton.vue";
import EraseButton from "@/components/EraseButton.vue";
import DrawButton from "@/components/DrawButton.vue";

export default {
  components: {
    CanvasComponent,
    ColorPicker,
    ManaBar,
    SavingButton,
    EraseButton,
    DrawButton,
    Wallet,
  },
  computed: {
    currentAccount: function () {
      return this.$store.state.activeAccount;
    },
    pixelsToPlace() {
      return this.$store.state.pixelsToPlace;
    },
    pixelsToErase() {
      return this.$store.state.pixelsToErase;
    },
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
  },
};
</script>

<style>
.actionButtonsContainer {
  position: fixed;
  display: flex;
  gap: 1rem;
}

.topActionButtonsContainer {
  top: 9rem;
  right: 7rem;
}

.bottomActionButtonsContainer {
  top: 14rem;
  right: 2rem;
  flex-direction: column-reverse;
}
</style>
