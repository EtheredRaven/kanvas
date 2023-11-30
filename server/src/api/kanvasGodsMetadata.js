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
  ];

  const nftTiers = {
    Almighty: {
      "Max pixels per transaction": 100,
      "Max imported image size": 65536,
    },
    Olympian: {
      "Max pixels per transaction": 50,
      "Max imported image size": 16364,
    },
    Divine: {
      "Max pixels per transaction": 25,
      "Max imported image size": 4096,
    },
    Mythical: {
      "Max pixels per transaction": 15,
      "Max imported image size": 256,
    },
    Classical: {
      "Max pixels per transaction": 10,
      "Max imported image size": 64,
    },
  };

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

  return (tokenId) => {
    if (tokenId.startsWith("0x")) {
      tokenId = tokenId.substring(2);
    }
    tokenId = hexStringToAsciiInt(tokenId, 16) - 1;
    console.log(tokenId);

    if (isNaN(tokenId) || tokenId < 0 || tokenId >= nftMetadata.length)
      return {};
    let metadata = nftMetadata[tokenId];
    let returnedMetadata = {};
    returnedMetadata.name = metadata.name + " - " + metadata.Legacy;
    returnedMetadata.description =
      "Kanvas Gods (KANGODS) is a unique NFT collection where Greek deities empower your creative dominion over the collaborative digital world of Kanvas. " +
      "Spanning 'Almighty', 'Olympian', 'Divine', 'Mythical', and 'Classical' tiers, each one enhances your ability to shape this pixelated realm with escalating capabilities in pixel placement, pixel erasing and image importation. " +
      "Each tier not only grants greater creative power but also promises exclusive future features, embodying the democratic spirit and artistic mastery reminiscent of ancient Greece. " +
      "Own a piece of this legacy and wield the power of a god to mold the Kanvas universe.";
    returnedMetadata.image =
      "https://kanvas-app.com/app/img/gods/" + metadata.name + ".png";
    returnedMetadata.attributes = [];

    for (const attribute in metadata) {
      if (attribute == "name" || attribute == "Legacy") continue;
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
  };
};
