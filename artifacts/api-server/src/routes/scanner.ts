import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, sourcesTable, postsTable, mediaItemsTable, scanLogTable } from "@workspace/db";
import { ListSourcesResponse, StartScanResponse, GetScanLogResponse } from "@workspace/api-zod";
import {
  parseArchiveUrl,
  fetchCreatorProfile,
  fetchAllPosts,
  mediaUrl,
  postUrl,
  guessMediaType,
} from "../lib/patreon";

const router: IRouter = Router();

async function addLog(level: string, message: string) {
  await db.insert(scanLogTable).values({ level, message });
}

function sourceToWire(s: typeof sourcesTable.$inferSelect) {
  return {
    id: s.id,
    url: s.url,
    name: s.name,
    last_scanned: s.lastScanned,
    post_count: s.postCount,
    new_posts_count: s.newPostsCount,
    status: s.status,
  };
}

router.get("/scanner/sources", async (_req, res): Promise<void> => {
  const rows = await db.select().from(sourcesTable);
  res.json(ListSourcesResponse.parse(rows.map(sourceToWire)));
});

// Acknowledge new posts for a source (resets the new_posts_count badge)
router.patch("/scanner/sources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [updated] = await db
    .update(sourcesTable)
    .set({ newPostsCount: 0 })
    .where(eq(sourcesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Source not found" }); return; }
  res.json(sourceToWire(updated));
});

router.post("/scanner/scan", async (req, res): Promise<void> => {
  const { url } = req.body as { url?: string };
  if (!url) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  const log: { timestamp: string; level: string; message: string }[] = [];

  const push = async (level: string, message: string) => {
    log.push({ timestamp: new Date().toISOString(), level, message });
    await addLog(level, message);
  };

  await push("info", `Scan started: ${url}`);

  const parsed = parseArchiveUrl(url);
  if (!parsed) {
    await push("error", `Unrecognised URL format. Expected: pawchive.st/patreon/user/{id}`);
    res.json(StartScanResponse.parse({ discovered: 0, source_name: url, new_posts: 0, log }));
    return;
  }

  const { service, userId } = parsed;
  await push("info", `Resolved — service: ${service}, user ID: ${userId}`);

  const profile = await fetchCreatorProfile(service, userId);
  const creatorName = profile?.name ?? `${service}:${userId}`;
  const sourceUrl = `https://pawchive.st/${service}/user/${userId}`;

  await push("info", `Creator: ${creatorName}`);

  const [existingSource] = await db.select().from(sourcesTable).where(eq(sourcesTable.url, sourceUrl));
  let source;
  if (existingSource) {
    [source] = await db
      .update(sourcesTable)
      .set({ name: creatorName, status: "scanning", lastScanned: new Date().toISOString() })
      .where(eq(sourcesTable.id, existingSource.id))
      .returning();
  } else {
    [source] = await db
      .insert(sourcesTable)
      .values({ url: sourceUrl, name: creatorName, status: "scanning", lastScanned: new Date().toISOString(), postCount: 0, newPostsCount: 0 })
      .returning();
  }

  const existingPosts = await db.select({ postUrl: postsTable.postUrl }).from(postsTable);
  const existingUrls = new Set(existingPosts.map((p) => p.postUrl));

  await push("info", `${existingUrls.size} posts already archived — fetching all pages...`);

  let lastLoggedAt = 0;
  const allPosts = await fetchAllPosts(service, userId, async (fetched) => {
    if (fetched - lastLoggedAt >= 50) {
      await addLog("info", `Fetched ${fetched} posts so far...`);
      lastLoggedAt = fetched;
    }
  });

  await push("info", `Fetched ${allPosts.length} total posts from archive`);

  let newCount = 0;

  for (const post of allPosts) {
    const pUrl = postUrl(service, userId, post.id);
    if (existingUrls.has(pUrl)) continue;

    const mediaFiles: Array<{ name: string; path: string }> = [];
    if (post.file?.path && post.file?.name) {
      mediaFiles.push({ name: post.file.name, path: post.file.path });
    }
    for (const a of post.attachments ?? []) {
      if (a.path && a.name) mediaFiles.push({ name: a.name, path: a.path });
    }

    let previewUrl: string | null = null;
    for (const mf of mediaFiles) {
      if (guessMediaType(mf.name) === "image") {
        previewUrl = mediaUrl(mf.path);
        break;
      }
    }

    const bodyText = post.content
      ? post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000)
      : null;

    const [inserted] = await db.insert(postsTable).values({
      author: creatorName,
      title: post.title || "(Untitled)",
      bodyText,
      postUrl: pUrl,
      postDate: (post.published ?? post.added ?? new Date().toISOString()).slice(0, 10),
      previewUrl,
      mediaCount: mediaFiles.length,
      downloadedCount: 0,
      status: "new",
      tags: service,
    }).returning();

    for (const mf of mediaFiles) {
      const mt = guessMediaType(mf.name);
      await db.insert(mediaItemsTable).values({
        postId: inserted.id,
        filename: mf.name,
        mediaType: mt,
        url: mediaUrl(mf.path),
        localPath: null,
        fileSize: null,
        status: "available",
        thumbnailUrl: mt === "image" ? mediaUrl(mf.path) : null,
      });
    }

    newCount++;
    existingUrls.add(pUrl);
  }

  // Update source stats — accumulate new_posts_count so badge keeps growing until acknowledged
  await db.update(sourcesTable).set({
    postCount: allPosts.length,
    status: "idle",
    lastScanned: new Date().toISOString(),
    newPostsCount: (existingSource?.newPostsCount ?? 0) + newCount,
  }).where(eq(sourcesTable.id, source.id));

  const skipped = allPosts.length - newCount;
  if (newCount > 0) {
    await push("info", `Done — ${newCount} new posts added${skipped > 0 ? `, ${skipped} already archived` : ""}`);
  } else {
    await push("info", `Already up to date — all ${allPosts.length} posts already archived`);
  }

  res.json(StartScanResponse.parse({
    discovered: allPosts.length,
    source_name: creatorName,
    new_posts: newCount,
    log,
  }));
});

router.get("/scanner/log", async (_req, res): Promise<void> => {
  const rows = await db.select().from(scanLogTable).orderBy(desc(scanLogTable.timestamp)).limit(100);
  res.json(GetScanLogResponse.parse(rows.map((r) => ({
    timestamp: r.timestamp.toISOString(),
    level: r.level,
    message: r.message,
  }))));
});

export default router;
