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
    async erase_pixels() {
      return await getMockupTimeout(500, 3000)();
    },
    pixel_count_of() {
      return { value: 0 };
    },
    balance_of() {
      return { result: { value: 3000000000 } };
    },
    tokens_of() {
      return { result: { token_id: [] } };
    },
    pixels_per_tx_of() {
      return { result: { value: 5 } };
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

export const mockupPixelsPerTx = 5;
