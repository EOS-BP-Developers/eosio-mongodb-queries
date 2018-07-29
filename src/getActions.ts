import { MongoClient } from "mongodb";
import { isNullOrUndefined } from "util";
import { Actions } from "./types/actions";

/**
 * EOSIO MongoDB Actions
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<string>} [options.accounts] Filter by account contracts (eg: ["eosio","eosio.token"])
 * @param {Array<string>} [options.names] Filter by action names (eg: ["undelegatebw", "delegatebw"])
 * @param {number} [options.limit=25] Limit the maximum amount of of actions returned
 * @param {number} [options.skip] Skips number of documents
 * @param {object} [options.sort] Sort by ascending order (1) or descending order (-1) (eg: {block_num: -1})
 * @param {object} [options.match] Match by entries (eg: {"data.from": "eosio"})
 * @param {string} [options.trx_id] Filter by exact Transaction Id
 * @param {number} [options.block_num] Filter by exact Reference Block Number
 * @param {string} [options.block_id] Filter by exact Reference Block ID
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Filter by Greater-than or equal (>=) the Reference Block Number
 * @returns {AggregationCursor<Actions>} MongoDB Aggregation Cursor
 * @example
 * const options = {
 *     accounts: ["eosio"],
 *     names: ["delegatebw", "undelegatebw"],
 *     match: {"data.from": "eosnationftw", "data.receiver": "eosnationftw"},
 *     sort: {block_num: -1}
 * };
 * const results = await getActions(client, options);
 * console.log(await results.toArray());
 */
export function getActions(client: MongoClient, options: {
    accounts?: string[],
    names?: string[],
    match?: object,
    trx_id?: string,
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
    const collection = db.collection("actions");

    // MongoDB Pipeline
    const pipeline: any = [];

    // Default optional paramters
    options.limit = isNullOrUndefined(options.limit) ? 25 : options.limit;

    // Filter by Transaction ID
    if (options.trx_id) { pipeline.push({$match: { trx_id: options.trx_id }}); }

    // Filter account contracts
    // eg: ["eosio", "eosio.token"]
    if (options.accounts && options.accounts.length) {
        pipeline.push({
            $match: {
                $or: options.accounts.map((account) => {
                    return { account };
                }),
            },
        });
    }

    // Filter action names
    // eg: ["delegatebw", "undelegatebw"]
    if (options.names && options.names.length) {
        pipeline.push({
            $match: {
                $or: options.names.map((name) => {
                    return { name };
                }),
            },
        });
    }

    // Match by data entries
    // options.match //=> {"data.from": "eosio"}
    if (options.match) { pipeline.push({$match: options.match}); }

    // Get Reference Block Number from Transaction Id
    pipeline.push({
        $graphLookup: {
            from: "transactions",
            startWith: "$trx_id",
            connectFromField: "trx_id",
            connectToField: "trx_id",
            as: "transactions",
        },
    });

    // Add block_num + block_id and other fields
    pipeline.push({
        $project: {
            _id: 1,
            block_num: { $arrayElemAt: [ "$transactions.block_num", 0 ] },
            block_id: { $arrayElemAt: [ "$transactions.block_id", 0 ] },
            trx_id: 1,
            cfa: 1,
            account: 1,
            name: 1,
            authorization: 1,
            data: 1,
        },
    });

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
    if (options.limit !== Infinity && options.limit) { pipeline.push({$limit: options.limit }); }

    return collection.aggregate<Actions>(pipeline);
}
