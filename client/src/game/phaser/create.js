export default function ({ graphics }) {
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

  // Counter for animations
  graphics.t = 0;
  graphics.tSign = 1;
  graphics.periodicity = 20;
  graphics.pixelsToPlace = [];
  graphics.pixelsToErase = [];
}
