// Run against a disposable LOCAL database: node tests/api-smoke.mjs http://127.0.0.1:4173
import assert from "node:assert/strict";
const isolated = process.argv.includes("--isolated");
const base = isolated
  ? "http://localhost"
  : process.argv[2] || "http://127.0.0.1:5173";
let runtime;
if (isolated) {
  const { build } = await import("esbuild");
  const { Miniflare } = await import("miniflare");
  const { readFile } = await import("node:fs/promises");
  const bundle = await build({
    stdin: {
      contents:
        "import {GET,POST} from './app/api/[...path]/route.ts'; export default {fetch(req){return req.method==='POST'?POST(req):GET(req)}}",
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    format: "esm",
    target: "es2022",
    external: ["cloudflare:workers"],
  });
  runtime = new Miniflare({
    modules: true,
    script: bundle.outputFiles[0].text,
    compatibilityDate: "2026-01-01",
    d1Databases: ["DB"],
  });
  const db = await runtime.getD1Database("DB");
  const sql = await readFile("drizzle/0000_late_madrox.sql", "utf8");
  await db.batch(
    sql.split("--> statement-breakpoint").map((s) => db.prepare(s.trim())),
  );
}
const request = (...args) =>
  runtime ? runtime.dispatchFetch(...args) : fetch(...args);
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("This test only runs against localhost.");
async function call(path, body, cookie) {
  const r = await request(base + "/api/" + path, {
    method: body ? "POST" : "GET",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  return {
    status: r.status,
    data,
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
const run = Date.now();
const password = "Local-test-" + crypto.randomUUID();
const a = await call("auth/signup", {
  name: "Test Teacher",
  email: `teacher-${run}@example.test`,
  password,
});
assert.equal(a.status, 200, JSON.stringify(a.data));
const b = await call("auth/signup", {
  name: "Test Learner",
  email: `learner-${run}@example.test`,
  password,
});
assert.equal(b.status, 200);
const c = await call("auth/signup", {
  name: "Test Outsider",
  email: `outsider-${run}@example.test`,
  password,
});
assert.equal(c.status, 200);
assert.equal(
  (
    await call("auth/login", {
      email: `teacher-${run}@example.test`,
      password: "definitely-wrong",
    })
  ).status,
  401,
);
assert.equal(
  (
    await call(
      "listings",
      {
        title: "Java basics",
        category: "Technology",
        level: "Beginner",
        mode: "Online",
        description:
          "Learn Java with practical examples in this beginner session.",
        wants: "Guitar",
      },
      a.cookie,
    )
  ).status,
  200,
);
const l = (await call("listings", null, b.cookie)).data.listings.find(
  (x) => x.user_id === a.data.user.id,
);
assert.ok(l);
assert.equal(
  (
    await call(
      "exchanges",
      {
        listing_id: l.id,
        offer: "Guitar basics",
        note: "Local test exchange",
        date: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
      },
      b.cookie,
    )
  ).status,
  200,
);
const e = (await call("exchanges", null, a.cookie)).data.exchanges[0];
assert.ok(e);
assert.equal(
  (await call("exchanges/" + e.id, { action: "accept" }, b.cookie)).status,
  400,
);
assert.equal(
  (await call("exchanges/" + e.id, { action: "accept" }, c.cookie)).status,
  400,
);
assert.equal(
  (
    await call(
      "reviews",
      { exchange_id: e.id, rating: 5, comment: "Too soon" },
      b.cookie,
    )
  ).status,
  400,
);
assert.equal(
  (await call("exchanges/" + e.id, { action: "accept" }, a.cookie)).status,
  200,
);
assert.equal(
  (await call("exchanges/" + e.id, { action: "complete" }, a.cookie)).status,
  200,
);
assert.equal(
  (await call("exchanges", null, a.cookie)).data.exchanges[0].status,
  "accepted",
);
assert.equal(
  (await call("exchanges/" + e.id, { action: "complete" }, b.cookie)).status,
  200,
);
assert.equal(
  (await call("exchanges", null, a.cookie)).data.exchanges[0].status,
  "completed",
);
assert.equal(
  (
    await call(
      "reviews",
      { exchange_id: e.id, rating: 5, comment: "Great session" },
      b.cookie,
    )
  ).status,
  200,
);
assert.equal(
  (
    await call(
      "reviews",
      { exchange_id: e.id, rating: 1, comment: "Duplicate should not replace" },
      b.cookie,
    )
  ).status,
  200,
);
assert.equal(
  (await call("exchanges", null, b.cookie)).data.exchanges[0].my_rating,
  5,
);
assert.equal(
  (
    await call(
      "reviews",
      { exchange_id: e.id, rating: 5, comment: "Outsider" },
      c.cookie,
    )
  ).status,
  400,
);
assert.equal(
  (await call("block", { target_id: a.data.user.id }, b.cookie)).status,
  200,
);
assert.ok(
  !(await call("listings", null, b.cookie)).data.listings.some(
    (x) => x.id === l.id,
  ),
);
assert.equal((await call("auth/logout", {}, a.cookie)).status, 200);
assert.equal((await call("me", null, a.cookie)).data.user, null);
console.log(
  "PASS: accounts, password rejection, listing persistence, requests, authorization, bilateral completion, review eligibility/uniqueness, block filtering, logout.",
);

if (runtime) await runtime.dispose();
