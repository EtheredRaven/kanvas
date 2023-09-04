module.exports = async function (Server) {
  const dimensionsResult =
    await Server.kanvasContract.functions.canvas_dimensions({});
  Server.canvasDimensions = dimensionsResult.result;

  // Update the pixels map in memory to give it to new sockets connecting (to reduce db calls if a lot of new sockets connecting)
  let updatePixelsMap = async function () {
    Server.pixels = await Server.db.all(
      "SELECT * FROM pixels WHERE unvisible != 1"
    );
    Server.infoLogging("Updated pixels map");
  };

  // TODO
  /*
  await Server.db.run(
    "UPDATE pixels SET unvisible = ? WHERE owner = ?",
    [0, accId]
  );*/

  const PIXELS_MAP_UPDATE_FREQUENCY_IN_SECONDS = 10;
  Server.updatePixelsMapInterval = setInterval(
    updatePixelsMap,
    PIXELS_MAP_UPDATE_FREQUENCY_IN_SECONDS * 1000
  );
  /*for (let i = 0; i < Server.canvasDimensions.canvas_width; i++) {
    let row = [];
    for (let j = 0; j < Server.canvasDimensions.canvas_height; j++) {
      row.push({});
    }
    Server.pixelMap.push(row);
  }

  let pixels = await Server.db.all("SELECT * FROM pixels");
  for (let i = 0; i < pixels.length; i++) {
    let pixel = pixels[i];
    Server.pixelMap[pixel.posX][pixel.posY] = pixel;
    i % 1000 == 0 &&
      console.log(
        "Initalizing pixel map : " + ((i + 1) / pixels.length) * 100 + "%"
      );
  }
  console.log("Initalizing pixel map : 100%");*/
};