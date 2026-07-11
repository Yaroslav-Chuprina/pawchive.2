import { pgTable, text, serial, integer, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mediaItemsTable = pgTable("media_items", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  filename: text("filename").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  url: text("url"),
  localPath: text("local_path"),
  fileSize: bigint("file_size", { mode: "number" }),
  status: text("status").notNull().default("available"),
  thumbnailUrl: text("thumbnail_url"),
});

export const insertMediaItemSchema = createInsertSchema(mediaItemsTable).omit({ id: true });
export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItemsTable.$inferSelect;
