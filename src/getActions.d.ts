import { MongoClient } from "mongodb";
import { Actions } from "./types/actions";
/**
 * Get Account Actions
 *
 * @param {MongoClient} client MongoDB Client
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<string>} [options.accounts] Filter by account contracts (eg: ["eosio","eosio.token"])
 * @param {Array<string>} [options.names] Filter by action names (eg: ["undelegatebw", "delegatebw"])
 * @param {Array<object>} [options.match] Match by entries (eg: [{"data.from": "eosio"}])
 * @param {string} [options.trx_id] Filter by exact Transaction Id
 * @param {number} [options.block_num] Filter by exact Reference Block Number
 * @param {string} [options.block_id] Filter by exact Reference Block ID
 * @param {number} [options.lte_block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Filter by Greater-than or equal (>=) the Reference Block Number
 * @param {number} [options.skip] Skips number of documents
 * @param {number} [options.limit] Limit the maximum amount of of actions returned
 * @param {number} [options.sort] Sort by ascending order (1) or descending order (-1) (eg: {block_num: -1})
 * @returns {AggregationCursor<Actions>} MongoDB Aggregation Cursor
 * @example
 * const options = {
 *     accounts: ["eosio"],
 *     names: ["delegatebw", "undelegatebw"],
 *     match: [{"data.from": "eosnationftw"}, {"data.receiver": "eosnationftw"}],
 *     sort: {block_num: -1}
 * };
 * const results = await getActions(client, options);
 * console.log(await results.toArray());
 */
export declare function getActions(client: MongoClient, options?: {
    accounts?: string[];
    names?: string[];
    match?: object[];
    trx_id?: string;
    block_num?: number;
    block_id?: string;
    lte_block_num?: number;
    gte_block_num?: number;
    skip?: number;
    limit?: number;
    sort?: number;
}): import("mongodb").AggregationCursor<Actions>;
