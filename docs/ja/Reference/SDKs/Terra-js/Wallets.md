# 钱包

## 创建一个钱包

使用 `LCDClient.wallet()` 从 `Key` 创建一个 `Wallet`。 

```ts
import { LCDClient, MnemonicKey } from '@terra-money/terra.js';

const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainId: 'columbus-5'
});

const mk = new MnemonicKey();
const wallet = terra.wallet(mk);
```

在上面的例子中，我们为我们的钱包使用了一个 `MnemonicKey`，但可以使用任何类型的 `Key` 实现来代替。

## 用法

###获取帐号和序列

钱包连接到 Terra 区块链，可以直接轮询帐户的帐号和序列的值:

```ts
console.log(await wallet.accountNumber());
console.log(await wallet.sequence());
```

### 创建交易

钱包通过自动从区块链中获取帐号和序列，可以轻松创建交易。 费用参数是可选的——如果您不包含它，Terra.js 将自动使用您 LCD 的费用估算设置来模拟节点内的交易，并将由此产生的费用包含在您的交易中。 

```ts
const msgs = [ ... ]; // list of messages
const fee = Fee(...); // optional fee

const unsignedTx = await wallet.createTx({
  msgs,
  // fee, (optional)
  memo: 'this is optional'
});
```

然后，您可以使用钱包的密钥签署交易，这将创建一个“StdTx”，您可以稍后对其进行广播: 

```ts
const tx = wallet.key.signTx(unsignedTx);
```

您还可以使用便利函数`Wallet.createAndSignTx()`，它会自动生成一个签名交易进行广播: 

```ts
const tx = await wallet.createAndSignTx({
  msgs,
  fee,  
  memo: 'this is optional'
});
```
