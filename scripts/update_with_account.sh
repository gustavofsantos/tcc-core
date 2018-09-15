echo Update files with $1

echo $2 > src/ethereum/config_out/pass.wd

echo "
[parity]
chain = \"src/ethereum/config_out/genesis.json\"
base_path = \"src/ethereum/config_out/data\"
[network]
port = 30303
[rpc]
port = 8545
apis = [\"web3\", \"eth\", \"net\", \"personal\", \"parity\", \"parity_set\", \"traces\", \"rpc\", \"parity_accounts\"]
interface = \"0.0.0.0\" #external access to rpc
[ui]
port = 8181
[websockets]
port = 8452
[account]
password = [\"src/ethereum/config_out/pass.wd\"]
[ipc]
disable = true
[mining]
engine_signer = \"$1\"
reseal_on_txs = \"none\"
" > src/ethereum/config_out/node.toml

echo "
{
  \"name\": \"TCCPoANetwork\",
  \"engine\": {
    \"authorityRound\": {
      \"params\": {
        \"blockReward\": \"0x4563918244F40000\",
        \"stepDuration\": \"5\",
        \"validators\" : {
          \"safeContract\": \"0x0000000000000000000000000000000000000005\"
        }
      }
    }
  },
  \"params\": {
    \"gasLimitBoundDivisor\": \"0x400\",
    \"maximumExtraDataSize\": \"0x20\",
    \"minGasLimit\": \"0x1388\",
    \"networkID\" : \"0x2323\"
  },
  \"genesis\": {
    \"seal\": {
      \"authorityRound\": {
        \"step\": \"0x0\",
        \"signature\": \"0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000\"
      }
    },
    \"difficulty\": \"0x20000\",
    \"gasLimit\": \"0x5B8D80\"
  },
  \"accounts\": {
    \"0x0000000000000000000000000000000000000001\": { \"balance\": \"1\", \"builtin\": { \"name\": \"ecrecover\", \"pricing\": { \"linear\": { \"base\": 3000, \"word\": 0 } } } },
    \"0x0000000000000000000000000000000000000002\": { \"balance\": \"1\", \"builtin\": { \"name\": \"sha256\", \"pricing\": { \"linear\": { \"base\": 60, \"word\": 12 } } } },
    \"0x0000000000000000000000000000000000000003\": { \"balance\": \"1\", \"builtin\": { \"name\": \"ripemd160\", \"pricing\": { \"linear\": { \"base\": 600, \"word\": 120 } } } },
    \"0x0000000000000000000000000000000000000004\": { \"balance\": \"1\", \"builtin\": { \"name\": \"identity\", \"pricing\": { \"linear\": { \"base\": 15, \"word\": 3 } } } },
    \"$1\": { \"balance\": \"100000000000000000000\" }
  }
}
" > src/ethereum/config_out/genesis.json