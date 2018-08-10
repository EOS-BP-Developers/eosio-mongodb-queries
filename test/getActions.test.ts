import { getActions } from "..";
import { connect } from "./mongodb";

(async () => {
    const client = await connect();
    const test = await getActions(client, {
        limit: 3,
        account: "eosio",
        name: ["delegatebw", "undelegatebw"],
        match: {"act.data.from": "eosnationftw", "act.data.receiver": "eosnationftw"},
        sort: {block_num: -1},
    });
    const results = await test.toArray();
    console.log(results);
    client.close();
})();

(async () => {
    const client = await connect();
    const test = await getActions(client, {
        limit: 3,
        account: "eosio",
        name: ["transfer"],
        irreversible: true,
    });
    const results = await test.toArray();
    console.log(results);
    client.close();
})();
