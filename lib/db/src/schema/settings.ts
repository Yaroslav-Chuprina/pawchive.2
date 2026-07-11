import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  downloadPath: text("download_path").notNull().default("/downloads"),
  libraryPath: text("library_path").notNull().default("/library"),
  appVersion: text("app_version").notNull().default("0.1.0"),
  maxConcurrentDownloads: integer("max_concurrent_downloads").notNull().default(3),
  autoScan: boolean("auto_scan").notNull().default(false),
  autoScanInterval: integer("auto_scan_interval"),
  patreonAccessToken: text("patreon_access_token"),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
