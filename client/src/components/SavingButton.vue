<template>
  <div>
    <ActionButton
      @click="placePixels"
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
    placePixels() {
      window.Client.game.graphics.sendTransactionToPlacePixels();
    },
  },
  props: {
    tooltip: String,
  },
};
</script>
