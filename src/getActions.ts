import { MongoClient } from "mongodb";

/**
 * Get Account Actions
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<string>} [options.accounts] Filter by account contracts (eg: ["eosio","eosio.token"])
 * @param {Array<string>} [options.names] Filter by action names (eg: ["undelegatebw", "delegatebw"])
 * @param {Array<object>} [options.data] Filter by data entries (eg: [{"data.from": "eosio"}])
 * @param {number} [options.lte_block_num] Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Greater-than or equal (>=) the Reference Block Number
 * @param {number} [options.skip] Takes a positive integer that specifies the maximum number of documents to skip
 * @param {number} [options.limit] Takes a positive integer that specifies the maximum number of documents to pass along
 * @returns {AggregationCursor} MongoDB Aggregation Cursor
 * @example
 * const options = {
 *     accounts: ["eosio"],
 *     names: ["delegatebw", "undelegatebw"],
 *     data: [{from: "eosnationftw"}, {receiver: "eosnationftw"}],
 *     gte_block_num: 0,
 *     lte_block_num: Infinity,
 *     skip: 0,
 *     limit: 25,
 * };
 * const results = await getActions(client, options);
 * console.log(await results.toArray());
 */
export function getActions(client: MongoClient, options: {
    accounts?: string[],
    names?: string[],
    data?: object[],
    lte_block_num?: number,
    gte_block_num?: number,
    skip?: number,
    limit?: number,
} = {}) {
    // Setup MongoDB collection
    const db = client.db("EOS");
    const collection = db.collection("actions");

    // MongoDB Pipeline
    const pipeline: any = [];

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

    // Filter by data entry
    // eg: [{from: "eosio"}]
    if (options.data && options.data.length) {
        pipeline.push({
            $match: {
                $or: options.data,
            },
        });
    }

    // Get Reference Block Number from Transaction Id
    pipeline.push({
        $graphLookup: {
            from: "transactions",
            startWith: "$trx_id",
            connectFromField: "trx_id",
            connectToField: "trx_id",
            as: "transaction",
        },
    });

    // Filter only required fields
    pipeline.push({
        $project: {
            _id: 0,
            account: 1,
            name: 1,
            data: 1,
            trx_id: 1,
            ref_block_num: { $arrayElemAt: [ "$transaction.transaction_header.ref_block_num", 0 ] },
        },
    });

    // Filter by Reference Block Number
    if (options.lte_block_num) { pipeline.push({$match: {ref_block_num: {$lte: options.lte_block_num }}}); }
    if (options.gte_block_num) { pipeline.push({$match: {ref_block_num: {$gte: options.gte_block_num }}}); }

    // Support Pagination using Skip & Limit
    if (options.skip) { pipeline.push({$skip: options.skip }); }
    if (options.limit) { pipeline.push({$limit: options.limit }); }

    return collection.aggregate(pipeline);
}
