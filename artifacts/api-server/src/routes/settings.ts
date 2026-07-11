import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { GetSettingsResponse, UpdateSettingsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(settingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(settingsTable).values({
    downloadPath: "/home/user/pawchive/downloads",
    libraryPath: "/home/user/pawchive/library",
    appVersion: "0.1.0",
    maxConcurrentDownloads: 3,
    autoScan: false,
    autoScanInterval: null,
    patreonAccessToken: null,
  }).returning();
  return created;
}

function toResponse(s: typeof settingsTable.$inferSelect) {
  return {
    id: s.id,
    download_path: s.downloadPath,
    library_path: s.libraryPath,
    app_version: s.appVersion,
    max_concurrent_downloads: s.maxConcurrentDownloads,
    auto_scan: s.autoScan,
    auto_scan_interval: s.autoScanInterval,
    patreon_access_token: s.patreonAccessToken ?? null,
  };
}

router.get("/settings", async (_req, res): Promise<void> => {
  const s = await ensureSettings();
  res.json(GetSettingsResponse.parse(toResponse(s)));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const s = await ensureSettings();
  const body = req.body as {
    download_path?: string;
    library_path?: string;
    max_concurrent_downloads?: number;
    auto_scan?: boolean;
    auto_scan_interval?: number | null;
    patreon_access_token?: string | null;
  };

  const updateData: Partial<typeof settingsTable.$inferInsert> = {};
  if (body.download_path !== undefined) updateData.downloadPath = body.download_path;
  if (body.library_path !== undefined) updateData.libraryPath = body.library_path;
  if (body.max_concurrent_downloads !== undefined) updateData.maxConcurrentDownloads = body.max_concurrent_downloads;
  if (body.auto_scan !== undefined) updateData.autoScan = body.auto_scan;
  if ("auto_scan_interval" in body) updateData.autoScanInterval = body.auto_scan_interval ?? null;
  if ("patreon_access_token" in body) updateData.patreonAccessToken = body.patreon_access_token ?? null;

  const [updated] = await db.update(settingsTable)
    .set(updateData)
    .where(eq(settingsTable.id, s.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(toResponse(updated)));
});

export default router;
