import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadTasksTable = pgTable("download_tasks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  postTitle: text("post_title"),
  author: text("author"),
  mediaItemId: integer("media_item_id"),
  filename: text("filename"),
  status: text("status").notNull().default("queued"),
  progress: integer("progress"),
  errorMessage: text("error_message"),
  localPath: text("local_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertDownloadTaskSchema = createInsertSchema(downloadTasksTable).omit({ id: true, createdAt: true });
export type InsertDownloadTask = z.infer<typeof insertDownloadTaskSchema>;
export type DownloadTask = typeof downloadTasksTable.$inferSelect;
