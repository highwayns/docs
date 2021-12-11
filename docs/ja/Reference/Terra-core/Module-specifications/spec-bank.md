# 銀行

:::警告メモ
TerraのBankモジュールは、Cosmos SDKの[`bank`](https://docs.cosmos.network/master/modules/bank/)モジュールを継承しています。 このドキュメントはスタブであり、主にその使用方法に関する重要なTerra固有の手順をカバーしています。
:::

Bankモジュールは、Terraブロックチェーンの基本的なトランザクションレイヤーです。これにより、アセットを1つの「アカウント」から別の「アカウント」に送信できます。 銀行は、 `MsgSend`と` MsgMultiSend`の2種類の送信トランザクションを定義しています。 これらのメッセージは、[`Auth`モジュールのアンティハンドラー](spec-auth.md#stability-fee)によって実行される安定性料金を自動的に生成します。

## メッセージタイプ 

### MsgSend

```go
//MsgSend-コインモジュールの高度なトランザクション
type MsgSend struct {
    FromAddress sdk.AccAddress `json:"from_address"`
    ToAddress   sdk.AccAddress `json:"to_address"`
    Amount      sdk.Coins      `json:"amount"`
}
```

Bankモジュールを使用して、ある `Account`(` terra-`プレフィックスアカウント)から別の `Account`にコインを送ることができます。 送信を容易にするために `MsgSend`を構築しました。 「口座」のコイン残高が不足している場合、または受取人の「口座」が銀行モジュールを介して資金を受け取ることが許可されていない場合、取引は失敗します。 

### MsgMultiSend

```go
//MsgMultiSend-コインモジュールの高度なトランザクション 
type MsgMultiSend struct {
    Inputs  []Input  `json:"inputs"`
    Outputs []Output `json:"outputs"`
}
```

銀行モジュールを使用して、一度に複数のトランザクションを送信できます。 `Inputs`には着信トランザクションが含まれ、` Outputs`には発信トランザクションが含まれます。 「入力」と「出力」のコイン残高は正確に一致する必要があります。 マルチセンドによるバッチトランザクションの利点は、ネットワーク帯域幅とガスコストを節約できることです。

「アカウント」のいずれかが失敗した場合、トランザクションを通じて支払われた税金は返金されません。