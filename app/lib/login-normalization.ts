const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

function toAsciiDigits(value: string) {
  return value.normalize("NFKC").replace(/[০-৯]/g, (digit) =>
    String(BENGALI_DIGITS.indexOf(digit)),
  );
}

export function normalizeLoginCredentials(rawUsername: unknown, rawPassword: unknown) {
  const enteredUsername = String(rawUsername ?? "").trim();
  const compactUsername = toAsciiDigits(enteredUsername).replace(/\s+/g, "");
  const isEmisLogin = /^\d{11}$/.test(compactUsername);

  return {
    username: isEmisLogin ? compactUsername : enteredUsername,
    password: isEmisLogin
      ? toAsciiDigits(String(rawPassword ?? "")).replace(/\s+/g, "")
      : String(rawPassword ?? ""),
    isEmisLogin,
  };
}
