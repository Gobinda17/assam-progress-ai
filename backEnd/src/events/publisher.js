import IORedis from "ioredis";

export const pub = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

export async function publishAdminEvent(payload) {
  await pub.publish("admin:documents", JSON.stringify(payload));
}