# コインとコイン

「コイン」は、金種と数量のペアである単一のコインを表します。 `Coins`は、多くの演算子を持つ` Coin`オブジェクトのコレクションを表します 

```ts
import { Coin, Coins } from '@terra-money/terra.js';

const c = new Coin('uluna', 1500000); // 1.5 LUNA
const c2 = new Coin('uluna', 3000000); // 3 LUNA
c.add(c2); // 4.5 LUNA

const cs = new Coins([c, c2]);
const cs2 = new Coins({ uluna: 12002, ukrw: 12399 });
cs2.map(x => console.log(`${x.denom}: ${x.amount}`));
```

Coin / Coinsによって入力された小数入力は、自動的に小数コインに変換されます。 

```ts
const c = new Coin('uluna', 123.3); // a DecCoin
const d = new Coin('uluna', '123.3'); // a DecCoin
```

あいまいな場合は、

JavaScriptのネイティブの `Number`形式で数値を表現するのは便利ですが、 