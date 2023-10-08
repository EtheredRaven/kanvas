import { hexToHexNumber, hexToRgb } from "../../utils/colors";
//import { koinos } from "koinos-proto-js";
//import { utils } from "koilib";

export default function ({ graphics, vue }) {
  graphics.zoomOnCanvas = function (pointer, dz) {
    // Zoom on the canvas, triggered with the middle mouse button
    let oldZoom = graphics.cameras.main.zoom;
    let newZoom = Math.min(
      20,
      Math.max(0.7, oldZoom * (1 - Math.sign(dz) / 8))
    );

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

  graphics.actionIfClicked = function () {
    // Do the click action (like place) if clicked if it is not prevented (clicking on another component) and not moving

    // If there was a click and the mouse didn't moved
    if (graphics.lastMouseClick && !graphics.hasMovedDuringClick) {
      // Place a pixel if it's not prevented (it's prevented if the user click on the color or wallet selector)
      if (!vue.$store.state.preventNextClick) {
        switch (vue.$store.state.selectedTool) {
          case vue.$store.state.tools.DRAW:
            graphics.placePixel();
            break;
          case vue.$store.state.tools.ERASE:
            graphics.erasePixel();
            break;
        }
      }
      vue.$store.commit("preventNextClick", false);
    }
    return true;
  };

  graphics.placePixel = async function () {
    // Place a pixel virtually on the client (do not send the transaction, transaction is send in the next function in batches of pixels)
    // Verify if the game is initialized and that there is a wallet
    if (!vue.activeAccountAddress) {
      return;
    }

    const MAX_PIXELS_PER_TX = 10;

    if (vue.$store.state.pixelsToPlace.length >= MAX_PIXELS_PER_TX) {
      vue.$error(
        "You must click on the save button before placing more pixels !"
      );
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
    vue.$store.commit("addPixelToPlace", {
      pixelTransactionArgs: {
        from: vue.activeAccountAddress,
        pixel_to_place: {
          posX: pixelPosX,
          posY: pixelPosY,
          red: rgbColor.r,
          green: rgbColor.g,
          blue: rgbColor.b,
          alpha: 255,
          metadata: "",
          owner: vue.activeAccountAddress,
        },
      },
      graphics: loadingPixel,
      hexNumberColor: hexNumberColor,
    }); // Store the loading pixels to animate them in sync in the update loop
  };

  graphics.sendTransactionToPlacePixels = async function () {
    // Send a transaction of batches of pixels
    const kanvas = vue.$store.state.kanvasContract;

    try {
      // Avoid proxy from vue
      let pixels = [];
      vue.$store.state.pixelsToPlace.forEach((tx) => {
        let newTx = {};
        Object.assign(newTx, tx.pixelTransactionArgs);
        let newPixelToPlace = {};
        Object.assign(newPixelToPlace, newTx.pixel_to_place);
        newTx.pixel_to_place = newPixelToPlace;
        pixels.push(newTx);
      });

      const { transaction } = await kanvas.place_pixels(
        {
          place_pixel_arguments: pixels,
        },
        {
          payer: window.Client.kanvasContractAddress,
          payee: vue.activeAccountAddress,
        }
      );

      vue.$info(
        "Saving in progress !",
        "Transaction has been sent to the blockchain and is being processed."
      );
      graphics.pixelsToPlace = [...vue.$store.state.pixelsToPlace];
      vue.$store.commit("removePixelsToPlace");

      await transaction.wait();
      vue[transaction.demoText ? "$warning" : "$info"](
        (transaction.demoText ? "Demo - " : "") + "Pixels placed and saved !",
        transaction.demoText
          ? transaction.demoText
          : "Check transaction on <a target='_blank' href='https://koinosblocks.com/tx/" +
              transaction.id +
              "' style='color:white'>Koinos blocks</a>"
      );

      graphics.pixelsToPlace.forEach((px) => {
        graphics.destroyPixel(px, false);
        graphics.drawPixel(px.pixelTransactionArgs.pixel_to_place);
      });

      vue.$store.commit("setPixelsAmount", {
        amount: Math.min(
          await vue.$store.getters.getTokenBalance(),
          (await vue.$store.getters.getPixelsAmount()) +
            graphics.pixelsToPlace.length
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

      graphics.pixelsToPlace.forEach((px) => {
        graphics.destroyPixel(px, false);
      });
    }
    graphics.pixelsToPlace = [];
  };

  graphics.erasePixel = async function () {
    let posX = Math.floor(graphics.input.activePointer.worldX);
    let posY = Math.floor(graphics.input.activePointer.worldY);
    if (vue.$store.state.pixelsToPlace.length) {
      // If it's only client-side
      let pixelToErase;
      for (let i = 0; i < vue.$store.state.pixelsToPlace.length; i++) {
        let px = vue.$store.state.pixelsToPlace[i];
        let pxVars = px.pixelTransactionArgs.pixel_to_place;
        if (pxVars.posX == posX && pxVars.posY == posY) {
          pixelToErase = px;
          break;
        }
      }

      pixelToErase && graphics.destroyPixel(pixelToErase);
    } else {
      let pixelToErase = vue.pixelsMap[posX + ";" + posY];

      if (pixelToErase) {
        if (pixelToErase.owner != vue.activeAccountAddress) {
          vue.$error("You cannot erase a pixel you did not place !");
          return;
        }

        const kanvas = vue.$store.state.kanvasContract;

        const { transaction } = await kanvas.erase_pixel({
          from: vue.activeAccountAddress,
          posX,
          posY,
        });

        vue.$info(
          "Saving in progress !",
          "Transaction has been sent to the blockchain and is being processed."
        );
        await transaction.wait();

        graphics.erasePixelOnPosition(posX, posY);

        vue[transaction.demoText ? "$warning" : "$info"](
          (transaction.demoText ? "Demo - " : "") +
            "Pixel erased on position (" +
            posX +
            ";" +
            posY +
            ")",
          transaction.demoText
            ? transaction.demoText
            : "Check transaction on <a target='_blank' href='https://koinosblocks.com/tx/" +
                transaction.id +
                "' style='color:white'>Koinos blocks</a>"
        );

        vue.$store.commit("setPixelsAmount", {
          amount: Math.max(0, (await vue.$store.getters.getPixelsAmount()) - 1),
        });
      }
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
