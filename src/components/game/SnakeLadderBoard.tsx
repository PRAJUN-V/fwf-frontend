import {
  boardCells,
  cellCenter,
  colorHex,
  LADDERS,
  SNAKES,
} from "@/lib/snakesAndLadders";
import { cn } from "@/lib/cn";
import type { GamePlayerState } from "@/types";

const LADDER_COLOR = "#22c55e";
const SNAKE_COLOR = "#f43f5e";

function Connectors() {
  const ladders = Object.entries(LADDERS).map(([from, to]) => ({
    from: Number(from),
    to,
  }));
  const snakes = Object.entries(SNAKES).map(([from, to]) => ({
    from: Number(from),
    to,
  }));

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <marker
          id="arrow-up"
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L5,2.5 L0,5 Z" fill={LADDER_COLOR} />
        </marker>
        <marker
          id="arrow-down"
          markerWidth="5"
          markerHeight="5"
          refX="2.5"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L5,2.5 L0,5 Z" fill={SNAKE_COLOR} />
        </marker>
      </defs>

      {ladders.map(({ from, to }) => {
        const a = cellCenter(from);
        const b = cellCenter(to);
        return (
          <line
            key={`l-${from}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={LADDER_COLOR}
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.85}
            markerEnd="url(#arrow-up)"
          />
        );
      })}

      {snakes.map(({ from, to }) => {
        const a = cellCenter(from);
        const b = cellCenter(to);
        return (
          <line
            key={`s-${from}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={SNAKE_COLOR}
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.85}
            markerEnd="url(#arrow-down)"
          />
        );
      })}
    </svg>
  );
}

function Tokens({
  players,
  currentTurnUserId,
}: {
  players: GamePlayerState[];
  currentTurnUserId: number | null;
}) {
  const onBoard = players.filter((p) => p.position >= 1);
  const byCell = new Map<number, GamePlayerState[]>();
  for (const p of onBoard) {
    const arr = byCell.get(p.position) ?? [];
    arr.push(p);
    byCell.set(p.position, arr);
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {[...byCell.entries()].flatMap(([cell, group]) => {
        const { x, y } = cellCenter(cell);
        return group.map((p, idx) => {
          const count = group.length;
          // Spread multiple tokens within the same cell.
          const dx = count > 1 ? (idx % 2 === 0 ? -2 : 2) : 0;
          const dy = count > 2 ? (idx < 2 ? -2 : 2) : 0;
          return (
            <span
              key={p.user_id}
              title={`${p.username} · ${p.position}`}
              className={cn(
                "absolute flex h-[5%] w-[5%] min-h-3.5 min-w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 text-[8px] font-bold text-white shadow-md",
                p.user_id === currentTurnUserId && "ring-2 ring-white",
              )}
              style={{
                left: `${x + dx}%`,
                top: `${y + dy}%`,
                backgroundColor: colorHex(p.color),
              }}
            >
              {p.username.charAt(0).toUpperCase()}
            </span>
          );
        });
      })}
    </div>
  );
}

export function SnakeLadderBoard({
  players,
  currentTurnUserId,
}: {
  players: GamePlayerState[];
  currentTurnUserId: number | null;
}) {
  const cells = boardCells();
  const waiting = players.filter((p) => p.position === 0);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="grid grid-cols-10 overflow-hidden rounded-xl border border-border bg-surface-2">
          {cells.map((n) => {
            const ladderTo = LADDERS[n];
            const snakeTo = SNAKES[n];
            const isLadder = ladderTo !== undefined;
            const isSnake = snakeTo !== undefined;
            return (
              <div
                key={n}
                className={cn(
                  "relative aspect-square border-[0.5px] border-border/40",
                  isLadder && "bg-success/15",
                  isSnake && "bg-danger/15",
                  n === 100 && "bg-accent/20",
                )}
              >
                <span className="absolute left-0.5 top-0.5 text-[8px] leading-none text-muted">
                  {n}
                </span>
                {n === 100 && (
                  <span className="absolute right-0.5 top-0.5 text-[9px] leading-none">
                    🏁
                  </span>
                )}
                {isLadder && (
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold leading-none text-success">
                    ▲{ladderTo}
                  </span>
                )}
                {isSnake && (
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold leading-none text-danger">
                    ▼{snakeTo}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Connectors />
        <Tokens players={players} currentTurnUserId={currentTurnUserId} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: LADDER_COLOR }} />
          Ladder (▲ go up)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: SNAKE_COLOR }} />
          Snake (▼ slide down)
        </span>
        <span>Land exactly on 100 to win.</span>
      </div>

      {waiting.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>At start:</span>
          {waiting.map((p) => (
            <span key={p.user_id} className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-3 rounded-full border border-white/70"
                style={{ backgroundColor: colorHex(p.color) }}
              />
              {p.username}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
