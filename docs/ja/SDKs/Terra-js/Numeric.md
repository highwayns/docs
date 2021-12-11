# 番号

Terra.jsには、Cosmos-SDK互換の方法で10進数と整数を表す `Dec`と` Int`が含まれています。 

```ts
import { Dec, Int } from '@terra-money/terra.js';

// conversion into dec
const d = new Dec(123.11);

// addition
d.add(3).sub(5).div(3).mod(2);
