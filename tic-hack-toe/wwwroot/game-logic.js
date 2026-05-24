// Pure tic-hack-toe game logic. No DOM, no globals. Tested in tests/game-logic.test.mjs.
// Board is a 9-element array of '', 'X', 'O'. Indices 0..8 are row-major on a 3x3 grid.

export const EMPTY_BOARD = Object.freeze(['', '', '', '', '', '', '', '', '']);

export const WIN_PATTERNS = Object.freeze([
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]);

export function neighborIndices(index) {
  const r = Math.floor(index / 3);
  const c = index % 3;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr;
      const cc = c + dc;
      if (rr >= 0 && rr < 3 && cc >= 0 && cc < 3) out.push(rr * 3 + cc);
    }
  }
  return out;
}

export function rowColIndices(index) {
  const r = Math.floor(index / 3);
  const c = index % 3;
  const out = [];
  for (let i = 0; i < 3; i++) {
    if (i !== c) out.push(r * 3 + i);
    if (i !== r) out.push(i * 3 + c);
  }
  return out;
}

export function findWin(board, player) {
  for (const pattern of WIN_PATTERNS) {
    if (pattern.every((i) => board[i] === player)) return pattern;
  }
  return null;
}

export function isDraw(board) {
  return board.every((cell) => cell !== '');
}

export function opponentOf(player) {
  return player === 'X' ? 'O' : 'X';
}

// Apply a player's move with mode effects. Returns a fresh board (does not mutate).
// Returns the input board unchanged if the cell is occupied.
export function applyMove(board, index, player, mode = 'normal') {
  if (board[index] !== '') return board.slice();
  const next = board.slice();
  next[index] = player;
  const opp = opponentOf(player);
  if (mode === 'bomb') {
    for (const i of neighborIndices(index)) {
      if (next[i] === opp) next[i] = '';
    }
  } else if (mode === 'laser') {
    for (const i of rowColIndices(index)) {
      if (next[i] === opp) next[i] = '';
    }
  }
  return next;
}

export function emptyCells(board) {
  const out = [];
  for (let i = 0; i < 9; i++) if (board[i] === '') out.push(i);
  return out;
}

// Pick a uniformly random empty cell. Returns -1 if board is full.
// `rng` is a function returning a number in [0, 1) — defaults to Math.random.
export function randomMove(board, rng = Math.random) {
  const empty = emptyCells(board);
  if (empty.length === 0) return -1;
  return empty[Math.floor(rng() * empty.length)];
}

// Perfect-play minimax with alpha-beta pruning for normal-mode tic-tac-toe.
// Returns the best move index for `player`, or -1 on a full/won board.
// Faster wins beat slower wins; slower losses beat faster losses.
export function minimaxMove(board, player) {
  const opp = opponentOf(player);

  function score(b, depth) {
    if (findWin(b, player)) return 10 - depth;
    if (findWin(b, opp)) return depth - 10;
    if (isDraw(b)) return 0;
    return null;
  }

  function search(b, turn, depth, alpha, beta) {
    const terminal = score(b, depth);
    if (terminal !== null) return { score: terminal, move: -1 };

    const empty = emptyCells(b);
    let bestMove = empty[0] ?? -1;
    let bestScore = turn === player ? -Infinity : Infinity;

    for (const i of empty) {
      const next = b.slice();
      next[i] = turn;
      const child = search(next, turn === player ? opp : player, depth + 1, alpha, beta);
      if (turn === player) {
        if (child.score > bestScore) { bestScore = child.score; bestMove = i; }
        if (bestScore > alpha) alpha = bestScore;
      } else {
        if (child.score < bestScore) { bestScore = child.score; bestMove = i; }
        if (bestScore < beta) beta = bestScore;
      }
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }

  return search(board, player, 0, -Infinity, Infinity).move;
}

// Strategy selector. `mode` is 'normal' | 'bomb' | 'laser'.
// Minimax search is exact only for normal mode (bomb/laser change the state
// space and would explode), so non-normal modes fall back to random.
export function chooseAiMove(board, player, { difficulty = 'sharp', mode = 'normal', rng = Math.random } = {}) {
  if (emptyCells(board).length === 0) return -1;
  if (difficulty === 'sharp' && mode === 'normal') {
    return minimaxMove(board, player);
  }
  return randomMove(board, rng);
}
