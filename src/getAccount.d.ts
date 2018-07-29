import { MongoClient } from "mongodb";
/**
 * Get Account Details
 *
 * @param {MongoClient} client MongoDB Client
 * @param {string} name Account Name
 * @param {Object} [options={}] Optional Parameters
 * @param {number} [options.block_num] Filter by Less-than or equal (<=) the Reference Block Number
 * @returns {Object} Account Details
 * @example
 * const name = "eosnationftw";
 * const options = {
 *   block_num: 6000000,
 * };
 * const result = await getAccount(client, name, options);
 * // {
 * //   name: 'eosnationftw',
 * //   block_num: 2092984,
 * //   stake_quantity: 1.8,
 * //   stake_net_quantity: 0.9,
 * //   stake_cpu_quantity: 0.9
 * // }
 */
export declare function getAccount(client: MongoClient, name: string, options?: {
    block_num?: number;
}): Promise<{
    name: string;
    block_num: number;
    stake_quantity: number;
    stake_net_quantity: number;
    stake_cpu_quantity: number;
}>;
