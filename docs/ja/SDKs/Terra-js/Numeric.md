# 数字

Terra.js 包含 `Dec` 和 `Int`，它们以 Cosmos-SDK 兼容的方式表示十进制数和整数。 

```ts
import { Dec, Int } from '@terra-money/terra.js';

// conversion into dec
const d = new Dec(123.11);

// addition
d.add(3).sub(5).div(3).mod(2);
