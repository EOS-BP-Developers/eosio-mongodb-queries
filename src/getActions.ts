import { MongoClient } from "mongodb";

/**
 * Get Account Actions
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Array<string>} filterActions Filter by actions names
 * @param {Object} [options={}] Optional Parameters
 * @param {string} [options.accountName] Account Name (must also include "options.accountNameKeys")
 * @param {Array<string>} [options.accountNameKeys] Filter accountName by specific keys
 * @param {number} [options.lte_block_num] Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Greater-than or equal (>=) the Head Block Number
 * @returns {AggregationCursor} MongoDB Aggregation Cursor
 * @example
 * const actions = ["delegatebw", "undelegatebw"];
 * const options = {
 *     accountName: "eosnationftw",
 *     accountNameKeys: ["data.from", "data.receiver"],
 *     gte_block_num: 0,
 *     lte_block_num: Infinity,
 * };
 * const results = await getActions(client, actions, options);
 * console.log(await results.toArray());
 */
export function getActions(client: MongoClient, filterActions: string[], options: {
    accountName?: string,
    accountNameKeys?: string[],
    lte_block_num?: number,
    gte_block_num?: number,
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
    // https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
    // https://docs.mongodb.com/manual/reference/operator/aggregation/graphLookup/
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
        // Filter only specific actions
        {
            $match: { $or: filterActions.map((action) => {
                return { name: action };
            })},
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

    return collection.aggregate(pipeline);
}
