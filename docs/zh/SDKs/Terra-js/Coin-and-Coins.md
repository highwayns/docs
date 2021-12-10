# 硬币和硬币

“Coin”代表单个硬币，它是由面额和数量组成的一对。 `Coins` 表示一个 `Coin` 对象的集合，其中有许多操作符 

```ts
import { Coin, Coins } from '@terra-money/terra.js';

const c = new Coin('uluna', 1500000); // 1.5 LUNA
const c2 = new Coin('uluna', 3000000); // 3 LUNA
c.add(c2); // 4.5 LUNA

const cs = new Coins([c, c2]);
const cs2 = new Coins({ uluna: 12002, ukrw: 12399 });
cs2.map(x => console.log(`${x.denom}: ${x.amount}`));
```

Coin / Coins 输入的十进制输入将自动转换为十进制硬币。

```ts
const c = new Coin('uluna', 123.3); // a DecCoin
const d = new Coin('uluna', '123.3'); // a DecCoin
```

如果有歧义，

虽然通过 JavaScript 的原生 `Number` 格式来表示数字很方便，但你应该 
