import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(process.argv[2] || process.cwd());
if (!fs.existsSync(path.join(root, "BACKUP_COMPLETE"))) throw new Error("BACKUP_COMPLETE marker missing");
const lines = fs.readFileSync(path.join(root, "checksums.sha256"), "utf8").trim().split(/\r?\n/);
let checked = 0;
for (const line of lines) {
  const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
  if (!match) throw new Error("Invalid checksum entry");
  const file = path.resolve(root, match[2]);
  if (!file.startsWith(root + path.sep)) throw new Error("Checksum path escapes backup");
  const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if (hash !== match[1]) throw new Error(`Checksum mismatch: ${match[2]}`);
  checked++;
}
console.log(`Backup verified: ${checked} files, all SHA-256 checksums match.`);
