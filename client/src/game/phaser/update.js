import { rgbaToString } from "../../utils/colors.js";

export default function ({ graphics, vue }) {
  if (
    !vue ||
    !graphics ||
    !graphics.pixelMapInitialized ||
    !graphics.cameraInitialized
  ) {
    return;
  }

  // Animations for loading pixels
  graphics.t += graphics.tSign;
  (graphics.t == 0 || graphics.t == graphics.periodicity) &&
    (graphics.tSign = -graphics.tSign);

  // The graphics object is the local graphics object while the transaction is being validated and the player can still place pixels because the state pixels list is void
  [
    ...graphics.pixelsToPlace,
    ...vue.$store.state.pixelsToPlace,
    ...graphics.pixelsToErase,
    ...vue.$store.state.pixelsToErase,
  ].forEach((px) => {
    graphics.animateLoadingPixel(px.graphics, graphics.t);
  });

  // Draw pixel placeholder if connected to a wallet
  vue.activeAccountAddress != "" &&
    !graphics.placeholderImage &&
    graphics.drawPixelPlaceholder();

  // Try to place a pixel only if the user is not moving the canvas
  graphics.moveCanvasOnMouseMove() &&
    graphics.actionIfClicked() &&
    graphics.resetMovingVariables();

  // Update pixel properties
  let posX = Math.floor(graphics.input.activePointer.worldX);
  let posY = Math.floor(graphics.input.activePointer.worldY);
  vue.updatePixelProperties(posX, posY, vue.pixelsMap[posX + ";" + posY]);

  // Check the placeholders canvas for the color of the pixel under the mouse if there is a placeholder image here and put this data to the color picker
  let pixelColor = graphics.placeholdersCanvas
    .getContext("2d")
    .getImageData(posX, posY, 1, 1).data;
  let stringToColor = rgbaToString({
    red: pixelColor[0] || 0,
    green: pixelColor[1] || 0,
    blue: pixelColor[2] || 0,
    alpha: pixelColor[3] || 0,
  });
  // Change the picker color if the color is not rgba(0, 0, 0, 0.00)
  stringToColor != "rgba(0, 0, 0, 0.00)" &&
    vue.$store.commit("changeColor", stringToColor);

  // If there is a placeholder image, follow the mouse
  if (graphics.placeholderImage) {
    graphics.placeholderImage.x = posX;
    graphics.placeholderImage.y = posY;
  }

  // If the user press the escape key, remove the placeholder image
  graphics.escapeKey.on("down", () => {
    if (graphics.placeholderImage) {
      graphics.placeholderImage.destroy();
      graphics.placeholderImage = null;
    }
  });
}
