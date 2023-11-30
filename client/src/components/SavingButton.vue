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
      window.Client.game.graphics.sendTransactionToSavePixels();
    },
  },
  props: {
    tooltip: String,
  },
};
</script>
