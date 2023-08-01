import { Contract, utils, Provider } from "koilib";
import { kanvasContractAbi, kapNameServiceAbi, kapProfileAbi } from "./abi";

export const defaultProvider = new Provider([
  "https://api.koinos.io",
  "https://api.koinosblocks.com",
]);

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
    id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL", //1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju
    abi: utils.tokenAbi,
    provider: defaultProvider,
    signer: signer,
  }).functions;
}

export function getKapNameServiceContract() {
  return new Contract({
    id: "13tmzDmfqCsbYT26C4CmKxq86d33senqH3",
    abi: kapNameServiceAbi,
    provider: defaultProvider,
  }).functions;
}

export function getKapProfileContract() {
  return new Contract({
    id: "1EttfMuvTXGh8oE6vLiRF5JfqBvRiofFkB",
    abi: kapProfileAbi,
    provider: defaultProvider,
  }).functions;
}
