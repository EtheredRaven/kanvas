<template>
  <div>
    <ActionButton
      @click="savePixels"
      :tooltip="tooltip"
      icon="save.svg"
    ></ActionButton>
  </div>
</template>

<script>
import ActionButton from "./ActionButton.vue";
export default {
  components: {
    ActionButton,
  },
  methods: {
    savePixels() {
      // Do not send if there is no pixels to save
      if (
        this.$store.state.pixelsToPlace.length == 0 &&
        this.$store.state.pixelsToErase.length == 0
      )
        return this.$error(
          "You need to place or erase at least one pixel to save the transaction!"
        );
      window.Client.game.graphics.sendTransactionToSavePixels();
    },
  },
  props: {
    tooltip: String,
  },
};
</script>
