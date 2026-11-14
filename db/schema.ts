import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  salt: text("salt").notNull(),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  wants: text("wants").notNull().default(""),
  availability: text("availability").notNull().default("Weekends"),
  created: integer("created").notNull(),
});
export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expires: integer("expires").notNull(),
});
export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(),
  mode: text("mode").notNull(),
  description: text("description").notNull(),
  wants: text("wants").notNull(),
  created: integer("created").notNull(),
});
export const exchanges = sqliteTable("exchanges", {
  id: text("id").primaryKey(),
  fromId: text("from_id")
    .notNull()
    .references(() => users.id),
  toId: text("to_id")
    .notNull()
    .references(() => users.id),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id),
  offer: text("offer").notNull(),
  note: text("note").notNull(),
  date: text("date").notNull(),
  duration: integer("duration").notNull(),
  status: text("status").notNull().default("pending"),
  fromDone: integer("from_done").notNull().default(0),
  toDone: integer("to_done").notNull().default(0),
  created: integer("created").notNull(),
});
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  exchangeId: text("exchange_id")
    .notNull()
    .references(() => exchanges.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
});
export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  targetId: text("target_id")
    .notNull()
    .references(() => users.id),
});
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  targetId: text("target_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  created: integer("created").notNull(),
});
