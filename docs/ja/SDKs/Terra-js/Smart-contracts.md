# スマートコントラクト

このドキュメントでは、Terra.jsを使用してスマートコントラクトの使用に関連するタスクを実行する方法について説明します。

## コードをアップロード

アップロードするには、最初にWASMスマートコントラクトのコンパイル済みバイナリファイルが必要です。  

```ts
import { LCDClient, MsgStoreCode, MnemonicKey, isTxError } from '@terra-money/terra.js';
import * as fs from 'fs';

// test1 key from localterra accounts
const mk = new MnemonicKey({
  mnemonic: 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'
})

// connect to localterra
const terra = new LCDClient({
  URL: 'http://localhost:1317',
  chainID: 'localterra'
});

const wallet = terra.wallet(mk);

const storeCode = new MsgStoreCode(
  wallet.key.accAddress,
  fs.readFileSync('contract.wasm').toString('base64')
);
const storeCodeTx = await wallet.createAndSignTx({
  msgs: [storeCode],
});
const storeCodeTxResult = await terra.tx.broadcast(storeCodeTx);

console.log(storeCodeTxResult);

if (isTxError(storeCodeTxResult)) {
  throw new Error(
    `store code failed. code: ${storeCodeTxResult.code}, codespace: ${storeCodeTxResult.codespace}, raw_log: ${storeCodeTxResult.raw_log}`
  );
}

const {
  store_code: { code_id },
} = storeCodeTxResult.logs[0].eventsByType;
```

## 契約を作成する

Terraスマートコントラクトの場合、コントラクトコードのアップロードとコントラクトの作成には違いがあります。 これにより、コントラクトの作成時に構成できる小さな変更のみがロジックにある場合、複数のコントラクトが同じコードを共有できます。 この構成は** InitMsg **で渡され、コントラクトの初期状態を提供します。

スマートコントラクトを作成(インスタンス化)するには、最初にアップロードされたコードのコードIDを知っている必要があります。 InitMsgの横にある `MsgInstantiateContract`で参照して、コントラクトを作成します。 作成が成功すると、契約は指定したアドレスに配置されます。 

```ts
import { MsgInstantiateContract } from '@terra-money/terra.js';


const instantiate = new MsgInstantiateContract(
  wallet.key.accAddress,
  +code_id[0], // code ID
  {
    count: 0,
  }, // InitMsg
  { uluna: 10000000, ukrw: 1000000 }, // init coins
  false // migratable
);

const instantiateTx = await wallet.createAndSignTx({
  msgs: [instantiate],
});
const instantiateTxResult = await terra.tx.broadcast(instantiateTx);

console.log(instantiateTxResult);

if (isTxError(instantiateTxResult)) {
  throw new Error(
    `instantiate failed. code: ${instantiateTxResult.code}, codespace: ${instantiateTxResult.codespace}, raw_log: ${instantiateTxResult.raw_log}`
  );
}

const {
  instantiate_contract: { contract_address },
} = instantiateTxResult.logs[0].eventsByType;
```

## 执行合约

智能合约响应称为 **HandleMsg** 的 JSON 消息，该消息可以以不同类型存在。 智能合约编写者应以 JSON 模式的形式向智能合约的任何最终用户提供合约应该理解的所有 HandleMsg 种类的预期格式。 因此，该模式提供了对以太坊合约 ABI 的模拟。 

```ts
import { MsgExecuteContract } from '@terra-money/terra.js';

const execute = new MsgExecuteContract(
  wallet.key.accAddress, // sender
  contract_address[0], // contract account address
  { ...executeMsg }, // handle msg
  { uluna: 100000 } // coins
);

const executeTx = await wallet.createAndSignTx({
  msgs: [execute]
});

const executeTxResult = await terra.tx.broadcast(executeTx);
```

## 契約からのデータのクエリ

コントラクトは、QueryMsgという名前のJSONメッセージで指定されたデータのリクエストを理解するクエリハンドラーを定義できます。 メッセージハンドラーとは異なり、クエリハンドラーはコントラクトまたはブロックチェーンの状態を変更できません。これは読み取り専用の操作です。 したがって、コントラクトからのデータのクエリはメッセージやトランザクションを使用せず、「LCDClient」APIを介して直接機能します。
```ts
const result = await terra.wasm.contractQuery(
  contract_address[0],
  { query: { queryMsgArguments } } // query msg
);
```
