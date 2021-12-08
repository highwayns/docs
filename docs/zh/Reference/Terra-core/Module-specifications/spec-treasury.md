---
sidebarDepth: 2
---

# 财政部

财政部模块充当 Terra 经济的“中央银行”，通过[观察指标](#observed-indicators) 和调整[货币政策杠杆](#monetary-policy-levers) 来衡量宏观经济活动，以调节矿工的激励措施，使其趋于稳定，长期增长。

::: 警告 注意：
虽然财政部通过调整奖励来稳定矿工需求，但 [`Market`](spec-market.md) 模块通过套利和做市商负责 Terra 的价格稳定。
:::

## 概念

### 观察到的指标

财政部观察每个时期的三个宏观经济指标，并保留 [指标](#indicators) 在前几个时期的值：

- **税收奖励**：$T$，一个时期内交易和稳定费用产生的收入。
- **铸币税奖励***：$S$，在一个纪元期间从 Luna 交换到 Terra 所产生的铸币税金额，该纪元将用于“Oracle”奖励中的投票奖励。从 Columbus-5 开始，所有铸币税都被烧毁。
- **总质押 Luna **：$\lambda$，用户质押的 Luna 总量并绑定到他们委托的验证者。

这些指标用于推导出另外两个值：
- **每单位 Luna 的税收奖励** $\tau = T / \lambda$：这用于 [更新税率](#k-updatetaxpolicy)
- **总挖矿奖励** $R = T + S$：税收奖励和铸币税奖励的总和，用于[更新奖励权重](#k-updaterewardpolicy)。

::: 警告 注意：
从 Columbus-5 开始，所有铸币税都被烧毁，不再为社区或奖励池提供资金。
:::

- **铸币税奖励：**：$S$，在每个时期 Luna 交换到 Terra 产生的铸币税金额。

::: 警告 注意：
从 Columbus-5 开始，所有铸币税都被烧毁。
:::

这些指标可用于推导出另外两个值，用 $\tau = T / \lambda$ 表示的 **每单位 Luna 的税收奖励**，用于[更新税率](#k-updatetaxpolicy)，以及**总挖矿奖励** $R = T + S$：税收奖励和铸币税奖励的总和，用于[更新奖励权重](#k-updaterewardpolicy)。

该协议可以计算和比较上述指标的短期 ([`WindowShort`](#windowshort)) 和长期 ([`WindowLong`](#windowlong)) 滚动平均值，以确定相对方向和速度Terra 经济。

### 货币政策杠杆

- **税率**：$r$，调整从 Terra 交易中获得的收入金额，受 [_tax cap_](#tax-caps) 限制。

- **奖励权重**：$w$，分配给 [`Oracle`](spec-oracle.md) 投票获胜者奖励池的铸币税部分。这是给在加权中值汇率的奖励范围内投票的验证者。

::: 警告提示
从 Columbus-5 开始，所有铸币税都被烧毁，不再为社区池或预言机奖励池提供资金。验证者通过交换费用获得忠实的预言机投票奖励。
:::

### 更新政策

[Tax Rate](#tax-rate) 和 [Reward Weight](#reward-weight) 都作为值存储在 `KVStore` 中，并且可以在它们之后通过 [governance proposal](#governance-proposals) 更新它们的值已经通过。财政部在每个时期重新校准每个杠杆一次，以稳定 Luna 的单位回报，确保通过 Staking 获得可预测的采矿奖励：

- 对于税率，为了确保单位挖矿奖励不会停滞不前，国库添加了 [`MiningIncrement`](#miningincrement)，因此挖矿奖励会随着时间的推移稳步增加，如 [此处](#kupdatetaxpolicy) 所述。

- 对于奖励权重，财政部观察承担整体奖励概况所需的铸币税部分，[`SeigniorageBurdenTarget`](#seigniorageburdentarget)，并相应地提高利率，如[此处](#k-updaterewardpolicy) 所述。当前的奖励权重为“1”。

### 缓刑

[`WindowProbation`](#windowprobation) 指定的试用期阻止网络在创世后的第一个纪元期间执行税率和奖励权重更新，以允许区块链首先获得临界交易量和成熟可靠的历史记录 指标。

## 数据

### 政策约束

来自治理提案和自动校准的政策更新分别受 [`TaxPolicy`](#taxpolicy) 和 [`RewardPolicy`](#rewardpolicy) 参数的约束。 `PolicyConstraints` 指定每个变量的下限、上限和最大周期变化。

```go
// PolicyConstraints defines constraints around updating a key Treasury variable
type PolicyConstraints struct {
    RateMin       sdk.Dec  `json:"rate_min"`
    RateMax       sdk.Dec  `json:"rate_max"`
    Cap           sdk.Coin `json:"cap"`
    ChangeRateMax sdk.Dec  `json:"change_max"`
}
```

限制策略杠杆更新的逻辑由`pc.Clamp()` 执行。 

```go
// Clamp constrains a policy variable update within the policy constraints
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

财政部模块定义了特殊提案，允许对`KVStore`中的[税率](#tax-rate)和[奖励权重](#reward-weight)值进行投票并相应地改变，受[政策约束] ](#policy-constraints) 由 `pc.Clamp()` 强加。

### TaxRateUpdateProposal

```go
type TaxRateUpdateProposal struct {
	Title       string  `json:"title" yaml:"title"`             // Title of the Proposal
	Description string  `json:"description" yaml:"description"` // Description of the Proposal
	TaxRate     sdk.Dec `json:"tax_rate" yaml:"tax_rate"`       // target TaxRate
}
```

::: warning Note:
从 Columbus-5 开始，所有铸币税都被烧毁。 奖励权重现在设置为“1”。 
:::

## State

### Tax Rate

- type: `Dec`
- min: .1%
- max: 1%

当前时期的税率政策杠杆的价值。 

### Reward Weight

- type: `Dec`
- default: `1`

当前时期的奖励权重政策杠杆的值。 从 Columbus-5 开始，奖励权重设置为“1”。

### Tax Caps

- type: `map[string]Int`

财政部保留了一个“KVStore”，它将面额“denom”映射到一个“sdk.Int”，它代表同一面额的交易税可以产生的最大收入。 这在每个时期都更新为 [`TaxPolicy.Cap`](#taxpolicy) 在当前汇率下的等价值。

例如，如果一笔交易的价值为 100 SDT，税率为 5%，税收上限为 1 SDT，则产生的收入将是 1 SDT，而不是 5 SDT。 

### Tax Proceeds

- type: `Coins`

当前时期的税收奖励 $T$。 

### Epoch Initial Issuance

- type: `Coins`

当前纪元开始时 Luna 的总供应量。 该值在 [`k.SettleSeigniorage()`](#k-settleseigniorage) 中用于计算每个 epoch 结束时分配的铸币税。 从哥伦布 5 号开始，所有铸币税都被烧毁。

记录初始发行量会自动使用 [`Supply`](spec-supply.md) 模块来确定 Luna 的总发行量。 为清楚起见，Peeking 会将 μLuna 的 epoch 初始发行返回为 `sdk.Int` 而不是 `sdk.Coins`。

### 指标

财政部跟踪当前和以前时期的以下指标：

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

在每个 epoch $t$ 结束时，该函数会记录当前的税收奖励 $T$、铸币税奖励 $S$ 和抵押 Luna $\lambda$ 的当前值，然后再转移到下一个 epoch $t+1$。

- $T_t$ 是 [`TaxProceeds`](#tax-proceeds) 中的当前值
- $S_t = \Sigma * w$，带有纪元铸币税 $\Sigma$ 和奖励权重 $w$。
- $\lambda_t$ 是 `staking.TotalBondedTokens()` 的结果 

### `k.UpdateTaxPolicy()`

```go
func (k Keeper) UpdateTaxPolicy(ctx sdk.Context) (newTaxRate sdk.Dec)
```

在每个时期结束时，该函数计算税率货币杠杆的下一个值。

使用 $r_t$ 作为当前税率和 $n$ 作为 [`MiningIncrement`](#miningincrement) 参数：

1.计算过去一年`WindowLong`单位Luna税收奖励的滚动平均值$\tau_y$。

2. 计算上个月 `WindowShort` 中每单位 Luna 的税收奖励的滚动平均值 $\tau_m$。

3. 如果$\tau_m = 0$，则上个月没有税收。 税率应设置为税收政策允许的最大值，受制于 `pc.Clamp()` 的规则（参见 [约束](#policy-constraints)）。

4.如果$\tau_m > 0$，新的税率为$r_{t+1} = (n r_t \tau_y)/\tau_m$，以`pc.Clamp()`的规则为准。 有关更多详细信息，请参阅 [约束](#policy-constraints)。

当每月税收收入低于年度平均水平时，财政部就会提高税率。 当每月税收收入超过年度平均水平时，财政部会降低税率。

### `k.UpdateRewardPolicy()`

```go
func (k Keeper) UpdateRewardPolicy(ctx sdk.Context) (newRewardWeight sdk.Dec)
```

在每个 epoch 结束时，此函数会计算下一个奖励权重货币杠杆的值。

使用 $w_t$ 作为当前奖励权重，$b$ 作为 [`SeigniorageBurdenTarget`](#seigniorageburdentarget) 参数：

1.计算上个月`WindowShort`的铸币税奖励总和$S_m$。

2. 计算上个月`WindowShort`的总挖矿奖励总和$R_m$。

3. 如果 $R_m = 0$ 且 $S_m = 0$，则上个月没有挖矿或铸币税奖励。 奖励权重应设置为奖励政策允许的最大值，但须遵守 `pc.Clamp()` 的规则。 有关更多详细信息，请参阅 [约束](#policy-constraints)。

4.如果$R_m > 0$或$S_m > 0$，新的奖励权重为$w_{t+1} = b w_t S_m / R_m$，受`pc.Clamp()`规则约束。 有关更多详细信息，请参阅 [约束](#policy-constraints)。


::: 警告 注意：
从 Columbus-5 开始，所有铸币税都被烧毁，不再为社区或奖励池提供资金。
:::

### `k.UpdateTaxCap()`

```go
func (k Keeper) UpdateTaxCap(ctx sdk.Context) sdk.Coins
```

这个函数在一个时期结束时被调用，以计算下一个时期每个面额的税收上限。

对于流通中的每个面额，每个面额的新税收上限设置为 [`TaxPolicy`](#taxpolicy) 参数中定义的全球税收上限，按当前汇率计算。 

### `k.SettleSeigniorage()`

```go
func (k Keeper) SettleSeigniorage(ctx sdk.Context)
```

这个函数在一个纪元结束时被调用来计算铸币税并将资金转发到 [`Oracle`](spec-oracle.md) 模块以获得投票奖励，以及 [`Distribution`](spec-distribution.md)用于社区游泳池。

1. 当前epoch的铸币税$\Sigma$是取epoch开始时的Luna供应量([Epoch Initial Issuance](#epoch-initial-issuance))与当时的Luna供应量之差计算的的呼叫。

   请注意，当当前 Luna 供应量低于纪元开始时，$\Sigma > 0$，因为 Luna 已从 Luna 交换到 Terra 中被烧毁。请参阅[此处](spec-market.md#seigniorage)。

2. 奖励权重 $w$ 是指定用于投票奖励的铸币税的百分比。铸造了 $S$ 的新 Luna，并且 [`Oracle`](spec-oracle.md) 模块收到 $S = \Sigma * w$ 铸币税。

3. 剩余的硬币 $\Sigma - S$ 被发送到 [`Distribution`](spec-distribution.md) 模块，在那里它被分配到社区池中。

::: 警告 注意：
从 Columbus-5 开始，所有铸币税都被烧毁，不再为社区池或预言机奖励池提供资金。验证者通过交换费用获得忠实的预言机投票奖励。
:::

## Transitions

### End-Block

1. 使用[`k.UpdateIndicators()`](#kupdateindicators)更新所有指标

2. 如果当前区块在[试用](#probation)下，跳到步骤6。

3. [Settle seigniorage](#ksettleseigniorage) 在 epoch 期间累积，并将资金用于下一个 epoch 期间的投票奖励和社区池。 从 Columbus-5 开始，所有铸币税都被烧毁。

4. 计算下一个epoch的[Tax Rate](#k-updatetaxpolicy)、[Reward Weight](#k-updaterewardpolicy)和[Tax Cap](#k-updatetaxcap)。 从 Columbus-5 开始，所有铸币税都被烧毁，奖励权重设置为“1”。

5. 发出 [`policy_update`](#policy_update) 事件，记录新的政策杠杆值。

6. 最后用[`k.RecordEpochInitialIssuance()`](#epoch-initial-issuance)记录Luna的发行。 这将用于计算下一个时期的铸币税。

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
    RateMin:       sdk.NewDecWithPrec(5, 4), // 0.05%
    RateMax:       sdk.NewDecWithPrec(1, 2), // 1%
    Cap:           sdk.NewCoin(core.MicroSDRDenom, sdk.OneInt().MulRaw(core.MicroUnit)), // 1 SDR Tax cap
    ChangeRateMax: sdk.NewDecWithPrec(25, 5), // 0.025%
}
```

Constraints / rules for updating the [Tax Rate](#tax-rate) monetary policy lever.

### RewardPolicy

- type: `PolicyConstraints`
- default:

```go
DefaultRewardPolicy = PolicyConstraints{
    RateMin:       sdk.NewDecWithPrec(5, 2), // 5%
    RateMax:       sdk.NewDecWithPrec(90, 2), // 90%
    ChangeRateMax: sdk.NewDecWithPrec(25, 3), // 2.5%
    Cap:           sdk.NewCoin("unused", sdk.ZeroInt()), // UNUSED
}
```

Constraints / rules for updating the [Reward Weight](#reward-weight) monetary policy lever.

### SeigniorageBurdenTarget

- type: `sdk.Dec`
- default: 67%

乘数指定部分铸币税需要承担在纪元转换期间奖励权重更新的整体奖励配置文件。 

### MiningIncrement

- type: `sdk.Dec`
- default: 1.07 growth rate, 15% CAGR of $\tau$

确定时代过渡期间税率政策更新的年增长率的乘数。

### WindowShort

- type: `int64`
- default: `4` (month = 4 weeks)

指定计算短期移动平均线的时间间隔的多个时期

### WindowLong

- type: `int64`
- default: `52` (year = 52 weeks)

指定计算长期移动平均线的时间间隔的多个时期。

### WindowProbation

- type: `int64`
- default: `12` (3 months = 12 weeks)

指定试用期时间间隔的多个时期。 
