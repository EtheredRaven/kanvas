export default function ({ graphics }) {
  // Init game canvas
  graphics.renderer.clearBeforeRender = false;
  graphics.cameras.main.setRoundPixels(false);
  graphics.cameras.main.zoom = 1;
  graphics.targetZoom = graphics.cameras.main.zoom;

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

  // Canvas scrolling
  graphics.scrollSpeedX = 0;
  graphics.scrollSpeedY = 0;
  graphics.scrollAcceleration = 0.16;
  graphics.scrollMaxSpeed = 5;
  graphics.scrollFriction = 0.9;

  // Canvas zooming
  graphics.easeZoomSpeed = 0.1;
  graphics.zoomSpeed = 0.08;
  graphics.maxZoom = 30;
  graphics.minZoom = 0.5;

  // Add escape keyboard listener
  graphics.escapeKey = graphics.input.keyboard.addKey("ESC");

  // Add a placeholder hidden canvas and set to the same size as the game canvas
  // It will be only used for knowing the color of the pixels of the placeholder images
  graphics.placeholdersCanvas = document.createElement("canvas");
  graphics.placeholdersCanvas.width = graphics.game.canvas.width * 2;
  graphics.placeholdersCanvas.height = graphics.game.canvas.height * 2;
  graphics.placeholdersCanvas.style.display = "none";

  // Add a listener to the h key to hide/show the user pixels
  graphics.hKey = graphics.input.keyboard.addKey("H");
  graphics.hKey.on("down", () => {
    graphics.togglePixelsOwnerOnly();
  });
}
