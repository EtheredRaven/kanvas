import { Contract, utils, Provider } from "koilib";
import { kanvasContractAbi, kapNameServiceAbi, kapProfileAbi } from "./abi";

const defaultProviders = new Provider([
  "https://api.koinos.io",
  "https://api.koinosblocks.com",
]);

export function getKanvasContract(signer) {
  signer && (signer.provider = defaultProviders);
  return new Contract({
    id: "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS",
    abi: kanvasContractAbi,
    provider: defaultProviders,
    signer: signer,
    options: {
      rcLimit: "100000000",
    },
  }).functions;
}

export function getKoinContract(signer) {
  signer && (signer.provider = defaultProviders);
  return new Contract({
    id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    abi: utils.tokenAbi,
    provider: defaultProviders,
    signer: signer,
  }).functions;
}

export function getKapNameServiceContract() {
  return new Contract({
    id: "13tmzDmfqCsbYT26C4CmKxq86d33senqH3",
    abi: kapNameServiceAbi,
    provider: defaultProviders,
  }).functions;
}

export function getKapProfileContract() {
  return new Contract({
    id: "1EttfMuvTXGh8oE6vLiRF5JfqBvRiofFkB",
    abi: kapProfileAbi,
    provider: defaultProviders,
  }).functions;
}
