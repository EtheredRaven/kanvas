const { Contract, Provider, utils } = require("koilib");
const kanvasContractAbi = require("../../client/src/utils/abi/kanvasContractAbi.json");
const koindxCoreAbi = require("../../client/src/utils/abi/koindxCoreAbi.json");
const koindxPeripheryAbi = require("../../client/src/utils/abi/koindxPeripheryAbi.json");
const kapNameServiceAbi = require("../../client/src/utils/abi/kapNameServiceAbi.json");
const kanvasGodsAbi = require("../../client/src/utils/abi/kanvasGodsContractAbi.json");
const { Client } = require("koinos-rpc");

module.exports = async function (Server) {
  Server.PROVIDERS_URL = [
    "https://api.koinos.io",
    "https://api.koinosblocks.com",
  ];
  Server.provider = new Provider(Server.PROVIDERS_URL); // koilib
  Server.client = new Client(Server.PROVIDERS_URL); // koinos-rpc

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

  Server.kapNameServiceContract = new Contract({
    id: "13tmzDmfqCsbYT26C4CmKxq86d33senqH3",
    abi: kapNameServiceAbi,
    provider: Server.provider,
  }).functions;

  Server.initKoinContractWithSigner = (signer) => {
    signer.provider = Server.provider;
    return new Contract({
      id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
      abi: utils.tokenAbi,
      provider: Server.provider,
      signer: signer,
    }).functions;
  };

  // Kanvas contract
  Server.kanvasContractAddress = "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS";
  Server.koincrewtokenContractAddress = "1BTQCpospHJRA7VAtZ4wvitdcqYCvkwBCD";
  Server.initKanvasContractWithSigner = (
    signer,
    contractAddress = Server.kanvasContractAddress
  ) => {
    let contractArgs = {
      id: contractAddress,
      abi: kanvasContractAbi,
      provider: Server.provider,
    };
    if (signer) {
      signer.provider = Server.provider;
      contractArgs.signer = signer;
    }
    return new Contract(contractArgs);
  };
  Server.kanvasContract = Server.initKanvasContractWithSigner();

  // Kanvas gods contract
  Server.kanvasGodsContractAddress = "1KANGodsBD74xBuoBVoJE2x2PiRyDbfM2i";
  Server.kanvasGodsContract = new Contract({
    id: Server.kanvasGodsContractAddress,
    abi: kanvasGodsAbi,
    provider: Server.provider,
  });
};
