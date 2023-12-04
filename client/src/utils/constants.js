export const nftTiers = {
  Almighty: {
    "Max pixels per transaction": 100,
    "Max imported image size": 65536,
    Size: 3,
  },
  Olympian: {
    "Max pixels per transaction": 50,
    "Max imported image size": 16384,
    Size: 11,
  },
  Divine: {
    "Max pixels per transaction": 25,
    "Max imported image size": 4096,
    Size: 25,
  },
  Mythical: {
    "Max pixels per transaction": 15,
    "Max imported image size": 256,
    Size: 50,
  },
  Classical: {
    "Max pixels per transaction": 10,
    "Max imported image size": 64,
    Size: 100,
  },
};

// Create an array with associating the nft id to the max imported image size
// This is used to calculate the max size of the image that can be imported
let nftTiersArray = [0]; // The first element is the default tier and is equal to 0
for (const [, value] of Object.entries(nftTiers)) {
  for (let i = 0; i < value.Size; i++) {
    nftTiersArray.push(value["Max imported image size"]);
  }
}

export const nftTiersArrayMaxImportedImageSize = nftTiersArray;
