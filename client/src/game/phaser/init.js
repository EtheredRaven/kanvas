export default function ({ graphics, vue }) {
  graphics.resetMovingVariables = function () {
    // Reset the "moving" variables : a click ends any canvas movement (dragging)
    graphics.lastMouseClick = undefined;
    graphics.hasMovedDuringClick = false;
  };

  graphics.initCamera = function () {
    // Init the camera once we get the local params from the blockchain
    graphics.cameras.main.setBounds(
      0,
      0,
      Number(vue.canvasDimensions.canvas_width),
      Number(vue.canvasDimensions.canvas_height),
      true
    );

    graphics.cameraInitialized = true;
  };
  graphics.initPixelMap = function () {
    // For each pixel in the array
    vue.pixelsArray.forEach((pixel) => {
      graphics.drawPixel(pixel);
    });

    graphics.pixelMapInitialized = true;
  };
}
