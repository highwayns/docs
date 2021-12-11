# クエリデータ

「LCDClient」インスタンスを介してブロックチェーンに接続した後、そこからデータをクエリできます。 データアクセスは、「LCDClient」インスタンスからアクセスできるさまざまなモジュールAPIに編成されています。 これらはバックグラウンドでHTTPリクエストを行うため、ネットワークIO中にブロックされないように待機できるPromiseです。 

```ts
async main() {
  const marketParams = await terra.market.parameters();
  const exchangeRates = await terra.oracle.exchangeRates();
  console.log(marketParams.base_pool);
  console.log(exchangeRates.get('uusd'));
}

main();
```

各モジュールには、独自のクエリ関数のセットがあります。 完全なリストについては、モジュールのドキュメントを参照してください。 

- [`auth`](https://terra-money.github.io/terra.js/classes/AuthAPI.html)
- [`bank`](https://terra-money.github.io/terra.js/classes/BankAPI.html)
- [`distribution`](https://terra-money.github.io/terra.js/classes/DistributionAPI.html)
- [`gov`](https://terra-money.github.io/terra.js/classes/GovAPI.html)
- [`market`](https://terra-money.github.io/terra.js/classes/MarketAPI.html)
- [`mint`](https://terra-money.github.io/terra.js/classes/MintAPI.html)
- [`msgauth`](https://terra-money.github.io/terra.js/classes/MsgAuthAPI.html)
- [`oracle`](https://terra-money.github.io/terra.js/classes/OracleAPI.html)
- [`slashing`](https://terra-money.github.io/terra.js/classes/SlashingAPI.html)
- [`staking`](https://terra-money.github.io/terra.js/classes/StakingAPI.html)
- [`supply`](https://terra-money.github.io/terra.js/classes/SupplyAPI.html)
- [`tendermint`](https://terra-money.github.io/terra.js/classes/TendermintAPI.html)
- [`treasury`](https://terra-money.github.io/terra.js/classes/TreasuryAPI.html)
- [`tx`](https://terra-money.github.io/terra.js/classes/TxAPI.html)
- [`wasm`](https://terra-money.github.io/terra.js/classes/WasmAPI.html)
