export const FUTOSHIKI_MODES = {
  easy: { size: 4, givens: 6, minInequalities: 12 },
  medium: { size: 5, givens: 5, minInequalities: 20 },
  hard: { size: 6, givens: 4, minInequalities: 24 }
};

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function latinSquare(size) {
  const rows = shuffle(Array.from({ length: size }, (_, index) => index));
  const columns = shuffle(Array.from({ length: size }, (_, index) => index));
  const symbols = shuffle(Array.from({ length: size }, (_, index) => index + 1));
  return rows.flatMap((row) => columns.map((column) => symbols[(row + column) % size]));
}

function indexOf(row, column, size) {
  return row * size + column;
}

function inequalityIsValid(left, right, operator) {
  return operator === '<' ? left < right : left > right;
}

function respectsConstraints(puzzle, board, index, value) {
  const { size, inequalities } = puzzle;
  const row = Math.floor(index / size);
  const column = index % size;

  for (let offset = 0; offset < size; offset += 1) {
    if (board[indexOf(row, offset, size)] === value || board[indexOf(offset, column, size)] === value) return false;
  }

  return inequalities.every(({ a, b, operator }) => {
    const left = a === index ? value : board[a];
    const right = b === index ? value : board[b];
    return !left || !right || inequalityIsValid(left, right, operator);
  });
}

function candidatesFor(puzzle, board, index) {
  const values = [];
  for (let value = 1; value <= puzzle.size; value += 1) {
    if (respectsConstraints(puzzle, board, index, value)) values.push(value);
  }
  return values;
}

function chooseCell(puzzle, board) {
  let best = null;
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue;
    const candidates = candidatesFor(puzzle, board, index);
    if (!best || candidates.length < best.candidates.length || (candidates.length === best.candidates.length && degree(puzzle, board, index) > degree(puzzle, board, best.index))) {
      best = { index, candidates };
      if (candidates.length <= 1) break;
    }
  }
  return best;
}

function degree(puzzle, board, index) {
  const size = puzzle.size;
  const row = Math.floor(index / size);
  const column = index % size;
  let score = 0;
  for (let offset = 0; offset < size; offset += 1) {
    if (!board[indexOf(row, offset, size)]) score += 1;
    if (!board[indexOf(offset, column, size)]) score += 1;
  }
  score += puzzle.inequalities.filter(({ a, b }) => (a === index && !board[b]) || (b === index && !board[a])).length;
  return score;
}

export function countSolutions(puzzle, startingBoard = puzzle.givens, limit = 2) {
  const board = [...startingBoard];
  let count = 0;

  function search() {
    if (count >= limit) return;
    const choice = chooseCell(puzzle, board);
    if (!choice) {
      count += 1;
      return;
    }
    if (!choice.candidates.length) return;
    for (const value of choice.candidates) {
      board[choice.index] = value;
      search();
      board[choice.index] = 0;
      if (count >= limit) return;
    }
  }

  search();
  return count;
}

function createInequalities(solution, size) {
  const inequalities = [];
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const current = indexOf(row, column, size);
      if (column < size - 1) {
        const right = indexOf(row, column + 1, size);
        inequalities.push({ a: current, b: right, operator: solution[current] < solution[right] ? '<' : '>' });
      }
      if (row < size - 1) {
        const below = indexOf(row + 1, column, size);
        inequalities.push({ a: current, b: below, operator: solution[current] < solution[below] ? '<' : '>' });
      }
    }
  }
  return shuffle(inequalities);
}

function selectGivens(solution, count) {
  const givens = Array(solution.length).fill(0);
  for (const index of shuffle(Array.from({ length: solution.length }, (_, value) => value)).slice(0, count)) givens[index] = solution[index];
  return givens;
}

function tryRemoveInequalities(puzzle, minimum) {
  for (const inequality of shuffle(puzzle.inequalities)) {
    if (puzzle.inequalities.length <= minimum) break;
    const position = puzzle.inequalities.indexOf(inequality);
    puzzle.inequalities.splice(position, 1);
    if (countSolutions(puzzle) !== 1) puzzle.inequalities.splice(position, 0, inequality);
  }
}

export function generatePuzzle(mode = 'easy') {
  const settings = FUTOSHIKI_MODES[mode] || FUTOSHIKI_MODES.easy;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const solution = latinSquare(settings.size);
    const puzzle = {
      size: settings.size,
      solution,
      givens: selectGivens(solution, settings.givens),
      inequalities: createInequalities(solution, settings.size)
    };
    if (countSolutions(puzzle) !== 1) continue;
    tryRemoveInequalities(puzzle, settings.minInequalities);
    if (countSolutions(puzzle) === 1) return puzzle;
  }
  throw new Error(`Unable to generate a unique ${mode} Futoshiki puzzle.`);
}

export function isComplete(puzzle, board) {
  return board.every((value, index) => value === puzzle.solution[index]);
}

export function getCandidates(puzzle, board, index) {
  return candidatesFor(puzzle, board, index);
}
