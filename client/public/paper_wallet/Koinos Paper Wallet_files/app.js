/**
 * Stores wallet address and private key (WIF)
 * @typedef {Object} Wallet
 * @property {string} address
 * @property {string} privateKey
 */

/**
 * @type {(Wallet | null)}
 */
let currentWallet = null;

async function generateWalletKeys() {
  currentWallet = null;

  const ECPair = ecpair.ECPairFactory(secp256k1);
  const stringToFind = "1KAN";

  let b = Date.now();
  let t = 0;
  let address = "";
  let privateKey = "";
  while (!address.startsWith(stringToFind)) {
    let pair = ECPair.makeRandom();
    address = bitcoin.payments.p2pkh({ pubkey: pair.publicKey }).address;
    privateKey = pair.toWIF();
    t++;
  }

  let totalTime = Date.now() - b;
  console.log("Total time: " + totalTime);
  console.log("Number tries: " + t);
  console.log("Time per trie: " + totalTime / t);

  setText("wallet-address-value", address);
  drawQrCode("wallet-address-qr-code", address);

  setText("private-key-value", privateKey);
  drawQrCode("private-key-qr-code", privateKey);

  currentWallet = { address, privateKey };
}

async function downloadWalletArchive() {
  if (currentWallet === null) {
    alert("Wallet not ready");
    return;
  }

  const archive = new JSZip();

  archive.file("wallet-address.txt", currentWallet.address);
  archive.file("private-key.txt", currentWallet.privateKey);

  const imagesFolder = archive.folder("images");

  const addressQrCode = await createQrCode(currentWallet.address);
  const privateKeyQrCode = await createQrCode(currentWallet.privateKey);

  imagesFolder.file("wallet-address.png", addressQrCode, { base64: true });
  imagesFolder.file("private-key.png", privateKeyQrCode, { base64: true });

  const archiveData = await archive.generateAsync({ type: "base64" });

  downloadArchive(archiveData);
}

document.addEventListener("DOMContentLoaded", async () => {
  const generateButton = document.getElementById("generate-button");
  const downloadButton = document.getElementById("download-button");

  if (!generateButton || !downloadButton) {
    throw new Error("Missing UI elements");
  }

  generateButton.addEventListener("click", async () => {
    await generateWalletKeys();
  });

  downloadButton.addEventListener("click", async () => {
    await downloadWalletArchive();
  });

  await generateWalletKeys();
});
