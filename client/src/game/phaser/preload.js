export default function ({ graphics, vue }) {
  graphics.load.image("pixel", "./img/pixel.png");
  graphics.load.image("pixelmap", "../api/pixel_map_image.png");

  // Draw the pixel map image once it's loaded
  graphics.load.once("complete", graphics.initPixelMapImage, graphics);

  graphics.preloadPixelsOwnedOnlyMap = function () {
    graphics.load.image(
      "preloaded-pixels-owned-only-map",
      "../api/pixel_map_image/" + vue.activeAccountAddress + ".png"
    );
    graphics.load.start();
  };
}
