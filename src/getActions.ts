import { MongoClient } from "mongodb";
import { isString } from "util";

/**
 * Get Account Actions
 *
 * @param {MongoClient} client MongoDB Client
 * @param {string} account Filter by account contract
 * @param {Array<string>} names Filter by action names
 * @param {Object} [options={}] Optional Parameters
 * @param {string} [options.accountName] Account Name (must also include `accountNameKeys`)
 * @param {Array<string>} [options.accountNameKeys] Filter accountName by specific keys
 * @param {number} [options.lte_block_num] Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Greater-than or equal (>=) the Head Block Number
 * @param {number} [options.skip] Takes a positive integer that specifies the maximum number of documents to skip
 * @param {number} [options.limit] Takes a positive integer that specifies the maximum number of documents to pass along
 * @returns {AggregationCursor} MongoDB Aggregation Cursor
 * @example
 * const account = "eosio";
 * const names = ["delegatebw", "undelegatebw"];
 * const options = {
 *     accountName: "eosnationftw",
 *     accountNameKeys: ["data.from", "data.receiver"],
 *     gte_block_num: 0,
 *     lte_block_num: Infinity,
 *     skip: 0,
 *     limit: 25
 * };
 * const results = await getActions(client, account, names, options);
 * console.log(await results.toArray());
 */
export function getActions(client: MongoClient, account: string, names: string[], options: {
    accountName?: string,
    accountNameKeys?: string[],
    lte_block_num?: number,
    gte_block_num?: number,
    skip?: number,
    limit?: number,
} = {}) {
    // Setup MongoDB collection
    const db = client.db("EOS");
    const collection = db.collection("actions");

    // Optional Parameters
    const accountName = options.accountName;
    const accountNameKeys = options.accountNameKeys || [];

    // Asserts
    if (accountName && !accountNameKeys.length) {
        throw new Error("both accountName & accountNameKeys must be included");
    }

    // MongoDB Pipeline
    let pipeline: any = [];

    // Filter accounts based on specific fields using name
    if (accountName && accountNameKeys) {
        pipeline.push({
            $match: { $or: accountNameKeys.map((field) => {
                const filter: any = {};
                filter[field] = accountName;
                return filter;
            })},
        });
    }

    pipeline = pipeline.concat([
        // Filter only specific contract account & actions names
        {
            $match: {
                account,
                $or: names.map((name) => {
                    return { name };
                }),
            },
        },
        // Get Reference Block Number from Transaction Id
        {
            $graphLookup: {
                from: "transactions",
                startWith: "$trx_id",
                connectFromField: "trx_id",
                connectToField: "trx_id",
                as: "transaction",
            },
        },
        // Filter only required fields
        {
            $project: {
                _id: 0,
                account: 1,
                name: 1,
                data: 1,
                trx_id: 1,
                ref_block_num: { $arrayElemAt: [ "$transaction.transaction_header.ref_block_num", 0 ] },
            },
        },
    ]);

    // Filter by Reference Block Number
    if (options.lte_block_num) { pipeline.push({$match: {ref_block_num: {$lte: options.lte_block_num }}}); }
    if (options.gte_block_num) { pipeline.push({$match: {ref_block_num: {$gte: options.gte_block_num }}}); }

    // Support Pagination using Skip & Limit
    if (options.limit) { pipeline.push({$limit: options.limit }); }
    if (options.skip) { pipeline.push({$skip: options.skip }); }

    return collection.aggregate(pipeline);
}
