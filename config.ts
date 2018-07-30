import * as dotenv from "dotenv";

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const EOSIO_MONGODB_QUERIES_LIMIT = process.env.EOSIO_MONGODB_QUERIES_LIMIT || 25;
