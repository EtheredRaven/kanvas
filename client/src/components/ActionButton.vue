<template>
  <div
    class="actionButton animate__animated animate__bounceInRight"
    @onmousedown="Client.preventCanvasClick"
    @onmouseup="Client.preventCanvasClick"
    @touchstart="Client.preventCanvasClick"
    @touchend="Client.preventCanvasClick"
    @touchcancel="Client.preventCanvasClick"
    @click="Client.preventCanvasClick"
  >
    <div @click="$emit('click')">
      <span
        class="actionButtonTooltip"
        v-if="tooltip && tooltip != ''"
        v-bind:style="{ backgroundColor: tooltipColor, color: textColor }"
        >{{ tooltip }}</span
      >
      <img alt="save" v-bind:src="'/app/img/' + icon" class="actionImage" />
    </div>
  </div>
</template>

<script>
export default {
  emits: ["click"],
  props: {
    icon: String,
    tooltip: String,
    tooltipColor: {
      type: String,
      default: "#9B0046",
    },
    textColor: {
      type: String,
      default: "#FFFFFF",
    },
  },
};
</script>

<style>
.actionButton {
  display: flex;
  width: 4rem;
  height: 4rem;
  background-color: white;
  cursor: pointer;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 0px 16px 0px;
  z-index: 1;
  justify-content: center;
  align-items: center;
  position: relative;
}

.actionImage {
  width: 2.5rem;
  height: auto;
  color: #111111;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.actionButtonTooltip {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  padding: 0.3rem 0.5rem;
  font-size: 1rem;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 0px 16px 0px;
  border-radius: 1rem;
  z-index: 2;
  min-width: 18px;
  text-align: center;
}

.actionImage:hover {
  opacity: 1;
}
</style>
