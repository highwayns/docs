# 取引

このドキュメントでは、取引をブロードキャストすることによってブロックチェーンの状態に影響を与える方法について説明します。

取引には次のものが含まれます。

-メッセージリスト
-オプションのメモ
- 料金
-キーからの署名

取引に含まれるメッセージには、ノード内の適切なメッセージハンドラーにルーティングされる情報が含まれています。このハンドラーは、入力を解析し、ブロックチェーンの次の状態を決定します。

## 取引を作成する

### ウォレットを作成する

まず、取引の署名に使用できるウォレットを作成する必要があります。 

```ts
import { MnemonicKey, LCDClient } from '@terra-money/terra.js';

const mk = new MnemonicKey();
const terra = new LCDClient({
  URL: 'https://soju-lcd.terra.dev',
  chainId: 'soju-0014'
});
const wallet = terra.wallet(mk);
```

### メッセージを作成する 

```ts
import { MsgSend } from '@terra-money/terra.js';

const send = new MsgSend(
  wallet.key.accAddress,
  "<random-terra-address>",
  { uluna: 1000 }
);
```

### 取引を作成して署名する 

```ts
const tx = await wallet.createAndSignTx({
  msgs: [send],
  memo: "Hello"
});
```

### ブロードキャスト取引 

```ts
const txResult = await terra.tx.broadcast(tx);
```
デフォルトのブロードキャストモードは `block`で、取引がブロックに含まれるまで待機します。 これにより、処理中のイベントやエラーなど、取引に関するほとんどの情報が提供されます。

`sync`または` async`ブロードキャストモードを使用することもできます。

```ts
// const syncTxResult = await terra.tx.broadcastSync(tx);
// const asyncTxResult = await terra.tx.broadcastAsync(tx);
```

### イベントを確認する

`block`を使用して取引をブロードキャストすると、取引によって発行されたイベントを取得できます。

```ts
import { isTxError } from "@terra-money/terra.js";

const txResult = terra.tx.broadcast(tx);

if (isTxError(txResult)) {
  throw new Error(`encountered an error while running the transaction: ${txResult.code} ${txResult.codespace}`);
}

// check for events from the first message
txResult.logs[0].eventsByType.store_code;
```
