import { boardCells, colorHex, LADDERS, SNAKES } from "@/lib/snakesAndLadders";
import { cn } from "@/lib/cn";
import type { GamePlayerState } from "@/types";

function Token({ player }: { player: GamePlayerState }) {
  return (
    <span
      title={player.username}
      className="flex h-4 w-4 items-center justify-center rounded-full border border-white/70 text-[8px] font-bold text-white shadow"
      style={{ backgroundColor: colorHex(player.color) }}
    >
      {player.username.charAt(0).toUpperCase()}
    </span>
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
  const onBoard = players.filter((p) => p.position >= 1);
  const waiting = players.filter((p) => p.position === 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-10 overflow-hidden rounded-xl border border-border bg-surface-2">
        {cells.map((n) => {
          const isLadder = n in LADDERS;
          const isSnake = n in SNAKES;
          const here = onBoard.filter((p) => p.position === n);
          return (
            <div
              key={n}
              className={cn(
                "relative aspect-square border-[0.5px] border-border/40 p-0.5",
                isLadder && "bg-success/15",
                isSnake && "bg-danger/15",
                n === 100 && "bg-accent/20",
              )}
              title={
                isLadder
                  ? `Ladder ${n} → ${LADDERS[n]}`
                  : isSnake
                    ? `Snake ${n} → ${SNAKES[n]}`
                    : undefined
              }
            >
              <span className="absolute left-0.5 top-0.5 text-[8px] text-muted">{n}</span>
              <span className="absolute right-0.5 top-0.5 text-[9px] leading-none">
                {n === 100 ? "🏁" : isLadder ? "🪜" : isSnake ? "🐍" : ""}
              </span>
              {here.length > 0 && (
                <div className="absolute inset-x-0 bottom-0.5 flex flex-wrap justify-center gap-0.5">
                  {here.map((p) => (
                    <span
                      key={p.user_id}
                      className={cn(
                        "rounded-full",
                        p.user_id === currentTurnUserId &&
                          "ring-2 ring-white ring-offset-1 ring-offset-transparent",
                      )}
                    >
                      <Token player={p} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {waiting.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>At start:</span>
          {waiting.map((p) => (
            <span key={p.user_id} className="flex items-center gap-1">
              <Token player={p} />
              {p.username}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
