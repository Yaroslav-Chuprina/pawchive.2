import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: settings } = useGetSettings();
  const update = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    download_path: "",
    library_path: "",
    max_concurrent_downloads: 3,
    auto_scan: false,
    auto_scan_interval: 24,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        download_path: settings.download_path || "",
        library_path: settings.library_path || "",
        max_concurrent_downloads: settings.max_concurrent_downloads || 3,
        auto_scan: settings.auto_scan || false,
        auto_scan_interval: settings.auto_scan_interval || 24,
      });
    }
  }, [settings]);

  const handleSave = () => {
    update.mutate(
      { data: form },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast({ title: "Settings saved" });
        },
      }
    );
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure local paths and download preferences.</p>
      </div>

      {/* Storage Paths */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Paths</CardTitle>
          <CardDescription>Where Pawchive saves your files locally</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="download-path">Download Path</Label>
            <Input
              id="download-path"
              value={form.download_path}
              onChange={(e) => setForm({ ...form, download_path: e.target.value })}
              data-testid="input-download-path"
              placeholder="/home/user/pawchive/downloads"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="library-path">Library Path</Label>
            <Input
              id="library-path"
              value={form.library_path}
              onChange={(e) => setForm({ ...form, library_path: e.target.value })}
              data-testid="input-library-path"
              placeholder="/home/user/pawchive/library"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            Pawchive scans archives at{" "}
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">pawchive.st</span>.
            Paste a creator URL in the Scanner to add a source — no credentials required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="font-mono text-xs bg-muted/50 rounded px-3 py-2 space-y-1">
              <div>pawchive.st/patreon/user/66979515</div>
              <div>pawchive.st/fanbox/user/12345678</div>
              <div>pawchive.st/gumroad/user/creator</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Download Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-downloads">Max Concurrent Downloads</Label>
            <Input
              id="max-downloads"
              type="number"
              min="1"
              max="10"
              value={form.max_concurrent_downloads}
              onChange={(e) =>
                setForm({ ...form, max_concurrent_downloads: parseInt(e.target.value) || 1 })
              }
              className="w-32"
              data-testid="input-max-downloads"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-scan Sources</Label>
              <div className="text-sm text-muted-foreground">
                Periodically re-check known sources for new posts
              </div>
            </div>
            <Switch
              checked={form.auto_scan}
              onCheckedChange={(c) => setForm({ ...form, auto_scan: c })}
              data-testid="switch-auto-scan"
            />
          </div>
          {form.auto_scan && (
            <div className="space-y-2">
              <Label htmlFor="scan-interval">Interval (hours)</Label>
              <Input
                id="scan-interval"
                type="number"
                min="1"
                value={form.auto_scan_interval}
                onChange={(e) =>
                  setForm({ ...form, auto_scan_interval: parseInt(e.target.value) || 24 })
                }
                className="w-32"
                data-testid="input-scan-interval"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Pawchive {settings?.app_version || "0.1.0"}</span>
        <Button onClick={handleSave} disabled={update.isPending} data-testid="btn-save-settings">
          {update.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
