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
    };
  },
  computed: {
    color() {
      return this.$store.state.selectedColor;
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
      this.$store.commit(
        "changeColor",
        rgbaToString({
          r: color.rgba.r,
          g: color.rgba.g,
          b: color.rgba.b,
          a: Math.round(color.rgba.a * 255),
        })
      );
    },
    preventNextClick() {
      // When you chose a color, it should not add a pixel on the map
      this.$store.commit("preventNextClick", true);
    },
  },
};
</script>

<template>
  <div @click="preventNextClick">
    <div
      :style="selectedColorStyle"
      @click="showColorPicker = !showColorPicker"
    ></div>
    <ColorPicker
      :style="colorPickerStyle"
      theme="light"
      :color="color"
      :sucker-hide="true"
      @changeColor="changeColor"
    />
  </div>
</template>
