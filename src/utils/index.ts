import express from "express";
import Logger from "./Logger";
import RedisClient from "./external_clients/RedisClient";
/**
 * Check if a variable is not null, undefined, empty string, empty array, empty object, or has a falsy value.
 * @template T
 * @param {(T | null | undefined)} value - The value to check.
 * @returns {value is T} - Returns true if the value is not null, undefined, empty string, empty array, empty object, or has a falsy value, otherwise returns false.
 */

export function isExists<T>(value: T | null | undefined): value is T {
	if (value === undefined || value === null) return false;

	switch (typeof value) {
		case 'string':
			return value.length > 0;
		case 'object':
			return Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0;
		case 'boolean':
			return true;
		case 'number':
			return !isNaN(value);
	}
	return false;
}

/**
 *  Get all keys from Redis that matches the pattern. This is used to get all keys from Redis that matches the pattern and delete them from DAOs that uses Redis.
 * */
export async function getRedisKeys(pattern: string): Promise<unknown> {
	return RedisClient.getKeys(pattern)
		.then((keys) => keys)
		.catch((error) => Logger.error('REDIS_ERROR: ', error))
}
