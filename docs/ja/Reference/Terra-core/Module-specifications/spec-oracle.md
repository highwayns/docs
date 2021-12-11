# Oracle

Oracleモジュールは、TerraブロックチェーンにLunaの最新かつ正確な価格フィードとさまざまなTerra固定為替レートを提供するため、[Market](spec-market.md)はTerra <> Terra通貨とTerra <の間の公正な取引ペアを提供できます。 >ルナ。

価格情報はブロックチェーンの外部にあるため、Terraネットワークはバリデーターに依存して現在のルナの為替レートに定期的に投票します。プロトコルは「VotePeriod」ごとに結果をカウントし、チェーン上の為替レートを次のように更新します。 「ReferenceTerra」を使用した加重中央値投票相互為替レートが換算されました。

:::警告メモ
Oracleサービスはバリデーターによってサポートされているため、ステーキングとバリデーターのロジックをカバーする[Staking](spec-staking.md)モジュールを見ると面白いかもしれません。
:::

## 概念

### 投票手順

各[`VotePeriod`](#voteperiod)中に、Oracleモジュールは、[` Whitelist`](#whitelist)で指定された額面のルナの為替レートについて、バリデーターセットのすべてのメンバーにルナへの投票の提出を要求することで合意に達しました。インターバル終了前の為替レート。

検証者は、最初に事前に為替レートを確約し、次に為替レートと事前確約の証明を後続の「VotePeriod」でその価格で提出および開示する必要があります。このスキームにより、有権者は他の人の投票を知る前に提出する必要があり、それによってOracleでの集中化とフリーライディングのリスクが軽減されます。

#### 事前投票と投票 

$ P_t $を[`VotePeriod`](#voteperiod)(現在5ブロックチェーンブロックに設定)で定義されている現在の時間間隔とします。この間、バリデーターは2つのメッセージを送信する必要があります。

-[`MsgExchangeRatePrevote`](#msgexchangerateprevote)には、LunaからTerraにペグされた為替レートのSHA256ハッシュ値が含まれています。ルナの為替レートを報告するには、金種ごとに個別の事前投票を提出する必要があります。

-[`MsgExchangeRateVote`](#msgexchangeratevote)には、前の間隔$ P_ {t-1} $で送信された事前投票のハッシュを作成するために使用されるソルトが含まれています。

#### 投票統計

$ P_t $の終わりに、提出された投票を数えます。

各投票で提出されたソルトは、$ P_ {t-1} $で検証者によって提出された投票との整合性を検証するために使用されます。検証者が事前投票を送信しない場合、またはソルトによって生成されたSHA256が事前投票のハッシュと一致しない場合、投票は破棄されます。

各宗派について、投票のために提出された総投票権が50％を超える場合、投票の加重中央値は、その宗派に対するルナの実効為替レートとしてチェーンに記録され、次の `VotePeriod` $ P_ {t +に使用されます。 1} $。

[`VoteThreshold`](#votethreshold)の総議決権未満の金種を受け取ると、その為替レートがストアから削除され、次の` VotePeriod` $ P_ {t + 1} $期間中に交換することはできません。

投票率が最も高い「ReferenceTerra」を選択してください。 2つの金種の議決権が同じである場合は、参照テラをアルファベット順に選択してください。

#### 参照Terraを使用して相互為替レートを計算します

1.`ReferenceTerra`を選択します

   -`Vote_j = Vote_j_1 ... Vote_j_n`を指定された `VotePeriod`のバリデーター` Val_j`の各テラの `uluna`為替レート投票とします。 `n` =テラホワイトリストの総数
   -すべてのテラホワイトリスト `w_1 ... w_n`について、投票率が最も高いインデックス` r`を選択します。投票率に複数の抽選の当選者がいる場合は、アルファベット順に選択します。相互為替レートの計算に使用される `ReferenceTerra`として` w_r`が選択されました。

2.Oracleの為替レートを計算します

   -各バリデーターは、以下に示すように、 `w_i`の相互交換レート(` CER`)を計算するようになりました。
     -`i≠r`の場合、 `CER_j_i = Vote_j_r/Vote_j_i`
     -`i = r`の場合、 `CER_j_i = Vote_j_r`
   -各クロスレートの電力加重中央値を計算します( `PWM`、すべてのバリデーターにわたって)` CER_j_iMCER_i` = `PWM`(すべてのjに対して)[` CER_j_i`]
   -次に、以下に示すように、これらの `MCER_i`を元の形式uluna/terraに変換します。
     -`i≠r`の場合、 `LunaRate_i = MCER_r/MCER_i`
     -`i = r`の場合、 `LunaRate_i = MCER_r`

3.受賞者
   -`i = r`の場合、以前と同じように、[`tally()`](#tally)を使用します。`MCER_i`を使用して、 `CER_j_i = Vote_j_r`に基づいて投票の勝者に報酬を与えます。
   -`i≠r`の場合、[`tally()`](#tally)を使用して、 `CER_j_i = Vote_j_r/Vote_j_i`の投票と` MCER_i`に基づいて投票の勝者に報酬を与えます。

#### 投票報酬

開票後、[`tally()`](#tally)を渡して、投票の勝者を決定します。

加重中央値に近い狭い範囲で投票に成功した有権者は、収集されたシニョリッジの一部を受け取ります。詳細については、[`k.RewardBallotWinners()`](#k-rewardballotwinners)を参照してください。

:::警告メモ
Columbus-3以降、[Market](spec-market.md)からのスワップ料金はオラクル報酬プールに含まれなくなり、スワップ操作中にすぐに破棄されます。
:::

### リワードベルト

$ M $を加重中央値、$ \ sigma $を投票用紙の投票の標準偏差、$ R $を[`RewardBand`](#rewardband)パラメーターとします。中央値の周りのバンドは、$ \ varepsilon = \ max(\ sigma、R/2)$として設定されます。 $ \ left [M- \ varepsilon、M + \ varepsilon \ right] $の範囲内で為替レートの投票を提出したすべての有効な(つまり、担保付きおよび非管理)検証者は、親戚によって勝者のセットに含まれる必要があります加重議決権。

### 切る

::: 危険
このセクションは潜在的な経済的損失を伴うため、必ず注意深くお読みください。
:::

次のいずれかのイベントを伴う `VotePeriod`は、「ミス」と見なされます。

-検証者は、[`ホワイトリスト`](#whitelist)で指定された**各宗派のルナ為替レートに関する投票を提出できませんでした。

-検証者は、1つまたは複数の金種の加重中央値の周りの[報酬バンド](#reward-band)内で投票できませんでした。

各[`SlashWindow`](#slashwindow)期間中、参加するバリデーターは、共有がカットされるのを防ぐために、少なくとも[` MinValidPerWindow`](#minvalidperwindow)(5％)の有効な投票率を維持する必要があります(現在は[0.01に設定) ％)](#slashfraction))。削減されたバリデーターは、(プリンシパルの資金を保護するために)契約によって自動的に一時的に「投獄」され、オペレーターはバリデーターの参加を回復するために時間内に不一致を修復する必要があります。

### 投票を控える

検証者は、[`MsgExchangeRateVote`](#msgexchangeratevote)の` ExchangeRate`フィールドに正でない整数を送信することで投票を控えることができます。そうすることで、「VotePeriod」を見逃した場合のペナルティが免除されますが、忠実な報告に対するOracleのシニョリッジ報酬の受け取りも失格になります。

## メッセージタイプ

:::警告メモ
開票、ルナ為替レートの更新、投票報酬、および削減の制御フローは、各 `VotePeriod`の最後に発生し、メッセージハンドラーではなく、[end-block ABCI関数](#end-block)にあります。
:::

### MsgExchangeRatePrevote

```go
//MsgExchangeRatePrevote - struct for prevoting on the ExchangeRateVote.
//The purpose of prevote is to hide vote exchange rate with hash
//which is formatted as hex string in SHA256("salt:exchange_rate:denom:voter")
type MsgExchangeRatePrevote struct {
	Hash      string         `json:"hash" yaml:"hash"`//hex string
	Denom     string         `json:"denom" yaml:"denom"`
	Feeder    sdk.AccAddress `json:"feeder" yaml:"feeder"`
	Validator sdk.ValAddress `json:"validator" yaml:"validator"`
}
```

`Hash`は、` salt:exchange_rate:denom:voter`の形式の文字列のSHA256ハッシュ(16進文字列)の最初の20バイトから生成された16進文字列であり、実際の `MsgExchangeRateVote`のメタデータは次の「投票期間」。 [`VoteHash()`](#votehash)関数を使用して、このハッシュのエンコードに役立てることができます。ソルトは後続の「MsgExchangeRateVote」で表示する必要があるため、使用するソルトは投票前の送信ごとに再生成する必要があることに注意してください。

「デノム」は、投票が行われる通貨の額面です。たとえば、有権者が米ドルで事前投票を提出したい場合、正しい「Denom」は「uusd」です。

ハッシュで使用される為替レートは、「デノム」に一致する金種に対するルナの公開市場の為替レートである必要があります。たとえば、 `Denom`が` uusd`で、Lunaの現在の為替レートが$ 1の場合、 `1 uluna` =` 1 uusd`であるため、為替レートとして「1」を使用する必要があります。

`Feeder`(` terra-`アドレス)は、検証者がオラクルの投票署名を(オペレーターが価格を「提供する」のではなく)別のキーに委任して、検証者の署名キーを公開するリスクを軽減したい場合に使用されます。

`Validator`は、元のバリデーター(` terravaloper-`)のバリデーターアドレスです。 

### MsgExchangeRateVote

`MsgExchangeRateVote`には、実際の為替レートの投票が含まれています。 `Salt`パラメータは、事前投票の作成に使用されたソルトと一致する必要があります。一致しない場合、投票者に報酬を与えることはできません。 

```go
//MsgExchangeRateVote - struct for voting on the exchange rate of Luna denominated in various Terra assets.
//For example, if the validator believes that the effective exchange rate of Luna in USD is 10.39, that's
//what the exchange rate field would be, and if 1213.34 for KRW, same.
type MsgExchangeRateVote struct {
	ExchangeRate sdk.Dec        `json:"exchange_rate" yaml:"exchange_rate"`
	Salt         string         `json:"salt" yaml:"salt"`
	Denom        string         `json:"denom" yaml:"denom"`
	Feeder       sdk.AccAddress `json:"feeder" yaml:"feeder"`
	Validator    sdk.ValAddress `json:"validator" yaml:"validator"`
}
```

### MsgDelegateFeedConsent

検証者は、投票権を別のキーに委任して、ブロック署名キーがオンラインのままになるのを防ぐこともできます。 このためには、「MsgDelegateFeedConsent」を提出し、検証者に代わって「MsgExchangeRatePrevote」と「MsgExchangeRateVote」に署名する「Delegate」にオラクルの議決権を委任する必要があります。

::: 危険
委任されたバリデーターは、(TerraまたはLunaで)いくつかの資金を入金するように依頼する場合があります。これらの資金を使用して料金を支払い、別の「MsgSend」で送信できます。 契約はオフチェーンで行われ、Terra契約によって強制されることはありません。
:::

`Operator`フィールドには、バリデーターのオペレーターアドレスが含まれます(接頭辞` terravaloper-`)。 「委任」フィールドは、「オペレーター」に代わって為替レートに関連する投票と事前投票を送信する受託者アカウント(接頭辞「terra-」)のアカウントアドレスです。 

```go
//MsgDelegateFeedConsent - struct for delegating oracle voting rights to another address.
type MsgDelegateFeedConsent struct {
	Operator  sdk.ValAddress `json:"operator" yaml:"operator"`
	Delegate sdk.AccAddress `json:"delegate" yaml:"delegate"`
}
```

### MsgAggregateExchangeRatePrevote

```go
type MsgAggregateExchangeRatePrevote struct {
	Hash      AggregateVoteHash `json:"hash" yaml:"hash"`
	Feeder    sdk.AccAddress    `json:"feeder" yaml:"feeder"`
	Validator sdk.ValAddress    `json:"validator" yaml:"validator"`
}
```

### MsgAggregateExchangeRateVote

```go
type MsgAggregateExchangeRateVote struct {
	Salt          string         `json:"salt" yaml:"salt"`
	ExchangeRates string         `json:"exchange_rates" yaml:"exchange_rates"`//comma separated dec coins
	Feeder        sdk.AccAddress `json:"feeder" yaml:"feeder"`
	Validator     sdk.ValAddress `json:"validator" yaml:"validator"`
}
```

## State

### Prevotes

- type: `map[voter: ValAddress][denom: string]ExchangeRatePrevote`

Contains validator `voter`'s prevote for a given `denom` for the current `VotePeriod`.

### Votes

- type: `map[voter: ValAddress][denom: string]ExchangeRateVote`

Contains validator `voter`'s vote for a given `denom` for the current `VotePeriod`.

### Luna Exchange Rate

- type: `map[denom: string]Dec`

Stores the current Luna exchange rate against a given `denom`, which is used by the [`Market`](spec-market.md) module for pricing swaps.

### Oracle Delegates

- type: `map[operator: ValAddress]AccAddress`

Address of `operator`'s delegated price feeder.

### Validator Misses

- type: `map[operator: ValAddress]int64`

An `int64` representing the number of `VotePeriods` that validator `operator` missed during the current `SlashWindow`.

## Functions

### `VoteHash()`

```go
func VoteHash(salt string, rate sdk.Dec, denom string, voter sdk.ValAddress) ([]byte, error)
```

この関数は、 `VotePeriod`の前に` MsgExchangeRatePrevote`で送信された `salt:rate:denom:voter`から` ExchangeRateVote`の切り捨てられたSHA256ハッシュ値を計算します。

### `tally()`

```go
func tally(ctx sdk.Context, pb types.ExchangeRateBallot, rewardBand sdk.Dec) (weightedMedian sdk.Dec, ballotWinners []types.Claim)
```

この関数には、特定の金種の投票を計算し、加重中央値$ M $と投票の勝者を決定するロジックが含まれています。 

### `k.RewardBallotWinners()`

```go
func (k Keeper) RewardBallotWinners(ctx sdk.Context, ballotWinners types.ClaimPool)
```

各「VotePeriod」の最後に、シニョリッジの一部がオラクル投票の勝者(間隔内に為替レートの投票を提出した検証者)に報酬が与えられます。

各 `VotePeriod`によって報酬が与えられるLunaの合計量は、現在の報酬プール(Oracleモジュールが所有するLuna)内のLunaの数をパラメーター[` RewardDistributionWindow`](#rewarddistributionwindow)で割ったものに等しくなります。

各勝利バリデーターは、その期間中の勝利投票の重みに比例した報酬を受け取ります。

### `SlashAndResetMissCounters()`

```go
func SlashAndResetMissCounters(ctx sdk.Context, k Keeper)
```

この関数は、各 `SlashWindow`の最後に呼び出され、各バリデーターのミスカウンターをチェックして、バリデーターがパラメーター[` MinValidPerWindow`](#minvalidperwindow)で定義された有効票の最小数を満たしているかどうかを確認します(しきい値)。

バリデーターが基準を満たしていない場合、彼らの誓約資金は[`SlashFraction`](#slashfraction)によって削減され、投獄されます。

すべてのバリデーターをチェックした後、次の「SlashWindow」のためにすべてのミスカウンターがゼロにリセットされます。

## Transitions

### End-Block

各ブロックの終わりに、Oracleモジュールはそれが「VotePeriod」の最後のブロックであるかどうかをチェックします。はいの場合、[投票手順](#voting-procedure)を実行します。

1.現在アクティブなルナの為替レートはすべてストアから削除されます

2.受け取ったバロットペーパーは、金種に応じてバロットペーパーにまとめられます。非アクティブまたは投獄されたバリデーターによる棄権と投票は無視されます

3.次の要件を満たさない金種は削除されます。

   -[`ホワイトリスト`](#whitelist)で許可されている宗派に表示される必要があります
   -投票には、少なくとも[`VoteThreshold`](#votethreshold)の合計投票権が必要です。
   -投票率が最も高い `ReferenceTerra`を選択します

4.通過する投票で残りの「デノム」ごとに:

   -[`Compute Cross Exchange Rate using Reference Terra`](#compute-cross-exchange-rate-using-reference-terra)を使用して開票し、[` tally() `](#match)を使用します
   -投票の勝者を繰り返し処理し、合計に重みを追加します
   -`k.SetLunaExchangeRate() `を使用して、ブロックチェーン上のLuna <>` denom`のLuna為替レートを設定します
   -[`exchange_rate_update`](#exchange_rate_update)イベントを発行します

5. [missed](#slashing)Oracleによって投票されたバリデーターを計算し、対応するミスカウンターを追加します

6. [`SlashWindow`](#slashwindow)の最後に、ペナルティしきい値を超える失敗したバリデーターにペナルティを課す場合(送信された有効票の数が[` MinValidPerWindow`](#minvalidperwindow)未満)

7. [`k.RewardBallotWinners()`](#krewardballotwinners)を使用して、投票の勝者に報酬を配布します

8.すべての投票(次の `VotePeriod`を除く)をクリアし、ストアから投票します 

::: details Events

| Type                 | Attribute Key | Attribute Value |
| -------------------- | ------------- | --------------- |
| exchange_rate_update | denom         | {denom}         |
| exchange_rate_update | exchange_rate | {exchangeRate}  |

:::

## Parameters

The subspace for the Oracle module is `oracle`.

```go
//Params oracle parameters
type Params struct {
	VotePeriod               int64     `json:"vote_period" yaml:"vote_period"`
	VoteThreshold            sdk.Dec   `json:"vote_threshold" yaml:"vote_threshold"`
	RewardBand               sdk.Dec   `json:"reward_band" yaml:"reward_band"`
	RewardDistributionWindow int64     `json:"reward_distribution_window" yaml:"reward_distribution_window"`
	Whitelist                DenomList `json:"whitelist" yaml:"whitelist"`
	SlashFraction            sdk.Dec   `json:"slash_fraction" yaml:"slash_fraction"`
	SlashWindow              int64     `json:"slash_window" yaml:"slash_window"`
	MinValidPerWindow        sdk.Dec   `json:"min_valid_per_window" yaml:"min_valid_per_window"`
}
```

### VotePeriod

- type: `int64`
- default value: `5 blockchain blocks'

投票するためのブロックの数。  

### VoteThreshold

- type: `Dec`
- default value: 50%

投票には、最低投票率を渡す必要があります。 

### RewardBand

- type: `Dec`
- default value: 7%

報酬の最終的な加重平均為替レートの許容誤差を受け入れることができます。 

### RewardDistributionWindow

- type: `int64`
- default value: `BlocksPerYear` (1 year window)

Seigniorageは、入力されてから配布されたブロックの数に報酬を与えます。 

### Whitelist

- type: `oracle.DenomList`
- default: `[ukrt, uusd, usdr]`

投票できる通貨のリスト。 デフォルト設定は(µKRW、µSDR、µUSD)です。 

### SlashFraction

- type: `Dec`
- default: 0.01%

結合されたトークンのペナルティのパーセンテージ。 

### SlashWindow

- type: `int64`
- default: `BlocksPerWeek`

カウントを減らすために使用されるブロックの数。 

### MinValidPerWindow

- type: `Dec`
- default: 5%

スラッシュを回避するための各スラッシュウィンドウの最小有効オラクル投票率。
