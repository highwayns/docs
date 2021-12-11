# 認証

:::警告メモ
TerraのAuthモジュールは、Cosmos SDKの[`auth`](https://docs.cosmos.network/master/modules/auth/)モジュールを継承しています。このドキュメントはスタブであり、主にその使用方法に関する重要なTerra固有の手順をカバーしています。
:::

TerraのAuthモジュールは、Cosmos SDKの `auth`モジュールの機能を拡張し、変更されたanteハンドラーを使用して、すべての基本的なトランザクション有効性チェック(署名、乱数、補助フィールド)とともに安定性レイヤー料金を適用します。さらに、Lunaの先行販売からのトークンの帰属ロジックを処理する、特別な帰属アカウントタイプが定義されています。

## 料金

Authモジュールは、現在有効な `TaxRate`および` TaxCap`パラメーターを[`Treasury`](./spec-treasury.md)モジュールから読み取り、安定性レイヤー料金を適用します。

### ガソリン代

他のトランザクションと同様に、[`MsgSend`](./spec-bank.md#msgsend)と[` MsgMultiSend`](./spec-bank.md#msgmultisend)はガス料金を支払います。そのサイズは、検証者の設定(各検証者は独自の最小ガス料金を設定します)とトランザクションの複雑さ。 [ガスと料金に関する注意事項](/ja/Reference/terrad/#fees)では、ガスの計算方法について詳しく説明しています。ここで注意すべき重要な詳細は、トランザクションがステーションを出るときにガス料金が送信者によって指定されることです。

### 安定料金

ガス料金に加えて、賭け処理業者は、取引額のパーセンテージである**安定したコイン**(** LUNA **を除く)の安定料金のみを請求します。 [`Treasury`](./spec-treasury.md)モジュールから税率と税の上限パラメータを読み取り、徴収される安定した税額を計算します。

**税率**は、ブロック報酬で税収として収集される支払いトランザクションの割合を指定するネットワークによってネゴシエートされたパラメーターであり、これらの割合はバリデーター間で分配されます。分散モデルは少し複雑で、詳細に説明されています[ここ](../validator/faq.md#how-are-block-provisions-distributed)。各取引に対して徴収される税金は、その取引の額面に対して定義された特定の**税金上限**を超えることはできません。各期間で、ネットワークは税率と課税上限を自動的に再調整します。詳細については、[こちら](spec-treasury.md#monetary-policy-levers)を参照してください。

µSDRトークンの「MsgSend」トランザクションの例については、

```text
stability fee = min(1000 * tax_rate, tax_cap(usdr))
```

「MsgMultiSend」トランザクションの場合、アウトバウンドトランザクションごとに安定料金が請求されます。 

## パラメーター

Authモジュールのサブスペースは `auth`です。 

```go
type Params struct {
	MaxMemoCharacters      uint64 `json:"max_memo_characters" yaml:"max_memo_characters"`
	TxSigLimit             uint64 `json:"tx_sig_limit" yaml:"tx_sig_limit"`
	TxSizeCostPerByte      uint64 `json:"tx_size_cost_per_byte" yaml:"tx_size_cost_per_byte"`
	SigVerifyCostED25519   uint64 `json:"sig_verify_cost_ed25519" yaml:"sig_verify_cost_ed25519"`
	SigVerifyCostSecp256k1 uint64 `json:"sig_verify_cost_secp256k1" yaml:"sig_verify_cost_secp256k1"`
}
```

### MaxMemoCharacters

トランザクションメモで許可される最大文字数。

- type: `uint64`
- default: `256`

### TxSigLimit

トランザクション内の署名者の最大数。 1つのトランザクションに、複数のメッセージと複数の署名者を含めることができます。 sig検証のコストは他の操作よりもはるかに高いため、100に制限します。

- type: `uint64`
- default: `100`

### TxSizeCostPerByte

トランザクションのガス消費量 `TxSizeCostPerByte * txsize`を計算するために使用されます。

- type: `uint64`
- default: `10`

### SigVerifyCostED25519

ED25519署名を検証するためのガスコスト。

- type: `uint64`
- default: `590`

### SigVerifyCostSecp256k1

Secp256k1署名を検証するためのガスコスト。

- type: `uint64`
- default: `1000`
