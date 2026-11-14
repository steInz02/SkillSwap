// Apply unapplied SQL migrations to the local database; never touches production.
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const stateDir = ".wrangler/state";
const recordFile = stateDir + "/skillswap-migrations.json";
let applied = [];
try {
  applied = JSON.parse(await readFile(recordFile, "utf8"));
} catch {}
await mkdir(stateDir, { recursive: true });
for (const file of (await readdir("drizzle"))
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  if (applied.includes(file)) continue;
  const r = spawnSync(
    process.execPath,
    [
      "--import",
      "./scripts/sites-env.mjs",
      "./node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "DB",
      "--local",
      "--config",
      "dist/server/wrangler.json",
      "--persist-to",
      stateDir,
      "--file",
      "drizzle/" + file,
    ],
    { stdio: "inherit" },
  );
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status || 1);
  applied.push(file);
  await writeFile(recordFile, JSON.stringify(applied, null, 2));
}
console.log("Local SkillSwap database is ready.");
