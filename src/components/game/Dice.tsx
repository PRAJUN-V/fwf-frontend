import { cn } from "@/lib/cn";

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({ value, rolling }: { value: number | null; rolling?: boolean }) {
  const pips = value ? PIP_LAYOUT[value] ?? [] : [];
  return (
    <div
      className={cn(
        "grid h-16 w-16 grid-cols-3 grid-rows-3 gap-1 rounded-xl border border-border bg-white p-2 shadow-lg",
        rolling && "animate-pulse",
      )}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            value && pips.includes(i) ? "bg-slate-900" : "bg-transparent",
          )}
        />
      ))}
    </div>
  );
}
