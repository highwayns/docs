# 与合约交互

::: 警告注意

您也可以在 Terra 的官方桌面钱包 [Terra Station](https://station.terra.money) 中执行这些步骤。

:::

## 要求

确保您已设置 **LocalTerra** 并且它已启动并正在运行:

```sh
cd localterra
docker-compose up
```

您还应该通过构建最新版本的 Terra Core 来获得最新版本的 `terrad`。 我们将配置它以在我们隔离的测试网环境中使用它。

在单独的终端中，确保设置以下助记符:

```sh
terrad keys add test1 --recover
```

使用助记符: 

```
satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn
```

## 上传代码

确保您在上一节中创建的 `my_first_contract.wasm` 的**优化构建**位于您当前的工作目录中。 

```sh
terrad tx wasm store artifacts/my_first_contract.wasm --from test1 --chain-id=localterra --gas=auto --fees=100000uluna --broadcast-mode=block
```
Or, if you are on an arm64 machine:

```sh
terrad tx wasm store artifacts/my_first_contract-aarch64.wasm --from test1 --chain-id=localterra --gas=auto --fees=100000uluna --broadcast-mode=block
```

这将在向 LocalTerra 广播之前要求确认，输入“y”并按 Enter。

您应该会看到类似于以下内容的输出:

```sh
height: 6
txhash: 83BB9C6FDBA1D2291E068D5CF7DDF7E0BE459C6AF547EC82652C52507CED8A9F
codespace: ""
code: 0
data: ""
rawlog: '[{"msg_index":0,"log":"","events":[{"type":"message","attributes":[{"key":"action","value":"store_code"},{"key":"module","value":"wasm"}]},{"type":"store_code","attributes":[{"key":"sender","value":"terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"},{"key":"code_id","value":"1"}]}]}]'
logs:
- msgindex: 0
  log: ""
  events:
  - type: message
    attributes:
    - key: action
      value: store_code
    - key: module
      value: wasm
  - type: store_code
    attributes:
    - key: sender
      value: terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8
    - key: code_id
      value: "1"
info: ""
gaswanted: 681907
gasused: 680262
tx: null
timestamp: ""
```

As you can see, our contract was successfully instantiated with Code ID #1.

You can check it out:

```sh
terrad query wasm code 1
codeid: 1
codehash: KVR4SWuieLxuZaStlvFoUY9YXlcLLMTHYVpkubdjHEI=
creator: terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8
```

## 创建合约

我们现在已经上传了我们合约的代码，但我们仍然没有合约。 让我们使用以下 InitMsg 创建它: 

```json
{
  "count": 0
}
```

We will compress the JSON into 1 line with [this online tool](https://goonlinetools.com/json-minifier/).

```sh
terrad tx wasm instantiate 1 '{"count":0}' --from test1 --chain-id=localterra --fees=10000uluna --gas=auto --broadcast-mode=block
```

You should get a response like the following:

```sh
height: 41
txhash: AEF6F2FA570029A5D4C0DA5ACFA4A2B614D5811E29EEE10FF59F821AFECCD399
codespace: ""
code: 0
data: ""
rawlog: '[{"msg_index":0,"log":"","events":[{"type":"instantiate_contract","attributes":[{"key":"owner","value":"terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8"},{"key":"code_id","value":"1"},{"key":"contract_address","value":"terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5"}]},{"type":"message","attributes":[{"key":"action","value":"instantiate_contract"},{"key":"module","value":"wasm"}]}]}]'
logs:
- msgindex: 0
  log: ""
  events:
  - type: instantiate_contract
    attributes:
    - key: owner
      value: terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8
    - key: code_id
      value: "1"
    - key: contract_address
      value: terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5
  - type: message
    attributes:
    - key: action
      value: instantiate_contract
    - key: module
      value: wasm
info: ""
gaswanted: 120751
gasused: 120170
tx: null
timestamp: ""
```

从输出中，我们看到我们的合约是在上面创建的:`terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5`。 记下这个合约地址，因为我们将在下一节中用到它。

查看您的合同信息:

```sh
terrad query wasm contract terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5
address: terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5
owner: terra1dcegyrekltswvyy0xy69ydgxn9x8x32zdtapd8
codeid: 1
initmsg: eyJjb3VudCI6MH0=
migratable: false
```

You can use the following to decode the Base64 InitMsg:

```sh
echo eyJjb3VudCI6MH0= | base64 --decode
```

This will produce the message we used when initializing the contract: 

```json
{ "count": 0 }
```

## Executing the Contract

Let's do the following:

1. Reset count to 5
2. Increment twice

If done properly, we should get a count of 7.

#### Reset

First, to burn:

```json
{
  "reset": {
    "count": 5
  }
}
```

```sh
terrad tx wasm execute terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5 '{"reset":{"count":5}}' --from test1 --chain-id=localterra --fees=1000000uluna --gas=auto --broadcast-mode=block
```

#### Incrementing

```json
{
  "increment": {}
}
```

```sh
terrad tx wasm execute terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5 '{"increment":{}}' --from test1 --chain-id=localterra --gas=auto --fees=1000000uluna --broadcast-mode=block
```

#### Querying count

Let's check the result of our executions!

```json
{
  "get_count": {}
}
```

```sh
terrad query wasm contract-store terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5 '{"get_count":{}}'
```

Expected output: 

```
query_result:
  count: 7
```

优秀的！ 恭喜，您已经创建了第一个智能合约，并且现在知道如何使用 Terra dApp 平台进行开发。

## 下一步是什么？

我们只介绍了一个简单的智能合约示例，它在其内部状态中修改了一个简单的余额。 虽然这足以制作一个简单的 dApp，但我们可以通过**发送消息** 为更多有趣的应用程序提供动力，这将使我们能够与其他合约以及区块链模块的其余部分进行交互。

在我们的 [repo](https://github.com/terra-money/cosmwasm-contracts) 上查看更多关于 Terra 的智能合约示例。 
