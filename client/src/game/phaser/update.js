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

  (graphics.pixelsToPlace.length
    ? graphics.pixelsToPlace
    : vue.$store.state.pixelsToPlace
  ).forEach((px) => {
    graphics.animateLoadingPixel(px.graphics, graphics.t);
  });

  // Draw pixel placeholder if connected to a wallet
  vue.activeAccountAddress != "" && graphics.drawPixelPlaceholder();

  // Try to place a pixel only if the user is not moving the canvas
  graphics.moveCanvasOnMouseMove() &&
    graphics.placePixelIfClicked() &&
    graphics.resetMovingVariables();

  // Update pixel properties
  let posX = Math.floor(graphics.input.activePointer.worldX);
  let posY = Math.floor(graphics.input.activePointer.worldY);
  vue.updatePixelProperties(posX, posY, vue.pixelsMap[posX + ";" + posY]);
}
