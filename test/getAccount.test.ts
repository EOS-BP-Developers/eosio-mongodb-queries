import { getAccount } from "../";
import { connect } from "../config";

(async () => {
    const client = await connect();
    const results = await getAccount(client, "aus1genereos", {
        lte_block_num: 6146889,
    });
    console.log(results);
    client.close();
})();
