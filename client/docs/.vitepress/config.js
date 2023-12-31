import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Kanvas",
  description: "The first collaborative and decentralized canvas",
  lang: "en-US",
  base: "/docs/",
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "32x32",
        href: "/docs/favicon.ico",
      },
    ],
  ],
  themeConfig: {
    logo: "/favicon.ico",
    lastUpdated: true,
    editLink: {
      pattern:
        "https://github.com/EtheredRaven/kanvas/blob/master/client/docs/:path",
    },
    nav: [
      { text: "Home", link: "https://kanvas-app.com" },
      { text: "Game", link: "https://kanvas-app.com/app/" },
      {
        text: "NFTs",
        link: "https://kollection.app/collection/1KANGodsBD74xBuoBVoJE2x2PiRyDbfM2i/",
      },
      {
        text: "Buy",
        link: "https://app.koindx.com/swap?input=15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL&output=1LeWGhDVD8g5rGCL4aDegEf9fKyTL1KhsS",
      },
      {
        text: "1.5.6",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/EtheredRaven/kanvas/blob/master/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/EtheredRaven/kanvas/",
          },
        ],
      },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is Kanvas ?", link: "/introduction/whatiskanvas" },
          {
            text: "What is Koinos and $KOIN ?",
            link: "/introduction/whatiskoinos",
          },
          { text: "What is $KAN ?", link: "/introduction/whatiskan" },
        ],
      },
      {
        text: "Playing Kanvas",
        items: [
          { text: "How to buy $KOIN ?", link: "/playing/howtobuykoin" },
          { text: "How to buy $KAN ?", link: "/playing/howtobuykan" },
          {
            text: "Connecting your wallet",
            link: "/playing/connectingwallet",
          },
          {
            text: "Controls and info",
            link: "/playing/controlsandinfo",
          },
          {
            text: "Kanvas Gods NFT Collection",
            link: "/playing/kanvasgods",
          },
          {
            text: "Placing pixels",
            link: "/playing/placingpixels",
          },
          {
            text: "Erasing pixels",
            link: "/playing/erasingpixels",
          },
          {
            text: "Importing a placeholder image",
            link: "/playing/importimage",
          },
          { text: "Troubleshooting", link: "/playing/troubleshooting" },
        ],
      },
      {
        text: "Others",
        items: [{ text: "Privacy Policy", link: "/others/privacypolicy" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/EtheredRaven/kanvas" },
      { icon: "twitter", link: "https://twitter.com/KanvasOfficial" },
      { icon: "discord", link: "https://discord.com/invite/yt6jgArt" },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telegram" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>',
        },
        link: "https://t.me/KanvasOfficial",
        ariaLabel: "telegram",
      },
    ],
  },
});
