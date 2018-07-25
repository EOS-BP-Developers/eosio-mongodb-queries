import { MongoClient } from "mongodb";
import { getActions } from "..";

(async () => {
    const client = await MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });

    const options = {
        accounts: ["eosio"],
        names: ["delegatebw", "undelegatebw"],
        data: [{"data.from": "eosnationftw"}, {"data.receiver": "eosnationftw"}],
        gte_block_num: 0,
        lte_block_num: Infinity,
        skip: 0,
        limit: 25,
    };
    try {
        const results = await getActions(client, options);
        console.log(await results.toArray());
    } catch (e) {
        console.log(e);
    }
    client.close();
})();
