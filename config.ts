import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Parse .env
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const EOSIO_MONGODB_QUERIES_LIMIT = process.env.EOSIO_MONGODB_QUERIES_LIMIT || 25;

/**
 * Connect to MongoDB
 *
 * @returns {Promise<MongoClient>} MongoClient
 */
export function connect() {
    return MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
}
