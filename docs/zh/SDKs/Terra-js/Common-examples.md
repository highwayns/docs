# 常见例子

## 配置 LCDClient

以下代码示例显示了如何初始化 LCDClient。 其余示例假定您使用此示例或类似代码对其进行了初始化。

```ts
import fetch from 'isomorphic-fetch';
import { MsgSend, MnemonicKey, Coins, LCDClient } from '@terra-money/terra.js';

// Fetch gas prices and convert to `Coin` format.
const gasPrices = await (await fetch('https://bombay-fcd.terra.dev/v1/txs/gas_prices')).json();
const gasPricesCoins = new Coins(gasPrices);

const lcd = new LCDClient({
  URL: "https://bombay-lcd.terra.dev/",
  chainID: "bombay-12",
  gasPrices: gasPricesCoins,
  gasAdjustment: "1.5",
  gas: 10000000,
});
```

## 发送原生代币

以下代码示例显示了如何发送本机令牌:

```ts
import { LCDClient, MnemonicKey, MsgSend } from "@terra-money/terra.js";

// const lcd = new LCDClient(...);

const mk = new MnemonicKey({
  mnemonic: 'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn',
});

const wallet = lcd.wallet(mk);

// Transfer 1 Luna.
const send = new MsgSend(
  wallet.key.accAddress,
  "terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8",
  { uluna: "1000000" }
);

const tx = await wallet.createAndSignTx({ msgs: [send] });
const result = await lcd.tx.broadcast(tx);

console.log(result);
```

## 发送 CW20 代币

以下代码示例显示了如何发送 CW20 令牌:

```ts
import {
  LCDClient,
  MnemonicKey,
  MsgExecuteContract,
} from "@terra-money/terra.js";

// const lcd = new LCDClient(...);

const mk = new MnemonicKey({
  mnemonic: 'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn',
});

const wallet = lcd.wallet(mk);

// Transfer 1 ANC.
const cw20Send = new MsgExecuteContract(
  wallet.key.accAddress,
  "terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76", // ANC token address.
  {
    transfer: {
      amount: "1000000",
      recipient: wallet.key.accAddress,
    },
  }
);

const tx = await wallet.createAndSignTx({ msgs: [cw20Send] });
const result = await lcd.tx.broadcast(tx);

console.log(result);
```

## 使用市场模块交换
以下代码示例显示了如何使用市场模块交换原生 Terra 资产:

```ts
import {
  LCDClient,
  MnemonicKey,
  MsgSwap,
  Coin,
} from "@terra-money/terra.js";

// const lcd = new LCDClient(...);

const mk = new MnemonicKey({
  mnemonic: 'satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn',
});

const wallet = lcd.wallet(mk);

// Swap 1 Luna to UST.
const swap = new MsgSwap(
  wallet.key.accAddress,
  new Coin('uluna', '1000000'),
  'uusd'
);

const tx = await wallet.createAndSignTx({ msgs: [swap] });
const result = await lcd.tx.broadcast(tx);

console.log(result);
```
