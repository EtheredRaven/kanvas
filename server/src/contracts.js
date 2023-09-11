const { Contract, Provider, Signer } = require("koilib");
const kanvasContractAbi = require("../../client/src/utils/abi/kanvasContractAbi.json");
const koindxCoreAbi = require("../../client/src/utils/abi/koindxCoreAbi.json");
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
  Server.koindxCoreAddress = "1DMSDo8hmZN2Cui6eMM6tKjpjkBCTmrRR4"; //
  Server.koindxCoreContract = new Contract({
    id: Server.koindxCoreAddress,
    abi: koindxCoreAbi,
    provider: Server.provider,
  });

  // Koindx pairs management contract
  Server.koindxPeripheryAddress = "17e1q6Fh5RgnuA8K7v4KvXXH4k9qHgsT5s"; //
  Server.koindxPeripheryContract = new Contract({
    id: Server.koindxPeripheryAddress,
    abi: koindxPeripheryAbi,
    provider: Server.provider,
  });
};
