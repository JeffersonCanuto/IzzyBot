// Create Chat message (SAVE MESSAGES ON REDIS)
function create(message: string): Promise<void> {
  return redis.add(message);
}

export default { create } as const;