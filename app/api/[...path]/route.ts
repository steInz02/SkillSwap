import { env } from "cloudflare:workers";
import { transition } from "../../../lib/domain.mjs";
export const dynamic = "force-dynamic";
const uid = () => crypto.randomUUID();
const hex = (a: ArrayBuffer) =>
  Array.from(new Uint8Array(a), (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
async function hash(password: string, salt: string) {
  const k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      k,
      256,
    ),
  );
}
const publicUser = (u: any) => ({
  id: u.id,
  name: u.name,
  bio: u.bio,
  wants: u.wants,
  availability: u.availability,
});
async function handle(req: Request) {
  const db = env.DB!;
  const url = new URL(req.url);
  const path = url.pathname.slice(5).split("/");
  const reply = (data: any, status = 200, headers: any = {}) =>
    Response.json(data, {
      status,
      headers: { "Cache-Control": "no-store", ...headers },
    });
  try {
    if (
      req.method === "POST" &&
      req.headers.get("origin") &&
      req.headers.get("origin") !== url.origin
    )
      return reply({ error: "Cross-origin request refused." }, 403);
    const token = req.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)skillswap=([^;]+)/)?.[1];
    const me = token
      ? await db
          .prepare(
            "SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires>?",
          )
          .bind(token, Date.now())
          .first<any>()
      : null;
    if (req.method === "GET") {
      if (path[0] === "me") return reply({ user: me ? publicUser(me) : null });
      if (path[0] === "listings") {
        const rows = await db
          .prepare(
            `SELECT l.*,u.name,u.bio,u.availability,(SELECT ROUND(AVG(r.rating),1) FROM reviews r JOIN exchanges e ON e.id=r.exchange_id WHERE (e.to_id=u.id AND r.user_id=e.from_id) OR (e.from_id=u.id AND r.user_id=e.to_id)) rating,(SELECT COUNT(*) FROM exchanges e WHERE e.status='completed' AND (e.to_id=u.id OR e.from_id=u.id)) completed FROM listings l JOIN users u ON u.id=l.user_id WHERE NOT EXISTS(SELECT 1 FROM blocks b WHERE (b.user_id=? AND b.target_id=u.id) OR (b.target_id=? AND b.user_id=u.id)) ORDER BY l.created DESC`,
          )
          .bind(me?.id || "", me?.id || "")
          .all();
        return reply({ listings: rows.results });
      }
      if (!me) return reply({ error: "Please sign in." }, 401);
      if (path[0] === "exchanges") {
        const rows = await db
          .prepare(
            `SELECT e.*,l.title,a.name from_name,b.name to_name,(SELECT rating FROM reviews r WHERE r.exchange_id=e.id AND r.user_id=?) my_rating FROM exchanges e JOIN listings l ON l.id=e.listing_id JOIN users a ON a.id=e.from_id JOIN users b ON b.id=e.to_id WHERE e.from_id=? OR e.to_id=? ORDER BY e.created DESC`,
          )
          .bind(me.id, me.id, me.id)
          .all();
        return reply({ exchanges: rows.results });
      }
      return reply({ error: "Not found" }, 404);
    }
    if (req.method !== "POST")
      return reply({ error: "Method not allowed" }, 405);
    if (Number(req.headers.get("content-length") || 0) > 20000)
      return reply({ error: "Request too large" }, 413);
    const raw = await req.text();
    if (raw.length > 20000) return reply({ error: "Request too large" }, 413);
    const body = JSON.parse(raw || "{}");
    const str = (key: string, max = 200, min = 1) => {
      const v = typeof body[key] === "string" ? body[key].trim() : "";
      if (v.length < min || v.length > max)
        throw new Error(`Please check ${key} (${min}–${max} characters).`);
      return v;
    };
    if (path[0] === "auth") {
      if (path[1] === "logout") {
        if (token)
          await db
            .prepare("DELETE FROM sessions WHERE token=?")
            .bind(token)
            .run();
        return reply({ ok: true }, 200, {
          "Set-Cookie": "skillswap=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
        });
      }
      const email = str("email", 254).toLowerCase(),
        password = str("password", 128, 10);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("Enter a valid email.");
      let user: any;
      if (path[1] === "signup") {
        const name = str("name", 60),
          salt = uid(),
          id = uid();
        const exists = await db
          .prepare("SELECT id FROM users WHERE email=?")
          .bind(email)
          .first();
        if (exists)
          throw new Error(
            "An account already uses that email. Sign in instead.",
          );
        await db
          .prepare(
            "INSERT INTO users(id,email,password,salt,name,created) VALUES(?,?,?,?,?,?)",
          )
          .bind(id, email, await hash(password, salt), salt, name, Date.now())
          .run();
        user = { id, name, bio: "", wants: "", availability: "Weekends" };
      } else if (path[1] === "login") {
        user = await db
          .prepare("SELECT * FROM users WHERE email=?")
          .bind(email)
          .first<any>();
        const candidate = await hash(password, user?.salt || "dummy");
        if (!user || candidate !== user.password)
          return reply({ error: "Email or password is incorrect." }, 401);
      } else return reply({ error: "Not found" }, 404);
      const session = uid() + uid();
      await db
        .prepare("INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)")
        .bind(session, user.id, Date.now() + 7 * 86400000)
        .run();
      return reply({ user: publicUser(user) }, 200, {
        "Set-Cookie": `skillswap=${session}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${url.protocol === "https:" ? "; Secure" : ""}`,
      });
    }
    if (!me) return reply({ error: "Please sign in." }, 401);
    if (path[0] === "profile") {
      await db
        .prepare(
          "UPDATE users SET name=?,bio=?,wants=?,availability=? WHERE id=?",
        )
        .bind(
          str("name", 60),
          str("bio", 600, 0),
          str("wants", 200, 0),
          str("availability", 120, 0),
          me.id,
        )
        .run();
      return reply({ ok: true });
    }
    if (path[0] === "listings") {
      const title = str("title", 80),
        category = str("category"),
        level = str("level"),
        mode = str("mode");
      if (
        ![
          "Technology",
          "Music",
          "Design",
          "Languages",
          "Lifestyle",
          "Academics",
        ].includes(category) ||
        !["Beginner", "Intermediate", "Advanced"].includes(level) ||
        !["Online", "In person", "Flexible"].includes(mode)
      )
        throw new Error("Choose a valid category, level, and format.");
      await db
        .prepare(
          "INSERT INTO listings(id,user_id,title,category,level,mode,description,wants,created) VALUES(?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          uid(),
          me.id,
          title,
          category,
          level,
          mode,
          str("description", 1000, 20),
          str("wants", 200),
          Date.now(),
        )
        .run();
      return reply({ ok: true });
    }
    if (path[0] === "exchanges") {
      if (!path[1]) {
        const listing: any = await db
          .prepare("SELECT * FROM listings WHERE id=?")
          .bind(str("listing_id"))
          .first();
        if (!listing || listing.user_id === me.id)
          throw new Error("Choose another member’s skill.");
        const blocked = await db
          .prepare(
            "SELECT id FROM blocks WHERE (user_id=? AND target_id=?) OR (user_id=? AND target_id=?)",
          )
          .bind(me.id, listing.user_id, listing.user_id, me.id)
          .first();
        if (blocked) throw new Error("This exchange is unavailable.");
        const date = str("date", 40);
        if (
          !Number.isFinite(Date.parse(date)) ||
          Date.parse(date) <= Date.now()
        )
          throw new Error("Choose a future date and time.");
        const duration = Number(body.duration);
        if (![30, 60, 90, 120].includes(duration))
          throw new Error("Select a valid duration.");
        const pending = await db
          .prepare(
            "SELECT id FROM exchanges WHERE from_id=? AND listing_id=? AND status IN ('pending','accepted')",
          )
          .bind(me.id, listing.id)
          .first();
        if (pending)
          throw new Error("You already have an active request for this skill.");
        await db
          .prepare(
            "INSERT INTO exchanges(id,from_id,to_id,listing_id,offer,note,date,duration,created) VALUES(?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            uid(),
            me.id,
            listing.user_id,
            listing.id,
            str("offer", 80),
            str("note", 1000, 0),
            date,
            duration,
            Date.now(),
          )
          .run();
        return reply({ ok: true });
      }
      const exchange: any = await db
        .prepare("SELECT * FROM exchanges WHERE id=?")
        .bind(path[1])
        .first();
      if (!exchange) throw new Error("Exchange not found.");
      const next = transition(exchange, me.id, str("action"));
      const result = await db
        .prepare(
          "UPDATE exchanges SET status=?,from_done=?,to_done=? WHERE id=? AND status=? AND from_done=? AND to_done=?",
        )
        .bind(
          next.status,
          next.from_done,
          next.to_done,
          exchange.id,
          exchange.status,
          exchange.from_done,
          exchange.to_done,
        )
        .run();
      if (!result.meta.changes)
        return reply(
          { error: "This exchange changed. Refresh and try again." },
          409,
        );
      return reply({ ok: true });
    }
    if (path[0] === "reviews") {
      const eid = str("exchange_id");
      const e: any = await db
        .prepare("SELECT * FROM exchanges WHERE id=?")
        .bind(eid)
        .first();
      if (
        !e ||
        e.status !== "completed" ||
        ![e.from_id, e.to_id].includes(me.id)
      )
        throw new Error("Only participants can review a completed exchange.");
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5)
        throw new Error("Choose a rating from 1 to 5.");
      await db
        .prepare(
          "INSERT INTO reviews(id,exchange_id,user_id,rating,comment) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
        )
        .bind(eid + ":" + me.id, eid, me.id, rating, str("comment", 600, 0))
        .run();
      return reply({ ok: true });
    }
    if (path[0] === "block" || path[0] === "report") {
      const target = str("target_id");
      if (
        target === me.id ||
        !(await db
          .prepare("SELECT id FROM users WHERE id=?")
          .bind(target)
          .first())
      )
        throw new Error("Invalid member.");
      if (path[0] === "block")
        await db
          .prepare(
            "INSERT INTO blocks(id,user_id,target_id) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING",
          )
          .bind(me.id + ":" + target, me.id, target)
          .run();
      else
        await db
          .prepare(
            "INSERT INTO reports(id,user_id,target_id,reason,created) VALUES(?,?,?,?,?)",
          )
          .bind(uid(), me.id, target, str("reason", 1000, 10), Date.now())
          .run();
      return reply({ ok: true });
    }
    return reply({ error: "Not found" }, 404);
  } catch (error: any) {
    console.error(error);
    return reply(
      {
        error: error.message?.includes("SQL")
          ? "Unable to save. Please try again."
          : error.message || "Something went wrong.",
      },
      400,
    );
  }
}
export const GET = handle;
export const POST = handle;
