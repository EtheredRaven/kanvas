<template>
  <div>
    <ActionButton
      @click="toggleShowOnlyOwnedPixels"
      icon="showOwnedPixels.svg"
      :showTooltip="showOnlyOwnedPixels"
      tooltip="✓"
      tooltipColor="#019A09"
    ></ActionButton>
  </div>
</template>

<script>
import ActionButton from "./ActionButton.vue";
export default {
  components: {
    ActionButton,
  },
  computed: {
    showOnlyOwnedPixels() {
      return this.$store.state.showOnlyOwnedPixels;
    },
  },
  methods: {
    toggleShowOnlyOwnedPixels() {
      window.Client.game.graphics.togglePixelsOwnerOnly();
    },
  },
};
</script>
