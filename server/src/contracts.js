const { Contract, Provider, Signer } = require("koilib");
const kanvasContractAbi = require("../../client/src/utils/abi/kanvasContractAbi.json");
const koindxPeripheryAbi = require("../../client/src/utils/abi/koindxPeripheryAbi.json");
const { Client } = require("koinos-rpc");

module.exports = async function (Server) {
  Server.PROVIDERS_URL = [
    "https://api.koinos.io",
    "https://api.koinosblocks.com",
  ];
  Server.provider = new Provider(Server.PROVIDERS_URL); // koilib
  Server.client = new Client(Server.PROVIDERS_URL); // koinos-rpc

  // Kanvas contract
  Server.kanvasContractAddress = "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS";
  Server.kanvasContract = new Contract({
    id: Server.kanvasContractAddress,
    abi: kanvasContractAbi,
    provider: Server.provider,
  });

  // Koindx pair contract
  Server.koindxPeripheryAddress = "13KfdWTz3n4E9XmvuREwdcfBawdKLFk3YF";
  Server.koindxPeripheryContract = new Contract({
    id: Server.koindxPeripheryAddress,
    abi: koindxPeripheryAbi,
    provider: Server.provider,
  });

  Server.koindxCoreAddress = "14WeQjBk7F4C58xUquRGLK1KiqRjwj5Y4J";
  // TODO : ajouter l'adresse et le contrat
};
