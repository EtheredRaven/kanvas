export function InitSocketFunctions(vue) {
  // Initialization of the client pixel map with server data
  vue.$socket.on("got_pixel_map_data", (data) => {
    vue.pixelsArray = data.pixels;
    vue.canvasDimensions = data.canvas_dimensions;
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
}
