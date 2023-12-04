export function hexToHexNumber(hex) {
  hex = hex.substring(1);
  hex = "0x" + hex;
  // Delete the alpha
  hex = hex.length == 10 ? hex.substring(0, 8) : hex;
  return Number(hex);
}

export function rgbaToHex({ red, green, blue, alpha, r, g, b, a }) {
  red = red != undefined ? red : r;
  green = green != undefined ? green : g;
  blue = blue != undefined ? blue : b;
  alpha = alpha != undefined ? alpha : a;
  red = parseInt(red).toString(16);
  red = red.length == 1 ? "0" + red : red;
  green = parseInt(green).toString(16);
  green = green.length == 1 ? "0" + green : green;
  blue = parseInt(blue).toString(16);
  blue = blue.length == 1 ? "0" + blue : blue;

  let hex = "#" + red + "" + green + "" + blue;
  if (alpha == undefined) return hex;

  alpha = parseInt(alpha).toString(16);
  alpha = alpha.length == 1 ? "0" + alpha : alpha;
  return hex + "" + alpha;
}

export function rgbaToHexNumber({ red, green, blue, alpha, r, g, b, a }) {
  red = red != undefined ? red : r;
  green = green != undefined ? green : g;
  blue = blue != undefined ? blue : b;
  alpha = alpha != undefined ? alpha : a;
  let hex = rgbaToHex({ red, green, blue, alpha });
  return hexToHexNumber(hex);
}

export function hexToRgba(hex) {
  hex = hex.substring(1);
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  let a = hex.length == 8 ? parseInt(hex.substring(6, 8), 16) : undefined;
  return { r, g, b, a, red: r, green: g, blue: b, alpha: a };
}

export function rgbaToString(
  { red, green, blue, alpha, r, g, b, a },
  alphaDecimals = 2
) {
  red = red != undefined ? red : r;
  green = green != undefined ? green : g;
  blue = blue != undefined ? blue : b;
  alpha = alpha != undefined ? alpha : a;
  alpha = alpha / 255;
  alpha = alpha.toFixed(alphaDecimals);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function stringToRgba(string) {
  let rgba = string
    .substring(5, string.length - 1)
    .replace(/ /g, "")
    .split(",");
  let red = parseInt(rgba[0]);
  let green = parseInt(rgba[1]);
  let blue = parseInt(rgba[2]);
  let alpha = Math.round(parseFloat(rgba[3]) * 255);
  return {
    red,
    green,
    blue,
    alpha,
    r: red,
    g: green,
    b: blue,
    a: alpha,
  };
}

export function hexToRgbaString(hex) {
  let rgba = hexToRgba(hex);
  return rgbaToString(rgba);
}

export function stringToHex(string) {
  let rgba = stringToRgba(string);
  return rgbaToHex(rgba);
}

export function stringToHexNumber(string) {
  let hex = stringToHex(string);
  return hexToHexNumber(hex);
}
