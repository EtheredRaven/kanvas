<template>
  <div
    class="pixelsInfo"
    @onmousedown="Client.preventCanvasClick"
    @onmouseup="Client.preventCanvasClick"
    @touchstart="Client.preventCanvasClick"
    @touchend="Client.preventCanvasClick"
    @touchcancel="Client.preventCanvasClick"
    @click="Client.preventCanvasClick"
  >
    <span v-if="hoveredPixel">
      <span v-if="hoveredAccountName" class="bold">
        {{ hoveredAccountName }} </span
      ><span v-else class="bold">
        {{ shortenAddress(hoveredPixel.owner) }}
      </span>
      <br />
      <span class="pixelColor" :style="'background:' + color + ';'" />{{ color
      }}<br />
    </span>
    <img
      src="../../public/img/coordinates.svg"
      alt="coordinates"
      class="coordinates"
    />
    ({{ pointerX }} ; {{ pointerY }})
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { rgbaToString } from "../utils/colors";

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
    color() {
      return rgbaToString(this.hoveredPixel);
    },
  },
});
</script>

<style>
.pixelsInfo {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  text-align: center;
  line-height: 1.5rem;
  padding: 0.7rem 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.8rem 1.6rem -0.3rem rgba(140, 148, 159, 0.15);
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

.coordinates {
  width: 15px;
  margin-bottom: -4px;
}
</style>
