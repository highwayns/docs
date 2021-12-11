# 接続を確立する

ユーザーは、次の方法でブロックチェーンを操作できます。

-クエリデータ
-ブロードキャストトランザクション

## チェーンに接続する

これらの操作を実行するには、ライトクライアントデーモン(LCD)を実行しているノードへの接続を表す「LCDClient」オブジェクトを使用してブロックチェーンに接続します。 LCDはHTTPに基づくRESTfulAPIとして機能します。 Terra.jsは、元のAPI呼び出しの詳細を抽象化し、使用できるインターフェースを提供します。 

```ts
import { LCDClient } from '@terra-money/terra.js';

const terra = new LCDClient({
   URL: 'https://lcd.terra.dev',
   chainID: 'columbus-5'
});
```
