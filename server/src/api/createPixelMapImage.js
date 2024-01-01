const sharp = require("sharp");

module.exports = function (Server) {
  Server.pixelDataToBuffer = function (pixelData) {
    const t = Date.now();
    let canvasWidth = Number(Server.canvasDimensions.canvas_width);
    let canvasHeight = Number(Server.canvasDimensions.canvas_height);
    let bufferSize = canvasWidth * canvasHeight * 4;
    const buffer = Buffer.alloc(bufferSize);
    for (let i = 0; i < pixelData.length; i++) {
      let pixel = pixelData[i];
      let pixelIndexInBuffer = (pixel.posY * canvasWidth + pixel.posX) * 4;
      buffer.writeUInt8(pixel.red, pixelIndexInBuffer);
      buffer.writeUInt8(pixel.green, pixelIndexInBuffer + 1);
      buffer.writeUInt8(pixel.blue, pixelIndexInBuffer + 2);
      buffer.writeUInt8(pixel.alpha, pixelIndexInBuffer + 3);
    }
    Server.infoLogging(
      "Pixel data converted to buffer in " + (Date.now() - t) + "ms"
    );
    return buffer;
  };

  // This function must use the buffer and return a png image from it that it will serve to the client
  let bufferToPngImage = async function (buffer) {
    const t = Date.now();
    const pngImage = await sharp(buffer, {
      raw: {
        width: Number(Server.canvasDimensions.canvas_width),
        height: Number(Server.canvasDimensions.canvas_height),
        channels: 4,
      },
    })
      .png()
      .toBuffer();
    Server.infoLogging(
      "Buffer converted to png image in " + (Date.now() - t) + "ms"
    );
    return pngImage;
  };

  Server.app.get("/api/pixel_map_image.png", async function (req, res) {
    try {
      const pngImage = await bufferToPngImage(Server.pixelMapBuffer);
      return res.type("png").send(pngImage);
    } catch (err) {
      Server.errorLogging("Error while serving pixel map image", err);
      return res
        .status(500)
        .send("Error while serving pixel map image: " + err);
    }
  });

  // Get the pixels of a specific owner
  Server.app.get("/api/pixel_map_image/:owner.png", async function (req, res) {
    if (!req.params.owner) {
      return res.status(400).send("No owner provided");
    }

    let ownerPixelMapData = (Server.pixels = await Server.db.all(
      "SELECT * FROM pixels WHERE unvisible != 1 AND owner = ? ORDER BY posX ASC, posY ASC",
      [req.params.owner]
    ));

    try {
      const pngImage = await bufferToPngImage(
        Server.pixelDataToBuffer(ownerPixelMapData)
      );
      return res.type("png").send(pngImage);
    } catch (err) {
      Server.errorLogging("Error while serving pixel map image", err);
      return res
        .status(500)
        .send("Error while serving pixel map image: " + err);
    }
  });
};
