import { Contract, utils, Provider } from "koilib";
import { kanvasContractAbi, kapNameServiceAbi, kapProfileAbi } from "./abi";
import { WalletConnectKoinos } from "@armana/walletconnect-koinos-sdk-js";

export const defaultProvider = new Provider([
  "https://api.koinos.io",
  "https://api.koinosblocks.com",
]);

window.Client.kanvasContractAddress = "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS";
export function getKanvasContract(signer) {
  signer && (signer.provider = defaultProvider);
  return new Contract({
    id: window.Client.kanvasContractAddress,
    abi: kanvasContractAbi,
    provider: defaultProvider,
    signer: signer,
    options: {
      rcLimit: "150000000",
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

export function getWalletConnectKoinos() {
  const projectId = "52f899f5d7d7e95a07c00ea404e71902";
  return new WalletConnectKoinos({
    projectId,
    // your application information
    metadata: {
      name: "Kanvas",
      description:
        "The first collaborative and decentralized canvas, based on the first feeless smart-contract blockchain, Koinos !",
      url: "kanvas-app.com",
      icons: [
        "https://walletconnect.com/_next/static/media/logo_mark.84dd8525.svg",
      ],
    },
    modalOptions: {
      explorerRecommendedWalletIds: "NONE",
      enableExplorer: false,
    },
  });
}
