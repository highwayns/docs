# 分配します

:::警告注:
Terraの配布モジュールは、Cosmos SDKの[`distribution`](https://docs.cosmos.network/master/modules/distribution/)モジュールを継承しています。このドキュメントはスタブであり、主にその使用方法に関する重要なTerra固有の手順をカバーしています。
:::

`Distribution`モジュールは、収集された料金を追跡し、それらを検証者と委任者に_受動的に_割り当てるためのメカニズムを説明します。さらに、配布モジュールは、チェーンのガバナンス制御下にある資金である[community-pool](#community-pool)も定義します。

## 概念

### バリデーターとデリゲーターの報酬

:::警告重要
パッシブアロケーションとは、バリデーターとデリゲーターが引き出しトランザクションを送信することにより、手数料の報酬を手動で収集する必要があることを意味します。 `terrad`の使い方を読んでください[ここ](../terrad/distribution.md)。
:::

集められた報酬は世界中で集められ、検証者と委任者に配布されます。各バリデーターには、委任者に代わって収集された報酬について、委任者からコミッションを収集する機会があります。料金は、グローバル報酬プールとバリデーター提案者報酬プールに直接収集されます。受動的な簿記の性質上、報酬の分配率に影響を与えるパラメータが変更されるたびに、報酬も撤回する必要があります。

### コミュニティプール

コミュニティプールは、テラ経済のさらなる採用と成長を促進するプロジェクトに資金を提供するために特別に使用されるトークンリザーブです。為替レートのオラクル投票勝者に割り当てられたシニョリッジ部分は[報酬ウェイト](spec-treasury.md#reward-weight)と呼ばれ、この値は財務省によって管理されます。残りのシニョリッジはすべてコミュニティプールで使用されます。

:::警告注:
Columbus-5以降、すべてのシニョリッジが燃やされ、コミュニティプールは資金を受け取らなくなりました。
:::

## 状態

>このセクションは、Cosmos SDKの公式ドキュメントから抜粋したものであり、Distributionモジュールのパラメーターと作成変数の理解を容易にするためにここに配置されています。

### 経費プール

配布に使用されるすべてのグローバル追跡パラメータは、に保存されます
「コストプール」。報酬を収集し、報酬プールに追加します
ここから検証者/委任者に配布します。

報酬プールには、許可するための小数コイン( `DecCoins`)が含まれていることに注意してください
インフレなどの操作からコインのごく一部を取得します。
コインがプールから配布されると、切り捨てられます
`sdk.Coins`は10進数ではありません。

### バリデーターの配布

関連するバリデーターのバリデーター配布情報は、毎回更新されます。

1.バリデーターのデリゲートの数を更新しました。
2.バリデーターはブロックを正常に提案し、報酬を受け取ります。
3.委任者がバリデーターから撤退する、または
4.検証者はその手数料を撤回します。

### 配布の委任

各コミッション配分は、最終的な高さを記録するだけで済みます
手数料を引き出します。代表団は毎回料金を撤回しなければならないので
プロパティの変更(別名バインディングトークンなど)のプロパティは変更されません
そして、クライアントの_蓄積_係数は受動的に計算することができます
最後の引き出しの高さとその現在の属性のみ。

## メッセージタイプ 

### MsgSetWithdrawAddress

```go
type MsgSetWithdrawAddress struct {
	DelegatorAddress sdk.AccAddress `json:"delegator_address" yaml:"delegator_address"`
	WithdrawAddress  sdk.AccAddress `json:"withdraw_address" yaml:"withdraw_address"`
}
```


### MsgWithdrawDelegatorReward

```go
//委任に使用されるmsg構造は、単一のバリデーターから終了します 
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

配布モジュールは特別な提案を定義します。提案が渡された後、コミュニティプールの資金は、「金額」で指定されたコインを「受信者」アカウントに支払うために使用されます。 

```go
type CommunityPoolSpendProposal struct {
	Title       string         `json:"title" yaml:"title"`
	Description string         `json:"description" yaml:"description"`
	Recipient   sdk.AccAddress `json:"recipient" yaml:"recipient"`
	Amount      sdk.Coins      `json:"amount" yaml:"amount"`
}
```

## 取引

### スターティングブロック

>このセクションは、Cosmos SDKの公式ドキュメントから派生したものであり、配布モジュールのパラメーターを誰もが理解しやすいようにここに配置されています。

ブロックの開始時に、配布モジュールは、ブロックの終了時に配布を決定し、前のブロックの報酬を配布する提案者を設定します。

受け取った料金は、モジュールに出入りするコインの流れを追跡する配布モジュール「ModuleAccount」に転送されます。料金は、提案者、コミュニティファンド、およびグローバルプールにも割り当てられます。

-提案者:検証者がラウンドの提案者である場合、検証者とその委任者は1〜5％の手数料を受け取ります。
-コミュニティ基金:予備のコミュニティ税が徴収され、コミュニティプールに分配されます。 Columbus-5から、この税金は請求されなくなり、コミュニティプールは資金を受け取らなくなりました。
-グローバルプール:残りの資金はグローバルプールに分配され、投票するかどうかに関係なく、投票権を通じてすべてのバインドされたバリデーターに比例して分配されます。この分布は社会的分布と呼ばれます。提案者の報酬に加えて、社会的分配も提案者の検証者に適用されます。

プロポーザーの報酬は、事前コミットのTendermintメッセージに基づいて計算され、バリデーターが待機し、追加の事前コミットをブロックに含めるように促します。すべての供給報酬は供給報酬プールに追加され、各バリデーターは個別に保持します( `ValidatorDistribution.ProvisionsRewardPool`)。 

```go
func AllocateTokens(feesCollected sdk.Coins, feePool FeePool, proposer ValidatorDistribution,
              sumPowerPrecommitValidators, totalBondedTokens, communityTax,
              proposerCommissionRate sdk.Dec)

     SendCoins(FeeCollectorAddr, DistributionModuleAccAddr, feesCollected)
     feesCollectedDec = MakeDecCoins(feesCollected)
     proposerReward = feesCollectedDec * (0.01 + 0.04
                       * sumPowerPrecommitValidators/totalBondedTokens)

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

## パラメーター

分布モジュールの部分空間は「分布」です。 

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
