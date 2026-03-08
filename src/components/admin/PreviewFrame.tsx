import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Monitor, Tablet, Smartphone, ExternalLink, X } from "lucide-react";

interface PreviewFrameProps {
  url: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  refreshKey?: number;
}

const VIEWPORTS = [
  { id: "desktop", icon: Monitor, width: "100%", label: "Desktop" },
  { id: "tablet", icon: Tablet, width: "768px", label: "Tablet" },
  { id: "mobile", icon: Smartphone, width: "375px", label: "Mobile" },
] as const;

export function PreviewFrame({ url, open, onOpenChange, title = "Preview", refreshKey = 0 }: PreviewFrameProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const currentVp = VIEWPORTS.find((v) => v.id === viewport)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 flex flex-col">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
          <span className="text-sm font-semibold truncate">{title}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
              {VIEWPORTS.map((vp) => (
                <Button
                  key={vp.id}
                  variant={viewport === vp.id ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewport(vp.id)}
                  title={vp.label}
                >
                  <vp.icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener">
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
              </a>
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Preview area */}
        <div className="flex-1 bg-muted/30 flex items-start justify-center overflow-auto p-4">
          <div
            className="bg-background border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full"
            style={{ width: currentVp.width, maxWidth: "100%" }}
          >
            <iframe
              key={`${url}-${refreshKey}`}
              src={url}
              className="w-full h-full border-0"
              title={title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small inline preview card for popups/modals */
export function InlinePreview({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-2 border-dashed border-border rounded-xl p-4 bg-muted/20 ${className}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Preview</p>
      <div className="pointer-events-none select-none">
        {children}
      </div>
    </div>
  );
}
