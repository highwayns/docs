---
sidebarDepth: 2
---

# 財務省

財務省モジュールは、テラの経済の「中央銀行」として機能し、[観測された指標](#observed-indicators)と調整[金融政策レバー](#monetary-policy-levers)を通じてマクロ経済活動を測定し、鉱夫、それはそれが長期的に安定して成長する傾向があるように。

:::警告注:
財務省は鉱山労働者の需要を安定させるために報酬を調整しますが、[`Market`](spec-market.md)モジュールは、裁定取引とマーケットメーカーを通じてTerraの価格安定に責任があります。
:::

## 概念

### 観測された指標

財務省は、各期間の3つのマクロ経済指標を観察し、前の期間の[指標](#指標)の値を保持します。

-**税の報酬**:$ T $、一定期間の取引と安定した料金によって生み出された収入。
-**シニョリッジ報酬***:$ S $、エポック中にルナからテラへの交換中に生成されたシニョリッジの量。このエポックは、「オラクル」報酬の投票報酬に使用されます。コロンバス-5から始まって、すべてのシニョリッジは燃やされました。
-**合計誓約Luna **:$ \ lambda $、ユーザーによって誓約され、委任されたバリデーターにバインドされたLunaの合計金額。

これらの指標は、他の2つの値を導出するために使用されます。
-**ルナの単位あたりの税制上の優遇措置** $ \ tau = T/\ lambda $:これは[税率の更新](#k-updatetaxpolicy)に使用されます
-**マイニング報酬の合計** $ R = T + S $:[報酬の重みの更新](#k-updaterewardpolicy)に使用される税報酬とシニョリッジ報酬の合計。

:::警告注:
Columbus-5以降、すべてのシニョリッジが燃やされ、コミュニティや報酬プールにこれ以上の資金は提供されません。
:::

-**シニョリッジ報酬:**:$ S $、各期間にルナがテラに交換するシニョリッジの量。

:::警告注:
コロンバス-5から始まって、すべてのシニョリッジは燃やされました。
:::

これらの指標を使用して、他の2つの値を導き出すことができます。**ルナの単位あたりの税額**は$ \ tau = T/\ lambda $で表され、[税率の更新](#k-updatetaxpolicy)に使用されます。**マイニング報酬の合計** $ R = T + S $:[報酬の重みの更新](#k-updaterewardpolicy)に使用される税報酬とシニョリッジ報酬の合計。

プロトコルは、上記のインジケーターの短期([`WindowShort`](#windowshort))と長期([` WindowLong`](#windowlong))の移動平均を計算して比較し、の相対的な方向と速度を決定できます。テラエコノミー。

### 金融政策のレバレッジ

-**税率**:$ r $、[_ tax cap _](#tax-caps)の制限に従って、Terraトランザクションからの収入額を調整します。

-**報酬の重み**:$ w $、[`Oracle`](spec-oracle.md)投票勝者の報酬プールのシニョリッジ部分に割り当てられます。これは、加重中央値為替レートの報酬範囲内で投票するバリデーター向けです。

:::警告プロンプト
Columbus-5から、すべてのシニョリッジが燃やされ、コミュニティプールまたはオラクル報酬プールにこれ以上の資金が提供されなくなりました。検証者は、交換手数料を通じて忠実なオラクル投票報酬を取得します。
:::

### ポリシーの更新

[税率](#tax-rate)と[報酬の重み](#reward-weight)は値として `KVStore`に保存され、その後[ガバナンス提案](#governance-proposals)で更新できます。値が渡されました。財務省は、各期間に1回各レバーを再調整して、ルナのユニットリターンを安定させ、ステーキングを通じて予測可能なマイニング報酬を確実に取得できるようにします。

-税率に関しては、ユニットマイニング報酬が停滞しないようにするために、国庫は[`MiningIncrement`](#miningincrement)を追加しました。これにより、マイニング報酬は[here]( #kupdatetaxpolicy)言った。

-報酬の重みに関して、財務省は、全体的な報酬プロファイル[`SeigniorageBurdenTarget`](#seigniorageburdentarget)を負担するために必要なシニョリッジ部分を観察し、[ここ](#k-updaterewardpolicy]で説明されているように、それに応じて金利を引き上げます。 )。現在の報酬の重みは「1」です。

### 保護観察

[`WindowProbation`](#windowprobation)指定された試用期間は、ネットワークが作成後の最初のエポック中に税率と報酬の重みの更新を実行することを防ぎ、ブロックチェーンが最初に重要なトランザクション量と成熟した信頼できる履歴インジケーターを取得できるようにします。

## データ

### ポリシーの制約

ガバナンス提案からのポリシー更新と自動調整は、それぞれ[`TaxPolicy`](#taxpolicy)と[` RewardPolicy`](#rewardpolicy)パラメーターの対象となります。 `PolicyConstraints`は、各変数の下限、上限、および最大期間の変更を指定します。

```go
//PolicyConstraints defines constraints around updating a key Treasury variable
type PolicyConstraints struct {
    RateMin       sdk.Dec  `json:"rate_min"`
    RateMax       sdk.Dec  `json:"rate_max"`
    Cap           sdk.Coin `json:"cap"`
    ChangeRateMax sdk.Dec  `json:"change_max"`
}
```

ストラテジーレバーの更新を制限するロジックは、 `pc.Clamp()`によって実行されます。

```go
//Clamp constrains a policy variable update within the policy constraints
func (pc PolicyConstraints) Clamp(prevRate sdk.Dec, newRate sdk.Dec) (clampedRate sdk.Dec) {
	if newRate.LT(pc.RateMin) {
		newRate = pc.RateMin
	} else if newRate.GT(pc.RateMax) {
		newRate = pc.RateMax
	}

	delta := newRate.Sub(prevRate)
	if newRate.GT(prevRate) {
		if delta.GT(pc.ChangeRateMax) {
			newRate = prevRate.Add(pc.ChangeRateMax)
		}
	} else {
		if delta.Abs().GT(pc.ChangeRateMax) {
			newRate = prevRate.Sub(pc.ChangeRateMax)
		}
	}
	return newRate
}
```

## Proposals

財務省モジュールは、 `KVStore`の[税率](#tax-rate)と[reward-weight](#reward-weight)の値に投票できる特別な提案を定義し、それに応じて[ポリシー制約]](#policy-constraints)は `pc.Clamp()`によって課されます。 

### TaxRateUpdateProposal

```go
type TaxRateUpdateProposal struct {
	Title       string  `json:"title" yaml:"title"`           //Title of the Proposal
	Description string  `json:"description" yaml:"description"`//Description of the Proposal
	TaxRate     sdk.Dec `json:"tax_rate" yaml:"tax_rate"`     //target TaxRate
}
```

::: warning Note:
コロンバス-5から始まって、すべてのシニョリッジは燃やされました。 報酬の重みが「1」に設定されました。 
:::

## State

### Tax Rate

- type: `Dec`
- min: .1%
- max: 1%

当期の税率政策レバレッジの価値。 

### Reward Weight

- type: `Dec`
- default: `1`

当期の報酬ウェイトポリシーレバレッジの値。 Columbus-5から、報酬の重みは「1」に設定されます。 

### Tax Caps

- type: `map[string]Int`

財務省は、金種「denom」を「sdk.Int」にマッピングする「KVStore」を保持しています。これは、同じ金種の取引税によって生成できる最大収入を表します。 これは、各期間で、現在の為替レートで[`TaxPolicy.Cap`](#taxpolicy)と同等の値に更新されます。

たとえば、トランザクションの値が100 SDT、税率が5％、課税上限が1 SDTの場合、生成される収入は5SDTではなく1SDTになります。

### Tax Proceeds

- type: `Coins`

当期の税制上の優遇措置は$ T $です。

### Epoch Initial Issuance

- type: `Coins`

現在の時代の初めのルナの総供給。 この値は、[`k.SettleSeigniorage()`](#k-settleseigniorage)で使用され、各エポックの終わりに割り当てられたシニョリッジを計算します。 コロンバス5から始まって、すべてのシニョリッジは燃やされました。

初期循環を記録すると、[`Supply`](spec-supply.md)モジュールが自動的に使用され、ルナの総循環が決定されます。 わかりやすくするために、PeekingはμLunaのエポックの初期リリースを `sdk.Coins`ではなく` sdk.Int`として返します。

### インジケーター

財務省は、現在および過去の期間について次の指標を追跡します。

#### Tax Rewards

- type: `Dec`

The Tax Rewards $T$ for each `epoch`.

#### Seigniorage Rewards

- type: `Dec`

The Seigniorage Rewards $S$ for each `epoch`.

#### Total Staked Luna

- type: `Int`

The Total Staked Luna $\lambda$ for each `epoch`.

## Functions

### `k.UpdateIndicators()`

```go
func (k Keeper) UpdateIndicators(ctx sdk.Context)
```

各エポック$ t $の終わりに、関数は税報酬$ T $、シニョリッジ報酬$ S $、住宅ローンLuna $ \ lambda $の現在の値を記録し、次のエポック$ t + 1 $に転送します。

-$ T_t $は、[`TaxProceeds`](#tax-proceeds)の現在の値です。
-$ S_t = \ Sigma * w $、エポックシニョリッジ$ \ Sigma $および報酬ウェイト$ w $。
-$ \ lambda_t $は、 `stake.TotalBondedTokens()`の結果です。 
### `k.UpdateTaxPolicy()`

```go
func (k Keeper) UpdateTaxPolicy(ctx sdk.Context) (newTaxRate sdk.Dec)
```

各期間の終わりに、関数は税率通貨レバレッジの次の値を計算します。

$ r_t $を現在の税率として使用し、$ n $を[`MiningIncrement`](#miningincrement)パラメーターとして使用します。

1.過去1年間の `WindowLong`のユニットに対するルナの税制上の優遇措置の移動平均$ \ tau_y $を計算します。

2.先月の `WindowShort`で、ルナの単位あたりの税制上の優遇措置の移動平均$ \ tau_m $を計算します。

3. $ \ tau_m = 0 $の場合、前月には税金はありませんでした。 税率は、 `pc.Clamp()`の規則に従って、税務ポリシーで許可されている最大値に設定する必要があります([制約](#policy-constraints)を参照)。

4. $ \ tau_m> 0 $の場合、新しい税率は$ r_ {t + 1} =(n r_t \ tau_y)/\ tau_m $であり、 `pc.Clamp()`の規則に従います。 詳細については、[constraints](#policy-constraints)を参照してください。

月々の税収が年平均よりも低い場合、財務省は税率を引き上げます。 月々の税収が年平均を超えると、財務省は税率を引き下げます。 
### `k.UpdateRewardPolicy()`

```go
func (k Keeper) UpdateRewardPolicy(ctx sdk.Context) (newRewardWeight sdk.Dec)
```

各エポックの終わりに、この関数は次の報酬ウェイト通貨レバレッジの値を計算します。

$ w_t $を現在の報酬の重みとして使用し、$ b $を[`SeigniorageBurdenTarget`](#seigniorageburdentarget)パラメーターとして使用します。

1.先月の `WindowShort`のシニョリッジ報酬$ S_m $の合計額を計算します。

2.先月の `WindowShort`の合計マイニング報酬$ R_m $の合計を計算します。

3. $ R_m = 0 $および$ S_m = 0 $の場合、先月は採掘またはシニョリッジの報酬はありませんでした。 報酬の重みは、報酬ポリシーで許可されている最大値に設定する必要がありますが、 `pc.Clamp()`のルールに従います。 詳細については、[constraints](#policy-constraints)を参照してください。

4. $ R_m> 0 $または$ S_m> 0 $の場合、新しい報酬の重みは$ w_ {t + 1} = b w_t S_m/R_m $であり、 `pc.Clamp()`ルールに従います。 詳細については、[constraints](#policy-constraints)を参照してください。


:::警告注:
Columbus-5以降、すべてのシニョリッジが燃やされ、コミュニティや報酬プールにこれ以上の資金は提供されません。
:::

### `k.UpdateTaxCap()`

```go
func (k Keeper) UpdateTaxCap(ctx sdk.Context) sdk.Coins
```

この関数は、期間の終わりに呼び出され、次の期間の各金種の課税上限を計算します。

流通している各金種について、各金種の新しい課税上限は、現在の為替レートで計算された[`TaxPolicy`](#taxpolicy)パラメータで定義されたグローバル課税上限に設定されます。 

### `k.SettleSeigniorage()`

```go
func (k Keeper) SettleSeigniorage(ctx sdk.Context)
```

この関数は、エポックの終わりに呼び出され、シニョリッジを計算し、投票報酬のために資金を[`Oracle`](spec-oracle.md)モジュールに転送し、[` Distribution`](spec-distribution.md)Inコミュニティスイミングプール。

1.現在のエポックのシニョリッジ$ \ Sigma $は、エポックの開始時のルナ供給([エポック初期発行](#epoch-initial-issuance))とその時点でのルナ供給の差から計算された呼び出しです。時間。

   ルナがルナからテラに交換されて燃やされたため、ルナの現在の供給がエポックの開始よりも低い場合、$ \ Sigma> 0 $であることに注意してください。 [こちら](spec-market.md#seigniorage)を参照してください。

2.報酬の重み$ w $は、投票報酬に指定されたシニョリッジのパーセンテージです。 $ S $の新しいLunaが作成され、[`Oracle`](spec-oracle.md)モジュールは$ S = \ Sigma * w $ seigniorageを受け取りました。

3.残りのコイン$ \ Sigma-S $は[`Distribution`](spec-distribution.md)モジュールに送信され、そこでコミュニティプールに配布されます。

:::警告注:
Columbus-5から、すべてのシニョリッジが燃やされ、コミュニティプールまたはオラクル報酬プールにこれ以上の資金が提供されなくなりました。検証者は、交換手数料を通じて忠実なオラクル投票報酬を取得します。 
:::

## Transitions

### End-Block

1. [`k.UpdateIndicators()`](#kupdateindicators)を使用して、すべてのインジケーターを更新します

2.現在のブロックが[Trial](#probation)の下にある場合は、手順6にスキップします。

3. [Settle seigniorage](#ksettleseigniorage)はエポック中に蓄積され、次のエポック中に投票報酬とコミュニティプールに資金を使用します。 コロンバス-5から始まって、すべてのシニョリッジは燃やされました。

4.次のエポックの[税率](#k-updatetaxpolicy)、[報酬の重み](#k-updaterewardpolicy)、および[税の上限](#k-updatetaxcap)を計算します。 Columbus-5から、すべてのシニョリッジが燃やされ、報酬の重みが「1」に設定されています。

5. [`policy_update`](#policy_update)イベントを送信して、新しいポリシーレバレッジ値を記録します。

6.最後に、[`k.RecordEpochInitialIssuance()`](#epoch-initial-issuance)を使用してLunaのリリースを記録します。 これは、次の期間のシニョリッジを計算するために使用されます。 

::: details Events

| Type          | Attribute Key | Attribute Value |
| ------------- | ------------- | --------------- |
| policy_update | tax_rate      | {taxRate}       |
| policy_update | reward_weight | {rewardWeight}  |
| policy_update | tax_cap       | {taxCap}        |

:::

## Parameters

The subspace for the Treasury module is `treasury`.

```go
type Params struct {
	TaxPolicy               PolicyConstraints `json:"tax_policy" yaml:"tax_policy"`
	RewardPolicy            PolicyConstraints `json:"reward_policy" yaml:"reward_policy"`
	SeigniorageBurdenTarget sdk.Dec           `json:"seigniorage_burden_target" yaml:"seigniorage_burden_target"`
	MiningIncrement         sdk.Dec           `json:"mining_increment" yaml:"mining_increment"`
	WindowShort             int64             `json:"window_short" yaml:"window_short"`
	WindowLong              int64             `json:"window_long" yaml:"window_long"`
	WindowProbation         int64             `json:"window_probation" yaml:"window_probation"`
}
```

### TaxPolicy

- type: `PolicyConstraints`
- default:

```go
DefaultTaxPolicy = PolicyConstraints{
    RateMin:       sdk.NewDecWithPrec(5, 4),//0.05%
    RateMax:       sdk.NewDecWithPrec(1, 2),//1%
    Cap:           sdk.NewCoin(core.MicroSDRDenom, sdk.OneInt().MulRaw(core.MicroUnit)),//1 SDR Tax cap
    ChangeRateMax: sdk.NewDecWithPrec(25, 5),//0.025%
}
```

Constraints/rules for updating the [Tax Rate](#tax-rate) monetary policy lever.

### RewardPolicy

- type: `PolicyConstraints`
- default:

```go
DefaultRewardPolicy = PolicyConstraints{
    RateMin:       sdk.NewDecWithPrec(5, 2),//5%
    RateMax:       sdk.NewDecWithPrec(90, 2),//90%
    ChangeRateMax: sdk.NewDecWithPrec(25, 3),//2.5%
    Cap:           sdk.NewCoin("unused", sdk.ZeroInt()),//UNUSED
}
```

Constraints/rules for updating the [Reward Weight](#reward-weight) monetary policy lever.

### SeigniorageBurdenTarget

- type: `sdk.Dec`
- default: 67%

乗数によって指定されたシニョリッジは、エポック遷移中に報酬の重みを更新するための全体的な報酬プロファイルを保持するために必要です。 

### MiningIncrement

- type: `sdk.Dec`
- default: 1.07 growth rate, 15% CAGR of $\tau$

移行期間中の税率ポリシー更新の年間成長率の乗数を決定します。 

### WindowShort

- type: `int64`
- default: `4` (month = 4 weeks)

短期移動平均を計算するための時間間隔の複数の期間を指定します 

### WindowLong

- type: `int64`
- default: `52` (year = 52 weeks)

長期移動平均を計算するための時間間隔の複数の期間を指定します。 

### WindowProbation

- type: `int64`
- default: `12` (3 months = 12 weeks)

試用期間間隔の複数の期間を指定します。
