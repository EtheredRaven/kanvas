export default function ({ graphics, vue }) {
  graphics.resetMovingVariables = function () {
    // Reset the "moving" variables : a click ends any canvas movement (dragging)
    graphics.lastMouseClick = undefined;
    graphics.hasMovedDuringClick = false;
  };

  graphics.initBackground = function () {
    // Draw background
    graphics.pixelGraphics.fillStyle(0xffffff);
    graphics.pixelGraphics.fillRect(
      0,
      0,
      Number(vue.canvasDimensions.canvas_width),
      Number(vue.canvasDimensions.canvas_height)
    );
  };

  graphics.initCamera = function () {
    // Init the camera once we get the local params from the blockchain
    graphics.cameras.main.setBounds(
      -Math.floor(window.visualViewport.width) / 2,
      -Math.floor(window.visualViewport.height) / 4,
      Number(vue.canvasDimensions.canvas_width) +
        Math.floor(window.visualViewport.width),
      Number(vue.canvasDimensions.canvas_height) +
        Math.floor(window.visualViewport.height) / 2,
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
