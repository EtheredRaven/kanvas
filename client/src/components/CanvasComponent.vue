<script>
import Phaser from "phaser";
import { hexToHexNumber, hexToRgb } from "../utils/colors";
import { kanvasContractAbi } from "../utils/abi";
import * as kondor from "kondor-js";
import { Contract } from "koilib";
import PointerPosition from "./PointerPosition";

export default {
  components: {
    PointerPosition,
  },
  created() {
    // Phaser instance for the pixel canvas
    this.initializePhaserGame = true;

    // Get the pixel map data
    this.$socket.on("pixel_map_data", (data) => {
      this.pixelsArray = data.pixels;
      this.canvasDimensions = data.canvas_dimensions;
    });

    // Socket events
    this.$socket.on("update_token_balance", (data) => {
      this.$store.commit("setTokenBalance", data);
    });

    this.$socket.on("update_pixels_amount", (data) => {
      this.$store.commit("setPixelsAmount", data);
    });

    this.$socket.on("pixel_placed", (pixelPlaced) => {
      this.sceneInstance && this.drawPixel(pixelPlaced);
    });

    // Link the vue and phaser instances once the latter is initialized, try every 200ms
    let linkingInterval = setInterval(() => {
      if (this.game.instance && this.pixelsArray.length > 0) {
        // The references are made in both ways : phaser -> vue and vue -> phaser
        this.sceneInstance = this.game.instance.scene.scenes[0]; // phaser reference in vue instance
        this.game.instance.vueInstance = this; // vue reference in phaser instance
        if (this.sceneInstance.pixelGraphics) {
          this.initPixelMap();
          clearInterval(linkingInterval); // If done, no need to try to link anymore
        }
      }
    }, 100);
  },
  data() {
    return {
      initializePhaserGame: false,
      sceneInstance: null,
      loadingPixels: [],
      pixelsArray: [],
      canvasDimensions: null,
      pointerX: 0,
      pointerY: 0,
      game: {
        // Phaser instance of the game (canvas)
        width: Math.floor(window.visualViewport.width), //  substract the menu width
        height: Math.floor(window.visualViewport.height),
        backgroundColor: "#FFFFFF",
        type: Phaser.AUTO,
        pixelArt: true,
        scene: {
          init() {},
          preload() {
            this.load.image("pixel", "./img/pixel.png");
          },
          create() {
            // Init game canvas
            this.renderer.clearBeforeRender = false;
            this.cameras.main.setRoundPixels(false);
            this.cameras.main.zoom = 4;

            // Zooming behavior
            this.input.on("wheel", (pointer, dx, dy, dz) => {
              this?.game?.vueInstance?.zoomOnCanvas(pointer, dz);
            });

            // Graphics drawers
            this.pixelGraphics = this.add.graphics();
            this.selectorGraphics = this.add.graphics();

            // Counter for animations
            this.t = 0;
            this.tSign = 1;
            this.periodicity = 20;
          },
          update() {
            if (!this?.game?.vueInstance) {
              return;
            }

            // Init the camera and the pixel map (canvas)
            this.game.vueInstance.initCamera();

            if (!this.pixelMapInitialized || !this.cameraInitialized) {
              return;
            }

            // Animations for loading pixels
            this.t += this.tSign;
            (this.t == 0 || this.t == this.periodicity) &&
              (this.tSign = -this.tSign);

            this.game.vueInstance.loadingPixels.forEach((px) => {
              this.game.vueInstance.animateLoadingPixel(px, this.t);
            });

            // Draw pixel placeholder if connected to a wallet
            this.game.vueInstance.currentAccountAddress &&
              this.game.vueInstance.drawPixelPlaceholder();

            // Try to place a pixel only if the user is not moving the canvas
            this.game.vueInstance.moveCanvasOnMouseMove() &&
              this.game.vueInstance.placePixelIfClicked() &&
              this.game.vueInstance.resetMovingVariables();

            // Update mouse position
            this.game.vueInstance.pointerX = this.input.activePointer.worldX;
            this.game.vueInstance.pointerY = this.input.activePointer.worldY;
          },
        },
      },
    };
  },
  computed: {
    currentAccountAddress() {
      return this.$store.state.currentAccount.address;
    },
  },
  methods: {
    initCamera() {
      // Init the camera once we get the local params from the blockchain
      if (!this.canvasDimensions || this.sceneInstance.cameraInitialized) {
        return;
      }

      this.sceneInstance.cameras.main.setBounds(
        0,
        0,
        Number(this.canvasDimensions.canvas_width),
        Number(this.canvasDimensions.canvas_height),
        true
      );

      this.sceneInstance.cameraInitialized = true;
    },
    initPixelMap() {
      // Draw the pixel map on the canvas once we retrieved it from the blockchain
      if (!this.pixelsArray || !this.canvasDimensions) {
        return;
      }

      // For each pixel in the array
      this.pixelsArray.forEach((pixel) => {
        this.drawPixel(pixel);
      });
      this.sceneInstance.pixelMapInitialized = true;
    },
    drawPixel(pixel) {
      // Parse the color
      let red = parseInt(pixel.red).toString(16);
      red = red.length == 1 ? "0" + red : red;
      let green = parseInt(pixel.green).toString(16);
      green = green.length == 1 ? "0" + green : green;
      let blue = parseInt(pixel.blue).toString(16);
      blue = blue.length == 1 ? "0" + blue : blue;

      // Draw the pixel
      this.sceneInstance.pixelGraphics.fillStyle(
        parseInt(`0x${red}${green}${blue}`)
      );
      this.sceneInstance.pixelGraphics.fillRect(
        parseInt(pixel.posX),
        parseInt(pixel.posY),
        1,
        1
      );
    },
    zoomOnCanvas(pointer, dz) {
      // Zoom on the canvas, triggered with the middle mouse button
      let oldZoom = this.sceneInstance.cameras.main.zoom;
      let newZoom = Math.min(
        20,
        Math.max(1, oldZoom * (1 - Math.sign(dz) / 8))
      );

      // Special zoom treshold for smooth lines
      if (newZoom > 8) {
        oldZoom < 8 && (newZoom = 8);
        newZoom =
          dz > 0 ? Math.floor(newZoom / 4) * 4 : Math.ceil(newZoom / 4) * 4;
      }

      // Zoom it !
      this.sceneInstance.cameras.main.setZoom(newZoom);

      // Recenter on the mouse so that it seems we zoom on the zone the mouse is pointing at
      this.sceneInstance.cameras.main.setScroll(
        this.sceneInstance.cameras.main.scrollX +
          (pointer.worldX - this.sceneInstance.cameras.main.midPoint.x) *
            (newZoom / oldZoom - 1),
        this.sceneInstance.cameras.main.scrollY +
          (pointer.worldY - this.sceneInstance.cameras.main.midPoint.y) *
            (newZoom / oldZoom - 1)
      );
    },
    drawPixelPlaceholder() {
      // Draw the pixel placeholder

      // Clear the previous one
      this.sceneInstance.selectorGraphics.clear();

      // Draw the new one with the selected color
      this.sceneInstance.selectorGraphics.lineStyle(
        2 / this.sceneInstance.cameras.main.zoom,
        hexToHexNumber(this.$store.state.selectedColor),
        1
      );
      this.sceneInstance.selectorGraphics.fillStyle(
        hexToHexNumber(this.$store.state.selectedColor),
        0.5
      );
      this.sceneInstance.cameras.main.zoom > 8 &&
        this.sceneInstance.selectorGraphics.strokeRect(
          Math.floor(this.sceneInstance.input.activePointer.worldX),
          Math.floor(this.sceneInstance.input.activePointer.worldY),
          1,
          1
        );
      this.sceneInstance.cameras.main.zoom > 4 &&
        this.sceneInstance.selectorGraphics.fillRect(
          Math.floor(this.sceneInstance.input.activePointer.worldX),
          Math.floor(this.sceneInstance.input.activePointer.worldY),
          1,
          1
        );
    },
    moveCanvasOnMouseMove() {
      // Dragging effect with the mouse to move on the canvas
      let pointer = this.sceneInstance.input.activePointer;
      if (pointer.primaryDown) {
        if (this.sceneInstance.lastMouseClick) {
          let scrollX =
            (this.sceneInstance.lastMouseClick[0] - pointer.x) /
            this.sceneInstance.cameras.main.zoom;
          let scrollY =
            (this.sceneInstance.lastMouseClick[1] - pointer.y) /
            this.sceneInstance.cameras.main.zoom;

          // Store if the canvas has really been dragged
          (scrollX != 0 || scrollY != 0) &&
            (this.sceneInstance.hasMovedDuringClick = true);

          // Move the canvas
          this.sceneInstance.cameras.main.setScroll(
            this.sceneInstance.cameras.main.scrollX + scrollX,
            this.sceneInstance.cameras.main.scrollY + scrollY
          );
        }

        // Save the last mouse position to know how much we need to move the canvas on the next tick
        this.sceneInstance.lastMouseClick = [pointer.x, pointer.y];

        // Don't do the click action since the canvas is being moved
        return false;
      }
      return true;
    },
    placePixelIfClicked() {
      // Place a pixel if it is not prevented (clicking on another component) and not moving

      // If there was a click and the mouse didn't moved
      if (
        this.sceneInstance.lastMouseClick &&
        !this.sceneInstance.hasMovedDuringClick
      ) {
        // Place a pixel if it's not prevented (it's prevented if the user click on the color or wallet selector)
        !this.$store.state.preventNextClick && this.placePixel();
        this.$store.commit("preventNextClick", false);
      }
      return true;
    },
    resetMovingVariables() {
      // Reset the "moving" variables : a click ends any canvas movement (dragging)
      this.sceneInstance.lastMouseClick = undefined;
      this.sceneInstance.hasMovedDuringClick = false;
    },
    async placePixel() {
      // Place a pixel
      // Verify if the game is initialized and that there is a wallet
      if (!this.currentAccountAddress) {
        return;
      }

      // Retrieve the data for this new pixel
      let rgbColor = hexToRgb(this.$store.state.selectedColor);
      let hexNumberColor = hexToHexNumber(this.$store.state.selectedColor);
      let pixelPosX = Math.floor(this.sceneInstance.input.activePointer.worldX);
      let pixelPosY = Math.floor(this.sceneInstance.input.activePointer.worldY);

      // Loading pixel animation until it is confirmed
      let loadingPixel = this.sceneInstance.add
        .image(pixelPosX + 0.5, pixelPosY + 0.5, "pixel")
        .setTint(hexNumberColor)
        .setOrigin(0.5, 0.5);
      this.loadingPixels.push(loadingPixel); // Store the loading pixels to animate them in sync in the update loop

      // Create and send the transaction
      const kanvasContract = new Contract({
        id: "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS",
        abi: kanvasContractAbi,
        provider: kondor.provider,
        signer: kondor.getSigner(this.currentAccountAddress),
        options: {
          rcLimit: "100000000",
        },
      });
      const kanvas = kanvasContract.functions;

      try {
        await kanvas.place_pixel({
          from: this.currentAccountAddress,
          pixel_to_place: {
            posX: pixelPosX,
            posY: pixelPosY,
            red: rgbColor.r,
            green: rgbColor.g,
            blue: rgbColor.b,
            alpha: 255,
            metadata: "",
          },
        });
        this.destroyPixel(loadingPixel);
        this.sceneInstance.pixelGraphics.fillStyle(hexNumberColor);
        this.sceneInstance.pixelGraphics.fillRect(pixelPosX, pixelPosY, 1, 1);
      } catch (err) {
        this.$error("Transaction failed", err);
        this.destroyPixel(loadingPixel);
      }
    },
    animateLoadingPixel(px, t) {
      // Animate the loading pixel
      t = t / this.sceneInstance.periodicity;
      let alphaFactor =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      px.alpha = alphaFactor;
    },
    destroyPixel(loadingPixel) {
      this.loadingPixels.splice(this.loadingPixels.indexOf(loadingPixel), 1);
      loadingPixel.destroy();
    },
  },
};
</script>

<template>
  <div>
    <ion-phaser
      v-bind:game.prop="game"
      v-bind:initialize.prop="initializePhaserGame"
    />
    <PointerPosition v-bind:pointerX="pointerX" v-bind:pointerY="pointerY" />
  </div>
</template>

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
