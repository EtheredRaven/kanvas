import { Contract, utils, Provider } from "koilib";
import { kanvasContractAbi } from "./abi";

const defaultProvider = new Provider(["https://api.koinos.io"]);

export function getKanvasContract(signer) {
  signer && (signer.provider = defaultProvider);
  return new Contract({
    id: "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS",
    abi: kanvasContractAbi,
    provider: defaultProvider,
    signer: signer,
    options: {
      rcLimit: "100000000",
    },
  }).functions;
}

export function getKoinContract(signer) {
  signer && (signer.provider = defaultProvider);
  return new Contract({
    id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    abi: utils.tokenAbi,
    provider: defaultProvider,
    signer: signer,
  }).functions;
}
