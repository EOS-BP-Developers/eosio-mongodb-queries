import { MongoClient } from "mongodb";
import { getActions } from "..";

(async () => {
    const client = await MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });

    const account = "eosio";
    const names = ["delegatebw", "undelegatebw"];
    const options = {
        accountName: "eosnationftw",
        accountNameKeys: ["data.from", "data.receiver"],
        gte_block_num: 0,
        lte_block_num: Infinity,
    };
    const results = await getActions(client, account, names, options);
    console.log(await results.toArray());
    client.close();
})();
