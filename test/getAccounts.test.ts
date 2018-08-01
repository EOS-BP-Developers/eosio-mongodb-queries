import { getAccounts } from "../";
import { connect } from "./mongodb";

(async () => {
    const client = await connect();
    const results = await getAccounts(client, {
        abi: true,
    });
    console.log(await results.toArray());
    client.close();
})();
