# 建立连接

用户可以通过以下方式与区块链进行交互:

- 查询数据
- 广播交易

## 连接到一个链

要执行这些操作，请使用“LCDClient”对象连接到区块链，该对象表示与运行轻客户端守护程序 (LCD) 的节点的连接。 LCD 充当基于 HTTP 的 RESTful API。 Terra.js 抽象了进行原始 API 调用的细节，并提供了一个您可以使用的界面。 

```ts
import { LCDClient } from '@terra-money/terra.js';

const terra = new LCDClient({
   URL: 'https://lcd.terra.dev',
   chainID: 'columbus-5'
});
```
