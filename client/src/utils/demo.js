let Client = window.Client;
Client.mockupAddress = "1DRAGKEp1KxT8AaCFitF9XJJcH4RGZ5uxR";
let demoText = "This is a demo wallet with local and unsaved transactions !";

let getMockupTimeout = function (
  timeoutToSend,
  timeoutToProcess,
  errorFunction
) {
  return async function () {
    await new Promise((r) => setTimeout(r, timeoutToSend));
    return {
      transaction: {
        wait: async function () {
          await new Promise((res, rej) =>
            setTimeout(async () => {
              try {
                errorFunction && (await errorFunction());
                return res();
              } catch (err) {
                rej(err);
              }
            }, timeoutToProcess)
          );
        },
        demoText,
      },
    };
  };
};

export function getMockupContract() {
  return {
    async place_pixels({ place_pixel_arguments }) {
      return await getMockupTimeout(500, 3000, async function () {
        if (
          place_pixel_arguments.length >
          (await Client.game.vue.$store.getters.getTokenBalance()) -
            (await Client.game.vue.$store.getters.getPixelsAmount())
        ) {
          throw "You need more KAN to place a new pixel";
        }
      })();
    },
    async erase_pixel() {
      return await getMockupTimeout(500, 3000)();
    },
  };
}

export function getMockupWallet() {
  return {
    name: "Demo",
    wallet: {
      name: "Demo",
      accounts: [
        {
          name: "Demo",
          address: Client.mockupAddress,
          signers: [],
        },
      ],
    },
  };
}

export const mockupKANNumber = 30;
