# 查询数据

通过“LCDClient”实例连接到区块链后，您可以从中查询数据。 数据访问被组织成各种模块 API，可以从“LCDClient”实例中访问这些 API。 因为它们在后台发出 HTTP 请求，所以它们是可以等待的 Promises，以便在网络 IO 期间不被阻塞。 

```ts
async main() {
  const marketParams = await terra.market.parameters();
  const exchangeRates = await terra.oracle.exchangeRates();
  console.log(marketParams.base_pool);
  console.log(exchangeRates.get('uusd'));
}

main();
```

每个模块都有自己的一组查询函数。 要获得完整列表，请浏览模块文档:

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
