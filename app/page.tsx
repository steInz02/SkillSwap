"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowRight,
  Search,
  Plus,
  Compass,
  Bookmark,
  LayoutDashboard,
  UserRound,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  Globe,
  ChevronDown,
  Check,
  Code2,
  Guitar,
  Palette,
  Languages,
  Camera,
  BookOpen,
  LogOut,
  Heart,
  ShieldCheck,
  CalendarDays,
  Menu,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { transition, matchScore } from "../lib/domain.mjs";
const categories = [
  "All skills",
  "Technology",
  "Music",
  "Design",
  "Languages",
  "Lifestyle",
  "Academics",
];
const icons: any = {
  Technology: Code2,
  Music: Guitar,
  Design: Palette,
  Languages: Languages,
  Lifestyle: Camera,
  Academics: BookOpen,
};
const people = [
  {
    id: "earhl",
    name: "Earhl Dumaquita",
    bio: "BSIT student. I turn tricky programming concepts into small, practical steps.",
    wants: "Guitar, Photography",
    availability: "Weekends · afternoon",
  },
  {
    id: "alex",
    name: "Alex Rivera",
    bio: "Guitar player, patient teacher, and a big believer in learning by doing.",
    wants: "HTML, Java",
    availability: "Weekday evenings",
  },
  {
    id: "maya",
    name: "Maya Santos",
    bio: "Designer who loves thoughtful interfaces and sharing the process behind them.",
    wants: "Photography, Java",
    availability: "Saturday mornings",
  },
  {
    id: "luca",
    name: "Luca Reyes",
    bio: "Language enthusiast. Let’s make learning a little less intimidating.",
    wants: "Web development",
    availability: "Sunday afternoons",
  },
  {
    id: "sam",
    name: "Sam Torres",
    bio: "Finding good light and helping you find it too.",
    wants: "Guitar, Design",
    availability: "Weekends",
  },
  {
    id: "nina",
    name: "Nina Cruz",
    bio: "Making numbers make sense, one example at a time.",
    wants: "Java, HTML",
    availability: "Weekday evenings",
  },
];
const samples = [
  {
    id: "guitar",
    user_id: "alex",
    title: "Acoustic guitar essentials",
    category: "Music",
    description:
      "Learn your first chords, find your rhythm, and play a song you love. No experience needed—just bring a guitar and a little curiosity.",
    wants: "HTML, Java",
    level: "Beginner",
    mode: "Online",
    rating: 4.9,
    completed: 12,
  },
  {
    id: "design",
    user_id: "maya",
    title: "Design your first interface",
    category: "Design",
    description:
      "Go from a blank canvas to a thoughtful app screen. Learn layout, type, and practical design principles with a guided project.",
    wants: "Photography, Java",
    level: "Beginner",
    mode: "Online",
    rating: 4.8,
    completed: 8,
  },
  {
    id: "web",
    user_id: "earhl",
    title: "Build a website from scratch",
    category: "Technology",
    description:
      "Understand HTML and CSS by building a small personal website. We’ll work through structure, styling, and responsive layouts together.",
    wants: "Guitar, Photography",
    level: "Beginner",
    mode: "Online",
    rating: 4.9,
    completed: 6,
  },
  {
    id: "language",
    user_id: "luca",
    title: "Conversational Spanish",
    category: "Languages",
    description:
      "Practice real conversations, useful expressions, and pronunciation in a friendly, low-pressure session.",
    wants: "Web development",
    level: "Beginner",
    mode: "Online",
    rating: 4.9,
    completed: 15,
  },
  {
    id: "photo",
    user_id: "sam",
    title: "See life through a new lens",
    category: "Lifestyle",
    description:
      "Make better photographs with the camera you already own. Explore composition, natural light, and telling a story in one frame.",
    wants: "Guitar, Design",
    level: "Beginner",
    mode: "Flexible",
    rating: 4.8,
    completed: 9,
  },
  {
    id: "math",
    user_id: "nina",
    title: "Math that finally makes sense",
    category: "Academics",
    description:
      "Get comfortable with algebra and problem solving. Bring a topic you find difficult, and we’ll work through it step by step.",
    wants: "Java, HTML",
    level: "Beginner",
    mode: "Online",
    rating: 5,
    completed: 7,
  },
].map((l) => ({
  ...l,
  ...Object.fromEntries(
    Object.entries(people.find((p) => p.id === l.user_id)!).filter(
      ([k]) => k !== "id" && k !== "wants",
    ),
  ),
  created: 0,
}));
const initialDemo = {
  people,
  listings: samples,
  exchanges: [
    {
      id: "sample-request",
      from_id: "maya",
      to_id: "earhl",
      listing_id: "web",
      title: "Build a website from scratch",
      from_name: "Maya Santos",
      to_name: "Earhl Dumaquita",
      offer: "UI design fundamentals",
      note: "I’d love to build my portfolio. In return, we can design your app’s first screen together.",
      date: new Date(Date.now() + 7 * 86400000).toISOString(),
      duration: 60,
      status: "pending",
      from_done: 0,
      to_done: 0,
    },
  ],
  blocked: [] as string[],
};
async function api(path: string, body?: any) {
  const r = await fetch("/api/" + path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const d: any = await r.json();
  if (!r.ok) throw new Error(d.error || "Unable to connect. Try again.");
  return d;
}
function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span className={"avatar " + (small ? "small" : "")}>
      {name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export default function Home() {
  const [demo, setDemo] = useState(true),
    [data, setData] = useState<any>(initialDemo),
    [persona, setPersona] = useState("earhl"),
    [realMe, setRealMe] = useState<any>(null),
    [liveListings, setLiveListings] = useState<any[]>([]),
    [liveExchanges, setLiveExchanges] = useState<any[]>([]),
    [ready, setReady] = useState(false);
  const [page, setPage] = useState("discover"),
    [category, setCategory] = useState("All skills"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("recommended"),
    [format, setFormat] = useState("Any format"),
    [level, setLevel] = useState("Any level"),
    [filters, setFilters] = useState(false),
    [saved, setSaved] = useState<string[]>([]),
    [modal, setModal] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false),
    [exchangeTab, setExchangeTab] = useState("All");
  const me = demo ? data.people.find((p: any) => p.id === persona) : realMe;
  const listings = demo
    ? data.listings.filter((l: any) => !data.blocked.includes(l.user_id))
    : liveListings;
  const exchanges = demo
    ? data.exchanges.filter(
        (e: any) => e.from_id === persona || e.to_id === persona,
      )
    : liveExchanges;
  useEffect(() => {
    try {
      const stored = localStorage.getItem("skillswap-demo-v1");
      if (stored) setData(JSON.parse(stored));
      setSaved(JSON.parse(localStorage.getItem("skillswap-saved-v1") || "[]"));
      setDemo(localStorage.getItem("skillswap-mode") !== "live");
    } catch {}
    setReady(true);
    api("me")
      .then((d) => setRealMe(d.user))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (ready) {
      localStorage.setItem("skillswap-demo-v1", JSON.stringify(data));
      localStorage.setItem("skillswap-saved-v1", JSON.stringify(saved));
    }
  }, [data, saved, ready]);
  useEffect(() => {
    if (!demo) refresh();
    if (ready) localStorage.setItem("skillswap-mode", demo ? "demo" : "live");
  }, [demo, ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setError("");
  }, [modal]);
  useEffect(() => {
    if (!modal) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [modal]);
  async function refresh() {
    try {
      const u = await api("me");
      setRealMe(u.user);
      const l = await api("listings");
      setLiveListings(l.listings);
      if (u.user) setLiveExchanges((await api("exchanges")).exchanges);
      else setLiveExchanges([]);
    } catch (e: any) {
      setToast(e.message);
    }
  }
  function open(kind: string, listing?: any) {
    if (["offer", "request", "profile", "review"].includes(kind) && !me) {
      setModal({ kind: "auth", signup: true });
      return;
    }
    setModal({ kind, listing });
  }
  function save(id: string) {
    setSaved((x) => (x.includes(id) ? x.filter((i) => i !== id) : [...x, id]));
  }
  function navigate(p: string) {
    setPage(p);
    setMobile(false);
    if (!demo) refresh();
  }
  const offers = listings
    .filter((l: any) => l.user_id === me?.id)
    .map((l: any) => l.title)
    .join(",");
  const filtered = listings
    .filter(
      (l: any) =>
        (page !== "saved" || saved.includes(l.id)) &&
        (category === "All skills" || category === l.category) &&
        (format === "Any format" || format === l.mode) &&
        (level === "Any level" || level === l.level) &&
        `${l.title} ${l.name} ${l.wants} ${l.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a: any, b: any) =>
      sort === "rating"
        ? (b.rating || 0) - (a.rating || 0)
        : sort === "newest"
          ? b.created - a.created
          : matchScore(b, me?.wants, offers) - matchScore(a, me?.wants, offers),
    );
  async function action(e: any, type: string) {
    setBusy(true);
    try {
      if (demo) {
        const next = transition(e, persona, type);
        setData((d: any) => ({
          ...d,
          exchanges: d.exchanges.map((x: any) => (x.id === e.id ? next : x)),
        }));
      } else {
        await api("exchanges/" + e.id, { action: type });
        await refresh();
      }
      setToast(
        type === "complete"
          ? "Your completion is confirmed. Both partners must confirm."
          : "Exchange updated.",
      );
    } catch (e: any) {
      setToast(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: any) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const f = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      if (modal.kind === "auth") {
        const r = await api("auth/" + (modal.signup ? "signup" : "login"), f);
        setRealMe(r.user);
        setDemo(false);
        await refresh();
        setToast("Welcome to SkillSwap.");
      }
      if (modal.kind === "offer") {
        if (demo)
          setData((d: any) => ({
            ...d,
            listings: [
              {
                ...f,
                id: crypto.randomUUID(),
                user_id: persona,
                name: me.name,
                bio: me.bio,
                availability: me.availability,
                created: Date.now(),
                rating: null,
                completed: 0,
              },
              ...d.listings,
            ],
          }));
        else {
          await api("listings", f);
          await refresh();
        }
        setToast("Your skill is ready to share.");
      }
      if (modal.kind === "profile") {
        if (demo)
          setData((d: any) => ({
            ...d,
            people: d.people.map((p: any) =>
              p.id === persona ? { ...p, ...f } : p,
            ),
            listings: d.listings.map((l: any) =>
              l.user_id === persona
                ? {
                    ...l,
                    name: f.name,
                    bio: f.bio,
                    availability: f.availability,
                  }
                : l,
            ),
          }));
        else {
          await api("profile", f);
          await refresh();
        }
        setToast("Profile updated.");
      }
      if (modal.kind === "request") {
        const l = modal.listing;
        const date = new Date(f.date as string).toISOString();
        if (Date.parse(date) <= Date.now())
          throw new Error("Choose a future date and time.");
        if (demo) {
          if (
            exchanges.some(
              (e: any) =>
                e.from_id === persona &&
                e.listing_id === l.id &&
                ["pending", "accepted"].includes(e.status),
            )
          )
            throw new Error(
              "You already have an active request for this skill.",
            );
          setData((d: any) => ({
            ...d,
            exchanges: [
              {
                ...f,
                date,
                duration: Number(f.duration),
                id: crypto.randomUUID(),
                from_id: persona,
                to_id: l.user_id,
                listing_id: l.id,
                title: l.title,
                from_name: me.name,
                to_name: l.name,
                status: "pending",
                from_done: 0,
                to_done: 0,
              },
              ...d.exchanges,
            ],
          }));
        } else {
          await api("exchanges", { ...f, date, listing_id: l.id });
          await refresh();
        }
        setToast("Request sent. Find it in My exchanges.");
      }
      if (modal.kind === "review") {
        if (demo)
          setData((d: any) => ({
            ...d,
            exchanges: d.exchanges.map((e: any) =>
              e.id === modal.listing.id
                ? {
                    ...e,
                    reviews: { ...e.reviews, [persona]: Number(f.rating) },
                  }
                : e,
            ),
          }));
        else {
          await api("reviews", { ...f, exchange_id: modal.listing.id });
          await refresh();
        }
        setToast("Thank you for sharing your feedback.");
      }
      if (modal.kind === "report") {
        if (!demo)
          await api("report", { ...f, target_id: modal.listing.user_id });
        setToast(
          demo
            ? "Demo report recorded for this preview only."
            : "Report recorded. The project owner can review it in the database.",
        );
      }
      setModal(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const pending = exchanges.filter(
    (e: any) => e.status === "pending" && e.to_id === me?.id,
  ).length;
  function skillCard(l: any) {
    const Icon = icons[l.category] || BookOpen;
    const score = matchScore(l, me?.wants, offers);
    return (
      <article className="skill-card" key={l.id}>
        <button
          className={"card-art " + l.category.toLowerCase()}
          onClick={() => open("detail", l)}
          aria-label={"View " + l.title}
        >
          <span className="art-grid" />
          <span className="art-orbit" />
          <span className="art-icon">
            <Icon size={62} strokeWidth={1.3} />
          </span>
          <span className="art-caption">
            {l.category === "Music"
              ? "FIND YOUR RHYTHM"
              : l.category === "Design"
                ? "MAKE SOMETHING MATTER"
                : l.category === "Technology"
                  ? "HELLO, POSSIBILITIES"
                  : l.category === "Languages"
                    ? "A WORLD OF WORDS"
                    : l.category === "Lifestyle"
                      ? "A DIFFERENT PERSPECTIVE"
                      : "CONNECT THE DOTS"}
          </span>
          <span className="category-pill">{l.category}</span>
          {score === 3 && l.user_id !== me?.id && (
            <span className="match-pill">
              <Sparkles size={11} /> Mutual match
            </span>
          )}
        </button>
        <div className="card-content">
          <div className="person">
            <Avatar name={l.name} small />
            <span>{l.name}</span>
            <span className="rating">
              <Star size={12} fill="currentColor" />
              {l.rating || "New"}
            </span>
          </div>
          <button className="title-button" onClick={() => open("detail", l)}>
            <h3>{l.title}</h3>
          </button>
          <p className="description">{l.description}</p>
          <div className="wants">
            <ArrowLeftRight size={14} />
            <span>
              Wants to learn <strong>{l.wants}</strong>
            </span>
          </div>
          <div className="card-bottom">
            <span>
              <Globe size={13} /> {l.mode}
            </span>
            <span className="level">{l.level}</span>
            <button
              className={
                "icon-button save " + (saved.includes(l.id) ? "selected" : "")
              }
              aria-label={
                saved.includes(l.id) ? "Unsave " + l.title : "Save " + l.title
              }
              onClick={() => save(l.id)}
            >
              <Bookmark
                size={18}
                fill={saved.includes(l.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>
      </article>
    );
  }
  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("discover");
          }}
        >
          <span className="brand-icon">
            <ArrowLeftRight size={23} />
          </span>
          SkillSwap<span className="brand-dot">.</span>
        </a>
        <span className="side-label">YOUR LEARNING SPACE</span>
        <nav>
          {[
            ["discover", Compass, "Discover skills"],
            ["exchanges", ArrowLeftRight, "My exchanges"],
            ["saved", Bookmark, "Saved skills"],
            ["profile", UserRound, "My profile"],
          ].map(([p, Icon, label]: any) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => navigate(p)}
            >
              <Icon size={19} />
              {label}
              {p === "exchanges" && pending > 0 && (
                <span className="nav-count">{pending}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-prompt">
          <span className="spark">
            <Sparkles size={29} />
          </span>
          <h3>
            Everyone knows
            <br />
            something.
          </h3>
          <p>Your everyday skill could be someone’s next big step.</p>
          <button onClick={() => open("offer")}>
            Share your skill <ArrowUpRight size={15} />
          </button>
        </div>
        <button
          className={"guide-link " + (page === "guide" ? "active" : "")}
          onClick={() => navigate("guide")}
        >
          <BookOpen size={18} /> How SkillSwap works <ArrowUpRight size={14} />
        </button>
        <div className="sidebar-footer">
          <span className="status-dot" /> Made for learning together
          <small>A project by Earhl Dumaquita</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={22} />
            </button>
            <span>Community</span>
            <span className="slash">/</span>
            <strong>
              {
                (
                  {
                    discover: "Discover skills",
                    exchanges: "My exchanges",
                    saved: "Saved skills",
                    profile: "My profile",
                    guide: "How it works",
                  } as any
                )[page]
              }
            </strong>
          </div>
          <div className="top-actions">
            <span className="workspace-label">
              <span className="status-dot" />
              {demo ? "Demo workspace" : "Live community"}
            </span>
            <button
              className="icon-button user-button"
              aria-label="Open profile"
              onClick={() => navigate("profile")}
            >
              <Avatar name={me?.name || "Guest"} small />
            </button>
          </div>
        </header>
        <div className="demo-bar">
          <span>
            {demo ? (
              <>
                <strong>Take a look around.</strong> These are sample profiles.
                Try an exchange or join the real community.
              </>
            ) : (
              <>
                <strong>Your community starts here.</strong> Profiles and
                exchanges are saved to your account.
              </>
            )}
          </span>
          <button
            onClick={() => {
              setDemo(!demo);
              setPage("discover");
              setSearch("");
              setCategory("All skills");
            }}
          >
            {demo ? "Go to live community" : "Explore demo"}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
        <main>
          {(page === "discover" || page === "saved") && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">A LITTLE GIVE. A LOT TO GAIN.</p>
                  <h1>
                    {page === "saved"
                      ? "Your next possibilities."
                      : "Trade skills. Grow together."}
                  </h1>
                  <p>
                    {page === "saved"
                      ? "Keep the skills that spark your curiosity in one place."
                      : "You have something to teach. Someone has something you’d love to learn."}
                  </p>
                </div>
                <button className="primary" onClick={() => open("offer")}>
                  <Plus size={18} /> Share a skill
                </button>
              </section>
              {page === "discover" && (
                <section className="hero">
                  <div className="hero-copy">
                    <span className="hero-label">
                      <span /> KNOWLEDGE IS BETTER SHARED
                    </span>
                    <h2>
                      Your next skill
                      <br />
                      starts with a swap<span>.</span>
                    </h2>
                    <p>
                      Guitar for coding. Design for Spanish.
                      <br />
                      Find your person. Learn from each other.
                    </p>
                    <button
                      onClick={() => {
                        document.getElementById("skill-search")?.focus();
                        document
                          .getElementById("browse")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }}
                    >
                      Find your skill swap <ArrowUpRight size={17} />
                    </button>
                    <div className="hero-foot">
                      <span className="tiny-avatars">
                        {["AR", "MS", "LC"].map((n) => (
                          <i key={n}>{n}</i>
                        ))}
                      </span>
                      <span>No payments. Just shared possibilities.</span>
                    </div>
                  </div>
                  <div className="hero-visual" aria-hidden="true">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <span className="floating-star star-one">
                      <Sparkles size={38} />
                    </span>
                    <span className="floating-star star-two">✦</span>
                    <div className="swap-tile code-tile">
                      <span>I CAN TEACH</span>
                      <Code2 size={54} strokeWidth={1.6} />
                      <strong>Code that creates.</strong>
                      <small>HTML · CSS · Java</small>
                    </div>
                    <div className="swap-center">
                      <ArrowLeftRight size={28} />
                    </div>
                    <div className="swap-tile music-tile">
                      <span>I WANT TO LEARN</span>
                      <Guitar size={55} strokeWidth={1.6} />
                      <strong>Chords that connect.</strong>
                      <small>Guitar · Music · Rhythm</small>
                    </div>
                    <div className="hero-sticker">
                      <Check size={13} /> A perfect exchange
                    </div>
                  </div>
                </section>
              )}
              <section id="browse" className="browse">
                <div className="section-heading">
                  <h2>
                    {page === "saved"
                      ? "Saved for later"
                      : "Find something worth learning"}{" "}
                    <span>{filtered.length}</span>
                  </h2>
                  <label className="sort-label">
                    Sort by{" "}
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="newest">Newest first</option>
                      <option value="rating">Top rated</option>
                    </select>
                  </label>
                </div>
                <div className="search-row">
                  <label className="search-input">
                    <Search size={19} />
                    <input
                      id="skill-search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Try “guitar”, “web design”, or a skill you’re curious about…"
                    />
                    {search && (
                      <button
                        aria-label="Clear search"
                        onClick={() => setSearch("")}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </label>
                  <button
                    className={"filter-button " + (filters ? "chosen" : "")}
                    onClick={() => setFilters(!filters)}
                  >
                    <SlidersHorizontal size={17} /> Filters
                    {(format !== "Any format" || level !== "Any level") && (
                      <span className="status-dot" />
                    )}
                  </button>
                </div>
                {filters && (
                  <div className="filter-panel">
                    <label>
                      Learning format
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                      >
                        {["Any format", "Online", "In person", "Flexible"].map(
                          (x) => (
                            <option key={x}>{x}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Skill level
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        {[
                          "Any level",
                          "Beginner",
                          "Intermediate",
                          "Advanced",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setFormat("Any format");
                        setLevel("Any level");
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                )}
                <div className="category-tabs">
                  {categories.map((c) => {
                    const Icon = icons[c];
                    return (
                      <button
                        key={c}
                        className={c === category ? "selected" : ""}
                        onClick={() => setCategory(c)}
                      >
                        {Icon && <Icon size={15} />} {c}
                      </button>
                    );
                  })}
                </div>
                <div className="cards-grid">{filtered.map(skillCard)}</div>
                {!filtered.length && (
                  <div className="empty">
                    <Compass size={36} />
                    <h3>
                      {page === "saved"
                        ? "Your collection starts with a little curiosity."
                        : "No skills found just yet."}
                    </h3>
                    <p>
                      {search || category !== "All skills"
                        ? "Try a different search or category."
                        : demo
                          ? "Save a skill using the bookmark on any card."
                          : "Be the first to share something you know."}
                    </p>
                    <button
                      className="secondary"
                      onClick={() => {
                        if (page === "saved") setPage("discover");
                        else if (!listings.length) open("offer");
                        setSearch("");
                        setCategory("All skills");
                        setFormat("Any format");
                        setLevel("Any level");
                      }}
                    >
                      {page === "saved"
                        ? "Discover skills"
                        : !listings.length
                          ? "Share a skill"
                          : "Clear filters"}
                    </button>
                  </div>
                )}
              </section>
              <div className="bottom-note">
                <Heart size={14} /> A little of what you know can make a big
                difference to someone.
              </div>
            </>
          )}
          {page === "exchanges" && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">TURN CONNECTIONS INTO PROGRESS</p>
                  <h1>Your learning, in motion.</h1>
                  <p>
                    Make a plan, share what you know, and celebrate what you
                    learn.
                  </p>
                </div>
              </section>
              {demo && (
                <div className="persona-bar">
                  <span>
                    <Sparkles size={18} /> Test both sides of an exchange
                  </span>
                  <label>
                    Viewing as{" "}
                    <select
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                    >
                      {data.people.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              <div className="stats-grid">
                {[
                  [
                    "Pending",
                    exchanges.filter((e: any) => e.status === "pending").length,
                  ],
                  [
                    "Upcoming",
                    exchanges.filter((e: any) => e.status === "accepted")
                      .length,
                  ],
                  [
                    "Completed",
                    exchanges.filter((e: any) => e.status === "completed")
                      .length,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <ArrowUpRight size={22} />
                  </div>
                ))}
              </div>
              <div className="category-tabs">
                {["All", "Pending", "Accepted", "Completed", "Closed"].map(
                  (t) => (
                    <button
                      key={t}
                      className={exchangeTab === t ? "selected" : ""}
                      onClick={() => setExchangeTab(t)}
                    >
                      {t}
                    </button>
                  ),
                )}
              </div>
              <div className="exchange-list">
                {exchanges
                  .filter(
                    (e: any) =>
                      exchangeTab === "All" ||
                      (exchangeTab === "Closed"
                        ? ["declined", "cancelled"].includes(e.status)
                        : e.status === exchangeTab.toLowerCase()),
                  )
                  .map((e: any) => (
                    <article className="exchange-card" key={e.id}>
                      <div className="exchange-top">
                        <Avatar
                          name={e.from_id === me?.id ? e.to_name : e.from_name}
                        />
                        <div>
                          <span className="eyebrow">
                            {e.from_id === me?.id
                              ? "YOU SENT A REQUEST TO"
                              : "REQUEST FROM"}
                          </span>
                          <h3>
                            {e.from_id === me?.id ? e.to_name : e.from_name}
                          </h3>
                        </div>
                        <span className={"status " + e.status}>{e.status}</span>
                      </div>
                      <div className="exchange-skills">
                        <div>
                          <small>{e.from_name} learns</small>
                          <strong>{e.title}</strong>
                        </div>
                        <ArrowLeftRight size={23} />
                        <div>
                          <small>{e.to_name} learns</small>
                          <strong>{e.offer}</strong>
                        </div>
                      </div>
                      <p>{e.note}</p>
                      <div className="exchange-meta">
                        <CalendarDays size={15} />
                        {new Date(e.date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        <span>·</span>
                        <Clock size={15} />
                        {e.duration} min each
                      </div>
                      <div className="exchange-actions">
                        {e.status === "pending" && e.to_id === me?.id && (
                          <>
                            <button
                              disabled={busy}
                              className="primary"
                              onClick={() => action(e, "accept")}
                            >
                              Accept exchange
                            </button>
                            <button
                              disabled={busy}
                              className="secondary"
                              onClick={() => action(e, "decline")}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {["pending", "accepted"].includes(e.status) && (
                          <button
                            disabled={busy}
                            className="text-button"
                            onClick={() => action(e, "cancel")}
                          >
                            Cancel exchange
                          </button>
                        )}
                        {e.status === "accepted" && (
                          <button
                            disabled={
                              busy ||
                              (e.from_id === me?.id
                                ? e.from_done
                                : e.to_done) === 1
                            }
                            className="primary"
                            onClick={() => action(e, "complete")}
                          >
                            <CheckCheck size={17} />
                            {(e.from_id === me?.id ? e.from_done : e.to_done)
                              ? "Waiting for partner"
                              : "Confirm completed"}
                          </button>
                        )}
                        {e.status === "completed" &&
                          (!(demo ? e.reviews?.[persona] : e.my_rating) ? (
                            <button
                              className="primary"
                              onClick={() => open("review", e)}
                            >
                              <Star size={16} /> Leave a review
                            </button>
                          ) : (
                            <span className="reviewed">
                              <Check size={16} /> Review submitted
                            </span>
                          ))}
                      </div>
                    </article>
                  ))}
              </div>
              {!exchanges.length && (
                <div className="empty">
                  <ArrowLeftRight size={36} />
                  <h3>Your first exchange is waiting.</h3>
                  <p>Discover a skill and send a thoughtful proposal.</p>
                  <button
                    className="primary"
                    onClick={() => navigate("discover")}
                  >
                    Explore skills
                  </button>
                </div>
              )}
            </>
          )}
          {page === "profile" && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">SOMETHING ONLY YOU CAN SHARE</p>
                  <h1>
                    {me
                      ? "Hello, " + me.name.split(" ")[0] + "."
                      : "Make room for something new."}
                  </h1>
                  <p>
                    Your skills are the start of someone else’s learning story.
                  </p>
                </div>
                {me && (
                  <button className="primary" onClick={() => open("profile")}>
                    Edit profile
                  </button>
                )}
              </section>
              {me ? (
                <>
                  <div className="profile-card">
                    <Avatar name={me.name} />
                    <div>
                      <h2>{me.name}</h2>
                      <p>
                        {me.bio ||
                          "Add a short bio so people can get to know you."}
                      </p>
                      <div className="profile-info">
                        <span>
                          <Clock size={16} />
                          {me.availability || "Set your availability"}
                        </span>
                        <span>
                          <BookOpen size={16} /> Wants to learn:{" "}
                          {me.wants || "Add your interests"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="section-heading">
                    <h2>Skills you’re sharing</h2>
                    <button className="secondary" onClick={() => open("offer")}>
                      <Plus size={16} /> Add a skill
                    </button>
                  </div>
                  <div className="cards-grid">
                    {listings
                      .filter((l: any) => l.user_id === me.id)
                      .map(skillCard)}
                  </div>
                  {!listings.some((l: any) => l.user_id === me.id) && (
                    <div className="empty">
                      <h3>What could you teach someone?</h3>
                      <p>
                        Start with one skill. You don’t need to know everything.
                      </p>
                    </div>
                  )}
                  {!demo && (
                    <button
                      className="text-button logout"
                      onClick={async () => {
                        await api("auth/logout", {});
                        setRealMe(null);
                        setLiveExchanges([]);
                        setToast("Signed out.");
                      }}
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  )}
                </>
              ) : (
                <div className="join-card">
                  <span className="brand-icon">
                    <ArrowLeftRight size={30} />
                  </span>
                  <h2>Good things happen when we share.</h2>
                  <p>
                    Create an account to share skills, propose exchanges, and
                    track your learning.
                  </p>
                  <button
                    className="primary"
                    onClick={() => setModal({ kind: "auth", signup: true })}
                  >
                    Create your account <ArrowRight size={17} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setModal({ kind: "auth", signup: false })}
                  >
                    Already here? Sign in
                  </button>
                </div>
              )}
            </>
          )}
          {page === "guide" && (
            <>
              <section className="page-heading">
                <div>
                  <p className="eyebrow">NO PAYMENTS. JUST POSSIBILITIES.</p>
                  <h1>A fair exchange of know-how.</h1>
                  <p>
                    Start small. Be kind. Leave knowing something you didn’t
                    before.
                  </p>
                </div>
              </section>
              <div className="guide-grid">
                {[
                  [
                    "01",
                    "Share what you know",
                    "Create a clear skill offer. Say who it’s for, what you’ll cover, and what you want to learn.",
                  ],
                  [
                    "02",
                    "Find your learning partner",
                    "Browse skills, save your favorites, and look for mutual interests. Recommended matches use your profile and offers.",
                  ],
                  [
                    "03",
                    "Agree on a fair exchange",
                    "Propose a topic, future date, and equal session duration. Use the proposal notes to share a meeting link or public meeting place.",
                  ],
                  [
                    "04",
                    "Learn, then pay it forward",
                    "Both partners confirm completion. Only then can participants leave one review each.",
                  ],
                ].map(([n, title, desc]) => (
                  <article key={n}>
                    <span>{n}</span>
                    <h2>{title}</h2>
                    <p>{desc}</p>
                  </article>
                ))}
              </div>
              <div className="safety-note">
                <ShieldCheck size={26} />
                <div>
                  <h3>A little care goes a long way.</h3>
                  <p>
                    Keep sensitive information private. Meet online or in a
                    public place. Use Block or Report on a member’s skill
                    details when needed. This first version has no in-app calls
                    or chat; agree on meeting details in your request.
                  </p>
                </div>
              </div>
            </>
          )}
        </main>
        <footer>
          SkillSwap{" "}
          <span>Learn something. Teach something. Grow together.</span>
          <small>Built by Earhl Dumaquita</small>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <dialog
            open
            className="modal"
            aria-labelledby="modal-title"
            ref={(el) => {
              if (el && !el.dataset.focused) {
                el.dataset.focused = "true";
                el.querySelector<HTMLButtonElement>("button")?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              const els = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>(
                  "button:not(:disabled),input,select,textarea,a[href]",
                ),
              );
              const first = els[0],
                last = els[els.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={22} />
            </button>
            {modal.kind === "detail" ? (
              <>
                <span className="eyebrow">
                  {modal.listing.category} · {modal.listing.level}
                </span>
                <h2 id="modal-title">{modal.listing.title}</h2>
                <div className="detail-person">
                  <Avatar name={modal.listing.name} />
                  <div>
                    <strong>{modal.listing.name}</strong>
                    <p>
                      {modal.listing.completed || 0} completed exchanges{" "}
                      {demo ? "· Sample profile" : ""}
                    </p>
                  </div>
                </div>
                <p className="detail-description">
                  {modal.listing.description}
                </p>
                <div className="detail-box">
                  <span>
                    <ArrowLeftRight size={17} /> In exchange for
                  </span>
                  <strong>{modal.listing.wants}</strong>
                </div>
                <div className="detail-meta">
                  <span>
                    <Globe size={16} />
                    {modal.listing.mode}
                  </span>
                  <span>
                    <Clock size={16} />
                    {modal.listing.availability}
                  </span>
                </div>
                <h3>Meet your learning partner</h3>
                <p>
                  {modal.listing.bio || "This member hasn’t added a bio yet."}
                </p>
                {modal.listing.user_id !== me?.id ? (
                  <button
                    className="primary full"
                    onClick={() => open("request", modal.listing)}
                  >
                    Propose a skill swap <ArrowUpRight size={18} />
                  </button>
                ) : (
                  <p className="own-listing">
                    <Check size={16} /> This is your skill offer
                  </p>
                )}
                <div className="detail-links">
                  <button
                    className="text-button"
                    onClick={() => save(modal.listing.id)}
                  >
                    {saved.includes(modal.listing.id)
                      ? "Remove from saved"
                      : "Save for later"}
                  </button>
                  {modal.listing.user_id !== me?.id && me && (
                    <>
                      <button
                        className="text-button"
                        onClick={() => open("report", modal.listing)}
                      >
                        Report
                      </button>
                      <button
                        className="text-button"
                        onClick={async () => {
                          try {
                            if (demo)
                              setData((d: any) => ({
                                ...d,
                                blocked: [...d.blocked, modal.listing.user_id],
                              }));
                            else {
                              await api("block", {
                                target_id: modal.listing.user_id,
                              });
                              await refresh();
                            }
                            setModal(null);
                            setToast(
                              "Member blocked. Their offers will no longer appear.",
                            );
                          } catch (e: any) {
                            setError(e.message);
                          }
                        }}
                      >
                        Block member
                      </button>
                    </>
                  )}
                </div>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            ) : (
              <form onSubmit={submit}>
                <span className="eyebrow">
                  {demo && modal.kind !== "auth"
                    ? "DEMO WORKSPACE · SAVED ON THIS DEVICE"
                    : "YOUR NEXT CHAPTER"}
                </span>
                <h2 id="modal-title">
                  {
                    (
                      {
                        offer: "What can you share?",
                        profile: "A little about you.",
                        request: "Start a good exchange.",
                        review: "How did it go?",
                        report: "Tell us what happened.",
                        auth: modal.signup
                          ? "Welcome to SkillSwap."
                          : "Good to see you again.",
                      } as any
                    )[modal.kind]
                  }
                </h2>
                {modal.kind === "auth" && (
                  <>
                    {modal.signup && (
                      <label>
                        Your name
                        <input
                          name="name"
                          required
                          maxLength={60}
                          autoComplete="name"
                          placeholder="What should we call you?"
                        />
                      </label>
                    )}
                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={254}
                        autoComplete="email"
                        placeholder="you@example.com"
                      />
                    </label>
                    <label>
                      Password
                      <input
                        name="password"
                        type="password"
                        required
                        minLength={10}
                        maxLength={128}
                        autoComplete={
                          modal.signup ? "new-password" : "current-password"
                        }
                        placeholder="At least 10 characters"
                      />
                    </label>
                    <p className="form-help">
                      {modal.signup
                        ? "Use a unique password. Email verification and password recovery are not available in this first version."
                        : "Sign in with your SkillSwap account."}
                    </p>
                  </>
                )}
                {modal.kind === "offer" && (
                  <>
                    <label>
                      Skill title
                      <input
                        name="title"
                        required
                        maxLength={80}
                        placeholder="e.g. Java programming for beginners"
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Category
                        <select name="category">
                          {categories.slice(1).map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        For learners at
                        <select name="level">
                          {["Beginner", "Intermediate", "Advanced"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      What will you teach?
                      <textarea
                        name="description"
                        required
                        minLength={20}
                        maxLength={1000}
                        rows={3}
                        placeholder="Describe what your partner will learn and what they should bring."
                      />
                    </label>
                    <label>
                      What would you like to learn in return?
                      <input
                        name="wants"
                        required
                        maxLength={200}
                        placeholder="e.g. Guitar, Photography"
                      />
                    </label>
                    <label>
                      Session format
                      <select name="mode">
                        <option>Online</option>
                        <option>In person</option>
                        <option>Flexible</option>
                      </select>
                    </label>
                  </>
                )}
                {modal.kind === "profile" && (
                  <>
                    <label>
                      Your name
                      <input
                        name="name"
                        required
                        maxLength={60}
                        defaultValue={me.name}
                      />
                    </label>
                    <label>
                      Your story
                      <textarea
                        name="bio"
                        maxLength={600}
                        rows={3}
                        defaultValue={me.bio}
                      />
                    </label>
                    <label>
                      Skills you want to learn
                      <input
                        name="wants"
                        maxLength={200}
                        defaultValue={me.wants}
                        placeholder="Separate interests with commas"
                      />
                    </label>
                    <label>
                      Typical availability
                      <input
                        name="availability"
                        maxLength={120}
                        defaultValue={me.availability}
                      />
                    </label>
                  </>
                )}
                {modal.kind === "request" && (
                  <>
                    <div className="proposal-summary">
                      <Avatar name={modal.listing.name} small />
                      <span>
                        You learn <strong>{modal.listing.title}</strong> from{" "}
                        {modal.listing.name}
                      </span>
                    </div>
                    <label>
                      What will you teach in return?
                      <input
                        name="offer"
                        required
                        maxLength={80}
                        placeholder="e.g. HTML and CSS basics"
                        defaultValue={
                          listings.find((l: any) => l.user_id === me?.id)
                            ?.title || ""
                        }
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Proposed date and time
                        <input name="date" type="datetime-local" required />
                      </label>
                      <label>
                        Time per person
                        <select name="duration">
                          <option value="30">30 minutes</option>
                          <option value="60">60 minutes</option>
                          <option value="90">90 minutes</option>
                          <option value="120">120 minutes</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      A note for your partner
                      <textarea
                        name="note"
                        maxLength={1000}
                        rows={3}
                        placeholder="Introduce yourself and suggest a meeting link or public meeting place."
                      />
                    </label>
                    <p className="form-help">
                      Times use your device’s time zone. Your partner must
                      accept before the exchange is confirmed.
                    </p>
                  </>
                )}
                {modal.kind === "review" && (
                  <>
                    <label>
                      Rating
                      <select name="rating">
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} / 5 {n === 5 ? "— Excellent" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      What was helpful?
                      <textarea
                        name="comment"
                        rows={3}
                        maxLength={600}
                        placeholder="Share honest, constructive feedback."
                      />
                    </label>
                  </>
                )}
                {modal.kind === "report" && (
                  <>
                    <p>
                      Reports are stored for the project owner to review. This
                      first version does not have an automated moderation
                      service.
                    </p>
                    <label>
                      Reason
                      <textarea
                        name="reason"
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={4}
                        placeholder="Describe the concern without including sensitive information."
                      />
                    </label>
                  </>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button disabled={busy} type="submit" className="primary full">
                  {busy
                    ? "Saving…"
                    : (
                        {
                          offer: "Publish skill",
                          profile: "Save profile",
                          request: "Send exchange request",
                          review: "Submit review",
                          report: "Submit report",
                          auth: modal.signup ? "Create account" : "Sign in",
                        } as any
                      )[modal.kind]}
                  <ArrowRight size={17} />
                </button>
                {modal.kind === "auth" && (
                  <button
                    type="button"
                    className="text-button auth-switch"
                    onClick={() =>
                      setModal({ ...modal, signup: !modal.signup })
                    }
                  >
                    {modal.signup
                      ? "Already have an account? Sign in"
                      : "New here? Create an account"}
                  </button>
                )}
              </form>
            )}
          </dialog>
        </div>
      )}
    </div>
  );
}
