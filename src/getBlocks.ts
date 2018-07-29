import { MongoClient } from "mongodb";
import { isNullOrUndefined } from "util";
import { Blocks } from "./types/blocks";

/**
 * EOSIO MongoDB Blocks
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Object} [options={}] Optional Parameters
 * @param {object} [options.match] Match by entries (eg: {"block.producer": "eosio"})
 * @param {number} [options.block_num] Filter by exact Reference Block Number
 * @param {string} [options.block_id] Filter by exact Reference Block ID
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Filter by Greater-than or equal (>=) the Reference Block Number
 * @param {number} [options.skip] Skips number of documents
 * @param {number} [options.limit] Limit the maximum amount of of actions returned
 * @param {object} [options.sort] Sort by ascending order (1) or descending order (-1) (eg: {block_num: -1})
 * @returns {AggregationCursor<Blocks>} MongoDB Aggregation Cursor
 * @example
 * const options = {
 *     match: {"block.producer": "eosnationftw"},
 *     sort: {block_num: -1}
 * };
 * const results = await getBlocks(client, options);
 * console.log(await results.toArray());
 */
export function getBlocks(client: MongoClient, options: {
    match?: object,
    block_num?: number,
    block_id?: string,
    lte_block_num?: number,
    gte_block_num?: number,
    skip?: number,
    limit?: number,
    sort?: object,
} = {}) {
    // Setup MongoDB collection
    const db = client.db("EOS");
    const collection = db.collection("blocks");

    // MongoDB Pipeline
    const pipeline: any = [];

    // Match by data entries
    // options.match //=> {"data.from": "eosio"}
    if (options.match) { pipeline.push({$match: options.match}); }

    // Filter by Reference Block Number
    const {block_id, block_num, lte_block_num, gte_block_num} = options;

    if (block_id) { pipeline.push({$match: { block_id }}); }
    if (!isNullOrUndefined(block_num)) { pipeline.push({$match: { block_num }}); }

    // Both greater & lesser Block Number
    if (!isNullOrUndefined(lte_block_num) && !isNullOrUndefined(gte_block_num)) {
        pipeline.push({$match: { block_num: {$lte: lte_block_num, $gte: gte_block_num }}});
    } else {
        if (!isNullOrUndefined(lte_block_num)) { pipeline.push({$match: { block_num: {$lte: lte_block_num }}}); }
        if (!isNullOrUndefined(gte_block_num)) { pipeline.push({$match: { block_num: {$gte: gte_block_num }}}); }
    }

    // Sort by ascending or decending based on attribute
    // options.sort //=> {block_num: -1}
    // options.sort //=> {"data.from": -1}
    if (options.sort) { pipeline.push({$sort: options.sort}); }

    // Support Pagination using Skip & Limit
    if (options.skip) { pipeline.push({$skip: options.skip }); }
    if (options.limit) { pipeline.push({$limit: options.limit }); }

    return collection.aggregate<Blocks>(pipeline);
}
