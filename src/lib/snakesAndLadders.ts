export const BOARD_SIZE = 100;
export const BOARD_COLS = 10;
export const BOARD_ROWS = 10;

export const LADDERS: Record<number, number> = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

export const SNAKES: Record<number, number> = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

export const PLAYER_HEX: Record<string, string> = {
  red: "#f43f5e",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
};

export function colorHex(color: string): string {
  return PLAYER_HEX[color] ?? "#a855f7";
}

/**
 * Cell numbers in render order (top-left to bottom-right) for a serpentine
 * board where 1 is bottom-left and 100 is top-left.
 */
export function boardCells(): number[] {
  const cells: number[] = [];
  for (let rowFromTop = 0; rowFromTop < BOARD_ROWS; rowFromTop++) {
    const r = BOARD_ROWS - 1 - rowFromTop; // 0 = bottom row
    const rowCells: number[] = [];
    for (let col = 0; col < BOARD_COLS; col++) {
      const n = r % 2 === 0 ? r * BOARD_COLS + col + 1 : r * BOARD_COLS + (BOARD_COLS - col);
      rowCells.push(n);
    }
    cells.push(...rowCells);
  }
  return cells;
}
