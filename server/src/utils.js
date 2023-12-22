module.exports = {
  integerToHexString(number) {
    const numberString = number.toString();
    const hexString =
      "0x" +
      Array.from(numberString)
        .map((char) => {
          return char.charCodeAt(0).toString(16);
        })
        .join("");
    return hexString;
  },

  hexStringToInt(hexString) {
    // Get rid of the first two characters (0x)
    hexString = hexString.slice(2);

    let chars = [];
    for (let i = 0; i < hexString.length; i += 2) {
      // Extract each 2-character chunk (like '0x31')
      const chunk = hexString.slice(i, i + 2);
      // Convert the chunk to an integer (ASCII code)
      const asciiCode = parseInt(chunk, 16);
      // Convert the ASCII code to a character and add to the array
      chars.push(String.fromCharCode(asciiCode));
    }
    // Combine the characters and convert to an integer
    return parseInt(chars.join(""));
  },
};
