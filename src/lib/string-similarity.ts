// Levenshtein distance implementation
export function levenshtein(s1: string, s2: string): number {
  if (s1.length > s2.length) {
    [s1, s2] = [s2, s1];
  }

  const distances = Array(s1.length + 1);
  for (let i = 0; i <= s1.length; i++) {
    distances[i] = i;
  }

  for (let j = 1; j <= s2.length; j++) {
    let previousDiagonal = distances[0];
    distances[0] = j;
    for (let i = 1; i <= s1.length; i++) {
      const oldDiagonal = distances[i];
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      distances[i] = Math.min(
        distances[i] + 1,       // Deletion
        distances[i - 1] + 1,   // Insertion
        previousDiagonal + cost // Substitution
      );
      previousDiagonal = oldDiagonal;
    }
  }

  return distances[s1.length];
}

// Calculate similarity ratio
export function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) {
    return 1.0;
  }
  
  const distance = levenshtein(longer.toLowerCase().trim(), shorter.toLowerCase().trim());
  return (longer.length - distance) / longer.length;
}
