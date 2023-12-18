export function InitSocketFunctions(vue) {
  // Initialization of the client pixel map with server data
  let tempPixelsArray = [];
  vue.$socket.on("got_pixel_map_data", (data) => {
    tempPixelsArray.push(...data.pixels);
    vue.canvasDimensions = data.canvas_dimensions;
    if (data.chunkIndex == data.maxChunkIndex) {
      vue.pixelsDataReceived = true;
      vue.pixelsArray = tempPixelsArray;
      tempPixelsArray = [];
    }
  });

  // Socket events
  vue.$socket.on("update_token_balance", (data) => {
    vue.$store.commit("setTokenBalance", data);
  });

  vue.$socket.on("update_pixels_amount", (data) => {
    vue.$store.commit("setPixelsAmount", data);
  });

  vue.$socket.on("pixel_placed", (pixelPlaced) => {
    vue.sceneInstance && vue.sceneInstance.drawPixel(pixelPlaced);
  });

  vue.$socket.on("pixel_erased", ({ posX, posY }) => {
    vue.sceneInstance && vue.sceneInstance.erasePixelOnPosition(posX, posY);
  });
}
