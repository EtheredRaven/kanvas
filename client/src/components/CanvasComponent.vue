<template>
  <div>
    <div
      id="gameContainer"
      :style="'display:' + (gameGraphics ? 'show' : 'hidden') + ';'"
    />
    <PixelProperties
      v-bind:pointerX="pointerX"
      v-bind:pointerY="pointerY"
      v-bind:hoveredPixel="hoveredPixel"
    />
    <ZoomLevel />
  </div>
</template>

<script>
import PixelProperties from "./PixelProperties";
import ZoomLevel from "./ZoomLevel";
import { InitSocketFunctions } from "../game/socket/index";
let Client = window.Client;

export default {
  components: {
    PixelProperties,
    ZoomLevel,
  },
  created() {
    this.$socket.emit("get_pixel_map_data");
    InitSocketFunctions(this);
  },
  async mounted() {
    const gameGraphicsScript = await import("../game/phaser/index");
    this.$nextTick(() => {
      Client.game = {
        graphics: gameGraphicsScript.launch("gameContainer", this),
        vue: this,
      };
      let graphicsLoadingStep = 1;
      let graphicsLoadingInterval = setInterval(() => {
        if (
          graphicsLoadingStep == 1 &&
          Client.game.graphics.scene.scenes.length &&
          Client.game.graphics.scene.scenes[0].pixelGraphics
        ) {
          this.gameGraphics = Client.game.graphics;
          Client.game.graphics = Client.game.graphics.scene.scenes[0];
          this.sceneInstance = Client.game.graphics;
          this.sceneInstance.initCamera();
          graphicsLoadingStep = 2;
        }
        if (graphicsLoadingStep == 2 && this.pixelsDataReceived) {
          this.sceneInstance.initPixelMapData();
          clearInterval(graphicsLoadingInterval);
        }
      }, 100);
    });
  },
  unmounted() {
    this.gameGraphics && this.gameGraphics.destroy(true);
    this.sceneInstance = null;
    Client.game = undefined;
  },
  data() {
    return {
      gameGraphics: null,
      sceneInstance: null,
      pixelsArray: [],
      pixelsMap: {},
      canvasDimensions: {
        canvas_width: 1000,
        canvas_height: 1000,
      },
      pointerX: 0,
      pointerY: 0,
      hoveredPixel: null,
      pixelsDataReceived: false,
    };
  },
  computed: {
    activeAccountAddress() {
      return this.$store.state.activeAccount?.address || "";
    },
  },
  methods: {
    updatePixelProperties(x, y, pixel) {
      this.pointerX = x;
      this.pointerY = y;
      this.hoveredPixel = pixel;
    },
  },
};
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
