import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";
import * as path from "path";

// Parse .env
dotenv.config({path: path.join(__dirname, "..", ".env")});

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

/**
 * Connect to MongoDB
 *
 * @returns {Promise<MongoClient>} MongoClient
 */
export function connect() {
    return MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
}
