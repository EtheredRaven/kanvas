const nftTiers = {
  Almighty: {
    "Max pixels per transaction": 100,
    "Max imported image size": 65536,
    Size: 3,
  },
  Olympian: {
    "Max pixels per transaction": 50,
    "Max imported image size": 16364,
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

module.exports = function (Server) {
  const nftMetadata = [
    {
      name: "Zeus",
      Legacy: "King of Gods",
      Tier: "Almighty",
      Realm: "Sky",
      "Main Attribute": "Lightning Bolt",
      "Secondary Attributes": "Eagle",
      Temperament: "Authoritative & Commanding",
    },
    {
      name: "Poseidon",
      Legacy: "God of the Sea",
      Tier: "Almighty",
      Realm: "Sea",
      "Main Attribute": "Trident",
      "Secondary Attributes": "Sea animals & Raging waters",
      Temperament: "Tempestuous & Unpredictable",
    },
    {
      name: "Hades",
      Legacy: "God of the Underworld",
      Tier: "Almighty",
      Realm: "Underworld",
      "Main Attribute": "Black Scepter",
      "Secondary Attributes": "Skull",
      Temperament: "Stern & Unyielding",
    },
    {
      name: "Hera",
      Legacy: "Queen of Gods",
      Tier: "Olympian",
      Realm: "Marriage",
      "Main Attribute": "Pomegranate",
      "Secondary Attributes": "Peacock",
      Temperament: "Regal & Dignified",
    },
    {
      name: "Demeter",
      Legacy: "Goddess of Agriculture",
      Tier: "Olympian",
      Realm: "Agriculture & Harvest",
      "Main Attribute": "Sheaf of Wheat",
      "Secondary Attributes": "Wheat Wreath",
      Temperament: "Nurturing & Generous",
    },
    {
      name: "Hestia",
      Legacy: "Goddess of the Hearth",
      Tier: "Olympian",
      Realm: "Hearth and Home",
      "Main Attribute": "Torch",
      "Secondary Attributes": "Cauldron",
      Temperament: "Warm & Welcoming",
    },
    {
      name: "Athena",
      Legacy: "Goddess of Wisdom",
      Tier: "Olympian",
      Realm: "Wisdom and War",
      "Main Attribute": "Aegis",
      "Secondary Attributes": "Spear & Owl",
      Temperament: "Strategic & Intelligent",
    },
    {
      name: "Apollo",
      Legacy: "God of the Arts",
      Tier: "Olympian",
      Realm: "Music, Arts, and Light",
      "Main Attribute": "Lyre",
      "Secondary Attributes": "Laurel Wreath",
      Temperament: "Creative & Enlightened",
    },
    {
      name: "Artemis",
      Legacy: "Goddess of the Hunt",
      Tier: "Olympian",
      Realm: "Hunt and Moon",
      "Main Attribute": "Bow",
      "Secondary Attributes": "Arrow & Deer",
      Temperament: "Independent & Vigilant",
    },
    {
      name: "Aphrodite",
      Legacy: "Goddess of Love",
      Tier: "Olympian",
      Realm: "Love and Beauty",
      "Main Attribute": "Golden Apple",
      "Secondary Attributes": "Shell & Doves",
      Temperament: "Passionate & Desirable",
    },
    {
      name: "Hephaestus",
      Legacy: "God of the Forge",
      Tier: "Olympian",
      Realm: "Fire and Metalworking",
      "Main Attribute": "Hammer",
      "Secondary Attributes": "Metal",
      Temperament: "Industrious & Skilled",
    },
    {
      name: "Hermes",
      Legacy: "Messenger of the Gods",
      Tier: "Olympian",
      Realm: "Trade and Travel",
      "Main Attribute": "Caduceus",
      "Secondary Attributes": "Winged Sandals",
      Temperament: "Witty & Clever",
    },
    {
      name: "Ares",
      Legacy: "God of War",
      Tier: "Olympian",
      Realm: "War",
      "Main Attribute": "Swords",
      "Secondary Attributes": "Lion",
      Temperament: "Fierce & Aggressive",
    },
    {
      name: "Dionysos",
      Legacy: "God of Wine",
      Tier: "Olympian",
      Realm: "Wine and Festivity",
      "Main Attribute": "Grapes",
      "Secondary Attributes": "Wine Cup",
      Temperament: "Jovial & Liberated",
    },
    {
      name: "Bill Cipher",
      Legacy: "Master of Illusions",
      Tier: "Divine",
      Realm: "Mystery and Deception",
      "Main Attribute": "All-Seeing Eye",
      "Secondary Attributes": "Triangle Body & Top Hat",
      Temperament: "Mysterious & Chaotic",
      SpecialDescription:
        "This exclusive Bill Cipher NFT is a tribute to Fox, whose remarkable contributions have been instrumental in the success of the Kanvas project. As a token of gratitude, this artwork was crafted specifically for Fox, celebrating their support and passion. This NFT, inspired by the enigmatic character from the beloved series 'Gravity Falls,' represents a convergence of mystery and chaos, mirroring Bill Cipher's notorious role as a trickster and a master of deception. It's a unique fan illustration, created as a reward and not for sale, thus respecting the copyrights of the original creators. Kanvas acknowledges that it is not affiliated with 'Gravity Falls' or its creators and has not monetized this artwork in any way. It's a special homage to a character that resonates with the spirit of curiosity and the unexpected, much like the journey of Kanvas itself.",
    },
  ];

  function hexStringToAsciiInt(hexString) {
    // Remove the '0x' prefix if present
    if (hexString.startsWith("0x")) {
      hexString = hexString.substring(2);
    }

    let charString = "";
    for (let i = 0; i < hexString.length; i += 2) {
      // Extract two hexadecimal digits at a time
      let hexPair = hexString.substring(i, i + 2);
      // Convert the hex pair to a character
      charString += String.fromCharCode(parseInt(hexPair, 16));
    }

    // Convert the complete character string to an integer
    return parseInt(charString);
  }

  function getKanvasGodsMetadata(tokenId) {
    if (tokenId.startsWith("0x")) {
      tokenId = tokenId.substring(2);
    }
    tokenId = hexStringToAsciiInt(tokenId, 16) - 1;

    if (isNaN(tokenId) || tokenId < 0 || tokenId >= nftMetadata.length)
      return {};
    let metadata = nftMetadata[tokenId];
    let returnedMetadata = {};
    returnedMetadata.name = metadata.name + " - " + metadata.Legacy;
    returnedMetadata.description = metadata.SpecialDescription
      ? metadata.SpecialDescription
      : "Kanvas Gods (KANGODS) is a unique NFT collection where Greek deities empower your creative dominion over the collaborative digital world of Kanvas. " +
        "Spanning 'Almighty', 'Olympian', 'Divine', 'Mythical', and 'Classical' tiers, each one enhances your ability to shape this pixelated realm with escalating capabilities in pixel placement, pixel erasing and image importation. " +
        "Each tier not only grants greater creative power but also promises exclusive future features, embodying the democratic spirit and artistic mastery reminiscent of ancient Greece. " +
        "Own a piece of this legacy and wield the power of a god to mold the Kanvas universe.";
    returnedMetadata.image =
      "https://kanvas-app.com/app/img/gods/" +
      metadata.name.replace(" ", "%20") +
      ".png";
    returnedMetadata.attributes = [];

    for (const attribute in metadata) {
      if (
        attribute == "name" ||
        attribute == "Legacy" ||
        attribute == "SpecialDescription"
      )
        continue;
      returnedMetadata.attributes.push({
        trait_type: attribute,
        value: metadata[attribute],
      });
    }

    for (const tierAttribute in nftTiers[metadata.Tier]) {
      returnedMetadata.attributes.push({
        trait_type: tierAttribute,
        value: nftTiers[metadata.Tier][tierAttribute],
      });
    }

    return returnedMetadata;
  }

  Server.app.get("/api/kanvas_gods/get_metadata/:tokenId", function (req, res) {
    return res.send(getKanvasGodsMetadata(req.params.tokenId));
  });
};
