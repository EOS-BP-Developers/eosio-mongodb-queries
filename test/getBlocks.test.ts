import { getBlocks } from "../";
import { connect } from "./mongodb";

(async () => {
    const client = await connect();
    const results = await getBlocks(client, {
        match: {"block.producer": "eosnationftw"},
    });
    console.log(await results.toArray());
    client.close();
})();
