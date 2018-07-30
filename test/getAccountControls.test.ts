import { MongoClient } from "mongodb";
import { getAccountControls } from "../";
import { MONGODB_URI } from "../config";

(async () => {
    const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });

    const options = {
        sort: {_id: -1},
        // match: {controlled_account: "eosio.saving"},
    };
    try {
        const results = await getAccountControls(client, options);
        console.log(await results.toArray());
    } catch (e) {
        console.log(e);
    }
    client.close();
})();
