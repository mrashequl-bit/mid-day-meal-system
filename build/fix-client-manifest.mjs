import { access, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const clientAssets = resolve(root, "dist", "client", "assets");
const manifests = [
  resolve(root, "dist", "server", "__vite_rsc_assets_manifest.js"),
  resolve(root, "dist", "server", "ssr", "__vite_rsc_assets_manifest.js"),
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

let removed = 0;
for (const manifest of manifests) {
  let source = await readFile(manifest, "utf8");
  const assetLines = [...source.matchAll(/^(\s*)"\/assets\/([^"]+\.js)",?\r?$/gm)];

  for (const match of assetLines) {
    if (!(await exists(resolve(clientAssets, match[2])))) {
      source = source.replace(`${match[0]}\n`, "");
      removed += 1;
    }
  }

  await writeFile(manifest, source, "utf8");
}

if (removed > 0) {
  console.log(`Removed ${removed} stale client manifest references.`);
}
