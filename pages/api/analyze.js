export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
  const avgWordLength = (charCount / wordCount).toFixed(2);

  const wordFreq = {};
  text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .forEach((w) => {
      if (w) wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return res.status(200).json({
    wordCount,
    charCount,
    sentenceCount,
    avgWordLength: Number(avgWordLength),
    topWords,
  });
}
