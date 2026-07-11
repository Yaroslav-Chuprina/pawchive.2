import { useState, useMemo, useCallback } from "react";
import {
  useListPosts,
  useGetPost,
  useGetPostMedia,
  useQueueDownload,
  useUpdateMediaStatus,
  useListSources,
  useAcknowledgeSource,
  getListPostsQueryKey,
  getGetPostQueryKey,
  getGetPostMediaQueryKey,
  getListDownloadsQueryKey,
  getGetDownloadStatsQueryKey,
  getListSourcesQueryKey,
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  Image as ImageIcon,
  Search,
  Download,
  FileVideo,
  FileAudio,
  File,
  CheckCircle2,
  Clock,
  Circle,
  Check,
  X,
  User,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  new: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  partial: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  saved: "text-green-400 border-green-400/40 bg-green-400/10",
};

function MediaStatusIcon({ status }: { status: string }) {
  if (status === "done")
    return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
  if (status === "queued" || status === "downloading")
    return <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
  return <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />;
}

function MediaTypeIcon({ type }: { type: string }) {
  if (type === "video") return <FileVideo className="w-5 h-5 text-muted-foreground" />;
  if (type === "audio") return <FileAudio className="w-5 h-5 text-muted-foreground" />;
  if (type === "image") return <ImageIcon className="w-5 h-5 text-muted-foreground" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export default function PostsPage() {
  const [search, setSearch] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Set<number>>(new Set());

  const qc = useQueryClient();
  const { toast } = useToast();

  const acknowledge = useAcknowledgeSource();

  const { data: sources } = useListSources();
  const { data: posts, isLoading: postsLoading } = useListPosts(
    { search, author: selectedAuthor ?? undefined },
    { query: { queryKey: getListPostsQueryKey({ search, author: selectedAuthor ?? undefined }) } }
  );

  const activeId = selectedId ?? (posts?.[0]?.id ?? null);

  const { data: post, isLoading: postLoading } = useGetPost(activeId as number, {
    query: { enabled: !!activeId, queryKey: getGetPostQueryKey(activeId as number) },
  });
  const { data: media, refetch: refetchMedia } = useGetPostMedia(activeId as number, {
    query: { enabled: !!activeId, queryKey: getGetPostMediaQueryKey(activeId as number) },
  });

  const queue = useQueueDownload();
  const updateMedia = useUpdateMediaStatus();

  const toggleMedia = useCallback((id: number) => {
    setSelectedMedia((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => setSelectedMedia(new Set(media?.map((m) => m.id) ?? []));
  const clearSelection = () => setSelectedMedia(new Set());

  const handleQueueItems = async (mediaIds: number[]) => {
    if (!activeId || !mediaIds.length) return;
    let count = 0;
    for (const mid of mediaIds) {
      await new Promise<void>((resolve) => {
        queue.mutate(
          { data: { post_id: activeId, media_item_id: mid } },
          {
            onSuccess: () => { count++; resolve(); },
            onError: () => resolve(),
          }
        );
      });
    }
    qc.invalidateQueries({ queryKey: getGetPostMediaQueryKey(activeId) });
    qc.invalidateQueries({ queryKey: getListDownloadsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDownloadStatsQueryKey() });
    refetchMedia();
    toast({ title: `${count} item${count !== 1 ? "s" : ""} queued for download` });
    clearSelection();
  };

  const handleQueueSelected = () => handleQueueItems(Array.from(selectedMedia));
  const handleQueueAll = () => {
    const available = media?.filter((m) => m.status === "available").map((m) => m.id) ?? [];
    if (!available.length) {
      if (!activeId) return;
      queue.mutate({ data: { post_id: activeId } }, {
        onSuccess: () => {
          refetchMedia();
          qc.invalidateQueries({ queryKey: getListDownloadsQueryKey() });
          toast({ title: "All media queued" });
        },
      });
    } else {
      handleQueueItems(available);
    }
  };

  const handleMarkSaved = (mediaId: number, postId: number) => {
    updateMedia.mutate(
      { id: postId, mediaId, data: { status: "done" } },
      {
        onSuccess: () => {
          refetchMedia();
          toast({ title: "Marked as saved" });
        },
      }
    );
  };

  const savedCount = media?.filter((m) => m.status === "done").length ?? 0;
  const availableCount = media?.filter((m) => m.status === "available").length ?? 0;

  // Unique authors from sources for quick-bar
  const authorChips = useMemo(() => {
    const seen = new Set<string>();
    return (sources ?? []).filter((s) => {
      if (seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    });
  }, [sources]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">

      {/* ── Author quick-bar ───────────────────────────────────── */}
      {authorChips.length > 0 && (
        <div className="shrink-0 border-b border-border/60 bg-card/30 px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <User className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          <button
            onClick={() => { setSelectedAuthor(null); setSelectedId(null); }}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedAuthor === null
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            data-testid="author-chip-all"
          >
            All
          </button>
          {authorChips.map((source) => {
            const hasNew = (source.new_posts_count ?? 0) > 0;
            const isActive = selectedAuthor === source.name;
            return (
              <button
                key={source.id}
                onClick={() => {
                  setSelectedAuthor(isActive ? null : source.name);
                  setSelectedId(null);
                  if (hasNew) {
                    acknowledge.mutate({ id: source.id }, {
                      onSuccess: () => qc.invalidateQueries({ queryKey: getListSourcesQueryKey() }),
                    });
                  }
                }}
                className={`relative shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-testid={`author-chip-${source.id}`}
              >
                {/* New-posts badge dot */}
                {hasNew && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 text-[9px] font-bold text-white px-0.5 shadow">
                    {source.new_posts_count}
                  </span>
                )}
                {source.name}
                <span className={`text-[10px] tabular-nums ${isActive ? "opacity-75" : "opacity-50"}`}>
                  {source.post_count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main split ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Post list */}
        <div className="w-[300px] shrink-0 border-r border-border/60 flex flex-col bg-card/20">
          <div className="p-3 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                placeholder="Search posts…"
                className="pl-8 h-8 text-sm bg-background/60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-posts"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {postsLoading ? (
              <div className="p-3 space-y-2">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
              </div>
            ) : posts?.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No posts found</div>
            ) : (
              <div className="p-2 space-y-0.5">
                {posts?.map((p) => {
                  const isActive = activeId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedId(p.id); setSelectedMedia(new Set()); }}
                      data-testid={`btn-select-post-${p.id}`}
                      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <div className="font-medium text-sm leading-snug truncate">{p.title || "Untitled"}</div>
                      <div className={`flex items-center justify-between mt-1 gap-1 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        <span className="text-xs truncate">{p.author} · {new Date(p.post_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${isActive ? "border-white/20 text-white/80" : STATUS_COLORS[p.status] ?? "border-border text-muted-foreground"}`}>
                          {p.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Post detail */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
          {postLoading && activeId ? (
            <div className="p-8 space-y-4 max-w-3xl">
              <Skeleton className="h-7 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-56 w-full" />
            </div>
          ) : !post ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a post to view
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-7 max-w-4xl space-y-7">

                {/* Title + meta */}
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight leading-tight mb-2">{post.title || "Untitled"}</h1>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{new Date(post.post_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                      data-testid="link-original-post"
                    >
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[post.status] ?? ""}`}>
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Preview */}
                {post.preview_url && (
                  <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/30 max-h-80 flex items-center justify-center">
                    <img
                      src={post.preview_url}
                      alt="Preview"
                      className="max-h-80 max-w-full object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}

                {/* Media section */}
                {(media?.length ?? 0) > 0 && (
                  <div>
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Media</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {media!.length} files · {savedCount} saved · {availableCount} available
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedMedia.size > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">{selectedMedia.size} selected</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={clearSelection}
                              data-testid="btn-clear-selection"
                            >
                              <X className="w-3 h-3 mr-1" /> Clear
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={handleQueueSelected}
                              disabled={queue.isPending}
                              data-testid="btn-queue-selected"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Queue {selectedMedia.size}
                            </Button>
                          </>
                        )}
                        {selectedMedia.size === 0 && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              onClick={selectAll}
                              data-testid="btn-select-all"
                            >
                              Select all
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs"
                              onClick={handleQueueAll}
                              disabled={queue.isPending}
                              data-testid="btn-download-all"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Queue all
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Media grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {media!.map((m) => {
                        const isSelected = selectedMedia.has(m.id);
                        const isSaved = m.status === "done";
                        const isQueued = m.status === "queued" || m.status === "downloading";

                        return (
                          <div
                            key={m.id}
                            className={`relative group rounded-md border transition-all cursor-pointer overflow-hidden ${
                              isSelected
                                ? "border-primary ring-1 ring-primary bg-primary/5"
                                : isSaved
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-border/50 bg-card/40 hover:border-border"
                            }`}
                            onClick={() => !isSaved && toggleMedia(m.id)}
                            data-testid={`media-item-${m.id}`}
                          >
                            {/* Thumbnail or icon */}
                            <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
                              {m.thumbnail_url || (m.media_type === "image" && m.url) ? (
                                <img
                                  src={m.thumbnail_url ?? m.url ?? ""}
                                  alt={m.filename}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <MediaTypeIcon type={m.media_type} />
                              )}
                            </div>

                            {/* Status overlay top-right */}
                            <div className="absolute top-1.5 right-1.5">
                              {isSaved ? (
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : isQueued ? (
                                <div className="w-5 h-5 rounded-full bg-amber-500/80 flex items-center justify-center shadow">
                                  <Clock className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-white/40 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>

                            {/* Bottom info */}
                            <div className="px-2 py-1.5 border-t border-border/30">
                              <div className="text-[11px] text-muted-foreground truncate leading-tight" title={m.filename}>
                                {m.filename}
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                                  {m.media_type}
                                </span>
                                {isSaved ? (
                                  <span className="text-[10px] text-green-400">saved</span>
                                ) : isQueued ? (
                                  <span className="text-[10px] text-amber-400">queued</span>
                                ) : (
                                  <button
                                    className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
                                    onClick={(e) => { e.stopPropagation(); handleMarkSaved(m.id, m.post_id); }}
                                    data-testid={`btn-mark-saved-${m.id}`}
                                    title="Mark as already saved"
                                  >
                                    mark saved
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Saved path tooltip on hover */}
                            {(isSaved || isQueued) && m.local_path && (
                              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform bg-black/80 text-[10px] text-white/70 px-2 py-1 truncate z-10 rounded-b-md">
                                {m.local_path}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Body text */}
                {post.body_text && (
                  <div className="border-t border-border/40 pt-6">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.body_text}</p>
                  </div>
                )}

              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
