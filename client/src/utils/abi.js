export const kanvasContractAbi = {
  methods: {
    name: {
      argument: "kanvascontract.name_arguments",
      return: "kanvascontract.name_result",
      description: "Returns the token's name",
      entry_point: 2191741823,
      read_only: true,
    },
    symbol: {
      argument: "kanvascontract.symbol_arguments",
      return: "kanvascontract.symbol_result",
      description: "Returns the token's symbol",
      entry_point: 3077209249,
      read_only: true,
    },
    decimals: {
      argument: "kanvascontract.decimals_arguments",
      return: "kanvascontract.decimals_result",
      description: "Returns the token's decimals precision",
      entry_point: 4001430831,
      read_only: true,
    },
    total_supply: {
      argument: "kanvascontract.total_supply_arguments",
      return: "kanvascontract.total_supply_result",
      description: "Returns the token's total supply",
      entry_point: 2967091508,
      read_only: true,
    },
    balance_of: {
      argument: "kanvascontract.balance_of_arguments",
      return: "kanvascontract.balance_of_result",
      description: "Checks the balance at an address",
      entry_point: 1550980247,
      read_only: true,
    },
    transfer: {
      argument: "kanvascontract.transfer_arguments",
      return: "kanvascontract.empty_message",
      description: "Transfers the token",
      entry_point: 670398154,
      read_only: false,
    },
    mint: {
      argument: "kanvascontract.mint_arguments",
      return: "kanvascontract.empty_message",
      description: "Mints the token",
      entry_point: 3698268091,
      read_only: false,
    },
    burn: {
      argument: "kanvascontract.burn_arguments",
      return: "kanvascontract.empty_message",
      description: "Burns the token",
      entry_point: 2241834181,
      read_only: false,
    },
    pixel_count_of: {
      argument: "kanvascontract.pixel_count_of_arguments",
      return: "kanvascontract.pixel_count_of_result",
      description: "Checks the pixels balance at an address",
      entry_point: 1009867529,
      read_only: true,
    },
    place_pixel: {
      argument: "kanvascontract.place_pixel_arguments",
      return: "kanvascontract.place_pixel_result",
      description: "Place a new pixel",
      entry_point: 2987049699,
      read_only: false,
    },
    pixel_at: {
      argument: "kanvascontract.pixel_at_arguments",
      return: "kanvascontract.pixel_at_result",
      description: "Query a pixel at a specific position",
      entry_point: 222960212,
      read_only: true,
    },
    canvas_dimensions: {
      argument: "kanvascontract.canvas_dimensions_arguments",
      return: "kanvascontract.canvas_dimensions_result",
      description: "Query the canvas dimensions",
      entry_point: 881444190,
      read_only: true,
    },
    set_canvas_dimensions: {
      argument: "kanvascontract.set_canvas_dimensions_arguments",
      return: "kanvascontract.empty_message",
      description: "Set the canvas dimensions",
      entry_point: 3274083070,
      read_only: false,
    },
  },
  types: {
    nested: {
      kanvascontract: {
        nested: {
          empty_message: {
            fields: {},
          },
          uint64: {
            fields: {
              value: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          name_arguments: {
            fields: {},
          },
          name_result: {
            fields: {
              value: {
                type: "string",
                id: 1,
              },
            },
          },
          symbol_arguments: {
            fields: {},
          },
          symbol_result: {
            fields: {
              value: {
                type: "string",
                id: 1,
              },
            },
          },
          decimals_arguments: {
            fields: {},
          },
          decimals_result: {
            fields: {
              value: {
                type: "uint32",
                id: 1,
              },
            },
          },
          total_supply_arguments: {
            fields: {},
          },
          total_supply_result: {
            fields: {
              value: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          balance_of_arguments: {
            fields: {
              owner: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
            },
          },
          balance_of_result: {
            fields: {
              value: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          transfer_arguments: {
            fields: {
              from: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              to: {
                type: "bytes",
                id: 2,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              value: {
                type: "uint64",
                id: 3,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          mint_arguments: {
            fields: {
              to: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              value: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          burn_arguments: {
            fields: {
              from: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              value: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          pixel_count_of_arguments: {
            fields: {
              owner: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
            },
          },
          pixel_count_of_result: {
            fields: {
              value: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          place_pixel_arguments: {
            fields: {
              from: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              posX: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
              posY: {
                type: "uint64",
                id: 3,
                options: {
                  jstype: "JS_STRING",
                },
              },
              red: {
                type: "uint64",
                id: 4,
                options: {
                  jstype: "JS_STRING",
                },
              },
              green: {
                type: "uint64",
                id: 5,
                options: {
                  jstype: "JS_STRING",
                },
              },
              blue: {
                type: "uint64",
                id: 6,
                options: {
                  jstype: "JS_STRING",
                },
              },
              alpha: {
                type: "uint64",
                id: 7,
                options: {
                  jstype: "JS_STRING",
                },
              },
              metadata: {
                type: "string",
                id: 8,
              },
            },
          },
          place_pixel_result: {
            fields: {
              pixel_count_object: {
                type: "pixel_count_object",
                id: 1,
              },
              old_pixel_count_object: {
                type: "pixel_count_object",
                id: 2,
              },
              balance_object: {
                type: "balance_object",
                id: 3,
              },
            },
          },
          pixel_at_arguments: {
            fields: {
              posX: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
              posY: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          pixel_at_result: {
            fields: {
              pixel: {
                type: "pixel_object",
                id: 1,
              },
            },
          },
          canvas_dimensions_arguments: {
            fields: {},
          },
          canvas_dimensions_result: {
            fields: {
              canvas_width: {
                type: "uint64",
                id: 1,
              },
              canvas_height: {
                type: "uint64",
                id: 2,
              },
            },
          },
          set_canvas_dimensions_arguments: {
            fields: {
              canvas_width: {
                type: "uint64",
                id: 1,
              },
              canvas_height: {
                type: "uint64",
                id: 2,
              },
            },
          },
          balance_object: {
            fields: {
              value: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          pixel_count_object: {
            fields: {
              value: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          pixel_object: {
            fields: {
              posX: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
              posY: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
              red: {
                type: "uint64",
                id: 3,
                options: {
                  jstype: "JS_STRING",
                },
              },
              green: {
                type: "uint64",
                id: 4,
                options: {
                  jstype: "JS_STRING",
                },
              },
              blue: {
                type: "uint64",
                id: 5,
                options: {
                  jstype: "JS_STRING",
                },
              },
              alpha: {
                type: "uint64",
                id: 6,
                options: {
                  jstype: "JS_STRING",
                },
              },
              metadata: {
                type: "string",
                id: 7,
              },
              owner: {
                type: "bytes",
                id: 8,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
            },
          },
          mint_event: {
            fields: {
              to: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              value: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          burn_event: {
            fields: {
              from: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              value: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          transfer_event: {
            fields: {
              from: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              to: {
                type: "bytes",
                id: 2,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              value: {
                type: "uint64",
                id: 3,
                options: {
                  jstype: "JS_STRING",
                },
              },
              from_balance: {
                type: "uint64",
                id: 4,
                options: {
                  jstype: "JS_STRING",
                },
              },
              to_balance: {
                type: "uint64",
                id: 5,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          pixel_placed_event: {
            fields: {
              from: {
                type: "bytes",
                id: 1,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              previous_owner: {
                type: "bytes",
                id: 2,
                options: {
                  "(koinos.btype)": "ADDRESS",
                },
              },
              pixel_placed: {
                type: "pixel_object",
                id: 3,
              },
              owner_pixel_count: {
                type: "uint64",
                id: 4,
                options: {
                  jstype: "JS_STRING",
                },
              },
              previous_owner_pixel_count: {
                type: "uint64",
                id: 5,
                options: {
                  jstype: "JS_STRING",
                },
              },
              aComp: {
                type: "uint64",
                id: 6,
                options: {
                  jstype: "JS_STRING",
                },
              },
              bComp: {
                type: "uint64",
                id: 7,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
          canvas_dimensions_changed_event: {
            fields: {
              canvas_width: {
                type: "uint64",
                id: 1,
                options: {
                  jstype: "JS_STRING",
                },
              },
              canvas_height: {
                type: "uint64",
                id: 2,
                options: {
                  jstype: "JS_STRING",
                },
              },
            },
          },
        },
      },
    },
  },
};
