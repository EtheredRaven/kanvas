<template>
  <div>
    <ActionButton
      @click="selectEraseTool"
      icon="erase.svg"
      :showTooltip="isErasedToolSelected"
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
  methods: {
    selectEraseTool() {
      this.$store.commit("setSelectedTool", this.$store.state.tools.ERASE);
    },
  },
  computed: {
    isErasedToolSelected() {
      return this.$store.state.selectedTool == this.$store.state.tools.ERASE;
    },
  },
};
</script>
