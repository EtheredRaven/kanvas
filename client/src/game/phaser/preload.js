export default function ({ graphics }) {
  graphics.load.image("pixel", "./img/pixel.png");
  graphics.load.image("pixelmap", "../api/pixel_map_image.png");

  // Draw the pixel map image once it's loaded
  graphics.load.once("complete", graphics.initPixelMapImage, graphics);
}
