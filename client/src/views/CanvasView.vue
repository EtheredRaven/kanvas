<template>
  <div>
    <Wallet
      ref="wallet"
      v-on:dropdown-opened="$refs.menu.closeDropdown()"
      @onmousedown="Client.preventCanvasClick"
      @onmouseup="Client.preventCanvasClick"
      @touchstart="Client.preventCanvasClick"
      @touchend="Client.preventCanvasClick"
      @touchcancel="Client.preventCanvasClick"
      @click="Client.preventCanvasClick"
    />
    <!-- Fade opacity animation -->
    <div class="buttonsContainer">
      <div v-if="currentAccount && currentAccount.address">
        <ColorPicker />
        <div class="actionButtonsContainer topActionButtonsContainer">
          <SavingButton
            v-bind:tooltip="pixelsToPlace.length || pixelsToErase.length"
          />
        </div>
        <div class="actionButtonsContainer bottomActionButtonsContainer">
          <ImportButton v-if="bestKanvasGodId" />
          <ShowOnlyOwnedPixelsButton />
          <EraseButton />
          <DrawButton />
        </div>
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
import ImportButton from "@/components/ImportButton.vue";
import ShowOnlyOwnedPixelsButton from "@/components/ShowOnlyOwnedPixelsButton.vue";

export default {
  components: {
    CanvasComponent,
    ColorPicker,
    ManaBar,
    SavingButton,
    EraseButton,
    ShowOnlyOwnedPixelsButton,
    DrawButton,
    Wallet,
    ImportButton,
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
    bestKanvasGodId() {
      return this.$store.getters.getBestKanvasGodId();
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

.buttonsContainer {
  transition: 0.3s ease;
}
</style>
