export function transition(exchange, actor, action) {
  const from = exchange.from_id === actor,
    to = exchange.to_id === actor;
  if (!from && !to) throw new Error("This exchange belongs to someone else.");
  if (action === "accept" || action === "decline") {
    if (!to || exchange.status !== "pending")
      throw new Error("Only the recipient can respond to a pending request.");
    return {
      ...exchange,
      status: action === "accept" ? "accepted" : "declined",
    };
  }
  if (action === "cancel") {
    if (!["pending", "accepted"].includes(exchange.status))
      throw new Error("This exchange is already closed.");
    return { ...exchange, status: "cancelled" };
  }
  if (action === "complete") {
    if (exchange.status !== "accepted")
      throw new Error("Accept the request before confirming completion.");
    const next = {
      ...exchange,
      from_done: from ? 1 : exchange.from_done,
      to_done: to ? 1 : exchange.to_done,
    };
    return {
      ...next,
      status: next.from_done && next.to_done ? "completed" : "accepted",
    };
  }
  throw new Error("Unknown exchange action.");
}
export function matchScore(listing, wants, offers) {
  const parts = (s) =>
    String(s || "")
      .toLowerCase()
      .split(/[,;]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  const overlap = (a, b) =>
    parts(a).some((x) => parts(b).some((y) => x.includes(y) || y.includes(x)));
  return (
    Number(overlap(wants, listing.title)) * 2 +
    Number(overlap(offers, listing.wants))
  );
}
