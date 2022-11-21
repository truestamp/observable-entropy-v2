// Copyright © 2020-2022 Truestamp Inc. All rights reserved.

// NOTE : THESE IMPORTS ARE DENO SPECIFIC AND WILL NOT WORK IN NODE
import {
  base64Decode,
  DateTime,
  isIso3166Alpha2Code,
  isValidUnsafely,
  z
} from "./deps.ts";

// Hash Hex, any multiple of two a-fA-F0-9, case insensitive
export const REGEX_HASH_HEX = /^(([a-fA-F0-9]{2})+)$/i;

export const HashHex = z.string().regex(REGEX_HASH_HEX);
export type HashHex = z.infer<typeof HashHex>;

// SHA-256 -> 32 bytes
export const REGEX_HASH_HEX_32 = /^(([a-f0-9]{2}){32})$/i;

export const HashHex32 = z.string().regex(REGEX_HASH_HEX_32);
export type HashHex32 = z.infer<typeof HashHex32>;

// SHA-1 -> 20 bytes
// SHA-256 -> 32 bytes
// SHA-384 -> 48 bytes
// SHA-512 -> 64 bytes
export const REGEX_HASH_HEX_20_64 = /^(([a-f0-9]{2}){20,64})$/i;

export const HashHex20to64 = z.string().regex(REGEX_HASH_HEX_20_64);
export type HashHex20to64 = z.infer<typeof HashHex20to64>;

// ULID String Type
const REGEX_ULID = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;
export const ULID = z.string().regex(REGEX_ULID);
export type ULID = z.infer<typeof ULID>;

const UnionHashTypes = z.union([
  z.literal("sha1"),
  z.literal("sha-256"),
  z.literal("sha-384"),
  z.literal("sha-512"),
]);
export type UnionHashTypes = z.infer<typeof UnionHashTypes>;

export const UnionProofHashTypes = z.union([
  z.literal("sha224"),
  z.literal("sha256"),
  z.literal("sha384"),
  z.literal("sha512"),
  z.literal("sha512_256"),
  z.literal("sha3_224"),
  z.literal("sha3_256"),
  z.literal("sha3_384"),
  z.literal("sha3_512"),
]);

export type UnionProofHashTypes = z.infer<typeof UnionProofHashTypes>;

export const UnionIntentTypes = z.union([
  z.literal("bitcoin"),
  z.literal("ethereum"),
  z.literal("stellar"),
  z.literal("twitter"),
]);

export type UnionIntentTypes = z.infer<typeof UnionIntentTypes>;

export const UnionEnvironmentTypes = z.union([
  z.literal("development"),
  z.literal("staging"),
  z.literal("production"),
]);
export type UnionEnvironmentTypes = z.infer<typeof UnionEnvironmentTypes>;

/**
 *  The names of the built-in hash functions supported by the library.
 * @ignore
 */
// export const HASH_FUNCTION_NAMES: string[] = [
//   'sha224',
//   'sha256',
//   'sha384',
//   'sha512',
//   'sha512_256',
//   'sha3_224',
//   'sha3_256',
//   'sha3_384',
//   'sha3_512',
// ]

export const HashType = z.object({
  minBytes: z.number().min(20).max(64),
  maxBytes: z.number().min(20).max(64),
});
export type HashType = z.infer<typeof HashType>;

export const HashTypes = z.record(z.string(), HashType);
export type HashTypes = z.infer<typeof HashTypes>;

// Limit the available hash types for now to those that are supported by the browser
// and crypto.subtle.digest
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#syntax
export const HASH_TYPES: HashTypes = {
  "sha-1": { minBytes: 20, maxBytes: 20 },
  "sha-256": { minBytes: 32, maxBytes: 32 },
  "sha-384": { minBytes: 48, maxBytes: 48 },
  "sha-512": { minBytes: 64, maxBytes: 64 },
};

// A valid Truestamp Id string
export const TruestampId = z.string().refine(
  (val: string): boolean => {
    try {
      return isValidUnsafely(val);
    } catch (error) {
      return false;
    }
  },
  {
    message: `is not a valid Truestamp Id string`,
  },
);

export type TruestampId = z.infer<typeof TruestampId>;

// A valid Base64 encoded string
export const Base64 = z.string().refine(
  (val: string): boolean => {
    try {
      // if it safely decodes, then it is base64
      base64Decode(val);
      return true;
    } catch (error) {
      return false;
    }
  },
  {
    message: `is not a valid Base64 encoded string`,
  },
);

export type Base64 = z.infer<typeof Base64>;

// A valid ISO 8601 date string or any precision in any timezone
export const ISO8601 = z.string().refine(
  (val: string): boolean => {
    try {
      return DateTime.fromISO(val).isValid;
    } catch (error) {
      return false;
    }
  },
  {
    message: `is not a valid ISO8601 timestamp`,
  },
);

export type ISO8601 = z.infer<typeof ISO8601>;

// A valid ISO 8601 date string in UTC timezone Z or with no offset +00:00
export const ISO8601UTC = z.string().refine(
  (val: string): boolean => {
    try {
      if (!val.endsWith("Z") && !val.endsWith("+00:00")) {
        return false;
      }

      const d = DateTime.fromISO(val, { zone: "utc" });
      return d.isValid && d.offsetNameShort === "UTC";
    } catch (error) {
      return false;
    }
  },
  {
    message: `is not a valid ISO8601 UTC timestamp`,
  },
);

export type ISO8601UTC = z.infer<typeof ISO8601UTC>;

// A valid ISO 3166 Alpha 2 Country Code
// https://github.com/karpour/iso-3166-ts
// https://www.iso.org/iso-3166-country-codes.html
export const ISO3166Alpha2 = z
  .string()
  .length(2)
  .refine(
    (val: string): boolean => {
      try {
        return isIso3166Alpha2Code(val);
      } catch (error) {
        return false;
      }
    },
    {
      message: `is not an ISO3166 Alpha 2 country code`,
    },
  );

export type ISO3166Alpha2 = z.infer<typeof ISO3166Alpha2>;

// Universal Postal Union (UPU) S42 International Addressing Standards
// https://www.upu.int/UPU/media/upu/documents/PostCode/S42_International-Addressing-Standards.pdf
// https://www.upu.int/UPU/media/upu/documents/PostCode/AddressElementsFormattingAnInternationalAdressEn.pdf
export const Address = z.object({
  streetNo: z.optional(z.string().min(1).max(8)),
  streetName: z.optional(z.string().min(1).max(64)),
  streetType: z.optional(z.string().min(1).max(16)),
  floor: z.optional(z.string().min(1).max(8)),
  town: z.optional(z.string().min(1).max(64)),
  region: z.optional(z.string().min(1).max(64)),
  postcode: z.optional(z.string().min(1).max(16)),
  countryCode: z.optional(ISO3166Alpha2),
});

export type Address = z.infer<typeof Address>;

export const Latitude = z.string().refine(
  (val: string): boolean => {
    try {
      const decimalLatLongValueString = /^[-+]?[0-9]*\.?[0-9]+$/;
      if (!decimalLatLongValueString.test(val)) {
        return false;
      }
      const valFloat = parseFloat(val);
      return valFloat >= -90 && valFloat <= 90 ? true : false;
    } catch (error) {
      return false;
    }
  },
  {
    message: `is not a valid Latitude`,
  },
);

export type Latitude = z.infer<typeof Latitude>;

export const Longitude = z.string().refine(
  (val: string): boolean => {
    try {
      const decimalLatLongValueString = /^[-+]?[0-9]*\.?[0-9]+$/;
      if (!decimalLatLongValueString.test(val)) {
        return false;
      }
      const valFloat = parseFloat(val);
      return valFloat >= -180 && valFloat <= 180 ? true : false;
    } catch (error) {
      return false;
    }
  },
  {
    message: `is not a valid Longitude`,
  },
);

export type Longitude = z.infer<typeof Longitude>;

// Coordinate in decimal degrees(WGS84): {latitude: "38.8895563", longitude: "-77.0352546"}
export const LatLong = z.object({
  latitude: Latitude,
  longitude: Longitude,
});

export type LatLong = z.infer<typeof LatLong>;

// A Location on Earth where the data structure is aligned with the iOS CoreLocation framework
// https://developer.apple.com/documentation/corelocation
// It is presumed that the location is derived from a device's GPS or other location sensor.
export const Location = z.object({
  coordinate: LatLong,
  altitude: z.optional(z.number().int().min(-100000).max(100000)), // The altitude above mean sea level associated with a location, measured in meters.
  ellipsoidalAltitude: z.optional(z.number().int().min(-100000).max(100000)), // The altitude as a height above the World Geodetic System 1984 (WGS84) ellipsoid, measured in meters.
  floor: z.optional(z.number().int().min(0).max(200)), // The logical floor of the building in which the user is located. If floor information is not available for the current location, the value of this property is nil
  horizontalAccuracy: z.optional(z.number().int().min(-100000).max(100000)), // The radius of uncertainty for the location, measured in meters. The location’s latitude and longitude identify the center of the circle, and this value indicates the radius of that circle. A negative value indicates that the latitude and longitude are invalid.
  verticalAccuracy: z.optional(z.number().int().min(-100000).max(100000)), // The validity of the altitude values, and their estimated uncertainty, measured in meters. A positive verticalAccuracy value represents the estimated uncertainty associated with altitude and ellipsoidalAltitude. This value is available whenever altitude values are available. If verticalAccuracy is 0 or a negative number, altitude and ellipsoidalAltitude values are invalid. If verticalAccuracy is a positive number, altitude and ellipsoidalAltitude values are valid.
  timestamp: z.optional(ISO8601), // The time at which the location was determined.
  speed: z.optional(z.number().int().min(-100000).max(100000)), // The instantaneous speed of the device, measured in meters per second. This value reflects the instantaneous speed of the device as it moves in the direction of its current heading. A negative value indicates an invalid speed. Because the actual speed can change many times between the delivery of location events, use this property for informational purposes only.
  speedAccuracy: z.optional(z.number().int().min(-10000).max(10000)), // The accuracy of the speed value, measured in meters per second. When this property contains 0 or a positive number, the value in the speed property is plus or minus the specified number of meters per second. When this property contains a negative number, the value in the speed property is invalid.
  course: z.optional(z.number().int().min(-360).max(360)), // The direction in which the device is traveling, measured in degrees and relative to due north. Course values are measured in degrees starting at due north and continue clockwise around the compass. Thus, north is 0 degrees, east is 90 degrees, south is 180 degrees, and so on. Course values may not be available on all devices. A negative value indicates that the course information is invalid.
  courseAccuracy: z.optional(z.number().int().min(-360).max(360)), // The accuracy of the course value, measured in degrees. When this property contains 0 or a positive number, the value in the course property is plus or minus the specified number degrees, modulo 360. When this property contains a negative number, the value in the course property is invalid.
  magneticHeading: z.optional(z.number().int().min(0).max(359)), // Heading relative to the magnetic North Pole, which is different from the geographic North Pole. The value 0 means the device is pointed toward magnetic north, 90 means it is pointed east, 180 means it is pointed south, and so on.
  headingAccuracy: z.optional(z.number().int().min(-180).max(180)), // A positive value in this property represents the potential error between the value reported by the magneticHeading property and the actual direction of magnetic north. Thus, the lower the value of this property, the more accurate the heading. A negative value means that the reported heading is invalid, which can occur when the device is uncalibrated or there is strong interference from local magnetic fields.
  trueHeading: z.optional(z.number().int().min(0).max(359)), // Heading relative to the geographic North Pole. The value 0 means the device is pointed toward true north, 90 means it is pointed due east, 180 means it is pointed due south, and so on.
});

export type Location = z.infer<typeof Location>;

export const Person = z.object({
  givenName: z.optional(z.string().min(1).max(32)),
  surname: z.optional(z.string().min(1).max(32)),
  organizationName: z.optional(z.string().min(1).max(64)),
  roles: z.optional(z.array(z.string()).min(1).max(32)),
  email: z.optional(z.string().email()),
  uri: z.optional(z.string().url()),
  address: z.optional(Address),
});

export type Person = z.infer<typeof Person>;

export const Signature = z.object({
  publicKey: Base64,
  signature: Base64,
  signatureType: z.literal("ed25519"),
  signer: z.optional(Person),
});

export type Signature = z.infer<typeof Signature>;

// Incoming Cloudflare request properties
// https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties
export const ItemRequestProps = z.object({
  asn: z.optional(z.nullable(z.union([z.number().int(), z.string()]))),
  colo: z.optional(z.nullable(z.string().min(1))),
  country: z.optional(z.nullable(z.string().min(1))),
  city: z.optional(z.nullable(z.string().min(1))),
  continent: z.optional(z.nullable(z.string().min(1))),
  latitude: z.optional(z.nullable(z.string().min(1))),
  longitude: z.optional(z.nullable(z.string().min(1))),
  postalCode: z.optional(z.nullable(z.string().min(1))),
  metroCode: z.optional(z.nullable(z.string().min(1))),
  region: z.optional(z.nullable(z.string().min(1))),
  regionCode: z.optional(z.nullable(z.string().min(1))),
  timezone: z.optional(z.nullable(z.string().min(1))),
});

export type ItemRequestProps = z.infer<typeof ItemRequestProps>;

// JSON type
// See : https://zod.dev/?id=json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export const ItemData = z.object({
  hash: HashHex20to64,
  hashType: UnionHashTypes,
  people: z.optional(z.array(Person).min(1)), // WHO?
  description: z.optional(z.string().min(1).max(256)), // WHAT?
  address: z.optional(Address), // WHERE?
  location: z.optional(Location), // WHERE?
  timestamp: z.optional(ISO8601), // WHEN?
  extra: z.optional(jsonSchema), // Extra arbitrary content, must be (de)serializable to valid JSON
});

export type ItemData = z.infer<typeof ItemData>;

export const ItemSignals = z.object({
  cf: z.optional(ItemRequestProps), // Cloudflare request properties
  observableEntropy: z.optional(HashHex32), // Observable Entropy : latest SHA-256 hash : https://github.com/truestamp/observable-entropy/blob/main/README.md
  submittedAt: ISO8601UTC, // When (UTC) the item was submitted to the API
});

export type ItemSignals = z.infer<typeof ItemSignals>;

// User submitted Item
// An Item is a wrapper around ItemData
// The Item will be decorated with additional trust 'signals' properties,
// such as the Cloudflare worker request properties and the latest
// observable entropy hash value.
export const Item = z.object({
  itemData: z.array(ItemData).min(1),
  itemSignals: z.optional(ItemSignals), // Trust signals
  itemDataSignatures: z.optional(z.array(Signature).min(1)), // One, or more, user provided sign(hash(canonify(data))) signatures
});

export type Item = z.infer<typeof Item>;

// A subset of Item, used to validate user provided input. These are the only
// properties that are allowed to be set by the user.
export const ItemRequest = Item.pick({
  itemData: true,
  itemDataSignatures: true,
});

export type ItemRequest = z.infer<typeof ItemRequest>;

// The response from the API when submitting an Item to the API
export const ItemResponse = z.object({ id: TruestampId });

export type ItemResponse = z.infer<typeof ItemResponse>;

// An ItemEnvelope is a wrapper around an Item
export const ItemEnvelope = z.object({
  owner: z.string().min(1).max(255), // DB only
  ulid: ULID, // DB only
  item: Item,
});

export type ItemEnvelope = z.infer<typeof ItemEnvelope>;

export const SNSTopicMessage = z.object({
  owner: z.optional(z.string().min(1)),
  inputHash: HashHex32,
});

export type SNSTopicMessage = z.infer<typeof SNSTopicMessage>;

/**
 * Defines the shape of one layer of an Object encoded inclusion proof.
 */
export const ProofObjectLayer = z.tuple([
  z.number().int().min(0).max(1), // 0 : left, 1 : right
  HashHex20to64,
]);

export type ProofObjectLayer = z.infer<typeof ProofObjectLayer>;

/**
 * Defines the shape of an Object encoded inclusion proof.
 * v : version number
 * h : hash function
 * p : proof
 */
export const ProofObject = z.object({
  v: z.number().int().min(1).max(1),
  h: UnionProofHashTypes,
  p: z.array(ProofObjectLayer),
});

export type ProofObject = z.infer<typeof ProofObject>;

export const CommitProof = z.object({
  inputHash: HashHex32,
  inclusionProof: ProofObject,
  merkleRoot: HashHex32,
});

export type CommitProof = z.infer<typeof CommitProof>;

// Types for Discriminated Union of CommitTransactions for various
// transaction destinations. They all extend CommitTransaction which
// is the base (and which should not be directly used).
const CommitTransactionBase = z.object({
  inputHash: HashHex32,
});

export const CommitTransactionBitcoin = CommitTransactionBase.extend({
  intent: z.literal("bitcoin"),
  hash: z.string().regex(/(0x)?[0-9a-f]+/i),
}).strict();

export type CommitTransactionBitcoin = z.infer<typeof CommitTransactionBitcoin>;

export const CommitTransactionEthereum = CommitTransactionBase.extend({
  intent: z.literal("ethereum"),
  hash: z.string().regex(/(0x)?[0-9a-f]+/i),
}).strict();

export type CommitTransactionEthereum = z.infer<
  typeof CommitTransactionEthereum
>;

export const CommitTransactionStellar = CommitTransactionBase.extend({
  intent: z.literal("stellar"),
  hash: HashHex32,
  ledger: z.number().int().min(11111),
}).strict();

export type CommitTransactionStellar = z.infer<typeof CommitTransactionStellar>;

export const CommitTransactionTwitter = CommitTransactionBase.extend({
  intent: z.literal("twitter"),
  id: z.string().regex(/[0-9]+/i),
}).strict();

export type CommitTransactionTwitter = z.infer<typeof CommitTransactionTwitter>;

// 'intent' is the discriminant
// This is syntactic sugar on discriminated unions provided by Zod
// https://zod.dev/?id=discriminated-unions
export const CommitTransaction = z.discriminatedUnion("intent", [
  CommitTransactionBitcoin,
  CommitTransactionEthereum,
  CommitTransactionStellar,
  CommitTransactionTwitter,
]);

// The Discriminated Union type
export type CommitTransaction = z.infer<typeof CommitTransaction>;

export const CommitmentData = z.object({
  id: TruestampId,
  itemData: z.array(ItemData).min(1),
  itemDataSignatures: z.optional(z.array(Signature).min(1)), // One, or more, user provided sign(hash(canonify(data))) signatures
  itemSignals: z.optional(ItemSignals), // Trust signals
  proofs: z.array(CommitProof),
  transactions: z.record(z.string(), z.array(CommitTransaction).min(1)),
});

export type CommitmentData = z.infer<typeof CommitmentData>;

export const Commitment = z.object({
  commitmentData: CommitmentData,
  commitmentDataSignatures: z.array(Signature).min(1), // One, or more, sign(hash(canonicalize(commitmentData))) signatures
});

export type Commitment = z.infer<typeof Commitment>;

export const ULIDResponse = z.object({
  t: z.number(),
  ts: ISO8601UTC,
  ulid: ULID,
});

export type ULIDResponse = z.infer<typeof ULIDResponse>;

export const ULIDResponseCollection = z.array(ULIDResponse);

export type ULIDResponseCollection = z.infer<typeof ULIDResponseCollection>;

export const VerificationProof = z
  .object({
    inputHash: HashHex32,
    merkleRoot: HashHex32,
  })
  .strict();

export type VerificationProof = z.infer<typeof VerificationProof>;

export const VerificationTransaction = z
  .object({
    intent: UnionIntentTypes,
    verified: z.boolean(),
    transaction: CommitTransaction,
    timestamp: z.optional(ISO8601UTC),
    urls: z.optional(
      z.object({
        machine: z.optional(z.array(z.string().url())),
        human: z.optional(z.array(z.string().url())),
      }),
    ),
    error: z.optional(z.string()),
  })
  .strict();

export type VerificationTransaction = z.infer<typeof VerificationTransaction>;

export const CommitmentVerification = z
  .object({
    verified: z.boolean(),
    id: z.optional(TruestampId),
    idData: z.optional(
      z.object({
        test: z.boolean(),
        timestamp: z.string(),
        ulid: ULID,
      }),
    ),
    itemData: z.optional(
      z.object({
        hash: HashHex32,
        hashType: UnionHashTypes,
        signaturesCount: z.optional(z.number().int()),
      }),
    ),
    item: z.optional(
      z.object({
        hash: HashHex32,
        hashType: z.literal("sha-256"),
      }),
    ),
    commitmentData: z.optional(
      z.object({
        hash: HashHex32,
        hashType: z.literal("sha-256"),
        signaturesCount: z.optional(z.number().int()),
      }),
    ),
    proofs: z.optional(z.array(VerificationProof).min(1)),
    transactions: z.optional(z.array(VerificationTransaction).min(1)),
    commitsTo: z.optional(
      z.object({
        hashes: z
          .array(
            z.object({
              hash: HashHex20to64,
              hashType: z.string(),
            }),
          )
          .min(1),
        observableEntropy: z.optional(HashHex32),
        timestamps: z.object({
          submittedAfter: z.optional(ISO8601UTC),
          submittedAt: ISO8601UTC,
          submittedBefore: z.optional(z.array(z.string())),
          submitWindowMilliseconds: z.optional(
            z
              .number()
              .int()
              .min(0)
              .max(3600 * 24 * 365 * 1000),
          ),
        }),
      }),
    ),
    error: z.optional(z.string()),
  })
  .strict();

export type CommitmentVerification = z.infer<typeof CommitmentVerification>;

export const SignedKey = z.object({
  environment: UnionEnvironmentTypes,
  expired: z.boolean(),
  handle: z.string().min(1),
  publicKey: Base64,
  type: z.literal("ed25519"),
  selfSignature: Base64,
});

export type SignedKey = z.infer<typeof SignedKey>;

export const SignedKeys = z.array(SignedKey).min(1);

export type SignedKeys = z.infer<typeof SignedKeys>;

export const UnsignedKey = SignedKey.omit({ selfSignature: true });

export type UnsignedKey = z.infer<typeof UnsignedKey>;

export const CanonicalHash = z.object({
  hash: z.instanceof(Uint8Array),
  hashHex: HashHex32,
  hashType: UnionHashTypes,
  canonicalData: z.optional(z.string()),
});

export type CanonicalHash = z.infer<typeof CanonicalHash>;

export const EntropyBitcoin = z.object({
  block_index: z.number().int(),
  hash: HashHex,
  height: z.number().int(),
  time: z.number().int(),
});

export type EntropyBitcoin = z.infer<typeof EntropyBitcoin>;

export const EntropyDrandBeaconChainInfo = z.object({
  genesis_time: z.number().int(),
  groupHash: HashHex,
  hash: HashHex,
  metadata: z.object({
    beaconID: z.string(),
  }).optional(),
  period: z.number().int(),
  public_key: HashHex,
  schemeID: z.string().optional(),
});

export type EntropyDrandBeaconChainInfo = z.infer<
  typeof EntropyDrandBeaconChainInfo
>;

export const EntropyDrandBeaconRandomness = z.object({
  previous_signature: HashHex,
  randomness: HashHex,
  round: z.number().int(),
  signature: HashHex,
});

export type EntropyDrandBeaconRandomness = z.infer<
  typeof EntropyDrandBeaconRandomness
>;

export const EntropyDrandBeacon = z.object({
  chainInfo: EntropyDrandBeaconChainInfo,
  randomness: EntropyDrandBeaconRandomness,
});

export type EntropyDrandBeacon = z.infer<typeof EntropyDrandBeacon>;

export const EntropyEthereum = z.object({
  hash: HashHex,
  height: z.number().int(),
  time: ISO8601UTC,
});

export type EntropyEthereum = z.infer<typeof EntropyEthereum>;

export const EntropyHackerNewsStory = z.object({
  by: z.string(),
  id: z.number().int(),
  time: z.number().int(),
  title: z.string(),
  url: z.string().url().optional(),
});

export type EntropyHackerNewsStory = z.infer<typeof EntropyHackerNewsStory>;

export const EntropyHackerNews = z.object({
  stories: z.array(EntropyHackerNewsStory),
});

export type EntropyHackerNews = z.infer<typeof EntropyHackerNews>;

export const EntropyNistBeacon = z.object({
  chainIndex: z.number().int(),
  outputValue: HashHex,
  pulseIndex: z.number().int(),
  timeStamp: ISO8601UTC,
  uri: z.string().url(),
});

export type EntropyNistBeacon = z.infer<typeof EntropyNistBeacon>;

export const EntropyPrevious = z.object({
  hash: HashHex,
  uri: z.string().url(),
});

export type EntropyPrevious = z.infer<typeof EntropyPrevious>;

export const EntropyStellar = z.object({
  closed_at: ISO8601UTC,
  hash: HashHex,
  sequence: z.number().int(),
});

export type EntropyStellar = z.infer<typeof EntropyStellar>;

export const EntropyTimestamp = z.object({
  capturedAt: ISO8601UTC,
});

export type EntropyTimestamp = z.infer<typeof EntropyTimestamp>;

export const EntropyResponse = z.object({
  data: z.object({
    bitcoin: EntropyBitcoin.strict().optional(),
    "drand-beacon": EntropyDrandBeacon.strict().optional(),
    ethereum: EntropyEthereum.strict().optional(),
    "hacker-news": EntropyHackerNews.strict().optional(),
    "nist-beacon": EntropyNistBeacon.strict().optional(),
    previous: EntropyPrevious.strict().optional(),
    stellar: EntropyStellar.strict().optional(),
    timestamp: EntropyTimestamp.strict(),
  }),
  hash: HashHex32,
  hashType: z.literal("sha-256"),
  publicKey: Base64,
  signature: Base64,
  signatureType: z.literal("ed25519"),
}).strict();

export type EntropyResponse = z.infer<typeof EntropyResponse>;
