import { getActions } from "..";
import { connect } from "./mongodb";

(async () => {
    const client = await connect();
    (async () => {
        const test = await getActions(client, {
            account: "eosio",
            name: ["delegatebw", "undelegatebw"],
            match: {"act.data.from": "eosnationftw", "act.data.receiver": "eosnationftw"},
        });
        const results = await test.toArray();
        console.log(results);
    })();

    (async () => {
        const test = await getActions(client, {
            account: "eosio",
            name: ["transfer"],
            irreversible: true,
        });
        const results = await test.toArray();
        console.log(results);
    })();
    client.close();
})();
