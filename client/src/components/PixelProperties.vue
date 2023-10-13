<template>
  <div class="pixelsInfo" @click="preventNextClick">
    <span v-if="hoveredPixel">
      <span v-if="hoveredAccountName" class="bold">
        {{ hoveredAccountName }} </span
      ><span v-else class="bold">
        {{ shortenAddress(hoveredPixel.owner) }}
      </span>
      <br />
      <span class="pixelColor" :style="'background:' + colorHex + ';'" />{{
        colorHex
      }}<br />
    </span>
    {{ pointerX }} ; {{ pointerY }}
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { rgbToHex } from "../utils/colors";

export default defineComponent({
  name: "PixelProperties",
  props: {
    pointerX: Number,
    pointerY: Number,
    hoveredPixel: Object,
  },
  watch: {
    hoveredPixel() {
      this.resolveKapAccountName();
    },
  },
  data() {
    return {
      hoveredAccountName: null,
    };
  },
  methods: {
    preventNextClick() {
      this.$store.commit("preventNextClick", true);
    },
    shortenAddress(addr) {
      return addr.substr(0, 10) + "..." + addr.slice(-5);
    },
    async resolveKapAccountName() {
      let hoveredPixelOwner = this.hoveredPixel?.owner;
      if (hoveredPixelOwner == this.$store.state.activeAccount?.address)
        return "This account";
      else
        this.hoveredAccountName = await this.$store.getters.getKapName(
          hoveredPixelOwner
        );
    },
  },
  computed: {
    activeAccountAddress: function () {
      return this.$store.state.activeAccount?.address || "";
    },
    colorHex() {
      return (
        this.hoveredPixel &&
        rgbToHex(
          this.hoveredPixel.red,
          this.hoveredPixel.green,
          this.hoveredPixel.blue
        )
      );
    },
  },
});
</script>

<style>
.pixelsInfo {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  text-align: right;
  line-height: 1.5rem;
  padding: 0.7rem 1rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid black;
}

.bold {
  font-weight: bold;
}

.pixelColor {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 4px;
  border-radius: 2px;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 0px 2px;
}
</style>
