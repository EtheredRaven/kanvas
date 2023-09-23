import { hexToHexNumber } from "../../utils/colors";

export default function ({ graphics, vue }) {
  graphics.drawPixel = function (pixel) {
    // Add a reference for getting the pixel on specific coordinates (displaying properties for example)
    vue.pixelsMap[pixel.posX + ";" + pixel.posY] = pixel;

    // Parse the color
    let red = parseInt(pixel.red).toString(16);
    red = red.length == 1 ? "0" + red : red;
    let green = parseInt(pixel.green).toString(16);
    green = green.length == 1 ? "0" + green : green;
    let blue = parseInt(pixel.blue).toString(16);
    blue = blue.length == 1 ? "0" + blue : blue;

    // Draw the pixel
    graphics.pixelGraphics.fillStyle(parseInt(`0x${red}${green}${blue}`));
    graphics.pixelGraphics.fillRect(
      parseInt(pixel.posX),
      parseInt(pixel.posY),
      1,
      1
    );
  };

  graphics.drawPixelPlaceholder = function () {
    // Draw the pixel placeholder

    // Clear the previous one
    graphics.selectorGraphics.clear();

    // Draw the new one with the selected color
    graphics.selectorGraphics.lineStyle(
      2 / graphics.cameras.main.zoom,
      hexToHexNumber(vue.$store.state.selectedColor),
      1
    );
    graphics.selectorGraphics.fillStyle(
      hexToHexNumber(vue.$store.state.selectedColor),
      0.5
    );
    graphics.cameras.main.zoom > 8 &&
      graphics.selectorGraphics.strokeRect(
        Math.floor(graphics.input.activePointer.worldX),
        Math.floor(graphics.input.activePointer.worldY),
        1,
        1
      );
    graphics.cameras.main.zoom > 4 &&
      graphics.selectorGraphics.fillRect(
        Math.floor(graphics.input.activePointer.worldX),
        Math.floor(graphics.input.activePointer.worldY),
        1,
        1
      );
  };

  graphics.animateLoadingPixel = function (px, t) {
    // Animate the loading pixel
    t = t / graphics.periodicity;
    let alphaFactor = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    px.alpha = alphaFactor;
  };

  graphics.destroyPixel = function (loadingPixel, removeInStore = true) {
    removeInStore && vue.$store.commit("removePixelToPlace", loadingPixel);
    loadingPixel.graphics.destroy();
  };

  graphics.erasePixelOnPosition = function (posX, posY) {
    let pixelCoordinates = posX + ";" + posY;
    let pixel = vue.pixelsMap[pixelCoordinates];
    if (pixel) {
      vue.pixelsMap[pixelCoordinates] = undefined;
      graphics.pixelGraphics.fillStyle(0xffffff);
      graphics.pixelGraphics.fillRect(parseInt(posX), parseInt(posY), 1, 1);
    }
  };
}
