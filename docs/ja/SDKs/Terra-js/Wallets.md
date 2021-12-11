# 財布

## ウォレットを作成する

`LCDClient.wallet()`を使用して、 `Key`から` Wallet`を作成します。 

```ts
import { LCDClient, MnemonicKey } from '@terra-money/terra.js';

const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainId: 'columbus-3'
});

const mk = new MnemonicKey();
const wallet = terra.wallet(mk);
```

上記の例では、ウォレットに `MnemonicKey`を使用しましたが、代わりに任意のタイプの` Key`実装を使用できます。

## 使用法

### アカウント番号とシーケンスを取得する

ウォレットはTerraブロックチェーンに接続されており、アカウント番号とアカウントのシーケンス値を直接ポーリングできます。 

```ts
console.log(await wallet.accountNumber());
console.log(await wallet.sequence());
```

### トランザクションを作成する

ウォレットは、ブロックチェーンからアカウント番号とシーケンスを自動的に取得することで、簡単にトランザクションを作成できます。 コストパラメータはオプションです。これを含めない場合、Terra.jsはLCDのコスト見積もり設定を自動的に使用してノード内のトランザクションをシミュレートし、結果のコストをトランザクションに含めます。  

```ts
const msgs = [ ... ]; // list of messages
const fee = StdFee(...); // optional fee

const unsignedTx = await wallet.createTx({
  msgs,
  // fee, (optional)
  memo: 'this is optional'
});
```

次に、ウォレットのキーを使用してトランザクションに署名できます。これにより、後でブロードキャストできる「StdTx」が作成されます。

```ts
const tx = wallet.key.signTx(unsignedTx);
```

便利な関数 `Wallet.createAndSignTx()`を使用することもできます。これにより、ブロードキャスト用の署名付きトランザクションが自動的に生成されます。 

```ts
const tx = await wallet.createAndSignTx({
  msgs,
  fee,  
  memo: 'this is optional'
});
```
