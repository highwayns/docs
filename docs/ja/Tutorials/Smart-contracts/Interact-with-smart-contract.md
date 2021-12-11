# 契約と対話する

:::警告メモ

これらの手順は、Terraの公式デスクトップウォレット[Terra Station](https://station.terra.money)でも実行できます。

:::

## 必須

** LocalTerra **を設定し、稼働していることを確認してください。 

```sh
cd localterra
docker-compose up
```

また、最新バージョンのTerra Coreをビルドして、最新バージョンの `terrad`を入手する必要があります。 分離されたテストネット環境で使用するように構成します。

別の端末で、必ず次のニーモニックを設定してください。

```sh
terrad keys add test1 --recover
```

ニーモニックを使用する: 

```
satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn
```

## コードをアップロード

前のセクションで作成した `my_first_contract.wasm`の**最適化されたビルド**が現在の作業ディレクトリにあることを確認してください。  

```sh
terrad tx wasm store artifacts/my_first_contract.wasm --from test1 --chain-id=localterra --gas=auto --fees=100000uluna --broadcast-mode=block
```
Or, if you are on an arm64 machine:

```sh
terrad tx wasm store artifacts/my_first_contract-aarch64.wasm --from test1 --chain-id=localterra --gas=auto --fees=100000uluna --broadcast-mode=block
```

これにより、LocalTerraにブロードキャストする前に確認を求められます。「y」と入力して、Enterキーを押します。

次のような出力が表示されます。 

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

## これにより、LocalTerraにブロードキャストする前に確認を求められます。「y」と入力して、Enterキーを押します。

次のような出力が表示されます。 

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

これにより、LocalTerraにブロードキャストする前に確認を求められます。「y」と入力して、Enterキーを押します。

次のような出力が表示されます。 

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

優れました！ おめでとうございます。これで最初のスマートコントラクトが作成され、TerradAppプラットフォームを使用して開発する方法がわかりました。

## 次は何ですか？

内部状態の単純なバランスを変更する単純なスマートコントラクトの例のみを紹介しました。 これは単純なdAppを作成するのに十分ですが、**メッセージを送信**することで、より興味深いアプリケーションを強化できます。これにより、他のコントラクトや残りのブロックチェーンモジュールと対話できるようになります。

[リポジトリ](https://github.com/terra-money/cosmwasm-contracts)でTerraのスマートコントラクトのその他の例を確認してください。 