# トレード

このドキュメントでは、トランザクションをブロードキャストすることによってブロックチェーンの状態に影響を与える方法について説明します。

トランザクションには次のものが含まれます。

-メッセージリスト
-オプションのメモ
- 料金
-キーからの署名

トランザクションに含まれるメッセージには、ノード内の適切なメッセージハンドラーにルーティングされる情報が含まれています。このハンドラーは、入力を解析し、ブロックチェーンの次の状態を決定します。

##トランザクションを作成する

###ウォレットを作成する

まず、トランザクションの署名に使用できるウォレットを作成する必要があります。 

```ts
import { MnemonicKey, LCDClient } from '@terra-money/terra.js';

const mk = new MnemonicKey();
const terra = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev',
  chainId: 'bombay-12'
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

### Create and Sign Transaction

```ts
const tx = await wallet.createAndSignTx({
  msgs: [send],
  memo: "Hello"
});
```

### Broadcast transaction

```ts
const txResult = await terra.tx.broadcast(tx);
```
デフォルトのブロードキャストモードは `block`で、トランザクションがブロックに含まれるまで待機します。 これにより、処理中のイベントやエラーなど、トランザクションに関するほとんどの情報が提供されます。

`sync`または` async`ブロードキャストモードを使用することもできます。

```ts
// const syncTxResult = await terra.tx.broadcastSync(tx);
// const asyncTxResult = await terra.tx.broadcastAsync(tx);
```

### イベントをチェック

`block`を使用してトランザクションをブロードキャストすると、トランザクションによって発行されたイベントを取得できます。

```ts
import { isTxError } from "@terra-money/terra.js";

const txResult = terra.tx.broadcast(tx);

if (isTxError(txResult)) {
  throw new Error(`encountered an error while running the transaction: ${txResult.code} ${txResult.codespace}`);
}

// check for events from the first message
txResult.logs[0].eventsByType.store_code;
```
