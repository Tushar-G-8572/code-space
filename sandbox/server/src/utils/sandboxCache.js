import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);
const PROJECT_SANDBOX_KEY = (projectId) => `project:sandbox:${projectId}`;
const TTL = 60 * 20; // 20 minutes (match your pod TTL)

export async function setProjectSandbox(projectId, sandboxId) {
  await redisClient.set(PROJECT_SANDBOX_KEY(projectId), sandboxId, 'EX', TTL);
}

export async function getProjectSandbox(projectId) {
  return await redisClient.get(PROJECT_SANDBOX_KEY(projectId));
}

export async function deleteProjectSandbox(projectId) {
  await redisClient.del(PROJECT_SANDBOX_KEY(projectId));
}