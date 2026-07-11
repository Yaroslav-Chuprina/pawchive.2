import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  title: text("title").notNull(),
  bodyText: text("body_text"),
  postUrl: text("post_url").notNull(),
  postDate: text("post_date").notNull(),
  previewUrl: text("preview_url"),
  mediaCount: integer("media_count").notNull().default(0),
  downloadedCount: integer("downloaded_count").notNull().default(0),
  status: text("status").notNull().default("new"),
  tags: text("tags"),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
