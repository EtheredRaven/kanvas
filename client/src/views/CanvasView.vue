<script>
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
  },
  computed: {
    currentAccount: function () {
      return this.$store.state.activeAccount;
    },
    pixelsToPlace() {
      return this.$store.state.pixelsToPlace;
    },
  },
};
</script>

<template>
  <div>
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
