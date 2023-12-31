import {
  stringToHexNumber,
  rgbaToHexNumber,
  stringToRgba,
} from "../../utils/colors";

export default function ({ graphics, vue }) {
  graphics.drawPixel = function (pixel) {
    // Add a reference for getting the pixel on specific coordinates (displaying properties for example)
    vue.pixelsMap[pixel.posX + ";" + pixel.posY] = pixel;

    // Draw the pixel
    graphics.pixelGraphics.fillStyle(
      parseInt(rgbaToHexNumber(pixel)),
      pixel.alpha / 255
    );
    graphics.pixelGraphics.fillRect(
      parseInt(pixel.posX),
      parseInt(pixel.posY),
      1,
      1
    );
  };

  graphics.drawPixelPlaceholder = function () {
    // Clear the previous one
    graphics.selectorGraphics.clear();

    // Draw the new one with the selected color
    // Set the opacity for the placeholder

    const placeholderColorOpacity =
      stringToRgba(vue.$store.state.selectedColor).a / 255;
    graphics.selectorGraphics.lineStyle(
      2 / graphics.cameras.main.zoom,
      stringToHexNumber(vue.$store.state.selectedColor),
      placeholderColorOpacity
    );
    graphics.selectorGraphics.fillStyle(
      stringToHexNumber(vue.$store.state.selectedColor),
      0.5 * placeholderColorOpacity
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
    px.alpha = alphaFactor * px.originalAlpha;
  };

  graphics.destroyLoadingPixel = function (loadingPixel, removeInStore = true) {
    removeInStore && vue.$store.commit("removePixelToPlace", loadingPixel);
    loadingPixel.graphics.destroy();
  };

  graphics.erasePixelGraphics = function (posX, posY) {
    graphics.pixelGraphics.fillStyle(0xffffff);
    graphics.pixelGraphics.fillRect(parseInt(posX), parseInt(posY), 1, 1);
  };

  graphics.eraseSpecifiedPixel = function (pixel) {
    if (pixel) {
      vue.pixelsMap[pixel.posX + ";" + pixel.posY] = undefined;
      graphics.erasePixelGraphics(parseInt(pixel.posX), parseInt(pixel.posY));
    }
  };

  graphics.erasePixelOnPosition = function (posX, posY) {
    let pixelCoordinates = posX + ";" + posY;
    let pixel = vue.pixelsMap[pixelCoordinates];
    graphics.eraseSpecifiedPixel(pixel);
  };
}
