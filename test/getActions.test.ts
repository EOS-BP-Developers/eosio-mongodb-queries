import { getActions } from "..";
import { connect } from "../config";

(async () => {
    const client = await connect();
    const test1 = await getActions(client, {
        account: "eosio",
        name: ["delegatebw", "undelegatebw"],
        match: {"data.from": "eosnationftw", "data.receiver": "eosnationftw"},
        sort: {_id: -1},
    });
    console.log(JSON.stringify(await test1.toArray(), null, 4));
    client.close();
})();
