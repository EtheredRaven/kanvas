export default function ({ graphics, vue }) {
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

  graphics.initPixelMapImage = function () {
    graphics.pixelGraphics = graphics.add.graphics();
    graphics.pixelGraphics.fillStyle(0xffffff);
    graphics.pixelGraphics.fillRect(
      0,
      0,
      Number(vue.canvasDimensions?.canvas_width) || 1000,
      Number(vue.canvasDimensions?.canvas_height) || 1000
    );

    // Draw the preloaded image on the canvas
    graphics.backgroundImg = graphics.add.image(0, 0, "pixelmap");
    graphics.backgroundImg.setOrigin(0, 0);
    graphics.pixelGraphics = graphics.add.graphics();
    graphics.selectorGraphics = graphics.add.graphics();
  };

  graphics.initPixelMapData = async function () {
    for (let i = 0; i < vue.pixelsArray.length; i++) {
      const pixel = vue.pixelsArray[i];
      vue.pixelsMap[pixel.posX + ";" + pixel.posY] = pixel;
      if (i % 10000 == 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    graphics.pixelMapInitialized = true;
  };
}
