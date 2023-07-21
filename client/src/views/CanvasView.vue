<script>
import CanvasComponent from "../components/CanvasComponent";
import ColorPicker from "../components/ColorPicker.vue";
import ManaBar from "@/components/ManaBar.vue";

export default {
  components: {
    CanvasComponent,
    ColorPicker,
    ManaBar,
  },
  computed: {
    currentAccount: function () {
      return this.$store.state.activeAccount;
    },
  },
};
</script>

<template>
  <div>
    <ColorPicker v-if="currentAccount && currentAccount.address" />
    <CanvasComponent />
    <ManaBar />
  </div>
</template>
