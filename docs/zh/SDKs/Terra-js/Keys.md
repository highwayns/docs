# 键

要使用带有 Terra.js 的帐户执行操作，您需要一个 **Key**，它提供围绕帐户签名功能的抽象。

## Key interface

A `Key` provides the following interface:

```ts
interface Key {
  publicKey: Buffer;
  accAddress: AccAddress;
  valAddress: ValAddress;
  accPubKey: AccPubKey;
  valPubKey: ValPubKey;

  createSignature(tx: StdSignMsg): StdSignature;
  signTx(tx: StdSignMsg): Promise<StdTx>;
  sign(payload: Buffer): Promise<Buffer>;
}
```

## 关键实现

Terra.js 提供了几种标准的“Key”实现，这些实现提供了多种方式将具有签名功能的帐户加载到您的程序中。

### `RawKey`

`Key` 最基本的实现是 `RawKey`，它是用一个普通的私钥创建的。

```ts
import { RawKey } from '@terra-money/terra.js';

const rk = new RawKey("<private key>");
```

与 `RawKey` 关联的私钥可通过实例获得:

```ts
console.log(rk.privateKey);
```

### `MnemonicKey`

```ts
import { MnemonicKey } from '@terra-money/terra.js';

const mk = new MnemonicKey({
  mnemonic: "<24-word mnemonic>",
});
```

#### 生成随机助记符

如果你想生成一个随机助记符，你可以创建一个不带任何参数的`MnemonicKey`: 

```ts
const mk = new MnemonicKey();
console.log(mk.mnemonic);
```

#### 指定高清路径

`MnemonicKey` 可用于恢复具有特定 BIP44 HD 路径的钱包:`m/44'/${coinType}'/${account}'/0/${index}`。 

```ts
const mk = new MnemonicKey({
  mnemonic: "<seed-phrase>", // optional, will be random if not provided
  coinType: 330, // optional, default
  account: 0, // optional, default
  index: 0, // optional, default
});
```

例如，使用代币类型为 ATOM (118) 使用旧的 Terra 钱包 HD 路径恢复助记符: 

```ts
const mk = new MnemonicKey({
  mnemonic: "<seed-phrase>",
  coinType: 118
});
```

### `CLIKey`

> 注意:这需要您安装 `terrad`。

如果您想使用存储在“terrad”安装密钥环中的密钥来签署交易，您可以使用“CLIKey”。 这也适用于使用 Ledger 硬件设备使用 `--ledger` 在您的密钥环中注册的密钥。

```ts
import { StdFee, MsgSend } from '@terra-money/terra.js';
import { LocalTerra } from '@terra-money/terra.js';
import { CLIKey } from '@terra-money/terra.js';

const terra = new LocalTerra();
const { test1 } = terra.wallets;
const cliKey = new CLIKey('test111');
const cliWallet = terra.wallet(cliKey);

const send = new MsgSend(cliWallet.key.accAddress, test1.key.accAddress, {
  uluna: 100000,
});

async function main() {
  const tx = await cliWallet.createAndSignTx({
    msgs: [send],
    fee: new StdFee(100000, { uluna: 100000 }),
  });

  console.log(await terra.tx.broadcast(tx));
}

main().catch(console.error);
```

## 自定义键实现

如果您需要编写自己的密钥管理解决方案，则需要继承抽象的“Key”类并提供您自己的签名功能。 请注意，密钥不需要公开与私钥有关的任何详细信息——例如，您可以指定一个 `sign()` 函数，将签名请求转发到服务器或硬件钱包。 其余与签名相关的函数(`createSignature()` 和 `signTx()`)是自动提供的，并在下面使用 `sign()`。

下面的代码清单是`RawKey`的实现，它说明了如何编写自定义`Key`:

```ts
import SHA256 from 'crypto-js/sha256';
import * as secp256k1 from 'secp256k1';
import { Key } from '@terra-money/terra.js';

/**
 * An implementation of the Key interfaces that uses a raw private key.
 */
export class RawKey extends Key {
  /**
   * Raw private key, in bytes.
   */
  public privateKey: Buffer;

  constructor(privateKey: Buffer) {
    const publicKey = secp256k1.publicKeyCreate(
      new Uint8Array(privateKey),
      true
    );
    super(Buffer.from(publicKey));
    this.privateKey = privateKey;
  }

  public sign(payload: Buffer): Promise<Buffer> {
    const hash = Buffer.from(SHA256(payload.toString()).toString(), 'hex');
    const { signature } = secp256k1.ecdsaSign(
      Uint8Array.from(hash),
      Uint8Array.from(this.privateKey)
    );
    return Buffer.from(signature);
  }
}
```

请注意，您必须使用公钥调用“super()”——这会生成与您的密钥关联的相关帐户和验证器公钥。 
