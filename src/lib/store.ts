import { Participant, Config } from "./types";

interface Store {
  getConfig(): Promise<Config>;
  setConfig(config: Config): Promise<void>;
  getParticipants(): Promise<Record<string, Participant>>;
  getParticipant(id: string): Promise<Participant | null>;
  addParticipant(participant: Participant): Promise<void>;
  updateParticipant(participant: Participant): Promise<void>;
  removeParticipant(id: string): Promise<void>;
  resetAll(): Promise<void>;
}

// --- In-memory store (for local dev without Redis) ---
// Uses globalThis to share state across API route module instances

const DEFAULT_CONFIG: Config = { groupCount: 4 };

interface MemoryData {
  config: Config;
  participants: Record<string, Participant>;
}

const globalForStore = globalThis as unknown as {
  __groupbystay_data?: MemoryData;
};

function getMemoryData(): MemoryData {
  if (!globalForStore.__groupbystay_data) {
    globalForStore.__groupbystay_data = {
      config: { ...DEFAULT_CONFIG },
      participants: {},
    };
  }
  return globalForStore.__groupbystay_data;
}

const memoryStore: Store = {
  async getConfig() {
    return getMemoryData().config;
  },
  async setConfig(config) {
    getMemoryData().config = config;
  },
  async getParticipants() {
    return { ...getMemoryData().participants };
  },
  async getParticipant(id) {
    return getMemoryData().participants[id] || null;
  },
  async addParticipant(participant) {
    getMemoryData().participants[participant.id] = participant;
  },
  async updateParticipant(participant) {
    getMemoryData().participants[participant.id] = participant;
  },
  async removeParticipant(id) {
    delete getMemoryData().participants[id];
  },
  async resetAll() {
    const data = getMemoryData();
    data.config = { ...DEFAULT_CONFIG };
    data.participants = {};
  },
};

// --- Redis store (for production on Vercel) ---

function createRedisStore(): Store {
  const getRedis = async () => {
    const { Redis } = await import("@upstash/redis");
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  };

  const CONFIG_KEY = "groupbystay:config";
  const PARTICIPANTS_KEY = "groupbystay:participants";

  return {
    async getConfig() {
      const redis = await getRedis();
      const config = await redis.get<Config>(CONFIG_KEY);
      return config || { ...DEFAULT_CONFIG };
    },
    async setConfig(config) {
      const redis = await getRedis();
      await redis.set(CONFIG_KEY, config);
    },
    async getParticipants() {
      const redis = await getRedis();
      const data = await redis.get<Record<string, Participant>>(
        PARTICIPANTS_KEY
      );
      return data || {};
    },
    async getParticipant(id) {
      const participants = await this.getParticipants();
      return participants[id] || null;
    },
    async addParticipant(participant) {
      const redis = await getRedis();
      const participants =
        (await redis.get<Record<string, Participant>>(PARTICIPANTS_KEY)) || {};
      participants[participant.id] = participant;
      await redis.set(PARTICIPANTS_KEY, participants);
    },
    async updateParticipant(participant) {
      const redis = await getRedis();
      const participants =
        (await redis.get<Record<string, Participant>>(PARTICIPANTS_KEY)) || {};
      participants[participant.id] = participant;
      await redis.set(PARTICIPANTS_KEY, participants);
    },
    async removeParticipant(id) {
      const redis = await getRedis();
      const participants =
        (await redis.get<Record<string, Participant>>(PARTICIPANTS_KEY)) || {};
      delete participants[id];
      await redis.set(PARTICIPANTS_KEY, participants);
    },
    async resetAll() {
      const redis = await getRedis();
      await redis.del(CONFIG_KEY, PARTICIPANTS_KEY);
    },
  };
}

// --- Export the appropriate store based on environment ---

const useRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

export const store: Store = useRedis ? createRedisStore() : memoryStore;
