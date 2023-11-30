import { utils } from "koilib";

export function copyToClipboard(str) {
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  el.setSelectionRange(0, 999999);
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function str2rgba(r) {
  const o = [];
  for (let a, c = 0; c < 256; c++) {
    a = c;
    for (let f = 0; f < 8; f++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
    o[c] = a;
  }
  let n = -1;
  for (let t = 0; t < r.length; t++)
    n = (n >>> 8) ^ o[255 & (n ^ r.charCodeAt(t))];
  return ((-1 ^ n) >>> 0).toString(16);
}

export function base64ToInt(base64) {
  return parseInt(utils.toHexString(utils.decodeBase64url(base64)), 16);
}

export function intToBase64(intN) {
  return utils.encodeBase64url(utils.toUint8Array(parseInt(intN).toString(16)));
}

export function formatChainError(err) {
  let error = err;
  if (err.message) {
    error = err.toString().replace("Error: ", "");

    error = err.message;
    if (error == "User rejected") {
      error = "WalletConnect user rejected";
    }

    try {
      error = JSON.parse(error);
      error = error.error;
    } catch (err2) {
      err2;
    }

    if (error == "Connection lost") {
      error = "Kondor connection lost";
    }
  }
  return err;
}
