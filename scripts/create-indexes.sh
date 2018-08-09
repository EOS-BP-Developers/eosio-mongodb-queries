#!/usr/bin/env bash

# action_traces
mongo EOS --eval 'db.action_traces.createIndex({"act.account": 1, "act.name": 1},{background: true})'

# eosio:delegatebw
# eosio:undelegatebw
mongo EOS --eval 'db.action_traces.createIndex({"act.data.from": 1},{background: true})'
mongo EOS --eval 'db.action_traces.createIndex({"act.data.receiver": 1},{background: true})'

