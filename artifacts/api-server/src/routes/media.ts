import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, mediaItemsTable } from "@workspace/db";
import { GetPostMediaResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function toWire(m: typeof mediaItemsTable.$inferSelect) {
  return {
    id: m.id,
    post_id: m.postId,
    filename: m.filename,
    media_type: m.mediaType,
    url: m.url,
    local_path: m.localPath,
    file_size: m.fileSize,
    status: m.status,
    thumbnail_url: m.thumbnailUrl,
  };
}

router.get("/posts/:id/media", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const items = await db.select().from(mediaItemsTable).where(eq(mediaItemsTable.postId, id));
  res.json(GetPostMediaResponse.parse(items.map(toWire)));
});

router.patch("/posts/:id/media/:media_id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const rawMid = Array.isArray(req.params.media_id) ? req.params.media_id[0] : req.params.media_id;
  const postId = parseInt(rawId, 10);
  const mediaId = parseInt(rawMid, 10);
  if (isNaN(postId) || isNaN(mediaId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const body = req.body as { status?: string; local_path?: string | null };
  const update: Partial<typeof mediaItemsTable.$inferInsert> = {};
  if (body.status !== undefined) update.status = body.status;
  if ("local_path" in body) update.localPath = body.local_path ?? null;

  const [updated] = await db
    .update(mediaItemsTable)
    .set(update)
    .where(and(eq(mediaItemsTable.id, mediaId), eq(mediaItemsTable.postId, postId)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Media item not found" }); return; }
  res.json(toWire(updated));
});

export default router;
