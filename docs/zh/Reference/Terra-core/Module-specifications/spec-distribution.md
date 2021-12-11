# 分配

::: 警告 注意:
Terra 的 Distribution 模块继承自 Cosmos SDK 的 [`distribution`](https://docs.cosmos.network/master/modules/distribution/) 模块。本文档是一个存根，主要涵盖有关如何使用它的 Terra 特定的重要说明。
:::

`Distribution` 模块描述了一种跟踪收取的费用并_被动_将它们分配给验证者和委托者的机制。此外，Distribution 模块还定义了【社区池】(#community-pool)，是链上治理控制下的资金。

## 概念

### 验证人和委托人奖励

::: 警告 重要
被动分配意味着验证者和委托者必须通过提交提款交易来手动收取费用奖励。阅读如何使用 `terrad` [此处](../terrad/distribution.md)。
:::

收集到的奖励在全球汇集并分发给验证者和委托者。每个验证者都有机会就代表委托人收集的奖励向委托人收取佣金。费用直接收集到全球奖励池和验证者提议者奖励池中。由于被动记账的性质，每当影响奖励分配率的参数发生变化时，也必须撤回奖励。

### 社区池

社区池是一个代币储备，专门用于资助促进 Terra 经济进一步采用和增长的项目。指定给汇率 Oracle 投票获胜者的铸币税部分称为 [奖励权重](spec-treasury.md#reward-weight)，该值由财政部管理。其余的铸币税全部用于社区池。

::: 警告 注意:
从 Columbus-5 开始，所有铸币税都被烧毁，社区池不再获得资金。
:::

## 状态

> 本节取自 Cosmos SDK 官方文档，放在这里是为了方便您了解 Distribution 模块的参数和创世变量。

### 费用池

所有用于分发的全局跟踪参数都存储在
`费用池`。收集奖励并添加到奖励池中
从这里分发给验证者/委托者。

请注意，奖励池包含十进制硬币(`DecCoins`)以允许
从通货膨胀等操作中获得一小部分硬币。
当硬币从池中分配时，它们会被截断回
`sdk.Coins` 非十进制。

### 验证器分发

相关验证器的验证器分布信息每次都会更新:

1. 更新了验证者的委托数量，
2. 验证者成功提出区块并获得奖励，
3. 任何委托人退出验证人，或
4. 验证者撤回其佣金。 

### 委托分发

每个委托分布只需要记录它最后的高度
撤回费用。因为代表团每次都必须撤回费用
属性改变(又名绑定令牌等)它的属性将保持不变
并且委托人的_accumulation_因子可以被动计算
只有最后一次提款的高度及其当前属性。

## 消息类型

### MsgSetWithdrawAddress

```go
type MsgSetWithdrawAddress struct {
	DelegatorAddress sdk.AccAddress `json:"delegator_address" yaml:"delegator_address"`
	WithdrawAddress  sdk.AccAddress `json:"withdraw_address" yaml:"withdraw_address"`
}
```


### MsgWithdrawDelegatorReward

```go
// 用于委托的 msg 结构从单个验证器中退出
type MsgWithdrawDelegatorReward struct {
	DelegatorAddress sdk.AccAddress `json:"delegator_address" yaml:"delegator_address"`
	ValidatorAddress sdk.ValAddress `json:"validator_address" yaml:"validator_address"`
}
```


### MsgWithdrawValidatorCommission

```go
type MsgWithdrawValidatorCommission struct {
	ValidatorAddress sdk.ValAddress `json:"validator_address" yaml:"validator_address"`
}
```


### MsgFundCommunityPool

```go
type MsgFundCommunityPool struct {
	Amount    sdk.Coins      `json:"amount" yaml:"amount"`
	Depositor sdk.AccAddress `json:"depositor" yaml:"depositor"`
}
```


## 提案

### CommunityPoolSpendProposal

分配模块定义了一个特殊提案，该提案通过后，将使用社区池中的资金将“Amount”中指定的硬币支付给“Recipient”账户。

```go
type CommunityPoolSpendProposal struct {
	Title       string         `json:"title" yaml:"title"`
	Description string         `json:"description" yaml:"description"`
	Recipient   sdk.AccAddress `json:"recipient" yaml:"recipient"`
	Amount      sdk.Coins      `json:"amount" yaml:"amount"`
}
```

## 交易

### 开始区块

> 本节来源于Cosmos SDK 官方文档，放在这里是为了方便大家理解分发模块的参数。

在区块开始时，Distribution 模块将设置提议者以确定结束区块期间的分配，并为前一个区块分配奖励。

收到的费用被转移到分发模块“ModuleAccount”，它跟踪硬币进出模块的流量。费用也分配给提议者、社区基金和全球池:

- 提议者:当验证者是一轮的提议者时，该验证者及其委托人将获得 1-5% 的费用奖励。
- 社区基金:储备社区税被收取并分配到社区池中。从 Columbus-5 开始，不再收取此税，社区池不再获得资金。
- 全球池:剩余的资金分配到全球池，在那里它们通过投票权按比例分配给所有绑定验证者，而不管他们是否投票。这种分配称为社会分配。除了提议者奖励之外，社会分配还应用于提议者验证者。

提议者奖励是根据预提交 Tendermint 消息计算的，以激励验证者等待并在区块中包含额外的预提交。所有供应奖励都添加到供应奖励池中，每个验证者单独持有(`ValidatorDistribution.ProvisionsRewardPool`)。

```go
func AllocateTokens(feesCollected sdk.Coins, feePool FeePool, proposer ValidatorDistribution,
              sumPowerPrecommitValidators, totalBondedTokens, communityTax,
              proposerCommissionRate sdk.Dec)

     SendCoins(FeeCollectorAddr, DistributionModuleAccAddr, feesCollected)
     feesCollectedDec = MakeDecCoins(feesCollected)
     proposerReward = feesCollectedDec * (0.01 + 0.04
                       * sumPowerPrecommitValidators / totalBondedTokens)

     commission = proposerReward * proposerCommissionRate
     proposer.PoolCommission += commission
     proposer.Pool += proposerReward - commission

     communityFunding = feesCollectedDec * communityTax
     feePool.CommunityFund += communityFunding

     poolReceived = feesCollectedDec - proposerReward - communityFunding
     feePool.Pool += poolReceived

     SetValidatorDistribution(proposer)
     SetFeePool(feePool)
```

## 参数

Distribution 模块的子空间是“distribution”。 

```go
type GenesisState struct {
	...
	CommunityTax        sdk.Dec `json:"community_tax" yaml:"community_tax"`
	BaseProposerReward	sdk.Dec `json:"base_proposer_reward" yaml:"base_proposer_reward"`
	BonusProposerReward	sdk.Dec	`json:"bonus_proposer_reward" yaml:"bonus_proposer_reward"`
	WithdrawAddrEnabled bool 	`json:"withdraw_addr_enabled"`
	...
}
```

### CommunityTax

- type: `Dec`

### BaseProposerReward

- type: `Dec`

### BonusProposerReward

- type: `Dec`

### WithdrawAddrEnabled

- type: `bool`
