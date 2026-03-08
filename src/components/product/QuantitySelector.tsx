import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  max: number;
}

export function QuantitySelector({ value, onChange, max }: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-border rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-r-none"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-12 text-center text-sm font-medium tabular-nums">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-l-none"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
