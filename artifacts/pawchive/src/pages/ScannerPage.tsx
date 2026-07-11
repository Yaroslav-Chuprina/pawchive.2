import { useState, useRef } from "react";
import {
  useStartScan,
  useListSources,
  useGetScanLog,
  useGetPostStats,
  getListPostsQueryKey,
  getGetPostStatsQueryKey,
  getGetScanLogQueryKey,
  getListSourcesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Search, Radio, AlertCircle, CheckCircle } from "lucide-react";

const URL_EXAMPLES = [
  "https://pawchive.st/patreon/user/66979515",
  "https://www.patreon.com/user?u=66979515",
];

export default function ScannerPage() {
  const [url, setUrl] = useState("");
  const [scanResult, setScanResult] = useState<{ discovered: number; new_posts: number; source_name: string } | null>(null);
  const queryClient = useQueryClient();
  const logRef = useRef<HTMLDivElement>(null);

  const scan = useStartScan();
  const { data: sources, refetch: refetchSources } = useListSources();
  const { data: logs, refetch: refetchLogs } = useGetScanLog();
  const { data: stats } = useGetPostStats();
  const { toast } = useToast();

  const handleScan = () => {
    if (!url.trim()) return;
    setScanResult(null);
    scan.mutate(
      { data: { url: url.trim() } },
      {
        onSuccess: (res) => {
          setScanResult({ ...res, new_posts: res.new_posts ?? 0 });
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPostStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListSourcesQueryKey() });
          refetchSources();
          refetchLogs();

          if ((res.new_posts ?? 0) > 0) {
            toast({
              title: `Scan complete`,
              description: `${res.new_posts} new posts added from ${res.source_name}.`,
            });
          } else if (res.discovered > 0) {
            toast({
              title: "Already up to date",
              description: `All ${res.discovered} posts from ${res.source_name} are already archived.`,
            });
          } else {
            toast({
              title: "Scan finished",
              description: res.discovered === 0 ? "Check log for details." : `${res.discovered} posts found.`,
              variant: res.discovered === 0 ? "destructive" : "default",
            });
          }
        },
        onError: () => {
          toast({ title: "Scan failed", description: "Check the log for details.", variant: "destructive" });
          refetchLogs();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleScan();
  };

  const hasError = logs?.some((l) => l.level === "error") && !scan.isPending;

  return (
    <div className="flex flex-col h-full p-8 gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add a creator source and scan for new posts.
        </p>
      </div>

      {/* Input card */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-3">
            <Input
              placeholder="pawchive.st/patreon/user/66979515  or  patreon.com/user?u=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              data-testid="input-scan-url"
              className="font-mono text-sm"
              disabled={scan.isPending}
            />
            <Button
              onClick={handleScan}
              disabled={scan.isPending || !url.trim()}
              data-testid="btn-start-scan"
              className="shrink-0"
            >
              {scan.isPending ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Scanning…</>
              ) : (
                <><Search className="w-4 h-4 mr-2" />Scan</>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { refetchSources(); refetchLogs(); }}
              data-testid="btn-refresh"
              className="shrink-0"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Status chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {sources?.length ?? 0} {sources?.length === 1 ? "source" : "sources"}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats?.total ?? 0} posts archived
            </Badge>
            {stats?.new_count ? (
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30">
                {stats.new_count} new
              </Badge>
            ) : null}
            {scan.isPending && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                <Radio className="w-3 h-3" /> Scanning in progress — this may take a minute for large archives…
              </span>
            )}
            {scanResult && !scan.isPending && (
              <span className="flex items-center gap-1.5 text-xs">
                {scanResult.new_posts > 0 ? (
                  <><CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-green-400">{scanResult.new_posts} new posts added from {scanResult.source_name}</span></>
                ) : (
                  <><CheckCircle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Already up to date ({scanResult.discovered} posts)</span></>
                )}
              </span>
            )}
          </div>

          {/* URL format hint */}
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <span className="shrink-0 mt-0.5 opacity-50">Accepted formats:</span>
            <div className="flex flex-wrap gap-2">
              {URL_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  className="font-mono px-1.5 py-0.5 rounded bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => setUrl(ex)}
                  data-testid={`example-url-${ex}`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: sources + log */}
      <div className="flex-1 grid grid-cols-5 gap-6 min-h-0">
        {/* Sources — wider */}
        <Card className="col-span-3 flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Known Sources</CardTitle>
            {!sources?.length && (
              <CardDescription>No sources yet. Paste a creator URL above and click Scan.</CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-5 pb-5">
              <div className="space-y-2">
                {sources?.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3 rounded-md border border-border/50 bg-card/40 hover:bg-card/70 transition-colors"
                    data-testid={`source-row-${s.id}`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm leading-snug">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{s.url}</div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <Badge variant="secondary" className="text-xs">{s.post_count} posts</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.last_scanned
                          ? new Date(s.last_scanned).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                          : "Never"}
                      </div>
                    </div>
                  </div>
                ))}
                {!sources?.length && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No sources scanned yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Scan log — narrower, secondary */}
        <Card className="col-span-2 flex flex-col min-h-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scan Log</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => refetchLogs()}
                data-testid="btn-refresh-log"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div ref={logRef} className="px-4 pb-4 space-y-1.5 font-mono text-xs">
                {logs?.map((l, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 leading-relaxed ${
                      l.level === "error"
                        ? "text-red-400"
                        : l.level === "warn"
                        ? "text-amber-400"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`log-entry-${i}`}
                  >
                    <span className="opacity-40 shrink-0 tabular-nums">
                      {new Date(l.timestamp).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="break-words">{l.message}</span>
                  </div>
                ))}
                {!logs?.length && (
                  <div className="text-muted-foreground/40 py-4 text-center">No log entries.</div>
                )}
                {scan.isPending && (
                  <div className="flex gap-2 text-muted-foreground animate-pulse">
                    <span className="opacity-40">—</span>
                    <span>Working…</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
