import { Router, type IRouter } from "express";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";
import {
  ListPostsResponse,
  GetPostResponse,
  GetPostStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts/stats", async (_req, res): Promise<void> => {
  const rows = await db.select().from(postsTable);
  const stats = {
    total: rows.length,
    new_count: rows.filter((r) => r.status === "new").length,
    partial_count: rows.filter((r) => r.status === "partial").length,
    saved_count: rows.filter((r) => r.status === "saved").length,
    total_media: rows.reduce((sum, r) => sum + r.mediaCount, 0),
  };
  res.json(GetPostStatsResponse.parse(stats));
});

router.get("/posts", async (req, res): Promise<void> => {
  const { author, search, status } = req.query as Record<string, string | undefined>;

  let rows = await db.select().from(postsTable);

  if (author) {
    rows = rows.filter((r) => r.author.toLowerCase().includes(author.toLowerCase()));
  }
  if (search) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.bodyText ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }
  if (status) {
    rows = rows.filter((r) => r.status === status);
  }

  res.json(ListPostsResponse.parse(rows.map((r) => ({
    id: r.id,
    author: r.author,
    title: r.title,
    body_text: r.bodyText,
    post_url: r.postUrl,
    post_date: r.postDate,
    preview_url: r.previewUrl,
    media_count: r.mediaCount,
    downloaded_count: r.downloadedCount,
    status: r.status,
    tags: r.tags,
  }))));
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(GetPostResponse.parse({
    id: post.id,
    author: post.author,
    title: post.title,
    body_text: post.bodyText,
    post_url: post.postUrl,
    post_date: post.postDate,
    preview_url: post.previewUrl,
    media_count: post.mediaCount,
    downloaded_count: post.downloadedCount,
    status: post.status,
    tags: post.tags,
  }));
});

export default router;
