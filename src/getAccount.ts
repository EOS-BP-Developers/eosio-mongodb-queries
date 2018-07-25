import { MongoClient } from "mongodb";
import { getActions } from "./getActions";

/**
 * Get Account Details
 *
 * @param {MongoClient} client MongoDB Client
 * @param {string} name Account Name
 * @param {Object} [options={}] Optional Parameters
 * @param {number} [options.lte_block_num] Less-than or equal (<=) the Reference Block Number
 * @param {number} [options.gte_block_num] Greater-than or equal (>=) the Reference Block Number
 * @returns {Object} Account Details
 * @example
 * const name = "eosnationftw";
 * const options = {
 *   gte_block_num: 0,
 *   lte_block_num: Infinity,
 * };
 * const result = await getAccount(client, name, options);
 * // {
 * //   name: 'eosnationftw',
 * //   weight: 1.8,
 * //   ref_block_num: 61025,
 * //   stake_net_quantity: 0.9,
 * //   stake_cpu_quantity: 0.9
 * // }
 */
export async function getAccount(client: MongoClient, name: string, options: {
    lte_block_num?: number,
    gte_block_num?: number,
} = {}) {
    // Get Actions
    const actions = await getActions(client, {
        accounts: ["eosio"],
        names: ["delegatebw", "undelegatebw"],
        data: [{"data.from": name, "data.receiver": name}],
        lte_block_num: options.lte_block_num,
        gte_block_num: options.gte_block_num,
    }).toArray();

    // Assert
    if (!actions.length) { throw new Error("no account found"); }

    // Counters
    let weight = 0;
    let ref_block_num = 0;
    let stake_net_quantity = 0;
    let stake_cpu_quantity = 0;

    for (const action of actions) {
        if (action.ref_block_num > ref_block_num) { ref_block_num = action.ref_block_num; }

        switch (action.name) {
        case "delegatebw":
            if (name === action.data.receiver) {
                const stake_net_quantity_number = Number(action.data.stake_net_quantity.replace(" EOS", ""));
                const stake_cpu_quantity_number = Number(action.data.stake_cpu_quantity.replace(" EOS", ""));
                stake_net_quantity += stake_net_quantity_number;
                stake_cpu_quantity += stake_cpu_quantity_number;
                weight += stake_net_quantity_number + stake_cpu_quantity_number;
            }
            break;
        case "undelegatebw":
            if (name === action.data.from) {
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
        name,
        weight,
        ref_block_num,
        stake_net_quantity,
        stake_cpu_quantity,
    };
}
