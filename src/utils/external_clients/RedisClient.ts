import * as redis from "redis";
import Logger from "../Logger";
import {isExists} from "../index";
import {promisify} from 'util';


class RedisClient {
    private client: redis.RedisClientType | undefined;
    url: string = process.env.REDIS_URL || "redis://redis:6379";
    isInitialized: boolean = false;

    async init() {
        this.client = redis.createClient({url: this.url, legacyMode: true});

        this.client.on("error", (err: any) => Logger.error("Redis Error: ", err));

        this.client.connect().then(() => {
            this.isInitialized = true;
            Logger.info("Redis Connected Successfully");
        });

        return this.client;
    }

    // Helper function to promisify Redis commands and handle errors
    async executeCommand(command: string, ...args: any[]): Promise<any> {
        if (!isExists(this.client)) {
            throw new Error("Redis client not initialized");
        }

        try {
            // @ts-ignore
            const promisifiedCommand = promisify(this.client[command]).bind(this.client);
            const reply = await promisifiedCommand(...args);
            Logger.info(`Redis ${command} command executed successfully!`);
            return reply;
        } catch (error) {
            Logger.error(`Redis error while executing ${command} command: `, error);
            throw error;
        }
    }

    async getKeys(pattern: string): Promise<string[]> {
        return this.executeCommand("KEYS", `${pattern}*`);
    }

    async deleteKeys(pattern: string): Promise<number> {
        const keys = await this.getKeys(pattern);

        if (keys.length === 0) {
            return 0;
        }

        return this.executeCommand("DEL", keys);
    }

    async get(key: string): Promise<any> {
        return this.executeCommand("GET", key);
    }

    async set(key: string, value: string): Promise<string> {
        return this.executeCommand("SET", key);
    }

    async zremrangebyscore(key: string, min: string, max: number): Promise<number> {
        return this.executeCommand("ZREMRANGEBYSCORE", key, min, max);
    }

    async zadd(key: string, score: number, value: string): Promise<number> {
        return this.executeCommand("ZADD", key, score, value);
    }

    async zcount(key: string, min: number, max: string): Promise<number> {
        return this.executeCommand("ZCOUNT", key, min, max);
    }

    async exists(key: string): Promise<number> {
        return this.executeCommand("EXISTS", key);
    }

    async expire(key: string, duration: number): Promise<number> {
        return this.executeCommand("EXPIRE", key, duration);
    }

    async hincrby(key: string, min: string, max: number): Promise<string[]> {
        return this.executeCommand("HINCRBY", key, min, max);
    }

    async expireat(key: string, time: number): Promise<string[]> {
        return this.executeCommand("EXPIREAT", key, time);
    }

    async hgetall(key: string): Promise<string[]> {
        return this.executeCommand("HGETALL", key);
    }

    async hset(key: string, field: string, value: string): Promise<string[]> {
        return this.executeCommand("HSET", key, field, value);
    }

    async hget(key: string, field: string): Promise<string[]> {
        return this.executeCommand("HGET", key, field);
    }

    async hdel(key: string, field: string): Promise<string[]> {
        return this.executeCommand("HDEL", key, field);
    }

    async hlen(key: string): Promise<string[]> {
        return this.executeCommand("HLEN", key);
    }

    async hkeys(key: string): Promise<string[]> {
        return this.executeCommand("HKEYS", key);
    }

    async incr(key: string): Promise<string[]> {
        return this.executeCommand("INCR", key);
    }

    async decr(key: string): Promise<string[]> {
        return this.executeCommand("DECR", key);
    }

    async ttl(key: string): Promise<number> {
        return this.executeCommand("TTL", key);
    }
}

export default new RedisClient();
