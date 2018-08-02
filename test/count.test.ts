import { count } from "../";
import { connect } from "./mongodb";

(async () => {
    const client = await connect();
    console.log(await count(client, "actions", {account: "eosio.token"}));
    console.log(await count(client, "actions", {"data.to": "eosio.saving"}));
    console.log(await count(client, "actions"));
    console.log(await count(client, "accounts"));
    client.close();
})();
