import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";

const PBKDF2_ITERATIONS = 100_000;
const WEB_CRYPTO_MAX_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function encode(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

function decode(value: string) {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

async function derivePassword(
  password: string,
  salt: Uint8Array,
  iterations: number,
) {
  if (iterations > WEB_CRYPTO_MAX_ITERATIONS) {
    return pbkdf2Async(sha256, password, salt, {
      c: iterations,
      dkLen: KEY_BYTES,
      asyncTick: 10,
    });
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: Uint8Array.from(salt).buffer, iterations },
    key,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function legacySha256(password: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string) {
  const salt = new Uint8Array(SALT_BYTES);
  crypto.getRandomValues(salt);
  const hash = await derivePassword(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2-sha256:${PBKDF2_ITERATIONS}:${encode(salt)}:${encode(hash)}`;
}

export async function verifyPassword(password: string, storedPassword: string) {
  if (storedPassword.startsWith("pbkdf2-sha256:")) {
    const [, iterationsText, saltText, hashText] = storedPassword.split(":");
    const iterations = Number(iterationsText);
    if (
      !Number.isInteger(iterations) ||
      iterations <= 0 ||
      !saltText ||
      !hashText
    ) {
      return { ok: false, needsRehash: false };
    }
    const actual = await derivePassword(password, decode(saltText), iterations);
    const ok = constantTimeEqual(actual, decode(hashText));
    return {
      ok,
      needsRehash: ok && iterations !== PBKDF2_ITERATIONS,
      passwordHash:
        ok && iterations !== PBKDF2_ITERATIONS
          ? await hashPassword(password)
          : undefined,
    };
  }

  const legacyMatches =
    storedPassword === `sha256:${await legacySha256(password)}` ||
    storedPassword === password;
  return {
    ok: legacyMatches,
    needsRehash: legacyMatches,
    passwordHash: legacyMatches ? await hashPassword(password) : undefined,
  };
}
