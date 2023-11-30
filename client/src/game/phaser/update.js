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
  (graphics.pixelsToPlace.length
    ? graphics.pixelsToPlace
    : vue.$store.state.pixelsToPlace
  ).forEach((px) => {
    graphics.animateLoadingPixel(px.graphics, graphics.t);
  });

  (graphics.pixelsToErase.length
    ? graphics.pixelsToErase
    : vue.$store.state.pixelsToErase
  ).forEach((px) => {
    graphics.animateLoadingPixel(px.graphics, graphics.t);
  });

  // Draw pixel placeholder if connected to a wallet
  vue.activeAccountAddress != "" && graphics.drawPixelPlaceholder();

  // Try to place a pixel only if the user is not moving the canvas
  graphics.moveCanvasOnMouseMove() &&
    graphics.actionIfClicked() &&
    graphics.resetMovingVariables();

  // Update pixel properties
  let posX = Math.floor(graphics.input.activePointer.worldX);
  let posY = Math.floor(graphics.input.activePointer.worldY);
  vue.updatePixelProperties(posX, posY, vue.pixelsMap[posX + ";" + posY]);
}
