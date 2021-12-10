# 费用 

```ts
import { Fee } from '@terra-money/terra.js';

const msgs = [ new MsgSend( ... ), new MsgSwap( ... ), ]; // messages
const fee = new Fee(50000, { uluna: 4500000 });

const tx = await wallet.createAndSignTx({ msgs, fee });
```

## 自动费用估算

如果您在创建交易时未指定费用，则会通过在节点内对其进行模拟来自动估算费用。

```ts
const tx = await wallet.createAndSignTx({ msgs });
```

您可以在创建 `LCDClient` 实例时定义费用估算参数。 默认值是: 

```ts
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
  gasPrices: { uluna: 0.015 },
  gasAdjustment: 1.4
});
```

您可以通过在 `wallet.createTx` 或 `wallet.createAndSignTx` 中传递费用估算参数来覆盖这些设置: 

```ts
const tx = await wallet.createAndSignTx({
  msgs,
  gasPrices: { ukrw: 0.01 },
  gasAdjustment: 1.9
});
```
