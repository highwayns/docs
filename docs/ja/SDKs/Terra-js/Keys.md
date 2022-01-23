# 鍵

Terra.jsでアカウントを使用して操作を実行するには、アカウント署名関数の抽象化を提供する**キー**が必要です。 

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

## 重要な実現

Terra.jsは、いくつかの標準的な「キー」実装を提供します。これは、署名関数を持つアカウントをプログラムにロードするための複数の方法を提供します。

### `RawKey`

`Key`の最も基本的な実装は` RawKey`で、これは通常の秘密鍵で作成されます。 

```ts
import { RawKey } from '@terra-money/terra.js';

const rk = new RawKey("<private key>");
```

`RawKey`に関連付けられた秘密鍵は、次の例で取得できます。 

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

#### ランダムなニーモニックを生成する

ランダムなニーモニックを生成する場合は、パラメーターなしで `MnemonicKey`を作成できます。 

```ts
const mk = new MnemonicKey();
console.log(mk.mnemonic);
```

#### HDパスを指定する

`MnemonicKey`は、特定のBIP44HDパスでウォレットを復元するために使用できます :`m/44'/${coinType}'/${account}'/0/${index}`。 

```ts
const mk = new MnemonicKey({
  mnemonic: "<seed-phrase>", // optional, will be random if not provided
  coinType: 330, // optional, default
  account: 0, // optional, default
  index: 0, // optional, default
});
```

たとえば、トークンタイプATOM(118)を使用して、古いTerraウォレットHDパスを使用してニーモニックを復元します。 

```ts
const mk = new MnemonicKey({
  mnemonic: "<seed-phrase>",
  coinType: 118
});
```

### `CLIKey`

>注:これには、terradをインストールする必要があります。

「terrad」インストールキーリングに保存されているキーを使用してトランザクションに署名する場合は、「CLIKey」を使用できます。 これは、キーリングに `--ledger`で登録されたキーを持つ元帳ハードウェアデバイスの使用にも当てはまります。

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

## カスタムキーの実装

独自の鍵管理ソリューションを作成する必要がある場合は、抽象「Key」クラスを継承し、独自の署名関数を提供する必要があります。 キーは秘密キーに関連する詳細を開示する必要がないことに注意してください。たとえば、 `sign()`関数を指定して、署名要求をサーバーまたはハードウェアウォレットに転送できます。 残りの署名関連関数( `createSignature()`と `signTx()`)は自動的に提供され、以下の `sign()`を使用します。

次のコードリストは `RawKey`の実装であり、カスタム` Key`の記述方法を示しています。

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

「super()」を呼び出すには、公開鍵を使用する必要があることに注意してください。これにより、関連するアカウントと、鍵に関連付けられた検証者の公開鍵が生成されます。  
