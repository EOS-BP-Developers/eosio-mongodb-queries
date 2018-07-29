import { MongoClient } from "mongodb";
import { getActions } from "..";
import { MONGODB_URI } from "../config";

(async () => {
    const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });

    const options = {
        accounts: ["eosio"],
        names: ["delegatebw", "undelegatebw"],
        match: {"data.from": "eosnationftw", "data.receiver": "eosnationftw"},
        gte_block_num: 0,
        lte_block_num: Infinity,
        skip: 0,
        limit: 2,
        sort: {block_num: 1},
    };
    try {
        const results = await getActions(client, options);
        console.log(await results.toArray());
    } catch (e) {
        console.log(e);
    }
    client.close();
})();
