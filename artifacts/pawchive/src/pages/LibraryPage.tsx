import { useState } from "react";
import { useListLibrary } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, FolderOpen, ExternalLink, Image as ImageIcon, Video, Music, File } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const { data: library } = useListLibrary({ search });

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8 opacity-50" />;
      case 'video': return <Video className="w-8 h-8 opacity-50" />;
      case 'audio': return <Music className="w-8 h-8 opacity-50" />;
      default: return <File className="w-8 h-8 opacity-50" />;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-library-search"
            />
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-40" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="size">Largest Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
          {library?.map((item) => (
            <div key={item.id} className="group relative rounded-xl border bg-card overflow-hidden hover:border-primary transition-colors flex flex-col">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  getIcon(item.media_type)
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8"><FolderOpen className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-sm font-medium truncate" title={item.filename}>{item.filename}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{item.author}</div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}
                  </Badge>
                  {item.status === 'missing' && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Missing</Badge>}
                </div>
              </div>
            </div>
          ))}
          {!library?.length && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No files found in the library.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}