import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, downloadTasksTable, postsTable, mediaItemsTable, settingsTable } from "@workspace/db";
import {
  ListDownloadsResponse,
  QueueDownloadResponse,
  GetDownloadResponse,
  GetDownloadStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function sanitizePathSegment(name: string): string {
  return name.replace(/[^\w\s.-]/g, "").replace(/\s+/g, "_").replace(/_{2,}/g, "_").slice(0, 64) || "unknown";
}

function toWire(r: typeof downloadTasksTable.$inferSelect) {
  return {
    id: r.id,
    post_id: r.postId,
    post_title: r.postTitle,
    author: r.author,
    media_item_id: r.mediaItemId,
    filename: r.filename,
    status: r.status,
    progress: r.progress,
    error_message: r.errorMessage,
    local_path: r.localPath,
    created_at: r.createdAt.toISOString(),
    completed_at: r.completedAt?.toISOString() ?? null,
  };
}

router.get("/downloads/stats", async (_req, res): Promise<void> => {
  const rows = await db.select().from(downloadTasksTable);
  res.json(GetDownloadStatsResponse.parse({
    total: rows.length,
    queued: rows.filter((r) => r.status === "queued").length,
    running: rows.filter((r) => r.status === "running").length,
    done: rows.filter((r) => r.status === "done").length,
    error: rows.filter((r) => r.status === "error").length,
  }));
});

router.get("/downloads", async (req, res): Promise<void> => {
  const { status } = req.query as { status?: string };
  let rows = await db.select().from(downloadTasksTable).orderBy(desc(downloadTasksTable.createdAt));
  if (status) rows = rows.filter((r) => r.status === status);
  res.json(ListDownloadsResponse.parse(rows.map(toWire)));
});

router.post("/downloads/queue", async (req, res): Promise<void> => {
  const { post_id, media_item_id } = req.body as { post_id?: number; media_item_id?: number | null };
  if (!post_id) { res.status(400).json({ error: "post_id is required" }); return; }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, post_id));
  const [settings] = await db.select().from(settingsTable).limit(1);
  const downloadBase = settings?.downloadPath ?? "/downloads";
  const authorSlug = sanitizePathSegment(post?.author ?? "unknown");

  let filename: string | undefined;
  let mediaItem: typeof mediaItemsTable.$inferSelect | undefined;

  if (media_item_id) {
    const [mi] = await db.select().from(mediaItemsTable).where(eq(mediaItemsTable.id, media_item_id));
    mediaItem = mi;
    filename = mi?.filename;
  }

  const resolvedFilename = filename ?? `post_${post_id}_all.zip`;
  const localPath = `${downloadBase}/${authorSlug}/${resolvedFilename}`;

  const [task] = await db.insert(downloadTasksTable).values({
    postId: post_id,
    postTitle: post?.title,
    author: post?.author,
    mediaItemId: media_item_id ?? null,
    filename: resolvedFilename,
    status: "queued",
    progress: 0,
    localPath,
  }).returning();

  // Mark the specific media item as queued
  if (media_item_id && mediaItem) {
    await db.update(mediaItemsTable)
      .set({ status: "queued", localPath })
      .where(eq(mediaItemsTable.id, media_item_id));
  }

  // If queueing all (no specific media_item_id), mark all media items for this post as queued
  if (!media_item_id) {
    await db.update(mediaItemsTable)
      .set({ status: "queued" })
      .where(eq(mediaItemsTable.postId, post_id));
  }

  res.status(201).json(QueueDownloadResponse.parse(toWire(task)));
});

router.get("/downloads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [task] = await db.select().from(downloadTasksTable).where(eq(downloadTasksTable.id, id));
  if (!task) { res.status(404).json({ error: "Download not found" }); return; }
  res.json(GetDownloadResponse.parse(toWire(task)));
});

export default router;
