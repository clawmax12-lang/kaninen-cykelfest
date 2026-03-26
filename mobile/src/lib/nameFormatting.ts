/** Returns "Efternamn Förnamn" (last-first) format for a "Förnamn Efternamn" name string. */
export function formatLastFirst(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name;
  const first = parts[0];
  const last = parts.slice(1).join(' ');
  return `${last} ${first}`;
}

/** Returns the last name portion (everything after the first word). */
export function getLastName(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? parts.slice(1).join(' ') : parts[0];
}
