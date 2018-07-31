import { getActions } from "..";
import { connect } from "./mongodb";

(async () => {
    const client = await connect();
    const test1 = await getActions(client, {
        account: "eosio",
        name: ["delegatebw", "undelegatebw"],
        match: {"data.from": "eosnationftw", "data.receiver": "eosnationftw"}
    });
    console.log(await test1.toArray());

    const test2 = await getActions(client, {
        account: "eosio",
        name: ["transfer"],
        irreversible: true,
    });
    console.log(await test2.toArray());
    client.close();
})();
