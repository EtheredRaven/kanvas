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
  Server.bufferToPngImage = async function (buffer) {
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
};
