import { hexToHexNumber, hexToRgb, rgbToHex } from "../../utils/colors";

export default function ({ graphics, vue }) {
  graphics.zoomOnCanvas = function (pointer, dz) {
    // Zoom on the canvas, triggered with the middle mouse button
    let oldZoom = graphics.cameras.main.zoom;
    let newZoom = Math.min(20, Math.max(1, oldZoom * (1 - Math.sign(dz) / 8)));

    // Special zoom treshold for smooth lines
    if (newZoom > 8) {
      oldZoom < 8 && (newZoom = 8);
      newZoom =
        dz > 0 ? Math.floor(newZoom / 4) * 4 : Math.ceil(newZoom / 4) * 4;
    }

    // Zoom it !
    graphics.cameras.main.setZoom(newZoom);

    // Recenter on the mouse so that it seems we zoom on the zone the mouse is pointing at
    graphics.cameras.main.setScroll(
      graphics.cameras.main.scrollX +
        (pointer.worldX - graphics.cameras.main.midPoint.x) *
          (newZoom / oldZoom - 1),
      graphics.cameras.main.scrollY +
        (pointer.worldY - graphics.cameras.main.midPoint.y) *
          (newZoom / oldZoom - 1)
    );
  };

  graphics.placePixelIfClicked = function () {
    // Place a pixel if it is not prevented (clicking on another component) and not moving

    // If there was a click and the mouse didn't moved
    if (graphics.lastMouseClick && !graphics.hasMovedDuringClick) {
      // Place a pixel if it's not prevented (it's prevented if the user click on the color or wallet selector)
      !vue.$store.state.preventNextClick && graphics.placePixel();
      vue.$store.commit("preventNextClick", false);
    }
    return true;
  };

  graphics.placePixel = async function () {
    // Place a pixel
    // Verify if the game is initialized and that there is a wallet
    if (!vue.activeAccountAddress) {
      return;
    }

    // Retrieve the data for this new pixel
    let rgbColor = hexToRgb(vue.$store.state.selectedColor);
    let hexNumberColor = hexToHexNumber(vue.$store.state.selectedColor);
    let pixelPosX = Math.floor(graphics.input.activePointer.worldX);
    let pixelPosY = Math.floor(graphics.input.activePointer.worldY);

    // Loading pixel animation until it is confirmed
    let loadingPixel = graphics.add
      .image(pixelPosX + 0.5, pixelPosY + 0.5, "pixel")
      .setTint(hexNumberColor)
      .setOrigin(0.5, 0.5);
    vue.loadingPixels.push(loadingPixel); // Store the loading pixels to animate them in sync in the update loop

    // Create and send the transaction
    const kanvas = vue.$store.state.kanvasContract;

    try {
      const { transaction } = await kanvas.place_pixel({
        from: vue.activeAccountAddress,
        pixel_to_place: {
          posX: pixelPosX,
          posY: pixelPosY,
          red: rgbColor.r,
          green: rgbColor.g,
          blue: rgbColor.b,
          alpha: 255,
          metadata: "",
        },
      });
      vue.$info(
        "Pixel placed",
        rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b) +
          " placed on (" +
          pixelPosX +
          " ; " +
          pixelPosY +
          ")"
      );

      await transaction.wait();
      graphics.destroyPixel(loadingPixel);
      graphics.pixelGraphics.fillStyle(hexNumberColor);
      graphics.pixelGraphics.fillRect(pixelPosX, pixelPosY, 1, 1);
      vue.$store.commit("setPixelsAmount", {
        amount: Math.min(
          await vue.$store.getters.getTokenBalance(),
          (await vue.$store.getters.getPixelsAmount()) + 1
        ),
      });
    } catch (err) {
      let error = err;
      if (err.message) {
        error = err.toString().replace("Error: ", "");

        error = err.message;
        if (error == "User rejected") {
          error = "WalletConnect user rejected";
        }

        try {
          error = JSON.parse(error);
          error = error.error;
        } catch (err2) {
          err2;
        }

        if (error == "Connection lost") {
          error = "Kondor connection lost";
        }
      }

      vue.$error(error);
      graphics.destroyPixel(loadingPixel);
    }
  };

  graphics.moveCanvasOnMouseMove = function () {
    // Dragging effect with the mouse to move on the canvas
    let pointer = graphics.input.activePointer;
    if (pointer.primaryDown) {
      if (graphics.lastMouseClick) {
        let scrollX =
          (graphics.lastMouseClick[0] - pointer.x) / graphics.cameras.main.zoom;
        let scrollY =
          (graphics.lastMouseClick[1] - pointer.y) / graphics.cameras.main.zoom;

        // Store if the canvas has really been dragged
        (scrollX != 0 || scrollY != 0) && (graphics.hasMovedDuringClick = true);

        // Move the canvas
        graphics.cameras.main.setScroll(
          graphics.cameras.main.scrollX + scrollX,
          graphics.cameras.main.scrollY + scrollY
        );
      }

      // Save the last mouse position to know how much we need to move the canvas on the next tick
      graphics.lastMouseClick = [pointer.x, pointer.y];

      // Don't do the click action since the canvas is being moved
      return false;
    }
    return true;
  };
}
