# 料金  

```ts
import { Fee } from '@terra-money/terra.js';

const msgs = [ new MsgSend( ... ), new MsgSwap( ... ), ]; // messages
const fee = new Fee(50000, { uluna: 4500000 });

const tx = await wallet.createAndSignTx({ msgs, fee });
```

## 自動コスト見積もり

トランザクションの作成時に料金を指定しなかった場合は、ノードでシミュレートすることにより、料金が自動的に見積もられます。

```ts
const tx = await wallet.createAndSignTx({ msgs });
```

`LCDClient`インスタンスを作成するときに、コスト見積もりパラメータを定義できます。 デフォルト値は次のとおりです。

```ts
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
  gasPrices: { uluna: 0.015 },
  gasAdjustment: 1.4
});
```

`wallet.createTx`または` wallet.createAndSignTx`でコスト見積もりパラメータを渡すことにより、これらの設定を上書きできます。  

```ts
const tx = await wallet.createAndSignTx({
  msgs,
  gasPrices: { ukrw: 0.01 },
  gasAdjustment: 1.9
});
```
