# 智能合约

本文档解释了如何使用 Terra.js 执行与使用智能合约相关的任务。

## 上传代码

您首先需要一个编译好的 WASM 智能合约的二进制文件来上传。 

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

## 创建合约

对于 Terra 智能合约，上传合约代码和创建合约是有区别的。 这允许多个合约共享相同的代码，如果它们的逻辑只有很小的变化可以在合约创建时进行配置。 此配置在 **InitMsg** 中传递，并为合约提供初始状态。

要创建（实例化）智能合约，您必须首先知道上传代码的代码 ID。 您将在 InitMsg 旁边的 `MsgInstantiateContract` 中引用它以创建合约。 成功创建后，您的合约将位于您指定的地址。 

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

## 从合约中查询数据

合约可以定义一个查询处理程序，该处理程序理解对名为 QueryMsg 的 JSON 消息中指定的数据的请求。 与消息处理程序不同，查询处理程序不能修改合约或区块链的状态——它是一个只读操作。 因此，从合约查询数据不使用消息和事务，而是直接通过“LCDClient”API 工作。

```ts
const result = await terra.wasm.contractQuery(
  contract_address[0],
  { query: { queryMsgArguments } } // query msg
);
```
