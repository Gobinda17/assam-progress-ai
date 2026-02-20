import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

export async function ensureQdrantCollection() {
  const name = process.env.QDRANT_COLLECTION;
  const dim = 1536; // text-embedding-3-small

  const collections = await qdrant.getCollections();
  const exists = collections.collections?.some((c) => c.name === name);

  if (!exists) {
    await qdrant.createCollection(name, {
      vectors: { size: dim, distance: "Cosine" },
    });
  }

  // Payload indexes (fast filtering later: category/state/district/documentId)
  await qdrant.createPayloadIndex(name, { field_name: "documentId", field_schema: "keyword" });
  await qdrant.createPayloadIndex(name, { field_name: "category", field_schema: "keyword" });
  await qdrant.createPayloadIndex(name, { field_name: "state", field_schema: "keyword" });
  await qdrant.createPayloadIndex(name, { field_name: "district", field_schema: "keyword" });
}