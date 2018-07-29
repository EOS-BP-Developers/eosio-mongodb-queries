import { MongoClient } from "mongodb";
import { getBlocks } from "../";
import { MONGODB_URI } from "../config";

(async () => {
    const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });

    const options = {
        match: {"block.producer": "eosnationftw"},
    };
    try {
        const results = await getBlocks(client, options);
        console.log(await results.toArray());
    } catch (e) {
        console.log(e);
    }
    client.close();
})();
