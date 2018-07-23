import { MongoClient } from "mongodb";
import { getActions } from "./getActions";

/**
 * Get Account Details
 *
 * @param {MongoClient} client MongoDB Client
 * @param {string} accountName Account Name
 * @param {Object} [options={}] Optional Parameters
 * @param {number} [options.lte_block_num] Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Greater-than or equal (>=) the Head Block Number
 * @returns {Object} Account Details
 * @example
 * const options = {
 *   gte_block_num: 0,
 *   lte_block_num: Infinity,
 * };
 * const result = await getAccount(client, "heztcnbsgige", options);
 * // {
 * //   accountName: 'heztcnbsgige',
 * //   weight: 6.0261,
 * //   ref_block_num: 445,
 * //   stake_net_quantity: 3.0131,
 * //   stake_cpu_quantity: 3.013
 * // }
 */
export async function getAccount(client: MongoClient, accountName: string, options: {
    lte_block_num?: number,
    gte_block_num?: number,
} = {}) {
    // Get Actions
    const actions = await getActions(client, ["delegatebw", "undelegatebw"], Object.assign(options, {
        accountName,
        accountNameKeys: ["data.from", "data.receiver"],
    })).toArray();

    // Counters
    let weight = 0;
    let ref_block_num = 0;
    let stake_net_quantity = 0;
    let stake_cpu_quantity = 0;

    for (const action of actions) {
        if (action.ref_block_num > ref_block_num) { ref_block_num = action.ref_block_num; }

        switch (action.name) {
        case "delegatebw":
            if (accountName === action.data.receiver) {
                const stake_net_quantity_number = Number(action.data.stake_net_quantity.replace(" EOS", ""));
                const stake_cpu_quantity_number = Number(action.data.stake_cpu_quantity.replace(" EOS", ""));
                stake_net_quantity += stake_net_quantity_number;
                stake_cpu_quantity += stake_cpu_quantity_number;
                weight += stake_net_quantity_number + stake_cpu_quantity_number;
            }
            break;
        case "undelegatebw":
            if (accountName === action.data.from) {
                const unstake_net_quantity_number = Number(action.data.unstake_net_quantity.replace(" EOS", ""));
                const unstake_cpu_quantity_number = Number(action.data.unstake_cpu_quantity.replace(" EOS", ""));
                stake_net_quantity -= unstake_net_quantity_number;
                stake_cpu_quantity -= unstake_cpu_quantity_number;
                weight -= unstake_net_quantity_number + unstake_cpu_quantity_number;
            }
            break;
        }
    }

    return {
        accountName,
        weight,
        ref_block_num,
        stake_net_quantity,
        stake_cpu_quantity,
    };
}
