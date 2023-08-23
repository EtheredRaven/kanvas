<template>
  <div class="actionButton" @click="preventNextClick">
    <div @click="placePixels">
      <span
        class="actionButtonTooltip"
        v-if="tooltip && tooltip != ''"
        v-bind:style="{ backgroundColor: tooltipColor, color: textColor }"
        >{{ tooltip }}</span
      >
      <img alt="save" src="../../public/img/save.svg" class="actionImage" />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    preventNextClick() {
      // When you chose a color, it should not add a pixel on the map
      this.$store.commit("preventNextClick", true);
    },
    placePixels() {
      window.Client.game.graphics.sendTransactionToPlacePixels();
    },
  },
  props: {
    tooltip: String,
    tooltipColor: {
      type: String,
      default: "#FFFFFF",
    },
    textColor: {
      type: String,
      default: "#111111",
    },
  },
};
</script>

<style>
.actionButton {
  width: 4rem;
  height: 4rem;
  background-color: white;
  cursor: pointer;
  position: fixed;
  top: 9rem;
  right: 7rem;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 0px 16px 0px;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
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
  padding: 0.3rem 0.6rem;
  font-size: 1rem;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 0px 16px 0px;
  border-radius: 1rem;
  z-index: 2;
}

.actionImage:hover {
  opacity: 1;
}
</style>
