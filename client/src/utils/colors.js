export function hexToHexNumber(hex) {
  hex = hex.substring(1);
  hex = "0x" + hex;
  return Number(hex);
}

export function rgbToHex(r, g, b) {
  r = parseInt(r).toString(16);
  r = r.length == 1 ? "0" + r : r;
  g = parseInt(g).toString(16);
  g = g.length == 1 ? "0" + g : g;
  b = parseInt(b).toString(16);
  b = b.length == 1 ? "0" + b : b;
  return "#" + r + "" + g + "" + b;
}

export function rgbToHexNumber({ red, green, blue }) {
  let r = parseInt(red).toString(16);
  r = r.length == 1 ? "0" + r : r;
  let g = parseInt(green).toString(16);
  g = g.length == 1 ? "0" + g : g;
  let b = parseInt(blue).toString(16);
  b = b.length == 1 ? "0" + blue : blue;
  return parseInt(`0x${r}${g}${b}`);
}

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
