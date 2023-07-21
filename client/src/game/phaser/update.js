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

  vue.loadingPixels.forEach((px) => {
    graphics.animateLoadingPixel(px, graphics.t);
  });

  // Draw pixel placeholder if connected to a wallet
  vue.activeAccountAddress != "" && graphics.drawPixelPlaceholder();

  // Try to place a pixel only if the user is not moving the canvas
  graphics.moveCanvasOnMouseMove() &&
    graphics.placePixelIfClicked() &&
    graphics.resetMovingVariables();

  // Update mouse position
  vue.updatePointer(
    graphics.input.activePointer.worldX,
    graphics.input.activePointer.worldY
  );
}
