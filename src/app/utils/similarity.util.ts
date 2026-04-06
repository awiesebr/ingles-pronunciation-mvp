export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(source: string, target: string): number {
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[source.length][target.length];
}

export function getSimilarityScore(expected: string, spoken: string): number {
  const normalizedExpected = normalizeText(expected);
  const normalizedSpoken = normalizeText(spoken);

  if (!normalizedExpected && !normalizedSpoken) {
    return 100;
  }

  if (!normalizedExpected || !normalizedSpoken) {
    return 0;
  }

  const distance = levenshteinDistance(normalizedExpected, normalizedSpoken);
  const maxLength = Math.max(normalizedExpected.length, normalizedSpoken.length);

  const score = Math.round((1 - distance / maxLength) * 100);
  return Math.max(0, Math.min(100, score));
}
