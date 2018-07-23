import { MongoClient } from "mongodb";
import { getAccount } from "..";

(async () => {
    const client = await MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true });
    const options = {
        gte_block_num: 0,
        lte_block_num: Infinity,
    };
    const results = await getAccount(client, "heztcnbsgige", options);
    console.log(results);
    client.close();
})();
