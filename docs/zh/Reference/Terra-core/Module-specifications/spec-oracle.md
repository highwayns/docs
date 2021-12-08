# 预言机

Oracle 模块为 Terra 区块链提供了最新且准确的 Luna 与各种 Terra 挂钩汇率的价格馈送，以便 [Market](spec-market.md) 可以提供 Terra<>Terra 货币之间的公平交易对，以及 Terra<>Luna。

由于价格信息是区块链外部的，Terra 网络依赖验证器定期对当前 Luna 汇率进行投票，协议每个“VotePeriod”对结果进行一次统计，并更新链上汇率作为加权中位数选票使用“ReferenceTerra”转换了交叉汇率。

::: 警告注意
由于 Oracle 服务由验证器提供支持，您可能会发现查看 [Staking](spec-staking.md) 模块很有趣，该模块涵盖了 staking 和验证器的逻辑。
:::

## 概念

### 投票程序

在每个 [`VotePeriod`](#voteperiod) 期间，Oracle 模块通过要求验证器集的所有成员提交对 Luna 的投票，就 Luna 对 [`Whitelist`](#whitelist) 中指定的面额的汇率达成共识间隔结束前的汇率。

验证者必须首先预先承诺一个汇率，然后在随后的“VotePeriod”中提交并披露他们的汇率以及他们以该价格预先承诺的证明。该方案强制选民在知道其他人的投票之前提交提交，从而降低 Oracle 中的中心化和搭便车风险。

#### 预先投票和投票

让 $P_t$ 是由 [`VotePeriod`](#voteperiod)（当前设置为 5 个区块链块）定义的当前时间间隔，在此期间验证者必须提交两条消息：

- [`MsgExchangeRatePrevote`](#msgexchangerateprevote)，包含 Luna 相对于 Terra 挂钩的汇率的 SHA256 哈希值。必须为每个不同的面额提交单独的预投票，以报告 Luna 汇率。

- [`MsgExchangeRateVote`](#msgexchangeratevote)，包含用于为前一个间隔 $P_{t-1}$ 中提交的预投票创建散列的盐。

#### 投票统计

在 $P_t$ 结束时，对提交的投票进行统计。

每次投票提交的salt用于验证与验证者在$P_{t-1}$中提交的prevote的一致性。如果验证者未提交预投票，或者由盐生成的 SHA256 与预投票的哈希不匹配，则投票将被丢弃。

对于每个面额，如果提交投票的总投票权超过 50%，则投票的加权中位数在链上记录为 Luna 对该面额的有效汇率，用于下一个 `VotePeriod` $P_{t+1} $.

收到少于 [`VoteThreshold`](#votethreshold) 总投票权的面额将从商店中删除其汇率，并且在下一个 `VotePeriod`$P_{t+1}$ 期间不能与它进行掉期。

选择投票率最高的“ReferenceTerra”。如果两个面额的投票权相同，则按字母顺序选择参考 Terra。 

#### 使用参考 Terra 计算交叉汇率

1.选择`ReferenceTerra`

   - 让`Vote_j = Vote_j_1 ... Vote_j_n` 成为给定`VotePeriod` 中验证器`Val_j` 的每个terra 的`uluna` 汇率投票。 `n` = terra 白名单总数
   - 对于所有 terra 白名单 `w_1 ... w_n`，选择投票率最高的索引 `r`。如果投票率有多个平局获胜者，我们按字母顺序选择。 `w_r` 被选为用于计算交叉汇率的 `ReferenceTerra`。

2. 计算 Oracle 汇率

   - 每个验证器现在计算`w_i`的交叉汇率（`CER`），如下所示。
     - 对于`i≠r`，`CER_j_i = Vote_j_r / Vote_j_i`
     - 对于`i=r`，`CER_j_i = Vote_j_r`
   - 计算每个交叉汇率的功率加权中位数（`PWM`，跨所有验证器）`CER_j_iMCER_i` = `PWM`（对于所有 j）[`CER_j_i`]
   - 现在我们将这些`MCER_i`s 转换为原始形式 uluna/terra，如下所示
     - 对于`i≠r`，`LunaRate_i = MCER_r / MCER_i`
     - 对于`i=r`，`LunaRate_i = MCER_r`

3. 奖励中选者
   - 对于`i=r`，与之前相同，使用[`tally()`](#tally) 使用`MCER_i` 奖励基于`CER_j_i = Vote_j_r` 的投票获胜者。
   - 对于`i≠r`，使用[`tally()`](#tally) 奖励基于`CER_j_i = Vote_j_r / Vote_j_i` 选票和`MCER_i` 的投票获胜者。

#### 投票奖励

计票后，通过 [`tally()`](#tally) 确定选票的获胜者。

成功在加权中位数附近的狭窄范围内投票的选民将获得一部分所收集的铸币税。有关更多详细信息，请参阅 [`k.RewardBallotWinners()`](#k-rewardballotwinners)。

::: 警告注意
从 Columbus-3 开始，来自 [Market](spec-market.md) 掉期的费用不再包含在 oracle 奖励池中，并在掉期操作期间立即销毁。
:::

### 奖励带

设 $M$ 为加权中位数，$\sigma$ 为选票中选票的标准差，$R$ 为 [`RewardBand`](#rewardband) 参数。中位数周围的带设置为 $\varepsilon = \max(\sigma, R/2)$。所有在 $\left[ M - \varepsilon, M + \varepsilon \right]$ 区间内提交汇率投票的有效（即保税和非监禁）验证者都应该被包括在获胜者的集合中，由他们的亲属加权投票权。

### 削减

：：： 危险
请务必仔细阅读本节，因为它涉及潜在的资金损失。
:::

发生以下任一事件的 `VotePeriod` 被视为“未命中”：

- 验证者未能针对 [`Whitelist`](#whitelist) 中指定的 ** 每种** 面额提交对 Luna 汇率的投票。

- 验证者未能在围绕一种或多种面额的加权中位数的 [奖励范围](#reward-band) 内投票。

在每个 [`SlashWindow`](#slashwindow) 期间，参与的验证者必须保持至少 [`MinValidPerWindow`](#minvalidperwindow) (5%) 的有效投票率，以免他们的股份被削减（目前设置为 [0.01%） ](#slashfraction))。被削减的验证人会被协议自动暂时“监禁”（以保护委托人的资金），运营商应及时修复差异以恢复验证人参与。

###弃权投票

验证者可以通过为 [`MsgExchangeRateVote`](#msgexchangeratevote) 中的 `ExchangeRate` 字段提交一个非正整数来放弃投票。这样做将免除他们因错过“VotePeriod”而受到的任何处罚，但也会使他们失去因忠实报告而获得 Oracle 铸币税奖励的资格。

## 消息类型

::: 警告注意
计票、Luna 汇率更新、选票奖励和削减的控制流发生在每个 `VotePeriod` 的末尾，并在 [end-block ABCI 函数](#end-block) 中找到，而不是在消息处理程序中. 
:::

### MsgExchangeRatePrevote

```go
// MsgExchangeRatePrevote - struct for prevoting on the ExchangeRateVote.
// The purpose of prevote is to hide vote exchange rate with hash
// which is formatted as hex string in SHA256("salt:exchange_rate:denom:voter")
type MsgExchangeRatePrevote struct {
	Hash      string         `json:"hash" yaml:"hash"` // hex string
	Denom     string         `json:"denom" yaml:"denom"`
	Feeder    sdk.AccAddress `json:"feeder" yaml:"feeder"`
	Validator sdk.ValAddress `json:"validator" yaml:"validator"`
}
```

`Hash` 是由格式为 `salt:exchange_rate:denom:voter` 的字符串的 SHA256 哈希（十六进制字符串）的前 20 个字节生成的十六进制字符串，实际的 `MsgExchangeRateVote` 的元数据将在下一个`投票期`。你可以使用 [`VoteHash()`](#votehash) 函数来帮助编码这个哈希。请注意，由于在随后的“MsgExchangeRateVote”中，必须显示盐，因此必须为每次预投票提交重新生成使用的盐。

“Denom”是投票所针对的货币的面额。例如，如果选民希望为美元提交预投票，那么正确的“Denom”是“uusd”。

哈希中使用的汇率必须是 Luna 的公开市场汇率，相对于与“Denom”匹配的面额。例如，如果`Denom` 是`uusd`，而Luna 的现行汇率是1 美元，那么必须使用“1”作为汇率，因为`1 uluna` = `1 uusd`。

`Feeder`（`terra-` 地址）用于如果验证者希望将 oracle 投票签名委托给一个单独的密钥（代替运营商“提供”价格）以降低暴露其验证者签名密钥的风险。

`Validator` 是原始验证器的验证器地址（`terravaloper-`）。

### MsgExchangeRateVote

`MsgExchangeRateVote` 包含实际的汇率投票。 `Salt` 参数必须与用于创建预投票的盐相匹配，否则无法奖励投票者。 

```go
// MsgExchangeRateVote - struct for voting on the exchange rate of Luna denominated in various Terra assets.
// For example, if the validator believes that the effective exchange rate of Luna in USD is 10.39, that's
// what the exchange rate field would be, and if 1213.34 for KRW, same.
type MsgExchangeRateVote struct {
	ExchangeRate sdk.Dec        `json:"exchange_rate" yaml:"exchange_rate"`
	Salt         string         `json:"salt" yaml:"salt"`
	Denom        string         `json:"denom" yaml:"denom"`
	Feeder       sdk.AccAddress `json:"feeder" yaml:"feeder"`
	Validator    sdk.ValAddress `json:"validator" yaml:"validator"`
}
```

### MsgDelegateFeedConsent

验证者还可以选择将投票权委托给另一个密钥，以防止块签名密钥保持在线。 为此，他们必须提交“MsgDelegateFeedConsent”，将他们的预言机投票权委托给代表验证者签署“MsgExchangeRatePrevote”和“MsgExchangeRateVote”的“Delegate”。

：：： 危险
委托验证者可能会要求您存入一些资金（在 Terra 或 Luna 中），他们可以用这些资金来支付费用，并在单独的“MsgSend”中发送。 该协议是在链下制定的，不受 Terra 协议的强制执行。
:::

`Operator` 字段包含验证器的操作员地址（前缀为 `terravaloper-`）。 `Delegate` 字段是将代表 `Operator` 提交与汇率相关的投票和预投票的受托人账户的账户地址（前缀为 `terra-`）。

```go
// MsgDelegateFeedConsent - struct for delegating oracle voting rights to another address.
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
	ExchangeRates string         `json:"exchange_rates" yaml:"exchange_rates"` // comma separated dec coins
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

此函数从 `salt:rate:denom:voter` 中为 `ExchangeRateVote` 计算截断的 SHA256 哈希值，该值在 `VotePeriod` 之前的 `MsgExchangeRatePrevote` 中提交。

### `tally()`

```go
func tally(ctx sdk.Context, pb types.ExchangeRateBallot, rewardBand sdk.Dec) (weightedMedian sdk.Dec, ballotWinners []types.Claim)
```

此函数包含计算特定面额选票的选票的逻辑，并确定加权中位数 $M$ 以及选票的获胜者。 

### `k.RewardBallotWinners()`

```go
func (k Keeper) RewardBallotWinners(ctx sdk.Context, ballotWinners types.ClaimPool)
```

在每个“VotePeriod”结束时，一部分铸币税将奖励给预言机投票获胜者（在区间内提交汇率投票的验证者）。

每个`VotePeriod`奖励的Luna总量等于当前奖励池中的Luna数量（Oracle模块拥有的Luna）除以参数[`RewardDistributionWindow`](#rewarddistributionwindow)。

每个获胜的验证者都会获得与他们在那段时间的获胜投票权重成比例的奖励。

### `SlashAndResetMissCounters()`

```go
func SlashAndResetMissCounters(ctx sdk.Context, k Keeper)
```

这个函数在每个 `SlashWindow` 结束时被调用，并会检查每个验证器的未命中计数器，以查看该验证器是否满足参数 [`MinValidPerWindow`](#minvalidperwindow) 中定义的最小有效票数（没有错过超过 门槛）。

如果验证者没有达到标准，他们的质押资金将被 [`SlashFraction`](#slashfraction) 削减，并被监禁。

在检查完所有验证器后，所有未命中计数器都会为下一个“SlashWindow”重置为零。

## Transitions

### End-Block

在每个块的末尾，Oracle 模块检查它是否是“VotePeriod”的最后一个块。如果是，则运行[投票程序](#voting-procedure)：

1.所有当前活跃的Luna汇率从商店中清除

2. 收到的选票按面额组织成选票。弃权投票，以及不活跃或被监禁的验证者的投票被忽略

3. 不符合以下要求的面额将被删除：

   - 必须出现在 [`Whitelist`](#whitelist) 中允许的面额中
   - 选票必须至少有 [`VoteThreshold`](#votethreshold) 总投票权
   - 选择投票率最高的`ReferenceTerra`

4. 对于每个剩余的带有通过选票的“denom”：

   - 使用 [`Compute Cross Exchange Rate using Reference Terra`](#compute-cross-exchange-rate-using-reference-terra) 统计投票，并使用 [`tally()`]( #相符）
   - 遍历投票的获胜者并将他们的权重添加到他们的总和中
   - 使用 `k.SetLunaExchangeRate()` 在区块链上为 Luna<>`denom` 设置 Luna 汇率
   - 发出 [`exchange_rate_update`](#exchange_rate_update) 事件

5. 计算 [missed](#slashing) Oracle 投票的验证者并增加相应的miss counter

6. 如果在 [`SlashWindow`](#slashwindow) 的末尾，惩罚错过超过惩罚阈值的验证器（提交的有效票数少于 [`MinValidPerWindow`](#minvalidperwindow)）

7. 使用 [`k.RewardBallotWinners()`](#krewardballotwinners) 向投票获胜者分发奖励

8. 清除所有prevotes（下一个`VotePeriod`除外）和来自商店的投票 

::: details Events

| Type                 | Attribute Key | Attribute Value |
| -------------------- | ------------- | --------------- |
| exchange_rate_update | denom         | {denom}         |
| exchange_rate_update | exchange_rate | {exchangeRate}  |

:::

## Parameters

The subspace for the Oracle module is `oracle`.

```go
// Params oracle parameters
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

进行投票的区块数量。 

### VoteThreshold

- type: `Dec`
- default value: 50%

选票必须获得通过的最低选票百分比。

### RewardBand

- type: `Dec`
- default value: 7%

可以接受奖励的最终加权平均汇率的容忍误差。

### RewardDistributionWindow

- type: `int64`
- default value: `BlocksPerYear` (1 year window)

铸币税奖励进入然后分配的区块数量。

### Whitelist

- type: `oracle.DenomList`
- default: `[ukrt, uusd, usdr]`

可以投票的货币列表。 默认设置为 (µKRW, µSDR, µUSD)。

### SlashFraction

- type: `Dec`
- default: 0.01%

对保税代币的处罚比例。

### SlashWindow

- type: `int64`
- default: `BlocksPerWeek`

用于削减计数的块数。 

### MinValidPerWindow

- type: `Dec`
- default: 5%

每个斜线窗口的最小有效 oracle 投票的比率，以避免斜线。
