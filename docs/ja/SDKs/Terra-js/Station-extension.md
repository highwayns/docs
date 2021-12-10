# Terra Station 扩展

Terra Station 扩展的 API 正在快速发展并且非常不稳定。 如果您正在开发 dApp，请定期检查更新，因为可能会经常引入重大更改。

## Terra Station 扩展是什么？

Terra Station 扩展程序是 Chrome 的网络钱包扩展程序，它使网页能够创建签名和广播交易的请求。 该网页可以检测到 Station Extension 的存在并生成提示，从而用户可以确认要签署的交易。

## 连接 

```ts
import { Extension, Wallet } from "@terra-money/@terra.js";

let wallet: Wallet;
const extension = new Extension();
extension.connect();
extension.on("connect", (w: Wallet) => {
  w = wallet;
});
```

## 签署消息 

```ts
import { MsgSend } from "@terra-money/terra.js";

extension.post({
  msgs: []
});
```
