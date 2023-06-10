const { Contract, Provider } = require("koilib");
const { kanvasContractAbi } = require("./abi");
const { Client } = require("koinos-rpc");

module.exports = async function (Server) {
  Server.provider = new Provider(["https://api.koinos.io"]);
  Server.client = new Client(["https://api.koinos.io"]);
  Server.kanvasContractAddress = "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS";
  Server.kanvasContract = new Contract({
    id: Server.kanvasContractAddress,
    abi: kanvasContractAbi,
    provider: Server.provider,
  });
  const contractFunctions = Server.kanvasContract.functions;
  const dimensionsResult = await contractFunctions.canvas_dimensions({});
  Server.canvasDimensions = dimensionsResult.result;

  // Update the pixels map in memory to give it to new sockets connecting (to reduce db calls if a lot of new sockets connecting)
  let updatePixelsMap = async function () {
    Server.pixels = await Server.db.all(
      "SELECT * FROM pixels WHERE unvisible != 1"
    );
    Server.infoLogging("Updated pixels map");
  };

  Server.updatePixelsMapInterval = setInterval(updatePixelsMap, 5000);
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
