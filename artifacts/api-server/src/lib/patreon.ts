/**
 * pawchive.st archive API client (kemono-style public API, no auth required)
 *
 * Base: https://pawchive.st/api/v1
 * Endpoints used:
 *   GET /api/v1/{service}/user/{user_id}/profile
 *   GET /api/v1/{service}/user/{user_id}/posts?o={offset}
 */
import { logger } from "./logger";

const BASE = "https://pawchive.st";
const API = `${BASE}/api/v1`;

const HEADERS: HeadersInit = {
  "User-Agent": "Pawchive/0.1.0",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArchiveCreator {
  id: string;
  name: string;
  service: string;
  indexed: string;
  updated: string;
}

export interface ArchivePost {
  id: string;
  user: string;
  service: string;
  title: string;
  content: string | null;
  published: string;
  added: string;
  file: { name?: string; path?: string } | null;
  attachments: Array<{ name: string; path: string }>;
}

// ─── URL parser ───────────────────────────────────────────────────────────────

export interface ParsedArchiveUrl {
  service: string;   // e.g. "patreon"
  userId: string;    // e.g. "66979515"
}

/**
 * Parse URLs like:
 *   https://pawchive.st/patreon/user/66979515
 *   https://coomer.su/patreon/user/66979515
 *   66979515                    (bare ID, defaults to patreon)
 */
export function parseArchiveUrl(input: string): ParsedArchiveUrl | null {
  const trimmed = input.trim();

  // Bare numeric ID — assume Patreon
  if (/^\d+$/.test(trimmed)) {
    return { service: "patreon", userId: trimmed };
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

    // /{service}/user/{userId}
    const m = url.pathname.match(/^\/([^/]+)\/user\/(\d+)/);
    if (m) return { service: m[1], userId: m[2] };

    // /api/v1/{service}/user/{userId}
    const m2 = url.pathname.match(/\/api\/v1\/([^/]+)\/user\/(\d+)/);
    if (m2) return { service: m2[1], userId: m2[2] };
  } catch {
    // fall through
  }

  return null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchCreatorProfile(
  service: string,
  userId: string
): Promise<ArchiveCreator | null> {
  const url = `${API}/${service}/user/${userId}/profile`;
  logger.info({ url }, "Fetching archive creator profile");

  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) {
    logger.warn({ status: resp.status, url }, "Creator profile not found");
    return null;
  }

  const data = await resp.json() as ArchiveCreator;
  return data;
}

export async function fetchPostsPage(
  service: string,
  userId: string,
  offset: number
): Promise<ArchivePost[]> {
  const url = `${API}/${service}/user/${userId}/posts?o=${offset}`;
  logger.info({ url, offset }, "Fetching archive posts page");

  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) {
    logger.warn({ status: resp.status, url }, "Failed to fetch posts page");
    return [];
  }

  return resp.json() as Promise<ArchivePost[]>;
}

/**
 * Fetch ALL posts for a creator by walking offset-based pages.
 * Each page returns up to 50 posts; stops when a page returns fewer than 50.
 */
export async function fetchAllPosts(
  service: string,
  userId: string,
  onProgress?: (fetched: number) => void
): Promise<ArchivePost[]> {
  const all: ArchivePost[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchPostsPage(service, userId, offset);
    if (!page.length) break;

    all.push(...page);
    onProgress?.(all.length);
    logger.info({ offset, page_count: page.length, total: all.length }, "Fetched page");

    if (page.length < 50) break;   // last page
    offset += 50;

    // Small polite delay to avoid hammering the archive
    await new Promise((r) => setTimeout(r, 150));
  }

  logger.info({ total: all.length, service, userId }, "All posts fetched");
  return all;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function mediaUrl(path: string): string {
  return `${BASE}/data${path}`;
}

export function postUrl(service: string, userId: string, postId: string): string {
  return `${BASE}/${service}/user/${userId}/post/${postId}`;
}

export function guessMediaType(filename: string): "image" | "video" | "audio" | "file" {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "tiff"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm", "m4v", "flv"].includes(ext)) return "video";
  if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) return "audio";
  return "file";
}
