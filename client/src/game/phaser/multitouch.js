// Define a function to compute a distance between two points
function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Return true if there is a multitouch event
export default function ({ graphics }) {
  const MIN_DELTA = 0.6;
  const DELTA_FACTOR = 0.4;
  let pointers = graphics.input.manager.pointers;
  if (pointers.length <= 2) return;

  let pointer1 = pointers[1]; // First pointer is reserved by phaser
  let pointer2 = pointers[2];
  if (!pointer1.active || !pointer2.active) return;

  // Get the distance between the two pointers
  let distance = distanceBetweenPoints(
    pointer1.x,
    pointer1.y,
    pointer2.x,
    pointer2.y
  );
  let lastDistance = distanceBetweenPoints(
    pointer1.prevPosition.x,
    pointer1.prevPosition.y,
    pointer2.prevPosition.x,
    pointer2.prevPosition.y
  );

  let pointersMiddle = {
    worldX: (pointer1.worldX + pointer2.worldX) / 2,
    worldY: (pointer1.worldY + pointer2.worldY) / 2,
  };
  let delta = lastDistance - distance;
  Math.abs(delta) > MIN_DELTA &&
    graphics.zoomOnCanvas(pointersMiddle, delta, DELTA_FACTOR);

  // Multi-touch delay to avoid clicking on the canvas when zooming
  graphics.isMultitouchZooming && clearTimeout(graphics.isMultitouchZooming);
  graphics.isMultitouchZooming = setTimeout(() => {
    graphics.isMultitouchZooming = false;
  }, 300);

  return true;
}
