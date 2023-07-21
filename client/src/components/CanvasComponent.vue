<template>
  <div>
    <div
      id="gameContainer"
      :style="'display:' + (gameGraphics ? 'show' : 'hidden') + ';'"
    />
    <PointerPosition v-bind:pointerX="pointerX" v-bind:pointerY="pointerY" />
  </div>
</template>

<script>
import PointerPosition from "./PointerPosition";
import { InitSocketFunctions } from "../game/socket/index";
let Client = window.Client;

export default {
  components: {
    PointerPosition,
  },
  created() {
    InitSocketFunctions(this);
  },
  async mounted() {
    const gameGraphicsScript = await import("../game/phaser/index");
    this.$nextTick(() => {
      Client.game = {
        graphics: gameGraphicsScript.launch("gameContainer", this),
        vue: this,
      };
      let graphicsLoadingInterval = setInterval(() => {
        let scenes = Client.game.graphics.scene.scenes;
        if (scenes.length && this.pixelsArray && scenes[0].pixelGraphics) {
          this.gameGraphics = Client.game.graphics;
          Client.game.graphics = Client.game.graphics.scene.scenes[0];
          this.sceneInstance = Client.game.graphics;

          this.sceneInstance.initCamera();
          this.sceneInstance.initPixelMap();
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
      loadingPixels: [],
      pixelsArray: null,
      canvasDimensions: null,
      pointerX: 0,
      pointerY: 0,
    };
  },
  computed: {
    activeAccountAddress() {
      return this.$store.state.activeAccount
        ? this.$store.state.activeAccount.address
        : "";
    },
  },
  methods: {
    updatePointer(x, y) {
      this.pointerX = x;
      this.pointerY = y;
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
