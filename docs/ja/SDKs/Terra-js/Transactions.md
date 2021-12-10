# 交易

本文档解释了如何通过广播交易来影响区块链的状态。

交易包括:

- 消息列表
- 可选的备忘录
- 费用
- 来自钥匙的签名

交易中包含的消息包含将路由到节点中适当消息处理程序的信息，该处理程序依次解析输入并确定区块链的下一个状态。

## 创建交易

### 创建一个钱包

您首先要创建一个可用于签署交易的钱包。 

```ts
import { MnemonicKey, LCDClient } from '@terra-money/terra.js';

const mk = new MnemonicKey();
const terra = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev',
  chainId: 'bombay-12'
});
const wallet = terra.wallet(mk);
```

### 创建消息 

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
默认的广播模式是`block`，它会一直等到交易被包含在一个区块中。 这将为您提供有关交易的最多信息，包括处理时的事件和错误。

您还可以使用 `sync` 或 `async` 广播模式。

```ts
// const syncTxResult = await terra.tx.broadcastSync(tx);
// const asyncTxResult = await terra.tx.broadcastAsync(tx);
```

### 检查事件

如果您使用 `block` 广播交易，您可以获得交易发出的事件。

```ts
import { isTxError } from "@terra-money/terra.js";

const txResult = terra.tx.broadcast(tx);

if (isTxError(txResult)) {
  throw new Error(`encountered an error while running the transaction: ${txResult.code} ${txResult.codespace}`);
}

// check for events from the first message
txResult.logs[0].eventsByType.store_code;
```
