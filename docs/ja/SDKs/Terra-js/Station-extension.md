# テラステーションエクステンション

Terra Station拡張APIは急速に進化しており、非常に不安定です。 dAppを開発している場合は、大きな変更が頻繁に導入される可能性があるため、定期的に更新を確認してください。

## Terra Stationの拡張機能とは何ですか？

Terra Station拡張機能は、Chrome用のWebウォレット拡張機能であり、Webページで署名を作成してトランザクション要求をブロードキャストできるようにします。 このWebページは、Station Extensionの存在を検出し、ユーザーが署名するトランザクションを確認できるようにプロンプ​​トを生成できます。

## 接続 

```ts
import { Extension, Wallet } from "@terra-money/@terra.js";

let wallet: Wallet;
const extension = new Extension();
extension.connect();
extension.on("connect", (w: Wallet) => {
  w = wallet;
});
```

## メッセージに署名する 

```ts
import { MsgSend } from "@terra-money/terra.js";

extension.post({
  msgs: []
});
```
