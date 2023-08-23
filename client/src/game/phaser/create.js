export default function ({ graphics, vue }) {
  // Init game canvas
  graphics.renderer.clearBeforeRender = false;
  graphics.cameras.main.setRoundPixels(false);
  graphics.cameras.main.zoom = 4;

  // Zooming behavior
  graphics.input.on("wheel", (pointer, dx, dy, dz) => {
    graphics.zoomOnCanvas(pointer, dz);
  });

  // Graphics drawers
  graphics.pixelGraphics = graphics.add.graphics();
  graphics.selectorGraphics = graphics.add.graphics();

  // Draw background
  graphics.pixelGraphics.fillStyle(0xffffff);
  graphics.pixelGraphics.fillRect(
    0,
    0,
    Number(vue.canvasDimensions.canvas_width),
    Number(vue.canvasDimensions.canvas_height)
  );

  // Counter for animations
  graphics.t = 0;
  graphics.tSign = 1;
  graphics.periodicity = 20;
  graphics.pixelsToPlace = [];
}
