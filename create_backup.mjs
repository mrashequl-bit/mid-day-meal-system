import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DatabaseSync, backup as backupSqlite } from "node:sqlite";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const backupRoot = path.join(projectDir, "Backup");
const timestamp = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
}).format(new Date()).replace(", ", "_").replaceAll(":", "-").replaceAll("/", "-");
const folderName = `MidDayMeal_Full_Backup_${timestamp}`;
const backupDir = path.join(backupRoot, folderName);
const projectSnapshotDir = path.join(backupDir, "project");
const databaseDir = path.join(backupDir, "database");
const metadataDir = path.join(backupDir, "metadata");
const wranglerConfig = path.join(projectDir, "dist", "server", "wrangler.json");
const remoteDatabaseFile = path.join(databaseDir, "production-d1-full.sql");
const restoreDatabaseFile = path.join(databaseDir, "production-d1-restore-ordered.sql");
const productionSqliteFile = path.join(databaseDir, "production-d1.sqlite");
const wranglerCli = path.join(projectDir, "node_modules", "wrangler", "bin", "wrangler.js");

const rootExclusions = new Set([
  ".git", ".next", ".tmp", ".vinext", ".wrangler", "Backup", "coverage",
  "dist", "node_modules", "output", "outputs", "tmp", "tsconfig.tsbuildinfo", "work",
]);
const nestedExclusions = new Set(["node_modules", ".next", ".vinext"]);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectDir,
    encoding: "utf8",
    shell: process.platform === "win32" && command.endsWith(".cmd"),
    env: { ...process.env, WRANGLER_LOG_PATH: path.join(metadataDir, "wrangler.log") },
    stdio: options.stdio || (options.capture ? "pipe" : "inherit"),
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${command} ${args.join(" ")} ব্যর্থ হয়েছে${detail ? `:\n${detail}` : ""}`);
  }
  return result;
}

function copyTree(source, destination) {
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.symlinkSync(fs.readlinkSync(source), destination, process.platform === "win32" ? "junction" : undefined);
    return;
  }
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      if (!nestedExclusions.has(entry)) copyTree(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function writeCaptured(command, args, destination, allowFailure = false) {
  // Binary Git patches can exceed spawnSync's output buffer. Stream to disk.
  const output = fs.openSync(destination, "w");
  try {
    const result = run(command, args, { stdio: ["ignore", output, output], allowFailure });
    return result.status === 0;
  } finally {
    fs.closeSync(output);
  }
}

function commandVersion(command, args = ["--version"]) {
  const result = spawnSync(command, args, {
    cwd: projectDir, encoding: "utf8",
    shell: process.platform === "win32" && command.endsWith(".cmd"),
  });
  return result.status === 0 ? String(result.stdout || result.stderr).trim() : "unavailable";
}

function rtfEscape(value) {
  return [...value].map((character) => {
    if (character === "\\") return "\\\\";
    if (character === "{") return "\\{";
    if (character === "}") return "\\}";
    const code = character.codePointAt(0);
    if (code > 0xffff) {
      const adjusted = code - 0x10000;
      const high = 0xd800 + (adjusted >> 10);
      const low = 0xdc00 + (adjusted & 0x3ff);
      return `\\u${high - 0x10000}?\\u${low - 0x10000}?`;
    }
    return code > 127 ? `\\u${code > 32767 ? code - 65536 : code}?` : character;
  }).join("");
}

function makeRtf(guide) {
  const sections = new Set([
    "ব্যাকআপে যা আছে", "অন্য পিসিতে প্লাগ অ্যান্ড প্লে চালু করা",
    "Production D1 ডাটাবেস local-এ restore করা", "Cloudflare production-এ হুবহু restore করা",
    "Cloudflare bindings এবং secrets", "Restore যাচাই",
    "AI agent বা developer-কে দেওয়ার পূর্ণ prompt", "নিরাপত্তা ও গুরুত্বপূর্ণ সতর্কতা",
  ]);
  const body = guide.split("\n").map((line, index) => {
    if (index === 0) return `\\pard\\qc\\sb120\\sa180\\b\\fs34 ${rtfEscape(line)}\\b0\\par`;
    if (sections.has(line)) return `\\pard\\sb220\\sa100\\b\\fs26 ${rtfEscape(line)}\\b0\\par`;
    if (!line) return "\\pard\\sa40\\par";
    if (/^\s{3}/.test(line)) return `\\pard\\li360\\sa50\\f1\\fs19 ${rtfEscape(line.trim())}\\f0\\par`;
    return `\\pard\\sa70\\sl260\\slmult1\\fs22 ${rtfEscape(line)}\\par`;
  }).join("\n");
  return `{\\rtf1\\ansi\\ansicpg1252\\deff0{\\fonttbl{\\f0 Calibri;}{\\f1 Consolas;}}\\viewkind4\\uc1\n${body}\n}`;
}

function listFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function databaseInventory(file) {
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const integrity = db.prepare("PRAGMA integrity_check").get().integrity_check;
    if (integrity !== "ok") throw new Error(`Database integrity check failed: ${path.basename(file)}`);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    const rowCounts = Object.fromEntries(tables.map(({ name }) => [name, db.prepare(`SELECT COUNT(*) AS count FROM "${name.replaceAll('"', '""')}"`).get().count]));
    return { integrity, rowCounts };
  } finally {
    db.close();
  }
}

async function snapshotLocalState(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const input = path.join(source, entry.name);
    const output = path.join(destination, entry.name);
    if (entry.isDirectory()) await snapshotLocalState(input, output);
    else if (entry.isFile() && entry.name.endsWith(".sqlite")) {
      const db = new DatabaseSync(input, { readOnly: true });
      try { await backupSqlite(db, output); } finally { db.close(); }
      databaseInventory(output);
    }
  }
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = "";
  let quote = null;
  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];
    current += character;
    if (quote) {
      if (character === quote) {
        if ((quote === "'" || quote === '"') && next === quote) {
          current += next;
          index += 1;
        } else quote = null;
      } else if (quote === "]" && character === "]") quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === "`") quote = character;
    else if (character === "[") quote = "]";
    else if (character === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function makeRestoreOrderedSql(sql) {
  const statements = splitSqlStatements(sql);
  const schema = statements.filter((statement) => !/^\s*(?:PRAGMA\s+defer_foreign_keys|INSERT\s+INTO)\b/i.test(statement));
  const data = statements.filter((statement) => /^\s*INSERT\s+INTO\b/i.test(statement));
  if (!schema.some((statement) => /^\s*CREATE\s+TABLE\b/i.test(statement)) || data.length === 0) {
    throw new Error("D1 export থেকে restore-ordered SQL তৈরি করা যায়নি।");
  }
  return `PRAGMA foreign_keys=OFF;\n${schema.join("\n")}\n${data.join("\n")}\nPRAGMA foreign_keys=ON;\n`;
}

function makeLocalRestoreHelper(databaseName) {
  return `import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const helperDir = path.dirname(fileURLToPath(import.meta.url));
const snapshot = path.join(helperDir, "production-d1.sqlite");
const projectDir = path.resolve(process.argv[2] || process.cwd());
const config = path.join(projectDir, "dist", "server", "wrangler.json");
const wrangler = path.join(projectDir, "node_modules", "wrangler", "bin", "wrangler.js");
if (!fs.existsSync(snapshot)) throw new Error("production-d1.sqlite পাওয়া যায়নি।");
if (!fs.existsSync(config)) throw new Error("dist/server/wrangler.json পাওয়া যায়নি; আগে npm.cmd run build চালান।");
if (!fs.existsSync(wrangler)) throw new Error("Wrangler পাওয়া যায়নি; আগে npm.cmd ci চালান।");
const init = spawnSync(process.execPath, [wrangler, "d1", "execute", ${JSON.stringify(databaseName)}, "--local", "--config", config, "--command", "SELECT 1"], { cwd: projectDir, stdio: "inherit" });
if (init.status !== 0) throw new Error("Local D1 initialize করা যায়নি।");
const sqliteFiles = [];
const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else if (entry.isFile() && entry.name.endsWith(".sqlite") && entry.name !== "metadata.sqlite") sqliteFiles.push(full); } };
const stateRoots = [path.join(projectDir, ".wrangler", "state", "v3", "d1"), path.join(path.dirname(config), ".wrangler", "state", "v3", "d1")];
for (const root of stateRoots) if (fs.existsSync(root)) walk(root);
const uniqueSqliteFiles = [...new Set(sqliteFiles.map((file) => path.resolve(file)))];
if (uniqueSqliteFiles.length !== 1) throw new Error(\`একটি local D1 file প্রত্যাশিত, পাওয়া গেছে \${uniqueSqliteFiles.length}: \${uniqueSqliteFiles.join(", ")}\`);
sqliteFiles.splice(0, sqliteFiles.length, ...uniqueSqliteFiles);
for (const suffix of ["-wal", "-shm"]) if (fs.existsSync(sqliteFiles[0] + suffix)) fs.rmSync(sqliteFiles[0] + suffix);
fs.copyFileSync(snapshot, sqliteFiles[0]);
console.log(\`Production D1 snapshot local-এ restore হয়েছে: \${sqliteFiles[0]}\`);
`;
}

fs.mkdirSync(backupRoot, { recursive: true });
fs.mkdirSync(backupDir, { recursive: false });
fs.mkdirSync(projectSnapshotDir, { recursive: true });
fs.mkdirSync(databaseDir, { recursive: true });
fs.mkdirSync(metadataDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, "BACKUP_IN_PROGRESS"), "Backup creation is still running.\n", "utf8");

try {
  if (!fs.existsSync(wranglerConfig)) {
    console.log("Generated Wrangler config পাওয়া যায়নি; production build তৈরি করা হচ্ছে...");
    if (process.env.npm_execpath) run(process.execPath, [process.env.npm_execpath, "run", "build"]);
    else run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]);
  }
  if (!fs.existsSync(wranglerConfig)) throw new Error(`Wrangler config পাওয়া যায়নি: ${wranglerConfig}`);
  if (!fs.existsSync(wranglerCli)) throw new Error("Wrangler dependency পাওয়া যায়নি; আগে npm.cmd ci চালান।");

  const config = JSON.parse(fs.readFileSync(wranglerConfig, "utf8"));
  const database = (config.d1_databases || []).find((entry) => entry.binding === "DB") || config.d1_databases?.[0];
  if (!database?.database_name) throw new Error("Wrangler config-এ D1 database binding পাওয়া যায়নি।");

  console.log(`Production D1 export করা হচ্ছে: ${database.database_name}`);
  run(process.execPath, [
    wranglerCli, "d1", "export", database.database_name, "--remote",
    "--config", wranglerConfig, "--output", remoteDatabaseFile,
  ]);
  const sql = fs.readFileSync(remoteDatabaseFile, "utf8");
  if (sql.length < 1024 || !/CREATE TABLE/i.test(sql) || !/INSERT INTO/i.test(sql)) {
    throw new Error("Production D1 export অসম্পূর্ণ মনে হচ্ছে; backup final করা হয়নি।");
  }
  const restoreSql = makeRestoreOrderedSql(sql);
  fs.writeFileSync(restoreDatabaseFile, restoreSql, "utf8");
  const snapshotDb = new DatabaseSync(productionSqliteFile);
  try {
    // Import the private snapshot atomically instead of syncing every INSERT.
    snapshotDb.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE;");
    try {
      snapshotDb.exec(restoreSql);
      snapshotDb.exec("COMMIT; PRAGMA foreign_keys=ON;");
    } catch (error) {
      snapshotDb.exec("ROLLBACK;");
      throw error;
    }
    const foreignKeyErrors = snapshotDb.prepare("PRAGMA foreign_key_check").all();
    if (foreignKeyErrors.length) throw new Error(`Production SQLite snapshot-এ ${foreignKeyErrors.length}টি foreign-key error পাওয়া গেছে।`);
    const integrity = snapshotDb.prepare("PRAGMA integrity_check").get();
    if (integrity?.integrity_check !== "ok") throw new Error(`Production SQLite integrity check ব্যর্থ: ${JSON.stringify(integrity)}`);
    snapshotDb.exec("VACUUM");
  } finally {
    snapshotDb.close();
  }
  fs.writeFileSync(path.join(databaseDir, "restore-local-d1.mjs"), makeLocalRestoreHelper(database.database_name), "utf8");
  fs.writeFileSync(path.join(metadataDir, "production-table-counts.json"), JSON.stringify(databaseInventory(productionSqliteFile), null, 2), "utf8");
  fs.copyFileSync(wranglerConfig, path.join(metadataDir, "wrangler-config-at-backup.json"));

  console.log("Project source snapshot কপি করা হচ্ছে...");
  for (const entry of fs.readdirSync(projectDir)) {
    if (!rootExclusions.has(entry)) copyTree(path.join(projectDir, entry), path.join(projectSnapshotDir, entry));
  }
  const localD1State = path.join(projectDir, ".wrangler", "state", "v3", "d1");
  if (fs.existsSync(localD1State)) {
    await snapshotLocalState(localD1State, path.join(databaseDir, "local-wrangler-state", ".wrangler", "state", "v3", "d1"));
  }

  writeCaptured("git", ["status", "--short", "--branch"], path.join(metadataDir, "git-status.txt"), true);
  writeCaptured("git", ["diff", "--binary", "HEAD"], path.join(metadataDir, "working-tree.patch"), true);
  writeCaptured("git", ["bundle", "create", path.join(metadataDir, "repository.bundle"), "--all"], path.join(metadataDir, "git-bundle-result.txt"), true);
  writeCaptured(process.execPath, [wranglerCli, "secret", "list", "--config", wranglerConfig], path.join(metadataDir, "cloudflare-secret-names.json"), true);
  writeCaptured(process.execPath, [wranglerCli, "versions", "list", "--config", wranglerConfig, "--json"], path.join(metadataDir, "cloudflare-worker-versions.json"), true);

  const systemInfo = {
    createdAtUtc: new Date().toISOString(), createdAtDhaka: timestamp.replace("_", " "),
    projectName: config.name || config.topLevelName || "midday-meal-supply-management",
    databaseName: database.database_name, databaseId: database.database_id || "",
    node: commandVersion("node"),
    npm: commandVersion(process.platform === "win32" ? "npm.cmd" : "npm"),
    wrangler: commandVersion(process.execPath, [wranglerCli, "--version"]),
    platform: `${process.platform} ${process.arch}`,
  };
  fs.writeFileSync(path.join(metadataDir, "system-info.json"), JSON.stringify(systemInfo, null, 2), "utf8");

  const guide = `Mid Day Meal System Full Backup Restore Guide

এই backup ${systemInfo.createdAtDhaka} Asia/Dhaka সময়ে তৈরি হয়েছে। এতে project source, production Cloudflare D1 data, local D1 state, Git working-tree evidence এবং environment metadata একসঙ্গে আছে। লক্ষ্য হলো একই কার্যকর অবস্থায় system পুনর্গঠন করা।

ব্যাকআপে যা আছে
1. project: সম্পূর্ণ editable source, public assets, migrations, tests, package.json ও package-lock.json।
2. database/production-d1-full.sql: Cloudflare production D1-এর অপরিবর্তিত archival export।
3. database/production-d1.sqlite: profile image-সহ production data-এর integrity-checked, ready-to-run SQLite snapshot।
4. database/restore-local-d1.mjs: অন্য পিসির local Wrangler D1-এ snapshot বসানোর Node helper।
5. database/production-d1-restore-ordered.sql: schema আগে ও data পরে সাজানো SQL fallback; খুব বড় profile image থাকলে Wrangler statement limit হতে পারে।
6. database/local-wrangler-state: backup তৈরির সময় থাকা development local D1 state, যদি পাওয়া যায়।
7. metadata: runtime version, Git status/patch/bundle, Worker version list এবং শুধু Cloudflare secret-এর নাম।
8. checksums.sha256: প্রতিটি backup file-এর SHA-256 integrity hash।
9. node_modules, dist, cache ও পুরোনো Backup snapshot-এ নেই। package-lock.json থেকে dependency পুনর্গঠন হবে। project-এ local environment file থাকলে সেটিও ব্যক্তিগত source snapshot-এ থাকতে পারে; পুরো backup private রাখুন। Cloudflare secret value export হয় না।
10. metadata/production-table-counts.json: প্রতিটি production table-এর row count ও SQLite integrity result। metadata/wrangler-config-at-backup.json: backup সময়ের bindings/config।

অন্য পিসিতে প্লাগ অ্যান্ড প্লে চালু করা
1. সম্পূর্ণ ${folderName} ফোল্ডারটি নতুন পিসির writable drive-এ কপি করুন।
2. একই environment পেতে Node.js ${systemInfo.node} (${systemInfo.platform}) ও npm ${systemInfo.npm} ব্যবহার করুন। Git প্রয়োজন হলে install করুন। dependency-এর জন্য internet লাগবে; node_modules portable backup-এ নেই।
3. PowerShell খুলে project snapshot-এ যান:
   Set-Location "<backup path>\\project"
4. lockfile অনুযায়ী dependency install করুন:
   npm.cmd ci
5. production-compatible files তৈরি করুন:
   npm.cmd run build
6. server চালানোর আগে নিচের database restore ধাপ অনুসরণ করুন। local development-এর হুবহু অবস্থার জন্য server বন্ধ রেখে database/local-wrangler-state/.wrangler ফোল্ডারটি project/.wrangler হিসেবে কপি করুন। Production data চাইলে restore-local-d1.mjs ব্যবহার করুন; একই সঙ্গে দুইটি database source restore করবেন না।
7. এরপর npm.cmd run dev চালান; terminal-এ দেখানো localhost URL খুলুন (সাধারণত http://localhost:3000/)। production-style local Worker চাইলে npm.cmd run start চালান এবং terminal-এর port ব্যবহার করুন।
8. DB local হলেও BROWSER ও EMAIL binding remote: true; email/Telegram/browser-based PDF চালাতে Cloudflare login, সঠিক secrets এবং internet লাগবে। সাধারণ offline database পরীক্ষা করার সময় delivery test পাঠাবেন না।

Production D1 ডাটাবেস local-এ restore করা
1. project ফোল্ডারে npm.cmd ci এবং npm.cmd run build চালান।
2. production snapshot restore করুন (project folder-এ দাঁড়িয়ে):
   আগে dev/start server বন্ধ করুন; বিদ্যমান local data থাকলে আলাদা backup নিন।
   node "..\\database\\restore-local-d1.mjs" .
3. npm.cmd run start চালিয়ে login, বিদ্যালয়, পরিকল্পনা, বিতরণ, stock, settings ও PDF পরীক্ষা করুন।
4. SQL fallback প্রয়োজন হলে কেবল নতুন/খালি D1-এ production-d1-restore-ordered.sql ব্যবহার করুন; বড় profile image-এর কারণে Wrangler statement limit হলে production-d1.sqlite helper-ই ব্যবহার করুন।

Cloudflare production-এ হুবহু restore করা
1. এটি production data পরিবর্তন করতে পারে। বর্তমান live D1 backup ও মালিকের স্পষ্ট অনুমতি ছাড়া restore করবেন না।
2. npx.cmd wrangler login চালিয়ে সঠিক Cloudflare account-এ login করুন।
3. সবচেয়ে নিরাপদভাবে নতুন খালি D1 তৈরি করুন। production-d1-full.sql অপরিবর্তিত archival copy; non-empty D1-এ সরাসরি import করলে conflict হতে পারে।
4. নতুন D1 হলে config-এ DB database_id বসিয়ে npm.cmd run build চালান।
5. খালি remote D1-এ SQL import (বড় binary/base64 field-এর statement limit হলে Cloudflare support/parameterized migration ব্যবহার করুন):
   npx.cmd wrangler d1 execute <database-name> --remote --config dist/server/wrangler.json --file "..\\database\\production-d1-restore-ordered.sql"
6. bindings ও secrets সেট করার পর deploy:
   npx.cmd wrangler deploy --keep-vars --config dist/server/wrangler.json
7. Worker version, custom domain, Cron, authenticated UI ও protected API যাচাই করুন।

Cloudflare bindings এবং secrets
Required bindings: DB = D1, BROWSER = Browser Rendering, EMAIL = Send Email।
Required production secrets: SETTINGS_ENCRYPTION_KEY এবং CLOUDFLARE_D1_API_TOKEN। Secret value Cloudflare থেকে export করা যায় না; নিরাপদ offline record থেকে পুনরায় সেট করুন।
Telegram token D1-এ encrypted। একই SETTINGS_ENCRYPTION_KEY না থাকলে Settings > Notification থেকে token পুনরায় save করুন।
Custom domain: middaymeal.xyz। Cron: 0 8 * * * এবং 0 10 * * * UTC। Email sender domain এবং Telegram permission আলাদাভাবে যাচাই করুন।

Restore যাচাই
1. npm.cmd test
2. npm.cmd run lint
3. npm.cmd run build
4. login page 200, unauthenticated protected API 403 এবং authenticated dashboard error ছাড়া খুলছে কি না দেখুন।
5. D1 table count ও গুরুত্বপূর্ণ records source export-এর সঙ্গে মিলিয়ে দেখুন।
6. দৈনিক PDF A4 portrait এবং অনুমোদিত email/Telegram test যাচাই করুন।
7. backup root-এ node project/verify_backup.mjs চালিয়ে checksums.sha256 দিয়ে corruption পরীক্ষা করুন।

AI agent বা developer-কে দেওয়ার পূর্ণ prompt
"এই folder-টি Mid Day Meal System-এর timestamped full restore point। প্রথমে instructions.rtf, backup-manifest.json, checksums.sha256 এবং metadata পড়ো। project folder-কে source of truth, database/production-d1-full.sql-কে অপরিবর্তিত production snapshot এবং database/production-d1.sqlite-কে local restore source হিসেবে ব্যবহার করো। কোনো source, migration, user data, report, adjustment ledger, notification setting বা Cloudflare binding অনুমান করে পরিবর্তন করবে না। প্রথমে target-এর backup নাও এবং target খালি/নিরাপদ কি না যাচাই করো। তারপর package-lock.json অনুযায়ী npm.cmd ci, npm.cmd run build, node ..\\database\\restore-local-d1.mjs ., npm.cmd test ও npm.cmd run lint চালাও। Production restore বা destructive database operation-এর আগে মালিকের স্পষ্ট অনুমতি নাও। Cloudflare deploy করলে DB, BROWSER, EMAIL, SETTINGS_ENCRYPTION_KEY, CLOUDFLARE_D1_API_TOKEN, custom domain ও Cron যাচাই করো। Restore শেষে database row counts, authentication, dashboard, মাসিক পরিকল্পনা, বিতরণ সমন্বয়, print/PDF, email ও Telegram delivery-এর প্রমাণসহ ফলাফল জানাও।"

নিরাপত্তা ও গুরুত্বপূর্ণ সতর্কতা
- এই backup-এ বিদ্যালয়, user profile, password hash, report ও operational data থাকতে পারে; private encrypted storage-এ রাখুন।
- instructions.rtf বা metadata-তে secret value নেই। Cloudflare secret values আলাদা নিরাপদ জায়গায় রাখুন।
- production restore কখনো চলমান database-এর উপর অন্ধভাবে চালাবেন না; আগে backup ও row-count comparison করুন।
- BACKUP_COMPLETE marker না থাকলে backup ব্যবহার করবেন না।`;

  fs.writeFileSync(path.join(backupDir, "instructions.rtf"), makeRtf(guide), "utf8");
  const payloadFiles = listFiles(backupDir).filter((file) => path.basename(file) !== "BACKUP_IN_PROGRESS");
  const manifest = {
    formatVersion: 2, status: "complete", createdAt: systemInfo.createdAtUtc, timezone: "Asia/Dhaka",
    sourceProject: projectDir, backupFolder: backupDir,
    productionDatabase: {
      name: database.database_name, id: database.database_id || "",
      archivalExport: "database/production-d1-full.sql",
      restoreExport: "database/production-d1-restore-ordered.sql",
      localSqliteSnapshot: "database/production-d1.sqlite",
      localRestoreHelper: "database/restore-local-d1.mjs",
      bytes: fs.statSync(remoteDatabaseFile).size, sha256: sha256(remoteDatabaseFile),
      restoreBytes: fs.statSync(restoreDatabaseFile).size, restoreSha256: sha256(restoreDatabaseFile),
      sqliteBytes: fs.statSync(productionSqliteFile).size, sqliteSha256: sha256(productionSqliteFile),
    },
    projectSnapshot: "project",
    localDatabaseState: fs.existsSync(path.join(databaseDir, "local-wrangler-state")) ? "database/local-wrangler-state" : null,
    excludedFromProjectSnapshot: [...rootExclusions].sort(), cloudflareSecretValuesIncluded: false,
    sourceEnvironmentFilesMayContainSecrets: true,
    fileCount: payloadFiles.length + 3,
    payloadBytes: payloadFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0),
    instructions: "instructions.rtf", checksums: "checksums.sha256",
  };
  fs.writeFileSync(path.join(backupDir, "backup-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  const filesForChecksum = listFiles(backupDir).filter((file) => path.basename(file) !== "BACKUP_IN_PROGRESS").sort();
  fs.writeFileSync(path.join(backupDir, "checksums.sha256"), `${filesForChecksum.map((file) => `${sha256(file)}  ${path.relative(backupDir, file).replaceAll("\\", "/")}`).join("\n")}\n`, "utf8");
  fs.rmSync(path.join(backupDir, "BACKUP_IN_PROGRESS"));
  fs.writeFileSync(path.join(backupDir, "BACKUP_COMPLETE"), `${systemInfo.createdAtUtc}\n`, "utf8");
  console.log(`Full backup created: ${backupDir}`);
  console.log(`Production D1 export: ${remoteDatabaseFile}`);
} catch (error) {
  fs.writeFileSync(path.join(backupDir, "BACKUP_FAILED.txt"), `${error instanceof Error ? error.stack || error.message : String(error)}\n`, "utf8");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
