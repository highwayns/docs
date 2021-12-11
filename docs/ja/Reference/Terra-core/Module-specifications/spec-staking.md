# 誓約

ステーキングモジュールは、検証者に地元の住宅ローン資産ルナをバインドするように要求することにより、テラのプルーフオブステーク機能を有効にします。 

## Message Types

### MsgDelegate

```go
type MsgDelegate struct {
	DelegatorAddress sdk.AccAddress `json:"delegator_address" yaml:"delegator_address"`
	ValidatorAddress sdk.ValAddress `json:"validator_address" yaml:"validator_address"`
	Amount           sdk.Coin       `json:"amount" yaml:"amount"`
}
```

### MsgUndelegate

```go
type MsgUndelegate struct {
	DelegatorAddress sdk.AccAddress `json:"delegator_address" yaml:"delegator_address"`
	ValidatorAddress sdk.ValAddress `json:"validator_address" yaml:"validator_address"`
	Amount           sdk.Coin       `json:"amount" yaml:"amount"`
}
```

### MsgBeginRedelegate

```go
type MsgBeginRedelegate struct {
	DelegatorAddress    sdk.AccAddress `json:"delegator_address" yaml:"delegator_address"`
	ValidatorSrcAddress sdk.ValAddress `json:"validator_src_address" yaml:"validator_src_address"`
	ValidatorDstAddress sdk.ValAddress `json:"validator_dst_address" yaml:"validator_dst_address"`
	Amount              sdk.Coin       `json:"amount" yaml:"amount"`
}
```


### MsgEditValidator

```go
type MsgEditValidator struct {
	Description      Description    `json:"description" yaml:"description"`
	ValidatorAddress sdk.ValAddress `json:"address" yaml:"address"`
	CommissionRate    *sdk.Dec `json:"commission_rate" yaml:"commission_rate"`
	MinSelfDelegation *sdk.Int `json:"min_self_delegation" yaml:"min_self_delegation"`
}
```


### MsgCreateValidator

```go
type MsgCreateValidator struct {
	Description       Description     `json:"description" yaml:"description"`
	Commission        CommissionRates `json:"commission" yaml:"commission"`
	MinSelfDelegation sdk.Int         `json:"min_self_delegation" yaml:"min_self_delegation"`
	DelegatorAddress  sdk.AccAddress  `json:"delegator_address" yaml:"delegator_address"`
	ValidatorAddress  sdk.ValAddress  `json:"validator_address" yaml:"validator_address"`
	PubKey            crypto.PubKey   `json:"pubkey" yaml:"pubkey"`
	Value             sdk.Coin        `json:"value" yaml:"value"`
}
```


## Transitions

### End-Block

>このセクションは、Cosmos SDKの公式ドキュメントから抜粋したものであり、ステーキングモジュールのパラメーターを誰もが理解しやすいようにここに配置されています。

各abciエンドブロック呼び出しは、キューの操作とバリデーターセットを更新します
変更は実行するように指定されています。

#### バリデーターセットの変更

その過程で、誓約バリデーターセットは状態遷移を通じて更新されます
各ブロックの最後で実行します。このプロセスの一環として、更新
バリデーターもTendermintに戻され、Tendermintに含まれます。
Tendermintメッセージの検証を担当するバリデーターのセット
コンセンサスレイヤー。操作は次のとおりです。

-新しいバリデーターセットは、 `params.MaxValidators`の最大数と見なされます
  ValidatorsByPowerインデックスから取得したバリデーター
-以前のバリデーターセットを新しいバリデーターセットと比較します。
  -欠落しているバリデーターはバインドを解除し始め、それらの「トークン」は
    `BondedPool`から` NotBondedPool` `ModuleAccount`
  -新しいバリデーターはすぐにバインドされ、それらの「トークン」は
    `NotBondedPool`から` BondedPool`` ModuleAccount`

すべての場合において、バインディングバリデーターセットを離れる、または入るバリデーター、または
バランスを変更し、バインディングバリデーターコレクションにとどまると、更新されます
メッセージがTendermintに返されました。

#### キュー

ステーキングでは、一部の状態遷移は瞬時ではなく発生します
一定期間内(通常はアンバンドリング期間)。これらのとき
変換は成熟しており、完了するには特定の操作が必要です
状態操作。これは、キューを使用して実現されます
各ブロックの最後でチェック/処理します。

##### バリデーターのバインドを解除します

バリデーターがバインディングバリデーターセットから追い出されたとき(パス
投獄されたか、バインドするのに十分なトークンがありませんでした)バインドを解除し始めました
プロセスとそのすべての代表団は(まだ
このバリデーターに委任します)。この時点で、ベリファイアは
アンバウンドバリデーター、「アンバウンドバリデーター」に成熟します
アンバンドリング期間後。

バリデーターキュー内の各ブロックは、成熟したバインドされていないバリデーターがないかチェックされます
(つまり、完了時間<=現在の時間)。現時点での満期
デリゲートが残っていないバリデーターは、状態から削除されます。
他のすべての成熟した拘束力のないバリデーターについては、残りがあります
委任、 `validator.Status`は` sdk.Unbonding`からに切り替えられます
`sdk.Unbonded`。

##### デリゲートのバインドを解除

`UnbondingDelegations.Entries`ですべての成熟した非結合を完了します
`UnbondingDelegations`キューには次のプロセスがあります。

-残高コインをクライアントのウォレットアドレスに転送します
-`UnbondingDelegation.Entries`から成熟したエントリを削除します
-そうでない場合は、ストアから `UnbondingDelegation`オブジェクトを削除します
  残りのエントリ。

##### 再承認

すべての成熟した「Redelegation.Entries」のバインド解除を完了します
`Redelegations`キューには次のプロセスがあります。

-`Redelegation.Entries`から成熟したエントリを削除します
-そうでない場合は、ストアから `Redelegation`オブジェクトを削除します
  残りのエントリ。

## パラメーター

ステーキングモジュールの部分空間は「ステーキング」です。

```go
type Params struct {
	UnbondingTime time.Duration `json:"unbonding_time" yaml:"unbonding_time"`
	MaxValidators uint16        `json:"max_validators" yaml:"max_validators"`
	MaxEntries    uint16        `json:"max_entries" yaml:"max_entries"`
	BondDenom string `json:"bond_denom" yaml:"bond_denom"`
}
```

### UnbondingTime

- type: `time.Duration`
- default: 3 weeks

結合解除の期間(ナノ秒単位)。

### MaxValidators

- type: `uint16`
- default: `130`

アクティブなバリデーターの最大数。  

### MaxEntries

- type: `uint16`
- default: `7`

バインド解除の承認または再承認のエントリの最大数(ペア/3人のグループごと)。 ここでは、ユーザーの決定であるため、オーバーフローの可能性に注意する必要があります。

### BondDenom

- type: `string`
- default: `uluna`

住宅ローンに必要な資産の額面を定義します。
