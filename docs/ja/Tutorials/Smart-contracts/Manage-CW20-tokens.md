# CW20トークン
[公式文書](https://docs.rs/crate/cw20/0.2.3)によると
> CW20は、CosmWasmに基づく代替トークン仕様です。 名前とデザインは大まかにイーサリアムのERC20標準に基づいていますが、多くの変更が加えられています。 ここでのタイプは、この仕様を実装することを希望するコントラクト、または標準のcw20コントラクトを呼び出すコントラクトによってインポートできます。

## CW20のバランスを確認する
   -query_msgを使用して、 `/wasm/Contracts/<tokenContractAddress>/store" {"balance":{"address": "<userAddress>"}} `をクエリします
   -応答: `{" height ":" 2947306 "、"結果 ":{" balance ":" 24732816921 "}}`
   -[例](https://bombay-lcd.terra.dev/wasm/contracts/terra1800p00qlxh0nmt0r0u9hv7m4lg042fnafng2t6/store?query_msg= {％22balance％22:{％22address％22:％22address％d

## CW20契約と対話する

-CW20はcosmwasmコントラクトであり、 `wasm/MsgExecuteContract`を使用して対話します
-メッセージペイロードの形式は次のように分類されます( `bank/MsgSend`に似ていますが、` execute_msg`が追加されています)。 

```
{
  "type": "wasm/MsgExecuteContract",
  "value": {
  //sender address
    "sender": "terra1zyrpkll2xpgcdsz42xm3k8qfnddcdu0w7jzx6y",

  //token contract address
    "contract": "terra1rz5chzn0g07hp5jx63srpkhv8hd7x8pss20w2e",

  //base64-encoded payload of contract execution message (refer to below)
    "execute_msg": "ewogICJzZW5kIjogewogICAgImFtb3VudCI6ICIxMDAwMDAwMDAwIiwKICAgICJjb250cmFjdCI6IDxyZWNpcGllbnRDb250cmFjdEFkZHJlc3M+LAogICAgIm1zZyI6ICJleUp6YjIxbFgyMWxjM05oWjJVaU9udDlmUT09IiAKICB9Cn0=",

  //used in case you are sending native tokens along with this message
    "coins": []
  }
}
```

## Sending CW20 token to another contract, and execute message
- Example
  - [Finder](https://finder.terra.money/columbus-5/tx/99CFBABE9DBC1059EF40B985D17ED9CCBA11570B28B032D4E57D527FD298F60A)
  - [Raw result](https://lcd.terra.dev/txs/99CFBABE9DBC1059EF40B985D17ED9CCBA11570B28B032D4E57D527FD298F60A)

```
//base64-encode the below message (without the comments), send that as `execute_msg`
{
  "send": {
  //amount of CW20 tokens being transferred
    "amount": "1000000000",

  //recipient of this transfer
    "contract": <recipientContractAddress>,

  //execute_msg to be executed in the context of recipient contract
    "msg": "eyJzb21lX21lc3NhZ2UiOnt9fQ==" 
  }
}
```

## Transferring CW20 token
  - `transfer` is different to `send`, as in it only __transfers__ ownership of CW20 balance within the contract, whereas `send` is capable of transferring & relays a contract msg to be executed
  - Example
    - [Finder](https://finder.terra.money/columbus-5/tx/F424552E25FDE52FEC229E04AE719A5B91D99E1088DC5F4978B263516A269FB1)
    - [Raw result](https://lcd.terra.dev/txs/F424552E25FDE52FEC229E04AE719A5B91D99E1088DC5F4978B263516A269FB1)
  - Find other messages at [cw20 documentation](https://docs.rs/crate/cw20/0.8.1)

```
{
  "transfer": {
    "amount": "1000000",
    "recipient": "<recipient>"
  }
}
```