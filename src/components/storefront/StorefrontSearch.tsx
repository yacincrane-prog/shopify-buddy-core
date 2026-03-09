import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function StorefrontSearch({ value, onChange }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="container px-4 pt-4">
      <div className={`relative transition-all duration-200 ${focused ? "ring-2 ring-primary/20 rounded-lg" : ""}`}>
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="ابحث عن منتج…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="ps-9 pe-9 h-10 text-sm bg-muted/50 border-border"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
