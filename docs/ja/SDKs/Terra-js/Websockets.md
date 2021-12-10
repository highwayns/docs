# 网络套接字

## `WebSocketClient`

Terra.js 带有“WebSocketClient”，它抽象了对 Tendermint RPC 的 WebSocket 端点的订阅。 这需要访问 Terra 节点的 RPC 服务器，这可能需要特权访问，因为它公开了可以终止节点操作的函数。 使用 LocalTerra，可以通过 `ws://localhost:26657/websocket` 访问 WebSocket 端点。 

```ts
import { LocalTerra, WebSocketClient } from '@terra-money/terra.js';

const wsclient = new WebSocketClient('ws://localhost:26657/websocket');

const terra = new LocalTerra();

let count = 0;
wsclient.subscribe('NewBlock', {}, (_) => {
  console.log(count);
  count += 1;

  if (count === 3) {
    wsclient.destroy();
  }
});

// send tracker
wsclient.subscribe('Tx', { 'message.action': 'send' }, data => {
  console.log('Send occured!');
  console.log(data.value);
});
```

### 支持的事件

您可以订阅以下公认的 Tendermint 事件: 

  - `CompleteProposal`
  - `Evidence`
  - `Lock`
  - `NewBlock`
  - `NewBlockHeader`
  - `NewRound`
  - `NewRoundStep`
  - `Polka`
  - `Relock`
  - `TimeoutPropose`
  - `TimeoutWait`
  - `Tx`
  - `Unlock`
  - `ValidatorSetUpdates`
  - `ValidBlock`
  - `Vote`

### 询问

为了指定 Tendermint 查询，使用以下语法:

```ts
type TendermintQueryOperand = string | number | Date;

interface TendermintQuery {
  [k: string]:
    | TendermintQueryOperand
    | ['>', number | Date]
    | ['<', number | Date]
    | ['<=', number | Date]
    | ['>=', number | Date]
    | ['CONTAINS', string]
    | ['EXISTS'];
}
```

下面显示了如何构造一个 `TendermintQuery` 并将其用于订阅的示例:

```ts
const tmQuery = {
  "message.action": "send", //
  "tx.timestamp": [">=", new Date()],
  "store_code.abc": ["EXISTS"],
  "abc.xyz": ["CONTAINS", "terra1..."]
};

wsclient.subscribe('Tx', tmQuery, (data) => {
  // do something with data ...
});
```

结果查询将是:

`tm.event='Tx' AND message.action='send' tx.timestamp >= 2020-12-12 AND store_code.abc 存在且 abc.xyz CONTAINS 'terra1...'`

###`subscribeTx`

使用 Tendermint 查询订阅交易是一个常见的用例，例如侦听特定地址何时发送或接收资金，或何时从智能合约中触发特定事件。 但是，由于交易结果采用 Base64 Amino 编码，因此很难提取数据。 如果您使用 `subscribeTx`，Terra.js 会自动将 `txhash` 注入到结果数据值中，以便您可以更轻松地查找交易以使用 `LCDClient` 对其进行解码。

```ts
// swap tracker
wsclient.subscribeTx({ 'message.action': 'swap' }, async data => {
  console.log('Swap occured!');
  const txInfo = await terra.tx.txInfo(data.value.TxResult.txhash);
  if (txInfo.logs) {
    console.log(txInfo.logs[0].eventsByType);
  }
});
```
