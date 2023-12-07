import { rgbaToString } from "../../utils/colors.js";
import multitouch from "./multitouch";

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

  // User actions
  multitouch({ graphics });
  graphics.moveCanvasOnMouseMove();
  graphics.actionIfClicked();

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
    // Take into account the fact that the placeholder image can have unodd size
    let posXDelta = (graphics.placeholderImage.width % 2) * 0.5;
    let posYDelta = (graphics.placeholderImage.height % 2) * 0.5;
    graphics.placeholderImage.x = posX - posXDelta;
    graphics.placeholderImage.y = posY - posYDelta;
  }

  // Scrolling friction
  graphics.scrollSpeedX *= graphics.scrollFriction;
  graphics.scrollSpeedY *= graphics.scrollFriction;

  // Move the canvas
  graphics.cameras.main.setScroll(
    graphics.cameras.main.scrollX + graphics.scrollSpeedX,
    graphics.cameras.main.scrollY + graphics.scrollSpeedY
  );

  // Ease-in and ease-out the camera zooming to attain graphics.targetZoom
  let currentZoom = graphics.cameras.main.zoom;
  let pointer = graphics.targetZoomPoint || graphics.input.activePointer;
  graphics.cameras.main.zoom +=
    (graphics.targetZoom - graphics.cameras.main.zoom) * graphics.easeZoomSpeed;

  // Recenter on the mouse so that it seems we zoom on the zone the mouse is pointing at
  let deltaScrollX =
    (pointer.worldX - graphics.cameras.main.midPoint.x) *
    (graphics.cameras.main.zoom / currentZoom - 1);
  let deltaScrollY =
    (pointer.worldY - graphics.cameras.main.midPoint.y) *
    (graphics.cameras.main.zoom / currentZoom - 1);

  graphics.cameras.main.scrollX += deltaScrollX;
  graphics.cameras.main.scrollY += deltaScrollY;

  // If the user press the escape key, remove the placeholder image
  graphics.escapeKey.on("down", () => {
    if (graphics.placeholderImage) {
      graphics.placeholderImage.destroy();
      graphics.placeholderImage = null;
    }
  });
}
