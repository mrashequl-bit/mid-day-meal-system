import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const baseBackupDir = path.join(sourceDir, "Backup");
const timestamp = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
}).format(new Date()).replace(", ", "_").replaceAll(":", "-").replaceAll("/", "-");
const backupDir = path.join(baseBackupDir, `MidDayMeal_Backup_${timestamp}`);

const excludedEntries = new Set(["node_modules", "dist", ".next", ".git", "Backup"]);

function copyTree(source, destination) {
  const stat = fs.lstatSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      if (!excludedEntries.has(entry)) {
        copyTree(path.join(source, entry), path.join(destination, entry));
      }
    }
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.mkdirSync(backupDir, { recursive: false });
for (const entry of fs.readdirSync(sourceDir)) {
  if (!excludedEntries.has(entry)) {
    copyTree(path.join(sourceDir, entry), path.join(backupDir, entry));
  }
}

const guide = `Mid Day Meal System - Backup Restore and Plug-and-Play Guide
===============================================================

এই backup-এ source code, database, migrations, configuration এবং build support files সংরক্ষিত আছে।

অন্য পিসিতে চালানোর নিয়ম
------------------------
1. এই backup folder-টি writable কোনো drive-এ রাখুন।
2. Node.js 22.13.0 বা তার পরের version install করুন। যাচাই: node -v
3. PowerShell খুলে এই folder-এ যান:
   Set-Location "<এই backup folder-এর পূর্ণ path>"
4. Dependency install করুন:
   npm.cmd install
5. Development server চালু করুন:
   npm.cmd run dev
6. Browser-এ খুলুন: http://localhost:3000/

Database restore
----------------
এই backup-এর .wrangler folder-এ local D1 database snapshot আছে। .wrangler folder মুছবেন না বা বাদ দেবেন না।
প্রথমবার চালানোর আগে অন্য কোনো project-এর .wrangler state দিয়ে এটি overwrite করবেন না।

Agent দিয়ে edit করার prompt
---------------------------
"এই folder-টিই Mid Day Meal System-এর সম্পূর্ণ source এবং database backup। প্রথমে package.json, instructions.rtf, app, db, drizzle, build এবং .wrangler পরীক্ষা করো। বিদ্যমান data, role, route, database schema ও UI না ভেঙে আমার নির্দেশনা অনুযায়ী পরিবর্তন করো। কাজ শেষে npm.cmd test, npx.cmd tsc --noEmit --pretty false এবং npm.cmd run lint চালিয়ে ফলাফল জানাও। কোনো destructive database/file operation করার আগে আমাকে জানাও।"

এই snapshot-এ system state হুবহু ফিরিয়ে আনার restore prompt
------------------------------------------------------------
"এই backup folder-টিকে restore point হিসেবে ব্যবহার করো। বর্তমান project-এর source/config/database-এর সঙ্গে এই backup-এর তুলনা করো। Backup-এর .wrangler database state, app source, db schema, drizzle migrations, build configuration এবং package-lock.json ব্যবহার করে এই snapshot-এর অবস্থায় ফিরিয়ে আনো। Backup-এর বাইরে থাকা user data মুছবে না; overwrite করার আগে পরিবর্তনের তালিকা দেখাবে। Restore শেষে npm.cmd install, npm.cmd test এবং npm.cmd run dev দিয়ে যাচাই করবে।"

সতর্কতা
--------
- এই backup-এ operational data, user profile এবং password hash থাকতে পারে; privateভাবে সংরক্ষণ করুন।
- node_modules, dist, .next এবং .git ইচ্ছাকৃতভাবে বাদ রাখা হয়েছে; এগুলো npm install/build দিয়ে পুনরায় তৈরি হবে।
- Database-এর সত্যিকারের restore দরকার হলে backup folder-এর .wrangler সম্পূর্ণভাবে project root-এ রাখতে হবে।
`;

function rtfEncode(text) {
  return [...text].map((character) => {
    const code = character.codePointAt(0);
    if (character === "\\") return "\\\\";
    if (character === "{") return "\\{";
    if (character === "}") return "\\}";
    if (character === "\n") return "\\par\n";
    if (code > 127) return `\\u${code > 32767 ? code - 65536 : code}?`;
    return character;
  }).join("");
}

const rtf = `{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0 Calibri;}}\\viewkind4\\uc1\\pard\\f0\\fs22 ${rtfEncode(guide)}}`;
fs.writeFileSync(path.join(backupDir, "instructions.rtf"), rtf, "utf8");

const manifest = {
  createdAt: new Date().toISOString(),
  source: sourceDir,
  backupFolder: backupDir,
  included: ["app", "db", "drizzle", "build", "public", "worker", ".wrangler", "package.json", "package-lock.json"],
  excluded: [...excludedEntries],
  instructions: "instructions.rtf",
};
fs.writeFileSync(path.join(backupDir, "backup-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

console.log(`Backup created: ${backupDir}`);
