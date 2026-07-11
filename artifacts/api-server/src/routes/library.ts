import { Router, type IRouter } from "express";
import { eq, desc, asc } from "drizzle-orm";
import { db, libraryAssetsTable } from "@workspace/db";
import { ListLibraryResponse, GetLibraryAssetResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/library", async (req, res): Promise<void> => {
  const { search, sort, author } = req.query as Record<string, string | undefined>;

  let rows = await db.select().from(libraryAssetsTable).orderBy(desc(libraryAssetsTable.createdAt));

  if (search) {
    rows = rows.filter(
      (r) =>
        r.filename.toLowerCase().includes(search.toLowerCase()) ||
        (r.postTitle ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.author ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }
  if (author) {
    rows = rows.filter((r) => (r.author ?? "").toLowerCase().includes(author.toLowerCase()));
  }
  if (sort === "filename") {
    rows = rows.sort((a, b) => a.filename.localeCompare(b.filename));
  } else if (sort === "author") {
    rows = rows.sort((a, b) => (a.author ?? "").localeCompare(b.author ?? ""));
  } else if (sort === "size") {
    rows = rows.sort((a, b) => (b.fileSize ?? 0) - (a.fileSize ?? 0));
  }

  res.json(ListLibraryResponse.parse(rows.map((r) => ({
    id: r.id,
    post_id: r.postId,
    post_title: r.postTitle,
    author: r.author,
    filename: r.filename,
    media_type: r.mediaType,
    local_path: r.localPath,
    file_size: r.fileSize,
    status: r.status,
    thumbnail_url: r.thumbnailUrl,
    created_at: r.createdAt.toISOString(),
  }))));
});

router.get("/library/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [asset] = await db.select().from(libraryAssetsTable).where(eq(libraryAssetsTable.id, id));
  if (!asset) {
    res.status(404).json({ error: "Library asset not found" });
    return;
  }

  res.json(GetLibraryAssetResponse.parse({
    id: asset.id,
    post_id: asset.postId,
    post_title: asset.postTitle,
    author: asset.author,
    filename: asset.filename,
    media_type: asset.mediaType,
    local_path: asset.localPath,
    file_size: asset.fileSize,
    status: asset.status,
    thumbnail_url: asset.thumbnailUrl,
    created_at: asset.createdAt.toISOString(),
  }));
});

export default router;
