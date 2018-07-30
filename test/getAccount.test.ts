import { MongoClient } from "mongodb";
import { getAccount } from "..";
import { MONGODB_URI } from "../config";

(async () => {
    const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
    const options = {
        lte_block_num: 6000000,
    };
    try {
        const results = await getAccount(client, "chainceout11", options);
        console.log(results);
    } catch (e) {
        console.log(e);
    }
    client.close();
})();
