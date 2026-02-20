export function chunkText(text, { chunkSize = 1200, overlap = 200 } = {}) {
  const s = (text || "").replace(/\s+/g, " ").trim();
  if (!s) return [];

  const chunks = [];
  let start = 0;

  while (start < s.length) {
    const end = Math.min(start + chunkSize, s.length);
    chunks.push(s.slice(start, end));
    if (end === s.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}