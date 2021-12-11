# 质押

Staking 模块通过要求验证者绑定本地抵押资产 Luna 来启用 Terra 的 Proof-of-Stake 功能。 

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

> 本节取自 Cosmos SDK 官方文档，放在这里是为了方便大家了解 Staking 模块的参数。

每个 abci 结束块调用，更新队列和验证器集的操作
更改被指定执行。

#### 验证器集更改

在此过程中通过状态转换更新质押验证器集
在每个块的末尾运行。作为此过程的一部分，任何更新
验证器也会返回到 Tendermint 以包含在 Tendermint 中
验证器集，负责验证 Tendermint 消息
共识层。操作如下:

- 新的验证器集被视为最高的 `params.MaxValidators` 数量
  从 ValidatorsByPower 索引中检索的验证器
- 将先前的验证器集与新的验证器集进行比较:
  - 缺失的验证者开始解除绑定，他们的“代币”从
    `BondedPool` 到 `NotBondedPool` `ModuleAccount`
  - 新的验证者立即绑定，他们的“代币”从
    `NotBondedPool` 到 `BondedPool` `ModuleAccount`

在所有情况下，任何离开或进入绑定验证器集的验证器或
更改余额并留在绑定验证器集合中会导致更新
传递回 Tendermint 的消息。

#### 队列

在 staking 中，某些状态转换不是即时的而是发生的
在一段时间内(通常是解绑期)。当这些
转换已经成熟，必须进行某些操作才能完成
状态操作。这是通过使用队列来实现的
在每个块的末尾检查/处理。

##### 解除绑定验证器

当验证者被踢出绑定验证者集时(通过
被监禁，或没有足够的绑定代币)它开始解除绑定
进程及其所有代表团开始解除绑定(同时仍在
委托给这个验证器)。在这一点上，验证者被认为是一个
非绑定验证器，它将成熟成为“非绑定验证器”
解绑期过后。

验证者队列的每个区块都将被检查是否有成熟的解绑验证者
(即完成时间 <= 当前时间)。此时任何成熟
没有任何剩余委托的验证器将从状态中删除。
对于所有其他成熟的解绑验证器，还有剩余的
委托，`validator.Status` 从`sdk.Unbonding` 切换到
`sdk.Unbonded`。

##### 解除绑定委托

完成所有成熟的`UnbondingDelegations.Entries` 内的解除绑定
`UnbondingDelegations` 队列具有以下过程:

- 将余额币转移到委托人的钱包地址
- 从`UnbondingDelegation.Entries`中删除成熟的条目
- 如果没有，则从商店中删除 `UnbondingDelegation` 对象
  剩余条目。

##### 重新授权

完成所有成熟的“Redelegation.Entries”的解绑
`Redelegations` 队列具有以下过程:

- 从`Redelegation.Entries`中删除成熟的条目
- 如果没有，则从商店中删除 `Redelegation` 对象
  剩余条目。

## 参数

Staking 模块的子空间是“staking”。

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

解除绑定的持续时间，以纳秒为单位。

### MaxValidators

- type: `uint16`
- default: `130`

活动验证器的最大数量。 

### MaxEntries

- type: `uint16`
- default: `7`

解除绑定授权或重新授权(每对/三人组)的最大条目数。 我们需要小心处理这里潜在的溢出，因为这是用户决定的。

### BondDenom

- type: `string`
- default: `uluna`

定义抵押所需资产的面额。
