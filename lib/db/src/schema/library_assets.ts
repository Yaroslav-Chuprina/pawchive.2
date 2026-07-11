import { pgTable, text, serial, integer, bigint, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const libraryAssetsTable = pgTable("library_assets", {
  id: serial("id").primaryKey(),
  postId: integer("post_id"),
  postTitle: text("post_title"),
  author: text("author"),
  filename: text("filename").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  localPath: text("local_path"),
  fileSize: bigint("file_size", { mode: "number" }),
  status: text("status").notNull().default("available"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLibraryAssetSchema = createInsertSchema(libraryAssetsTable).omit({ id: true, createdAt: true });
export type InsertLibraryAsset = z.infer<typeof insertLibraryAssetSchema>;
export type LibraryAsset = typeof libraryAssetsTable.$inferSelect;
