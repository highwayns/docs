# 削减

Slashing 模块使 Terra 能够通过惩罚(“slashing”)来抑制协议认可的具有风险的行为者的任何可归因行为。 Terra 主要使用 [`Staking`](spec-staking.md) 模块在违反验证者职责时进行斜线(例如在汇率预言机中遗漏过多的 `VotePeriod`)。 该模块处理 Tendermint 共识级别的较低级别的惩罚，例如双重签名。

## 消息类型 

### MsgUnjail

```go
type MsgUnjail struct {
    ValidatorAddr sdk.ValAddress `json:"address" yaml:"address"` // address of the validator operator
}
```

## 交易

### 开始块

> 本节取自Cosmos SDK 官方文档，放在这里是为了方便大家理解Slashing 模块的参数。

在每个区块的开始，Slashing 模块会检查验证器的违规或停机证据，以及双重签名和其他低级别共识惩罚。

#### 证据处理

Tendermint 块可以包含证据，这表明验证者犯下了恶意
行为。相关信息作为 ABCI 证据转发给应用程序
在`abci.RequestBeginBlock` 中，这样验证器就会受到相应的惩罚。

对于在 `block` 中提交的一些 `Evidence` 有效，它必须满足:

`Evidence.Timestamp >= block.Timestamp - MaxEvidenceAge`

其中`Evidence.Timestamp` 是块中高度处的时间戳
`Evidence.Height` 和 `block.Timestamp` 是当前区块的时间戳。

如果一个区块中包含有效证据，则验证者的权益将减少
他们的赌注的一些惩罚(`SlashFractionDoubleSign` 用于模棱两可)
违规发生的时间(而不是发现证据的时间)。我们
想要“关注赌注”，即导致违规的赌注
应该削减，即使它已经被重新授权或开始解除绑定。

我们首先需要遍历来自 slashed 的解除绑定和重新授权
验证器并跟踪此后移动了多少股份: 

```go
slashAmountUnbondings := 0
slashAmountRedelegations := 0

unbondings := getUnbondings(validator.Address)
for unbond in unbondings {

    if was not bonded before evidence.Height or started unbonding before unbonding period ago {
        continue
    }

    burn := unbond.InitialTokens * SLASH_PROPORTION
    slashAmountUnbondings += burn

    unbond.Tokens = max(0, unbond.Tokens - burn)
}

// only care if source gets slashed because we're already bonded to destination
// so if destination validator gets slashed our delegation just has same shares
// of smaller pool.
redels := getRedelegationsBySource(validator.Address)
for redel in redels {

    if was not bonded before evidence.Height or started redelegating before unbonding period ago {
        continue
    }

    burn := redel.InitialTokens * SLASH_PROPORTION
    slashAmountRedelegations += burn

    amount := unbondFromValidator(redel.Destination, burn)
    destroy(amount)
}
```

然后我们削减验证器并将它们墓碑化:

```
curVal := validator
oldVal := loadValidator(evidence.Height, evidence.Address)

slashAmount := SLASH_PROPORTION * oldVal.Shares
slashAmount -= slashAmountUnbondings
slashAmount -= slashAmountRedelegations

curVal.Shares = max(0, curVal.Shares - slashAmount)

signInfo = SigningInfo.Get(val.Address)
signInfo.JailedUntil = MAX_TIME
signInfo.Tombstoned = true
SigningInfo.Set(val.Address, signInfo)
```

这确保了违规的验证者无论是作为拥有 X 股权的单个验证者还是作为拥有 X 股权的 N 验证者，都会受到相同的惩罚。对在单次处罚期间发生的所有双重签名违规行为的处罚金额是有上限的。有关详细信息，请参阅 [墓碑上限](https://docs.cosmos.network/master/modules/slashing/01_concepts.html#tombstone-caps)。

#### 活性跟踪

在每个块的开始，我们更新每个块的“ValidatorSigningInfo”
验证器并检查它们是否超过了活跃度阈值
滑动窗口。这个滑动窗口由`SignedBlocksWindow`和
此窗口中的索引由验证器中的“IndexOffset”决定
`验证器签名信息`。对于每个处理的块，`IndexOffset` 被增加
无论验证者是否签名。指标确定后，
`MissedBlocksBitArray` 和 `MissedBlocksCounter` 相应更新。

最后，为了确定验证器是否低于活跃度阈值，
我们获取丢失的最大块数，`maxMissed`，即
`SignedBlocksWindow - (MinSignedPerWindow * SignedBlocksWindow)` 和最小值
我们可以确定活跃度的高度，`minHeight`。如果当前块是
大于 `minHeight` 并且验证器的 `MissedBlocksCounter` 大于
`maxMissed`，他们将被 `SlashFractionDowntime` 削减，将被监禁
对于`DowntimeJailDuration`，并重置以下值:
`MissedBlocksBitArray`、`MissedBlocksCounter` 和 `IndexOffset`。

**注意**:活性斜线**不会**导致墓碑。

```go
height := block.Height

for vote in block.LastCommitInfo.Votes {
  signInfo := GetValidatorSigningInfo(vote.Validator.Address)

  // This is a relative index, so we counts blocks the validator SHOULD have
  // signed. We use the 0-value default signing info if not present, except for
  // start height.
  index := signInfo.IndexOffset % SignedBlocksWindow()
  signInfo.IndexOffset++

  // Update MissedBlocksBitArray and MissedBlocksCounter. The MissedBlocksCounter
  // just tracks the sum of MissedBlocksBitArray. That way we avoid needing to
  // read/write the whole array each time.
  missedPrevious := GetValidatorMissedBlockBitArray(vote.Validator.Address, index)
  missed := !signed

  switch {
  case !missedPrevious && missed:
    // array index has changed from not missed to missed, increment counter
    SetValidatorMissedBlockBitArray(vote.Validator.Address, index, true)
    signInfo.MissedBlocksCounter++

  case missedPrevious && !missed:
    // array index has changed from missed to not missed, decrement counter
    SetValidatorMissedBlockBitArray(vote.Validator.Address, index, false)
    signInfo.MissedBlocksCounter--

  default:
    // array index at this index has not changed; no need to update counter
  }

  if missed {
    // emit events...
  }

  minHeight := signInfo.StartHeight + SignedBlocksWindow()
  maxMissed := SignedBlocksWindow() - MinSignedPerWindow()

  // If we are past the minimum height and the validator has missed too many
  // jail and slash them.
  if height > minHeight && signInfo.MissedBlocksCounter > maxMissed {
    validator := ValidatorByConsAddr(vote.Validator.Address)

    // emit events...

    // We need to retrieve the stake distribution which signed the block, so we
    // subtract ValidatorUpdateDelay from the block height, and subtract an
    // additional 1 since this is the LastCommit.
    //
    // Note, that this CAN result in a negative "distributionHeight" up to
    // -ValidatorUpdateDelay-1, i.e. at the end of the pre-genesis block (none) = at the beginning of the genesis block.
    // That's fine since this is just used to filter unbonding delegations & redelegations.
    distributionHeight := height - sdk.ValidatorUpdateDelay - 1

    Slash(vote.Validator.Address, distributionHeight, vote.Validator.Power, SlashFractionDowntime())
    Jail(vote.Validator.Address)

    signInfo.JailedUntil = block.Time.Add(DowntimeJailDuration())

    // We need to reset the counter & array so that the validator won't be
    // immediately slashed for downtime upon rebonding.
    signInfo.MissedBlocksCounter = 0
    signInfo.IndexOffset = 0
    ClearValidatorMissedBlockBitArray(vote.Validator.Address)
  }

  SetValidatorSigningInfo(vote.Validator.Address, signInfo)
}
```

## Parameters

The subspace for the Slashing module is `slashing`.

```go
type Params struct {
	MaxEvidenceAge          time.Duration `json:"max_evidence_age" yaml:"max_evidence_age"`
	SignedBlocksWindow      int64         `json:"signed_blocks_window" yaml:"signed_blocks_window"`
	MinSignedPerWindow      sdk.Dec       `json:"min_signed_per_window" yaml:"min_signed_per_window"`
	DowntimeJailDuration    time.Duration `json:"downtime_jail_duration" yaml:"downtime_jail_duration"`
	SlashFractionDoubleSign sdk.Dec       `json:"slash_fraction_double_sign" yaml:"slash_fraction_double_sign"`
	SlashFractionDowntime   sdk.Dec       `json:"slash_fraction_downtime" yaml:"slash_fraction_downtime"`
}
```

### MaxEvidenceAge

- type: `time.Duration` (seconds)
- default: 2 minutes

### SignedBlocksWindow

- type: `int64`
- default: `100`

### MinSignedPerWindow

- type: `Dec`
- default: `5`

### DowntimeJailDuration

- type: `time.Duration` (seconds)
- default: 10 minutes

### SlashFractionDoubleSign

- type: `Dec`
- default: 1/20

### SlashFractionDowntime

- type: `Dec`
- default: 1/10000
