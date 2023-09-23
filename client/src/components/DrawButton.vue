<template>
  <div>
    <ActionButton
      @click="selectDrawTool"
      icon="draw.svg"
      :tooltip="isDrawToolSelected && '✓'"
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
  methods: {
    selectDrawTool() {
      this.$store.commit("setSelectedTool", this.$store.state.tools.DRAW);
    },
  },
  computed: {
    isDrawToolSelected() {
      return this.$store.state.selectedTool == this.$store.state.tools.DRAW;
    },
  },
};
</script>
