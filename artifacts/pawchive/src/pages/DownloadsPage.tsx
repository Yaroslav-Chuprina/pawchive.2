import { useListDownloads, useGetDownloadStats } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";

export default function DownloadsPage() {
  const { data: stats } = useGetDownloadStats();
  const { data: downloads } = useListDownloads();

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Downloads</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: stats?.total || 0 },
          { label: "Queued", value: stats?.queued || 0 },
          { label: "Running", value: stats?.running || 0, highlight: true },
          { label: "Done", value: stats?.done || 0 },
          { label: "Error", value: stats?.error || 0, error: true }
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
              <div className={`text-2xl font-bold mt-1 ${s.highlight ? 'text-primary' : s.error ? 'text-destructive' : ''}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
          <h2 className="font-semibold">Queue</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-0">
            {downloads?.map(d => (
              <div key={d.id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                <div className="w-24 shrink-0">
                  <Badge variant={d.status === 'running' ? 'default' : d.status === 'error' ? 'destructive' : 'secondary'} className={d.status === 'running' ? 'animate-pulse' : ''}>
                    {d.status}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{d.filename || "Unknown file"}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.post_title} • {d.author}</div>
                  {d.status === 'running' && (
                    <Progress value={d.progress || 0} className="h-1.5 mt-2" />
                  )}
                  {d.error_message && (
                    <div className="text-xs text-destructive mt-1">{d.error_message}</div>
                  )}
                </div>
                <div className="w-32 text-right text-xs text-muted-foreground shrink-0">
                  {d.completed_at ? new Date(d.completed_at).toLocaleTimeString() : new Date(d.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {!downloads?.length && (
              <div className="p-8 text-center text-muted-foreground">Queue is empty</div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}