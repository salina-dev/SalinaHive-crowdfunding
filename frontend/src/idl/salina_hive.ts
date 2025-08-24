/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/salina_hive.json`.
 */
export type SalinaHive = {
  "address": "Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP",
  "metadata": {
    "name": "salinaHive",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "goalLamports",
          "type": "u64"
        },
        {
          "name": "deadlineTs",
          "type": "i64"
        },
        {
          "name": "imageUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteCampaign",
      "discriminator": [
        223,
        105,
        48,
        131,
        88,
        27,
        249,
        227
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "campaign"
          ]
        },
        {
          "name": "campaign",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "donate",
      "discriminator": [
        121,
        186,
        218,
        211,
        73,
        70,
        196,
        180
      ],
      "accounts": [
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "campaign",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePlatform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeBps",
          "type": "u16"
        },
        {
          "name": "treasuryBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateCampaign",
      "discriminator": [
        235,
        31,
        39,
        49,
        121,
        173,
        19,
        92
      ],
      "accounts": [
        {
          "name": "creator",
          "signer": true,
          "relations": [
            "campaign"
          ]
        },
        {
          "name": "campaign",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "updatePlatformSettings",
      "discriminator": [
        213,
        238,
        2,
        39,
        128,
        157,
        3,
        95
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "platform"
          ]
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "feeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true,
          "relations": [
            "campaign"
          ]
        },
        {
          "name": "campaign",
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "campaign",
      "discriminator": [
        50,
        40,
        49,
        11,
        157,
        220,
        229,
        192
      ]
    },
    {
      "name": "platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title too long"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description too long"
    },
    {
      "code": 6002,
      "name": "urlTooLong",
      "msg": "URL too long"
    },
    {
      "code": 6003,
      "name": "deadlineInPast",
      "msg": "Deadline must be in the future"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "Only creator can update or delete the campaign"
    },
    {
      "code": 6005,
      "name": "campaignDeleted",
      "msg": "Campaign already deleted"
    },
    {
      "code": 6006,
      "name": "withdrawNotAllowed",
      "msg": "Goal not reached or deadline not passed"
    },
    {
      "code": 6007,
      "name": "invalidAmount",
      "msg": "Amount must be greater than zero"
    }
  ],
  "types": [
    {
      "name": "campaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "platform",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "cid",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "goalLamports",
            "type": "u64"
          },
          {
            "name": "raisedLamports",
            "type": "u64"
          },
          {
            "name": "deadlineTs",
            "type": "i64"
          },
          {
            "name": "donationCount",
            "type": "u64"
          },
          {
            "name": "isDeleted",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "campaignCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
