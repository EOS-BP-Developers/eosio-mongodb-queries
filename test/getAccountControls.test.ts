import { getAccountControls } from "../";
import { connect } from "../config";

(async () => {
    const client = await connect();
    const results = await getAccountControls(client, {
        match: {controlled_account: "eosio.saving"},
    });
    console.log(await results.toArray());
    client.close();
})();
