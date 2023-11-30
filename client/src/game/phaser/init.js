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
    // Draw a texture for the pixel map

    let canvasWidth = Number(vue.canvasDimensions.canvas_width);
    let canvasHeight = Number(vue.canvasDimensions.canvas_height);
    let temporaryCanvas = document.createElement("canvas");
    temporaryCanvas.width = canvasWidth;
    temporaryCanvas.height = canvasHeight;

    let canvasImageData = temporaryCanvas
      .getContext("2d")
      .getImageData(0, 0, canvasWidth, canvasHeight);

    let buffer = new ArrayBuffer(canvasImageData.data.length);
    let buf8 = new Uint8ClampedArray(buffer);
    let data = new Uint32Array(buffer);

    for (let i = 0; i < vue.pixelsArray.length; i++) {
      let pixelToDraw = vue.pixelsArray[i];
      data[pixelToDraw.posY * canvasWidth + pixelToDraw.posX] =
        (255 << 24) | // alpha
        (pixelToDraw.blue << 16) | // blue
        (pixelToDraw.green << 8) | // green
        pixelToDraw.red; // red
      vue.pixelsMap[pixelToDraw.posX + ";" + pixelToDraw.posY] = pixelToDraw;
    }

    canvasImageData.data.set(buf8);
    temporaryCanvas.getContext("2d").putImageData(canvasImageData, 0, 0);

    graphics.textures.once("addtexture-pixelmap", () => {
      let img = graphics.add.image(0, 0, "pixelmap");
      img.setOrigin(0, 0);
    });

    graphics.textures.once("onerror", () => {
      console.log("error decoding base64");
    });
    graphics.textures.addBase64("pixelmap", temporaryCanvas.toDataURL());

    graphics.pixelMapInitialized = true;
  };
}
