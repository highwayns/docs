# ガバナンス

:::警告注:
Terraのガバナンスモジュールは、Cosmos SDKの[`gov`]（https://docs.cosmos.network/master/modules/gov/）モジュールから継承されます。このドキュメントはスタブであり、主にその使用方法に関する重要なTerra固有の手順をカバーしています。
:::

ガバナンスとは、Terraネットワークの参加者が「提案」と呼ばれる請願書を提出することにより、契約に変更を加えることができるプロセスです。サポートのしきい値に達すると、一般的なコンセンサスに達します。提案の構造は普遍的であり、Luna保有者（ネットワークの長期的な実行可能性に関心のある人）がブロックチェーンパラメーターの更新とTerraプロトコルの将来の開発についてコメントすることができます。

[`terrad`リファレンスのガバナンスセクション]（../terrad/governance.md）をチェックして、ガバナンスプロセスに参加する方法の例を確認してください。

## 概念

ガバナンス提案プロセスは次のとおりです。

### 入金期間

提案書が提出された後、それは再充電期間に入り、提出日から2週間以内に最低再充電量の50ルナに到達する必要があります。 （提案者からの）初期デポジットと他のすべての関心のあるネットワーク参加者のデポジットの合計が50ルナに達するか、それを超えると、デポジットのしきい値に達します。

デポジットはスパムを防ぐためにのみ使用されます。プロポーザルが拒否されない限り、ネットワークは合格または不合格のプロポーザルのデポジットを返金します。提案が却下された場合、デポジットは返金されません。

### 投票期間

入金期間が終了する前に最低入金額に達した場合、提案は投票段階に入ります。最低入金額に達すると、投票が開始され、1週間続きます。提案投票期間中、ルナ保有者は提案に投票することができます。利用可能な4つの投票オプションは次のとおりです。 

- `Yes` - in favor
- `No` - not in favor
- `NoWithVeto` - veto
- `Abstain` - does not influence vote

投票は、1つのバインドされたLUNA = 1の投票に基づいて、バインドされたLUNAの所有者によって実行されます。 したがって、バリデーターは投票結果に最も大きな影響を与えます。委任者が投票しない場合、デフォルトでバリデーターの投票を継承します。

### 提案

提案が通過するには、次の条件が満たされている必要があります。

1.投票者の参加は、少なくとも「定足数」$ Q $に達する必要があります。 

$$\frac{Yes + No + NoWithVeto}{Stake} \ge Q$$

2.`NoWithVeto`の投票率は `veto` $ V $未満でなければなりません。

$$\frac{NoWithVeto}{Yes + No + NoWithVeto} \lt V$$

3.「はい」の投票の割合は「しきい値」$ T $より大きくなければなりません。 

$$\frac{Yes}{Yes + No + NoWithVeto} \gt T$$

上記の条件のいずれかが満たされない場合、提案は拒否されます。 拒否された提案は返金されません。 パラメータ「quorum」、「veto」、および「threshold」は、ガバナンスモジュールのブロックチェーンパラメータとして存在します。

:::警告警告
拒否された提案の場合、デポジットは返金されません。 コロンバス5から、これらの堆積物は燃やされました。 却下されずに合格または却下されたプロポーザルは、デポジットに返金されます。
:::

### 提案の実装

ガバナンス提案が受け入れられると、提案処理手順により、説明されている変更が自動的に有効になります。 Terraチームとコミュニティは、渡された「TextProposal」などの一般的な提案を確認して、手動で実装する方法を理解する必要があります。

## データ

### 提案 

```go
type Proposal struct {
	Content `json:"content" yaml:"content"`//Proposal content interface

	ProposalID       uint64         `json:"id" yaml:"id"`                                // ID of the proposal
	Status           ProposalStatus `json:"proposal_status" yaml:"proposal_status"`      //Status of the Proposal {Pending, Active, Passed, Rejected}
	FinalTallyResult TallyResult    `json:"final_tally_result" yaml:"final_tally_result"`//Result of Tallys

	SubmitTime     time.Time `json:"submit_time" yaml:"submit_time"`          //Time of the block where TxGovSubmitProposal was included
	DepositEndTime time.Time `json:"deposit_end_time" yaml:"deposit_end_time"`//Time that the Proposal would expire if deposit amount isn't met
	TotalDeposit   sdk.Coins `json:"total_deposit" yaml:"total_deposit"`      //Current deposit on this proposal. Initial value is set at InitialDeposit

	VotingStartTime time.Time `json:"voting_start_time" yaml:"voting_start_time"`//Time of the block where MinDeposit was reached. -1 if MinDeposit is not reached
	VotingEndTime   time.Time `json:"voting_end_time" yaml:"voting_end_time"`    //Time that the VotingPeriod for this proposal will end and votes will be tallied
}

```

「提案」は、デポジットとともにブロックチェーンに送信された変更要求を表すデータ構造です。 保証金が一定額（[`MinDeposit`]（#mindeposit））に達すると、提案が確認され、投票が開始されます。 保税ルナ保有者は、[`TxGovVote`]（）トランザクションを送信して提案に投票できます。 Terraは現在、Bonded Luna = 1票の単純な投票スキームに従っています。

プロポーザルの「コンテンツ」は、「タイトル」、「説明」、重要な変更など、「プロポーザル」に関する情報を含むインターフェースです。 `Content`タイプは、どのモジュールでも実装できます。 `Content`の` ProposalRoute`は、ガバナンスキーパーの `Content`ハンドラーをルーティングするために使用する必要のある文字列を返します。 このプロセスにより、ガバナンス管理者は、任意のモジュールによって実装された提案ロジックを実行できます。 提案が可決されると、処理手順が実行されます。 ハンドラーが成功した場合にのみ、状態が保持され、プロポーザルが最終的に渡されます。 それ以外の場合、提案は拒否されます。

## メッセージタイプ 

### MsgSubmitProposal 

```go
type MsgSubmitProposal struct {
	Content        Content        `json:"content" yaml:"content"`
	InitialDeposit sdk.Coins      `json:"initial_deposit" yaml:"initial_deposit"`// Initial deposit paid by sender. Must be strictly positive
	Proposer       sdk.AccAddress `json:"proposer" yaml:"proposer"`              // Address of the proposer
}
```

### MsgDeposit

```go
type MsgDeposit struct {
	ProposalID uint64         `json:"proposal_id" yaml:"proposal_id"`//ID of the proposal
	Depositor  sdk.AccAddress `json:"depositor" yaml:"depositor"`    //Address of the depositor
	Amount     sdk.Coins      `json:"amount" yaml:"amount"`          //Coins to add to the proposal's deposit
}
```

### MsgVote

```go
type MsgVote struct {
	ProposalID uint64         `json:"proposal_id" yaml:"proposal_id"`//ID of the proposal
	Voter      sdk.AccAddress `json:"voter" yaml:"voter"`            // address of the voter
	Option     VoteOption     `json:"option" yaml:"option"`          // option from OptionSet chosen by the voter
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

テキストの提案は、コアチームに特定の機能を実装するように依頼するなど、一般的な請願書を作成するために使用されます。 コミュニティは、コア開発者に渡されたテキスト提案を引用して、ソフトフォークまたはハードフォークを必要とする可能性のある機能に対する需要が高いことを示すことができます。

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

:::警告注:
パラメータ変更の提案は、実際には内部モジュールであるParamsモジュールにあります。 便宜上、ここに示します。
:::

パラメータ変更プロポーザルは特殊なタイプのプロポーザルです。渡されると、ネットワークの指定されたパラメータを直接変更することで自動的に有効になります。 モジュール仕様の**パラメータ**セクションを参照すると、各モジュールに関連付けられているパラメータを見つけることができます。

### ソフトウェアアップグレードの提案

:::危険警告
ソフトウェアアップグレードの推奨事項は、Cosmos SDKから継承されているために存在しますが、まだ実装されていないため、一時的に利用できません。 したがって、それらは単純なテキスト提案と同じセマンティクスを共有します。 そのような提案を提出すると、ルナの預金を失う可能性があります。  
:::

## Transitions

### End-Block

>このセクションは、Cosmos SDKの公式ドキュメントから抜粋したものであり、すべての人がガバナンスプロセスを理解しやすいようにここに配置されています。

`ProposalProcessingQueue`は、` MinDeposit`に到着するすべてのプロポーザルの `ProposalID`を含むキュー` queue [proposalID] `です。 各ブロックの終わりに、投票期間の終わりに達したすべての提案が処理されます。 完成した提案を処理するために、アプリケーションは投票をカウントし、各バリデーターの投票を計算し、バリデーターセット内の各バリデーターが投票したかどうかを確認します。 提案が受理された場合、保証金は返金されます。 最後に、プロポーザルコンテンツ `Handler`が実行されます。 

```go
for finishedProposalID in GetAllFinishedProposalIDs(block.Time)
	proposal = load(Governance, <proposalID|'proposal'>)//proposal is a const key

	validators = Keeper.getAllValidators()
	tmpValMap := map(sdk.AccAddress)ValidatorGovInfo

	//Initiate mapping at 0. This is the amount of shares of the validator's vote that will be overridden by their delegator's votes
	for each validator in validators
	tmpValMap(validator.OperatorAddr).Minus = 0

	//Tally
	voterIterator = rangeQuery(Governance, <proposalID|'addresses'>)//return all the addresses that voted on the proposal
	for each (voterAddress, vote) in voterIterator
	delegations = stakingKeeper.getDelegations(voterAddress)//get all delegations for current voter

	for each delegation in delegations
		//make sure delegation.Shares does NOT include shares being unbonded
		tmpValMap(delegation.ValidatorAddr).Minus += delegation.Shares
		proposal.updateTally(vote, delegation.Shares)

	_, isVal = stakingKeeper.getValidator(voterAddress)
	if (isVal)
		tmpValMap(voterAddress).Vote = vote

	tallyingParam = load(GlobalParams, 'TallyingParam')

	//Update tally if validator voted they voted
	for each validator in validators
	if tmpValMap(validator).HasVoted
		proposal.updateTally(tmpValMap(validator).Vote, (validator.TotalShares - tmpValMap(validator).Minus))

	//Check if proposal is accepted or rejected
	totalNonAbstain := proposal.YesVotes + proposal.NoVotes + proposal.NoWithVetoVotes
	if (proposal.Votes.YesVotes/totalNonAbstain > tallyingParam.Threshold AND proposal.Votes.NoWithVetoVotes/totalNonAbstain  < tallyingParam.Veto)
	// proposal was accepted at the end of the voting period
	// refund deposits (non-voters already punished)
	for each (amount, depositor) in proposal.Deposits
		depositor.AtomBalance += amount

	stateWriter, err := proposal.Handler()
	if err != nil
		//proposal passed but failed during state execution
		proposal.CurrentStatus = ProposalStatusFailed
		else
		//proposal pass and state is persisted
		proposal.CurrentStatus = ProposalStatusAccepted
		stateWriter.save()
	else
	//proposal was rejected
	proposal.CurrentStatus = ProposalStatusRejected

	store(Governance, <proposalID|'proposal'>, proposal)
```

## Parameters

ガバナンスモジュールのサブスペースは「gov」です。 

```go
type DepositParams struct {
	MinDeposit       sdk.Coins     `json:"min_deposit,omitempty" yaml:"min_deposit,omitempty"`
	MaxDepositPeriod time.Duration `json:"max_deposit_period,omitempty" yaml:"max_deposit_period,omitempty"`// Maximum period for Atom holders to deposit on a proposal. Initial value: 2 months
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

投票期間に入るプロポーザルの最低保証金。 

### MaxDepositPeriod

- type: `time.Duration` (seconds)
- default value: 2 months

Luna 持有者存入提案的最长期限。

### Quorum

- type: `Dec`

投票結果は、有効であるために必要な総株式の最小パーセンテージと見なされます。 

### Threshold

- type: `Dec`
- default value: 50%

提案が通過するための投票の最小パーセンテージ。 

### Veto

- type: `Dec`
- default value: `0.33`

拒否される提案の総投票数に対する拒否権投票の最小数の比率。  

### VotingPeriod

- type: `time.Duration` (seconds)

提案を拒否または拒否するための最小投票数の比率、合計投票数。 