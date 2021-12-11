# 治理

::: 警告 注意:
Terra 的治理模块继承自 Cosmos SDK 的 [`gov`](https://docs.cosmos.network/master/modules/gov/) 模块。本文档是一个存根，主要涵盖有关如何使用它的 Terra 特定的重要说明。
:::

治理是 Terra 网络中的参与者可以通过提交称为“提案”的请愿书对协议进行更改的过程，当达到支持的阈值时，达成普遍共识。提案结构是通用的，允许 Luna 的持有者(那些对网络的长期可行性感兴趣的人)就区块链参数更新以及 Terra 协议的未来发展发表意见。

检查 [`terrad` 参考的治理部分](../terrad/governance.md) 以查看如何参与治理过程的示例。

## 概念

以下是治理提案程序:

### 存款期

提案提交后，进入充值期，自提交之日起2周内必须达到50 Luna的最低充值总额。当初始存款(来自提议者)和所有其他感兴趣的网络参与者的存款之和达到或超过 50 Luna 时，达到存款门槛。

存款仅用于防止垃圾邮件。网络为通过或失败的提案退还押金，除非提案被否决。如果提案被否决，则押金不予退还。

### 投票期

如果在存款期结束前达到最低存款额，则提案进入投票阶段。一旦达到最低存款额，投票就会开始，并持续一周。在提案投票期间，Luna 持有者可以为提案投票。可用的 4 个投票选项是: 

- `Yes` - in favor
- `No` - not in favor
- `NoWithVeto` - veto
- `Abstain` - does not influence vote

投票由绑定 LUNA 的持有者在 1 绑定 LUNA = 1 票的基础上进行。因此，验证人对投票结果的影响最大，如果委托人不投票，则默认情况下他们会继承验证人的投票。

### 提案

提案要通过，必须满足以下条件:

1. 选民参与必须至少达到`quorum` $Q$:

$$\frac{Yes + No + NoWithVeto}{Stake} \ge Q$$

2.`NoWithVeto`投票的比例必须小于`veto`$V$:

$$\frac{NoWithVeto}{Yes + No + NoWithVeto} \lt V$$

3.`Yes`投票的比例必须大于`threshold`$T$:

$$\frac{Yes}{Yes + No + NoWithVeto} \gt T$$

如果不满足上述任何条件，则该提案将被拒绝。被否决否决的提案不会退还押金。参数“quorum”、“veto”和“threshold”作为区块链参数存在于治理模块中。

::: 警告 警告
对于被否决的提案，押金将不予退还。从哥伦布 5 号开始，这些沉积物被烧毁。未经否决通过或被拒绝的提案将退还押金。
:::

### 提案实施

当治理提案被接受时，提案处理程序会自动使所描述的更改生效。 Terra 团队和社区必须审查诸如已传递的“TextProposal”之类的通用提案，以了解如何手动实施。

## 数据

### 提议 

```go
type Proposal struct {
	Content `json:"content" yaml:"content"` // Proposal content interface

	ProposalID       uint64         `json:"id" yaml:"id"`                                 //  ID of the proposal
	Status           ProposalStatus `json:"proposal_status" yaml:"proposal_status"`       // Status of the Proposal {Pending, Active, Passed, Rejected}
	FinalTallyResult TallyResult    `json:"final_tally_result" yaml:"final_tally_result"` // Result of Tallys

	SubmitTime     time.Time `json:"submit_time" yaml:"submit_time"`           // Time of the block where TxGovSubmitProposal was included
	DepositEndTime time.Time `json:"deposit_end_time" yaml:"deposit_end_time"` // Time that the Proposal would expire if deposit amount isn't met
	TotalDeposit   sdk.Coins `json:"total_deposit" yaml:"total_deposit"`       // Current deposit on this proposal. Initial value is set at InitialDeposit

	VotingStartTime time.Time `json:"voting_start_time" yaml:"voting_start_time"` // Time of the block where MinDeposit was reached. -1 if MinDeposit is not reached
	VotingEndTime   time.Time `json:"voting_end_time" yaml:"voting_end_time"`     // Time that the VotingPeriod for this proposal will end and votes will be tallied
}

```

“提案”是一种数据结构，表示与存款一起提交到区块链的变更请求。一旦其存款达到一定值([`MinDeposit`](#mindeposit))，提案就会被确认并开始投票。保税 Luna 持有者然后可以发送 [`TxGovVote`]() 交易以对该提案进行投票。 Terra 目前遵循 1 个 Bonded Luna = 1 Vote 的简单投票方案。

提案上的“内容”是包含有关“提案”的信息的界面，例如“标题”、“说明”和任何显着更改。 `Content` 类型可以由任何模块实现。 `Content` 的 `ProposalRoute` 返回一个字符串，该字符串必须用于路由 Governance keeper 中的 `Content` 处理程序。这个过程允许治理管理员执行由任何模块实现的提案逻辑。如果提案通过，则执行处理程序。只有当处理程序成功时，状态才会持久化并且提案最终通过。否则，该提议被拒绝。

## 消息类型

### MsgSubmitProposal 

```go
type MsgSubmitProposal struct {
	Content        Content        `json:"content" yaml:"content"`
	InitialDeposit sdk.Coins      `json:"initial_deposit" yaml:"initial_deposit"` //  Initial deposit paid by sender. Must be strictly positive
	Proposer       sdk.AccAddress `json:"proposer" yaml:"proposer"`               //  Address of the proposer
}
```

### MsgDeposit

```go
type MsgDeposit struct {
	ProposalID uint64         `json:"proposal_id" yaml:"proposal_id"` // ID of the proposal
	Depositor  sdk.AccAddress `json:"depositor" yaml:"depositor"`     // Address of the depositor
	Amount     sdk.Coins      `json:"amount" yaml:"amount"`           // Coins to add to the proposal's deposit
}
```

### MsgVote

```go
type MsgVote struct {
	ProposalID uint64         `json:"proposal_id" yaml:"proposal_id"` // ID of the proposal
	Voter      sdk.AccAddress `json:"voter" yaml:"voter"`             //  address of the voter
	Option     VoteOption     `json:"option" yaml:"option"`           //  option from OptionSet chosen by the voter
}
```

## Proposals

### Text Proposal

```go
type TextProposal struct {
	Title       string `json:"title" yaml:"title"`
	Description string `json:"description" yaml:"description"`
}
```

文本建议用于创建通用请愿书，例如要求核心团队实现特定功能。 社区可以将传递的文本提案引用给核心开发人员，以表明可能需要软分叉或硬分叉的功能的需求量很大。

### Parameter Change Proposals

```go
type ParameterChangeProposal struct {
	Title       string        `json:"title" yaml:"title"`
	Description string        `json:"description" yaml:"description"`
	Changes     []ParamChange `json:"changes" yaml:"changes"`
}

type ParamChange struct {
	Subspace string `json:"subspace" yaml:"subspace"`
	Key      string `json:"key" yaml:"key"`
	Subkey   string `json:"subkey,omitempty" yaml:"subkey,omitempty"`
	Value    string `json:"value" yaml:"value"`
}
```

::: 警告 注意:
Parameter Change Proposals 实际上位于Params 模块中，它是一个内部模块。 为方便起见，此处显示它。
:::

参数更改提案是一种特殊类型的提案，一旦通过，将通过直接更改网络的指定参数自动生效。 您可以通过浏览到模块规范的 **Parameters** 部分来找到与每个模块关联的参数。

### 软件升级建议

::: 危险警告
软件升级建议之所以存在，是因为它们是从 Cosmos SDK 继承而来的，但由于尚未实现，因此暂时不可用。 因此，它们与简单的文本提议共享相同的语义。 如果您提交此类提案，您可能会丢失 Luna 押金。 
:::

## Transitions

### End-Block

> 本节取自 Cosmos SDK 官方文档，放在这里是为了方便大家理解治理流程。

`ProposalProcessingQueue` 是一个队列 `queue[proposalID]`，包含所有到达 `MinDeposit` 的提案的 `ProposalID`。 在每个区块结束时，所有已达到投票期结束的提案都将被处理。 为了处理完成的提案，应用程序会统计投票，计算每个验证者的投票并检查验证者集中的每个验证者是否都投票。 如果提案被接受，押金将被退还。 最后，执行提案内容`Handler`。 

```go
for finishedProposalID in GetAllFinishedProposalIDs(block.Time)
	proposal = load(Governance, <proposalID|'proposal'>) // proposal is a const key

	validators = Keeper.getAllValidators()
	tmpValMap := map(sdk.AccAddress)ValidatorGovInfo

	// Initiate mapping at 0. This is the amount of shares of the validator's vote that will be overridden by their delegator's votes
	for each validator in validators
	tmpValMap(validator.OperatorAddr).Minus = 0

	// Tally
	voterIterator = rangeQuery(Governance, <proposalID|'addresses'>) //return all the addresses that voted on the proposal
	for each (voterAddress, vote) in voterIterator
	delegations = stakingKeeper.getDelegations(voterAddress) // get all delegations for current voter

	for each delegation in delegations
		// make sure delegation.Shares does NOT include shares being unbonded
		tmpValMap(delegation.ValidatorAddr).Minus += delegation.Shares
		proposal.updateTally(vote, delegation.Shares)

	_, isVal = stakingKeeper.getValidator(voterAddress)
	if (isVal)
		tmpValMap(voterAddress).Vote = vote

	tallyingParam = load(GlobalParams, 'TallyingParam')

	// Update tally if validator voted they voted
	for each validator in validators
	if tmpValMap(validator).HasVoted
		proposal.updateTally(tmpValMap(validator).Vote, (validator.TotalShares - tmpValMap(validator).Minus))

	// Check if proposal is accepted or rejected
	totalNonAbstain := proposal.YesVotes + proposal.NoVotes + proposal.NoWithVetoVotes
	if (proposal.Votes.YesVotes/totalNonAbstain > tallyingParam.Threshold AND proposal.Votes.NoWithVetoVotes/totalNonAbstain  < tallyingParam.Veto)
	//  proposal was accepted at the end of the voting period
	//  refund deposits (non-voters already punished)
	for each (amount, depositor) in proposal.Deposits
		depositor.AtomBalance += amount

	stateWriter, err := proposal.Handler()
	if err != nil
		// proposal passed but failed during state execution
		proposal.CurrentStatus = ProposalStatusFailed
		else
		// proposal pass and state is persisted
		proposal.CurrentStatus = ProposalStatusAccepted
		stateWriter.save()
	else
	// proposal was rejected
	proposal.CurrentStatus = ProposalStatusRejected

	store(Governance, <proposalID|'proposal'>, proposal)
```

## Parameters

治理模块的子空间是“gov”。 

```go
type DepositParams struct {
	MinDeposit       sdk.Coins     `json:"min_deposit,omitempty" yaml:"min_deposit,omitempty"`
	MaxDepositPeriod time.Duration `json:"max_deposit_period,omitempty" yaml:"max_deposit_period,omitempty"` //  Maximum period for Atom holders to deposit on a proposal. Initial value: 2 months
}

type TallyParams struct {
	Quorum    sdk.Dec `json:"quorum,omitempty" yaml:"quorum,omitempty"`
	Threshold sdk.Dec `json:"threshold,omitempty" yaml:"threshold,omitempty"`
	Veto      sdk.Dec `json:"veto,omitempty" yaml:"veto,omitempty"`
}

type VotingParams struct {
	VotingPeriod time.Duration `json:"voting_period,omitempty" yaml:"voting_period,omitempty"`
}
```

### MinDeposit

- type: `Coins`
- default value: `uluna`

进入投票期的提案的最低存款额。 

### MaxDepositPeriod

- type: `time.Duration` (seconds)
- default value: 2 months

Luna 持有者存入提案的最长期限。

### Quorum

- type: `Dec`

投票结果被视为有效所需的总股份的最低百分比。

### Threshold

- type: `Dec`
- default value: 50%

提案通过的最低赞成票比例。

### Veto

- type: `Dec`
- default value: `0.33`

否决票的最小值与要否决的提案的总票数之比。 

### VotingPeriod

- type: `time.Duration` (seconds)

投票期的长度。 