import test from "node:test";
import assert from "node:assert/strict";
import { transition, matchScore } from "../lib/domain.mjs";
const e = {
  from_id: "a",
  to_id: "b",
  status: "pending",
  from_done: 0,
  to_done: 0,
};
test("only the recipient can accept a pending request", () => {
  assert.throws(() => transition(e, "a", "accept"));
  assert.throws(() => transition(e, "c", "accept"));
  assert.equal(transition(e, "b", "accept").status, "accepted");
});
test("completion requires both participants", () => {
  const accepted = transition(e, "b", "accept");
  const first = transition(accepted, "a", "complete");
  assert.equal(first.status, "accepted");
  assert.equal(first.from_done, 1);
  assert.equal(transition(first, "b", "complete").status, "completed");
});
test("terminal exchanges cannot be reopened or completed", () => {
  assert.throws(() => transition({ ...e, status: "cancelled" }, "b", "accept"));
  assert.throws(() => transition(e, "a", "complete"));
  assert.throws(() => transition({ ...e, status: "completed" }, "a", "cancel"));
});
test("mutual matches rank above one-way matches", () => {
  assert.equal(
    matchScore(
      { title: "Acoustic guitar", wants: "Java" },
      "Guitar, Photography",
      "Java basics",
    ),
    3,
  );
  assert.equal(
    matchScore(
      { title: "Acoustic guitar", wants: "Spanish" },
      "Guitar",
      "Java",
    ),
    2,
  );
  assert.equal(matchScore({ title: "Guitar", wants: "Java" }, "", ""), 0);
});
