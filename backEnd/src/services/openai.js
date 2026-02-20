import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedBatch(texts) {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return r.data.map((d) => d.embedding);
}