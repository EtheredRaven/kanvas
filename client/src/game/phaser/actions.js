import { rgbaToHexNumber, stringToRgba } from "../../utils/colors";
import { formatChainError } from "@/utils/helpers";
//import { koinos } from "koinos-proto-js";
//import { utils } from "koilib";

export default function ({ graphics, vue }) {
  graphics.zoomOnCanvas = function (pointer, dz) {
    // Zoom on the canvas, triggered with the middle mouse button
    let oldZoom = graphics.cameras.main.zoom;
    let newZoom = Math.min(
      graphics.maxZoom,
      Math.max(
        graphics.minZoom,
        oldZoom * (1 - Math.sign(dz) * graphics.zoomSpeed)
      )
    );

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

    // If the user is moving the canvas, do not do the click action
    if (graphics.lastMouseClick && !graphics.hasMovedDuringClick) {
      // If the click was on a button, do not do the click action
      if (!vue.$store.state.preventNextClick) {
        // If there is a placeholder image, place it on the canvas
        if (graphics.placeholderImage) {
          graphics.drawImagePlaceholder();
        } else {
          // If there is no placeholder image, place or erase a pixel
          switch (vue.$store.state.selectedTool) {
            case vue.$store.state.tools.DRAW:
              graphics.placePixel();
              break;
            case vue.$store.state.tools.ERASE:
              graphics.erasePixel();
              break;
          }
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

    let MAX_PIXELS_PER_TX = await vue.$store.getters.getPixelsPerTx();

    if (vue.$store.state.pixelsToPlace.length >= MAX_PIXELS_PER_TX) {
      vue.$error(
        "You cannot place more than " +
          MAX_PIXELS_PER_TX +
          " pixels in one transaction. Click on save before placing new pixels!"
      );
      return;
    }

    // Retrieve the data for this new pixel
    let rgbColor = stringToRgba(vue.$store.state.selectedColor);
    let hexNumberColor = rgbaToHexNumber(rgbColor);
    let pixelPosX = Math.floor(graphics.input.activePointer.worldX);
    let pixelPosY = Math.floor(graphics.input.activePointer.worldY);

    // Loading pixel animation until it is confirmed
    let loadingPixel = graphics.add
      .image(pixelPosX + 0.5, pixelPosY + 0.5, "pixel")
      .setTint(hexNumberColor)
      .setOrigin(0.5, 0.5);
    loadingPixel.originalAlpha = rgbColor.alpha / 255 || 1;

    vue.$store.commit("addPixelToPlace", {
      pixelTransactionArgs: {
        from: vue.activeAccountAddress,
        pixel_to_place: {
          posX: pixelPosX,
          posY: pixelPosY,
          red: rgbColor.red,
          green: rgbColor.green,
          blue: rgbColor.blue,
          alpha: rgbColor.alpha || 255,
          metadata: "",
          owner: vue.activeAccountAddress,
        },
      },
      graphics: loadingPixel,
      hexNumberColor: hexNumberColor,
    }); // Store the loading pixels to animate them in sync in the update loop
  };

  graphics.erasePixel = async function () {
    if (!vue.activeAccountAddress) {
      return;
    }

    let MAX_PIXELS_PER_TX = await vue.$store.getters.getPixelsPerTx();
    if (vue.$store.state.pixelsToErase.length >= MAX_PIXELS_PER_TX)
      return vue.$error(
        "You cannot erase more than " +
          MAX_PIXELS_PER_TX +
          " pixels in one transaction. Click on save before placing new pixels!"
      );

    let pixelPosX = Math.floor(graphics.input.activePointer.worldX);
    let pixelPosY = Math.floor(graphics.input.activePointer.worldY);

    if (vue.$store.state.pixelsToPlace.length) {
      // If it's in a place transaction, remove the pixel from the transaction
      let pixelToErase;
      for (let i = 0; i < vue.$store.state.pixelsToPlace.length; i++) {
        let px = vue.$store.state.pixelsToPlace[i];
        let pxVars = px.pixelTransactionArgs.pixel_to_place;
        if (pxVars.posX == pixelPosX && pxVars.posY == pixelPosY) {
          pixelToErase = px;
          break;
        }
      }

      pixelToErase && graphics.destroyLoadingPixel(pixelToErase);
    } else {
      let pixelToErase = vue.pixelsMap[pixelPosX + ";" + pixelPosY];

      if (pixelToErase) {
        if (pixelToErase.owner != vue.activeAccountAddress)
          return vue.$error("You cannot erase a pixel you did not place !");

        let hexNumberColor = rgbaToHexNumber(pixelToErase);
        graphics.erasePixelGraphics(pixelPosX, pixelPosY);
        let loadingPixel = graphics.add
          .image(pixelPosX + 0.5, pixelPosY + 0.5, "pixel")
          .setTint(hexNumberColor)
          .setOrigin(0.5, 0.5);
        loadingPixel.originalAlpha = pixelToErase.alpha / 255 || 1;

        vue.$store.commit("addPixelToErase", {
          pixelTransactionArgs: {
            from: vue.activeAccountAddress,
            posX: pixelPosX,
            posY: pixelPosY,
          },
          graphics: loadingPixel,
          hexNumberColor: hexNumberColor,
        });
      }
    }
  };

  graphics.sendTransactionToErasePixels = async function () {
    const kanvas = vue.$store.state.kanvasContract;

    try {
      const { transaction } = await kanvas.erase_pixels(
        {
          erase_pixel_arguments: vue.$store.state.pixelsToErase.map(
            (px) => px.pixelTransactionArgs
          ),
        },
        {
          payer: window.Client.kanvasContractAddress,
          payee: vue.activeAccountAddress,
          rcLimit: Math.round(
            (1.115 + 0.15 * vue.$store.state.pixelsToErase.length) * 100000000
          ).toString(),
        }
      );

      vue.$info(
        "Saving in progress!",
        "Transaction has been sent to the blockchain and is being processed."
      );
      graphics.pixelsToErase = [...vue.$store.state.pixelsToErase];
      vue.$store.commit("removePixelsToErase");
      await transaction.wait();

      vue[transaction.demoText ? "$warning" : "$info"](
        (transaction.demoText ? "Demo - " : "") + "Pixels erased and saved!",
        transaction.demoText
          ? transaction.demoText
          : "Check transaction on <a target='_blank' href='https://koinosblocks.com/tx/" +
              transaction.id +
              "' style='color:white'>Koinos blocks</a>"
      );

      graphics.pixelsToErase.forEach((px) => {
        graphics.eraseSpecifiedPixel(px.pixelTransactionArgs);
      });

      transaction.demoText &&
        vue.$store.commit("setPixelsAmount", {
          amount: Math.max(
            0,
            (await vue.$store.getters.getPixelsAmount()) -
              graphics.pixelsToErase.length
          ),
        });
    } catch (err) {
      let error = formatChainError(err);
      vue.$error(error);
    }

    graphics.pixelsToErase.forEach((px) => {
      graphics.destroyLoadingPixel(px, false);
      // Do not destroy the pixels in store since it is new batch being placed, temporary pixels are placed in graphics.pixelsToErase
    });
    graphics.pixelsToErase = [];
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
          rcLimit: Math.round(
            (1.115 + 0.15 * vue.$store.state.pixelsToPlace.length) * 100000000
          ).toString(),
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
        graphics.drawPixel(px.pixelTransactionArgs.pixel_to_place);
      });

      transaction.demoText &&
        vue.$store.commit("setPixelsAmount", {
          amount: Math.min(
            await vue.$store.getters.getTokenBalance(),
            (await vue.$store.getters.getPixelsAmount()) +
              graphics.pixelsToPlace.length
          ),
        });
    } catch (err) {
      let error = formatChainError(err);
      vue.$error(error);
    }
    graphics.pixelsToPlace.forEach((px) => {
      graphics.destroyLoadingPixel(px, false);
    });
    graphics.pixelsToPlace = [];
  };

  graphics.sendTransactionToSavePixels = function () {
    vue.$store.state.pixelsToPlace.length
      ? graphics.sendTransactionToPlacePixels()
      : graphics.sendTransactionToErasePixels();
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

        // Add an acceleration
        graphics.scrollSpeedX += scrollX * graphics.scrollAcceleration;
        graphics.scrollSpeedY += scrollY * graphics.scrollAcceleration;
      }

      // Save the last mouse position to know how much we need to move the canvas on the next tick
      graphics.lastMouseClick = [pointer.x, pointer.y];
    }

    // Scrolling friction
    graphics.scrollSpeedX *= graphics.scrollFriction;
    graphics.scrollSpeedY *= graphics.scrollFriction;

    // Move the canvas
    graphics.cameras.main.setScroll(
      graphics.cameras.main.scrollX + graphics.scrollSpeedX,
      graphics.cameras.main.scrollY + graphics.scrollSpeedY
    );
    return !pointer.primaryDown;
  };

  graphics.importSelectedImageAsPixelsPlaceholder = function (imageElement) {
    // This function is called when the user import an image to put it on the canvas as a placeholder
    // First step, the image should follow the mouse and be placed on the canvas when clicked

    // Draw a texture with this imageElement
    let placeholderId = "placeHolder" + Math.random().toString(36).substring(7);
    graphics.textures.addImage(placeholderId, imageElement);
    graphics.placeholderImage = graphics.add
      .image(
        graphics.input.activePointer.worldX,
        graphics.input.activePointer.worldY,
        placeholderId
      )
      .setOrigin(0.5, 0.5);
    graphics.placeholderImage.element = imageElement;
  };

  graphics.drawImagePlaceholder = function () {
    // Add the image to the placeholders canvas on the mouse position but taking into account the image origin
    let mousePosX = Math.floor(
      graphics.input.activePointer.worldX -
        0.5 * graphics.placeholderImage.width
    );
    let mousePosY = Math.floor(
      graphics.input.activePointer.worldY -
        0.5 * graphics.placeholderImage.height
    );
    graphics.placeholdersCanvas
      .getContext("2d")
      .drawImage(graphics.placeholderImage.element, mousePosX, mousePosY);

    graphics.placeholderImage.setAlpha(0.7);
    graphics.placeholderImage = null;

    // Put the new pixels in front of the placeholder image
    graphics.pixelGraphics = graphics.add.graphics();
    graphics.selectorGraphics = graphics.add.graphics();
  };
}
