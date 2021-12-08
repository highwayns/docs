# 证据

::: 警告注意
Terra 的证据模块继承自 Cosmos SDK 的 [`evidence`](https://docs.cosmos.network/master/modules/evidence/) 模块。本文档是一个存根，主要涵盖有关如何使用它的 Terra 特定的重要说明。
:::

证据模块允许提交和处理不当行为的任意证据，例如模棱两可和反事实签名。

通常，标准证据处理期望底层共识引擎 Tendermint 在被发现时自动提交证据，允许客户和外部链直接提交更复杂的证据。证据模块的运作方式不同。

所有具体的证据类型都必须实现“证据”接口契约。首先，提交的“证据”通过证据模块的“路由器”进行路由，它尝试为特定的“证据”类型找到相应的注册“处理程序”。每个 `Evidence` 类型都必须有一个 `Handler` 注册到证据模块的 keeper 才能成功路由和执行。

每个相应的处理程序还必须履行`Handler` 接口契约。给定“证据”类型的“处理程序”可以执行任意状态转换，例如削减、监禁和墓碑化。

## 概念

### 证据

提交给模块的任何具体类型的证据都必须满足以下“证据”合同。并非所有具体类型的证据都会以相同的方式履行本合同，并且某些数据可能与某些类型的证据完全无关。还创建了一个附加的“ValidatorEvidence”，它扩展了“Evidence”，以定义针对恶意验证器的证据合同。 

```
// Evidence defines the contract which concrete evidence types of misbehavior
// must implement.
type Evidence interface {
	proto.Message

	Route() string
	Type() string
	String() string
	Hash() tmbytes.HexBytes
	ValidateBasic() error

	// Height at which the infraction occurred
	GetHeight() int64
}

// ValidatorEvidence extends Evidence interface to define contract
// for evidence against malicious validators
type ValidatorEvidence interface {
	Evidence

	// The consensus address of the malicious validator at time of infraction
	GetConsensusAddress() sdk.ConsAddress

	// The total power of the malicious validator at time of infraction
	GetValidatorPower() int64

	// The total validator set power at time of infraction
	GetTotalPower() int64
}
```

### 注册和处理

首先，证据模块必须知道它期望处理的所有证据类型。在 `Evidence` 合约中使用 `Router` 注册 `Route` 方法，定义如下。 `Router` 接受 `Evidence` 并尝试通过 `Route` 方法为 `Evidence` 找到相应的 `Handler`。

```
type Router interface {
  AddRoute(r string, h Handler) Router
  HasRoute(r string) bool
  GetRoute(path string) Handler
  Seal()
  Sealed() bool
}
```

如下定义，`Handler` 负责执行处理`Evidence` 的整个业务逻辑。这样做通常包括验证证据，通过“ValidateBasic”进行无状态检查和通过提供给“Handler”的任何保持器进行有状态检查。此外，`Handler` 还可以执行一些功能，例如削减和监禁验证器。所有由`Handler` 处理的`Evidence` 必须被持久化。

```
// 处理程序定义了一个不可知的证据处理程序。经办人负责
// 用于执行验证所需的所有相应业务逻辑
// 证据是有效的。此外，Handler 可以执行任何必要的
// 削减和潜在的监禁。
type Handler func(sdk.Context, Evidence) error
```

### 状态

证据模块只存储有效提交的“证据”状态。证据状态也存储和导出在证据模块的“GenesisState”中。

```
// GenesisState 定义了证据模块的创世状态。
message GenesisState {
  // evidence defines all the evidence at genesis.
  repeated google.protobuf.Any evidence = 1;
}
```

## 消息

### MsgSubmitEvidence

证据是通过“MsgSubmitEvidence”消息提交的：

```
// MsgSubmitEvidence 表示支持任意提交的消息
// 不当行为的证据，例如模棱两可或反事实签名。
message MsgSubmitEvidence {
  string              submitter = 1;
  google.protobuf.Any evidence  = 2;
}
```

`MsgSubmitEvidence` 消息的 `Evidence` 必须有一个相应的 `Handler` 注册到证据模块的 `Router` 才能被正确处理和路由。

鉴于 `Evidence` 已注册到相应的 `Handler`，其处理如下：

```
func SubmitEvidence(ctx Context, evidence Evidence) error {
  if _, ok := GetEvidence(ctx, evidence.Hash()); ok {
    return sdkerrors.Wrap(types.ErrEvidenceExists, evidence.Hash().String())
  }
  if !router.HasRoute(evidence.Route()) {
    return sdkerrors.Wrap(types.ErrNoEvidenceHandlerExists, evidence.Route())
  }

  handler := router.GetRoute(evidence.Route())
  if err := handler(ctx, evidence); err != nil {
    return sdkerrors.Wrap(types.ErrInvalidEvidence, err.Error())
  }

  ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			types.EventTypeSubmitEvidence,
			sdk.NewAttribute(types.AttributeKeyEvidenceHash, evidence.Hash().String()),
		),
	)

  SetEvidence(ctx, evidence)
  return nil
}
```

必须不存在相同类型的有效提交的“证据”。 `Evidence` 被路由到 `Handler` 并执行。如果处理证据时没有发生错误，则会发出一个事件，并将其持久化为状态。 

### Events

证据模块发出以下处理程序事件： 

#### MsgSubmitEvidence

| Type            | Attribute Key | Attribute Value |
| --------------- | ------------- | --------------- |
| submit_evidence | evidence_hash | {evidenceHash}  |
| message         | module        | evidence        |
| message         | sender        | {senderAddress} |
| message         | action        | submit_evidence |

### BeginBlock

#### 证据处理

Tendermint 块可以包括
[证据](https://github.com/tendermint/tendermint/blob/master/docs/spec/blockchain/blockchain.md#evidence) 表明验证者是否有恶意行为。 相关信息将作为 ABCI 证据在 abci.RequestBeginBlock 中转发给应用程序，以便验证器可以受到相应的惩罚。

#### 歧义

目前，SDK 在 ABCI `BeginBlock` 中处理两种类型的证据：

- `DuplicateVoteEvidence`,
- `LightClientAttackEvidence`.

证据模块以相同的方式处理这两种证据类型。 首先，SDK 将 Tendermint 的具体证据类型转换为 SDK 的“证据”接口，使用“Equivocation”作为具体类型。

```proto
// Equivocation implements the Evidence interface.
message Equivocation {
  int64                     height            = 1;
  google.protobuf.Timestamp time              = 2;
  int64                     power             = 3;
  string                    consensus_address = 4;
}
```

要使在 `block` 中提交的 `Equivocation` 有效，它必须满足以下要求：

`Evidence.Timestamp >= block.Timestamp - MaxEvidenceAge`

where:

- `Evidence.Timestamp` is the timestamp in the block at height `Evidence.Height`.
- `block.Timestamp` is the current block timestamp.

如果一个区块中包含有效的“Equivocation”证据，则验证者的权益为
减少了`SlashFractionDoubleSign`，由[slashing module](spec-slashing.md) 定义。 减少是在违规发生时实施，而不是在发现证据时实施。
导致违规的股份将被削减，即使它已被重新授权或开始解除绑定。

此外，验证者将被永久监禁和墓碑化，因此验证者无法再次重新进入验证者集。

::: 细节`Equivocation`证据处理代码 

```go
func (k Keeper) HandleEquivocationEvidence(ctx sdk.Context, evidence *types.Equivocation) {
	logger := k.Logger(ctx)
	consAddr := evidence.GetConsensusAddress()

	if _, err := k.slashingKeeper.GetPubkey(ctx, consAddr.Bytes()); err != nil {
		// Ignore evidence that cannot be handled.
		//
		// NOTE: We used to panic with:
		// `panic(fmt.Sprintf("Validator consensus-address %v not found", consAddr))`,
		// but this couples the expectations of the app to both Tendermint and
		// the simulator.  Both are expected to provide the full range of
		// allowable but none of the disallowed evidence types.  Instead of
		// getting this coordination right, it is easier to relax the
		// constraints and ignore evidence that cannot be handled.
		return
	}

	// calculate the age of the evidence
	infractionHeight := evidence.GetHeight()
	infractionTime := evidence.GetTime()
	ageDuration := ctx.BlockHeader().Time.Sub(infractionTime)
	ageBlocks := ctx.BlockHeader().Height - infractionHeight

	// Reject evidence if the double-sign is too old. Evidence is considered stale
	// if the difference in time and number of blocks is greater than the allowed
	// parameters defined.
	cp := ctx.ConsensusParams()
	if cp != nil && cp.Evidence != nil {
		if ageDuration > cp.Evidence.MaxAgeDuration && ageBlocks > cp.Evidence.MaxAgeNumBlocks {
			logger.Info(
				"ignored equivocation; evidence too old",
				"validator", consAddr,
				"infraction_height", infractionHeight,
				"max_age_num_blocks", cp.Evidence.MaxAgeNumBlocks,
				"infraction_time", infractionTime,
				"max_age_duration", cp.Evidence.MaxAgeDuration,
			)
			return
		}
	}

	validator := k.stakingKeeper.ValidatorByConsAddr(ctx, consAddr)
	if validator == nil || validator.IsUnbonded() {
		// Defensive: Simulation doesn't take unbonding periods into account, and
		// Tendermint might break this assumption at some point.
		return
	}

	if ok := k.slashingKeeper.HasValidatorSigningInfo(ctx, consAddr); !ok {
		panic(fmt.Sprintf("expected signing info for validator %s but not found", consAddr))
	}

	// ignore if the validator is already tombstoned
	if k.slashingKeeper.IsTombstoned(ctx, consAddr) {
		logger.Info(
			"ignored equivocation; validator already tombstoned",
			"validator", consAddr,
			"infraction_height", infractionHeight,
			"infraction_time", infractionTime,
		)
		return
	}

	logger.Info(
		"confirmed equivocation",
		"validator", consAddr,
		"infraction_height", infractionHeight,
		"infraction_time", infractionTime,
	)

	// We need to retrieve the stake distribution which signed the block, so we
	// subtract ValidatorUpdateDelay from the evidence height.
	// Note, that this *can* result in a negative "distributionHeight", up to
	// -ValidatorUpdateDelay, i.e. at the end of the
	// pre-genesis block (none) = at the beginning of the genesis block.
	// That's fine since this is just used to filter unbonding delegations & redelegations.
	distributionHeight := infractionHeight - sdk.ValidatorUpdateDelay

	// Slash validator. The `power` is the int64 power of the validator as provided
	// to/by Tendermint. This value is validator.Tokens as sent to Tendermint via
	// ABCI, and now received as evidence. The fraction is passed in to separately
	// to slash unbonding and rebonding delegations.
	k.slashingKeeper.Slash(
		ctx,
		consAddr,
		k.slashingKeeper.SlashFractionDoubleSign(ctx),
		evidence.GetValidatorPower(), distributionHeight,
	)

	// Jail the validator if not already jailed. This will begin unbonding the
	// validator if not already unbonding (tombstoned).
	if !validator.IsJailed() {
		k.slashingKeeper.Jail(ctx, consAddr)
	}

	k.slashingKeeper.JailUntil(ctx, consAddr, types.DoubleSignJailEndTime)
	k.slashingKeeper.Tombstone(ctx, consAddr)
}
```
:::

slashing、jail 和 tombstoning 调用通过 slashing 模块进行委托，该模块发出信息事件并最终将调用委托给 staking 模块。 有关削减和监禁的更多信息，请参阅 [transitions](spec-staking.md#transitions)。 