import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scanLogTable = pgTable("scan_log", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  level: text("level").notNull().default("info"),
  message: text("message").notNull(),
});

export const insertScanLogSchema = createInsertSchema(scanLogTable).omit({ id: true, timestamp: true });
export type InsertScanLog = z.infer<typeof insertScanLogSchema>;
export type ScanLog = typeof scanLogTable.$inferSelect;
