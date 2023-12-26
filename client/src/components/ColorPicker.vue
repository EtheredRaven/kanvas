<template>
  <div
    @onmousedown="Client.preventCanvasClick"
    @onmouseup="Client.preventCanvasClick"
    @touchstart="Client.preventCanvasClick"
    @touchend="Client.preventCanvasClick"
    @touchcancel="Client.preventCanvasClick"
    @click="Client.preventCanvasClick"
    class="animate__animated animate__bounceInRight colorPicker"
  >
    <div
      :style="selectedColorStyle"
      @click="showColorPicker = !showColorPicker"
    ></div>
    <div v-if="renderColorPicker">
      <ColorPicker
        :style="colorPickerStyle"
        theme="light"
        :color="color"
        @changeColor="changeColor"
        :colors-history-key="
          ownsAGod ? 'canvas-colors-history' : 'canvas-colors-history-no-god'
        "
      />
    </div>
  </div>
</template>

<script>
import { ColorPicker } from "vue-color-kit";
import "vue-color-kit/dist/vue-color-kit.css";
import { rgbaToString } from "../utils/colors";

export default {
  components: {
    ColorPicker,
  },
  data() {
    return {
      showColorPicker: false,
      gameCanvas: null,
      suckerArea: [],
      renderColorPicker: true,
    };
  },
  created() {
    window.Client.game.vue.forceRenderColorPicker = this.forceRenderColorPicker;
  },
  computed: {
    color() {
      return this.$store.state.selectedColor;
    },
    ownsAGod() {
      this.forceRenderColorPicker();
      return this.$store.getters.getBestKanvasGodId() > 0;
    },
    selectedColorStyle() {
      return `
        width:4rem;
        height:4rem;
        background-color:${this.color};
        cursor: pointer;
        position: fixed;
        top: 9rem;
        right: 2rem;
        border-radius: 12px;
        box-shadow: 0 0 16px 0 rgb(0 0 0 / 16%);
        z-index: 1;
      `;
    },
    colorPickerStyle() {
      return `
        visibility:${this.showColorPicker ? "visible" : "hidden"};
        opacity:${this.showColorPicker ? 1 : 0};
        transition:visibility 0.3s linear,opacity 0.3s linear;
        position: fixed;
        top: 14rem;
        right: 2rem;
        border-radius: 12px;
        z-index: 1;
      `;
    },
  },
  methods: {
    changeColor(color) {
      let colorString = rgbaToString({
        r: color.rgba.r,
        g: color.rgba.g,
        b: color.rgba.b,
        a: Math.round(color.rgba.a * 255),
      });
      this.$store.commit("changeColor", colorString);
    },
    async forceRenderColorPicker() {
      this.renderColorPicker = false;
      await this.$nextTick();
      this.renderColorPicker = true;
    },
  },
};
</script>

<style>
.colorPicker {
  position: relative;
  z-index: 2;
}
</style>
