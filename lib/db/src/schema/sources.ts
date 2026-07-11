import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sourcesTable = pgTable("sources", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  lastScanned: text("last_scanned"),
  postCount: integer("post_count").notNull().default(0),
  newPostsCount: integer("new_posts_count").notNull().default(0),
  status: text("status").notNull().default("idle"),
});

export const insertSourceSchema = createInsertSchema(sourcesTable).omit({ id: true });
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sourcesTable.$inferSelect;
