# ネットワークソケット

## `WebSocketClient`

Terra.jsには、TendermintRPCのWebSocketエンドポイントへのサブスクリプションを抽象化する「WebSocketClient」が付属しています。 これには、TerraノードのRPCサーバーへのアクセスが必要です。これにより、ノードの操作を終了できる機能が公開されるため、特権アクセスが必要になる場合があります。 LocalTerraを使用すると、 `ws://localhost:26657/websocket`を介してWebSocketエンドポイントにアクセスできます。  

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

//send tracker
wsclient.subscribe('Tx', { 'message.action': 'send' }, data => {
  console.log('Send occured!');
  console.log(data.value);
});
```

### サポートされているイベント

次の認識されたTendermintイベントをサブスクライブできます。

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
  "message.action": "send",//
  "tx.timestamp": [">=", new Date()],
  "store_code.abc": ["EXISTS"],
  "abc.xyz": ["CONTAINS", "terra1..."]
};

wsclient.subscribe('Tx', tmQuery, (data) => {
 //do something with data ...
});
```

結果のクエリは次のようになります。

`tm.event = 'Tx' AND message.action = 'send' tx.timestamp> = 2020-12-12 AND store_code.abcが存在し、abc.xyzに 'terra1 ...'`が含まれています

### `subscribeTx`

Tendermintを使用してサブスクリプショントランザクションをクエリすることは、特定のアドレスが資金を送受信するとき、または特定のイベントがスマートコントラクトからトリガーされるときをリッスンするなどの一般的なユースケースです。 ただし、トランザクション結果はBase64 Aminoでエンコードされているため、データを抽出することは困難です。 `subscribeTx`を使用すると、Terra.jsは自動的に` txhash`を結果データ値に挿入するため、 `LCDClient`を使用してそれらをデコードするトランザクションをより簡単に見つけることができます。

```ts
//swap tracker
wsclient.subscribeTx({ 'message.action': 'swap' }, async data => {
  console.log('Swap occured!');
  const txInfo = await terra.tx.txInfo(data.value.TxResult.txhash);
  if (txInfo.logs) {
    console.log(txInfo.logs[0].eventsByType);
  }
});
```
