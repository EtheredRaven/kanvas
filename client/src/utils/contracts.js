import { Contract, utils } from "koilib";
import { kanvasContractAbi } from "./abi";
import * as kondor from "kondor-js";

export function getKanvasContract(address) {
  return new Contract({
    id: "1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS",
    abi: kanvasContractAbi,
    provider: kondor.provider,
    signer: kondor.getSigner(address),
  });
}

export function getKoinContract(address) {
  return new Contract({
    id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
    abi: utils.tokenAbi,
    provider: kondor.provider,
    signer: kondor.getSigner(address),
  });
}
