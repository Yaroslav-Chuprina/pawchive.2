import { Link, useLocation } from "wouter";
import { Search, List, Download, Folder, Settings, Database } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/posts", icon: List, label: "Posts" },
    { href: "/scanner", icon: Search, label: "Scanner" },
    { href: "/downloads", icon: Download, label: "Downloads" },
    { href: "/library", icon: Folder, label: "Library" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2">
        <Database className="w-5 h-5 text-primary" />
        <span className="font-semibold text-lg tracking-tight">Pawchive</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href || (location === "/" && link.href === "/posts");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              data-testid={`nav-${link.label.toLowerCase()}`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}