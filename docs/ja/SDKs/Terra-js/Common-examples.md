# 一般的な例

## LCDClientを構成する

次のコード例は、LCDClientを初期化する方法を示しています。 残りの例は、この例または同様のコードで初期化したことを前提としています。 

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

## ネイティブトークンを送信する 

次のコード例は、ネイティブトークンを送信する方法を示しています。

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

## 次のコード例は、CW20トークンをローカルに送信する方法を示しています

次のコード例は、CW20トークンを送信する方法を示しています。

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

## マーケットモジュールを使用した交換
次のコード例は、マーケットモジュールを使用してネイティブTerraアセットを交換する方法を示しています。 

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
