# 切る

Slashingモジュールを使用すると、Terraは罰(「スラッシュ」)を使用して、契約で認識されている危険なアクターの原因となる動作を抑制することができます。 Terraは、主に[`Staking`](spec-staking.md)モジュールを使用して、バリデーターの義務に違反するときにスラッシュを作成します(たとえば、為替レートのオラクルでは、過度の` VotePeriod`は省略されます)。 このモジュールは、二重署名など、Tendermintコンセンサスレベルでの低レベルのペナルティを処理します。

## メッセージタイプ 

### MsgUnjail

```go
type MsgUnjail struct {
    ValidatorAddr sdk.ValAddress `json:"address" yaml:"address"`//address of the validator operator
}
```

## トレード

### スターティングブロック

>このセクションは、Cosmos SDKの公式ドキュメントから抜粋したものであり、Slashingモジュールのパラメーターを誰もが理解しやすいようにここに配置されています。

各ブロックの開始時に、Slashingモジュールは、違反またはダウンタイムの証拠、および二重署名やその他の低レベルのコンセンサスペナルティについてベリファイアをチェックします。

#### 証拠処理

Tendermintブロックには、検証者が悪意のあるものをコミットしたことを示す証拠を含めることができます
行動。 関連情報は、ABCIの証拠としてアプリに転送されます
`abci.RequestBeginBlock`では、バリデーターはそれに応じて罰せられます。

`block`で送信された一部の` Evidence`が有効であるためには、以下を満たさなければなりません。

`Evidence.Timestamp >= block.Timestamp - MaxEvidenceAge`

ここで、 `Evidence.Timestamp`はブロック内の高さのタイムスタンプです
`Evidence.Height`と` block.Timestamp`は、現在のブロックのタイムスタンプです。

ブロックに有効な証拠が含まれている場合、検証者の資本は減少します
賭けに対するいくつかのペナルティ( `SlashFractionDoubleSign`はあいまいさのために使用されます)
違反が発生した時刻(証拠が発見された時刻ではありません)。 私たち
「賭けに集中」したい、つまり違反につながる賭け
再承認された場合やバインド解除が開始された場合でも、カットする必要があります。

まず、スラッシュからのバインド解除と再承認をトラバースする必要があります
バリデーターとそれ以降に移動された共有の数を追跡します。 

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

//only care if source gets slashed because we're already bonded to destination
//so if destination validator gets slashed our delegation just has same shares
//of smaller pool.
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

次に、バリデーターを切り取り、それらをトゥームストーンします。 

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

これにより、問題のある検証者は、Xエクイティを持つ単一の検証者として、またはXエクイティを持つN検証者として、同じ方法で罰せられることが保証されます。 単一のペナルティ期間中に発生するすべての二重署名違反のペナルティ額には上限があります。 詳細については、[トゥームストーンキャップ](https://docs.cosmos.network/master/modules/slashing/01_concepts.html#tombstone-caps)を参照してください。 

#### アクティビティ追跡

各ブロックの先頭で、各ブロックの「ValidatorSigningInfo」を更新します
バリデーターとそれらが活性しきい値を超えているかどうかを確認します
スライドウィンドウ。このスライディングウィンドウは、 `SignedBlocksWindow`と
このウィンドウのインデックスは、バリデーターの「IndexOffset」によって決定されます
`ベリファイアの署名情報`。処理されたブロックごとに、 `IndexOffset`が増加します
検証者が署名するかどうかに関係なく。指標が決定された後、
`MissedBlocksBitArray`と` MissedBlocksCounter`はそれに応じて更新されます。

最後に、バリデーターがアクティビティのしきい値を下回っているかどうかを判断するには、
欠落しているブロックの最大数 `maxMissed`を取得します。
`SignedBlocksWindow-(MinSignedPerWindow * SignedBlocksWindow)`と最小値
アクティビティの高さ `minHeight`を決定できます。現在のブロックが
は `minHeight`より大きく、バリデーターの` MissedBlocksCounter`はより大きい
`maxMissed`、それらは` SlashFractionDowntime`によってカットされ、投獄されます
`DowntimeJailDuration`の場合、次の値をリセットします。
`MissedBlocksBitArray`、` MissedBlocksCounter`、および `IndexOffset`。

**注**:アクティブなスラッシュ**は**トゥームストーンを引き起こしません**。 

```go
height := block.Height

for vote in block.LastCommitInfo.Votes {
  signInfo := GetValidatorSigningInfo(vote.Validator.Address)

 //This is a relative index, so we counts blocks the validator SHOULD have
 //signed. We use the 0-value default signing info if not present, except for
 //start height.
  index := signInfo.IndexOffset % SignedBlocksWindow()
  signInfo.IndexOffset++

 //Update MissedBlocksBitArray and MissedBlocksCounter. The MissedBlocksCounter
 //just tracks the sum of MissedBlocksBitArray. That way we avoid needing to
 //read/write the whole array each time.
  missedPrevious := GetValidatorMissedBlockBitArray(vote.Validator.Address, index)
  missed := !signed

  switch {
  case !missedPrevious && missed:
   //array index has changed from not missed to missed, increment counter
    SetValidatorMissedBlockBitArray(vote.Validator.Address, index, true)
    signInfo.MissedBlocksCounter++

  case missedPrevious && !missed:
   //array index has changed from missed to not missed, decrement counter
    SetValidatorMissedBlockBitArray(vote.Validator.Address, index, false)
    signInfo.MissedBlocksCounter--

  default:
   //array index at this index has not changed; no need to update counter
  }

  if missed {
   //emit events...
  }

  minHeight := signInfo.StartHeight + SignedBlocksWindow()
  maxMissed := SignedBlocksWindow() - MinSignedPerWindow()

 //If we are past the minimum height and the validator has missed too many
 //jail and slash them.
  if height > minHeight && signInfo.MissedBlocksCounter > maxMissed {
    validator := ValidatorByConsAddr(vote.Validator.Address)

   //emit events...

   //We need to retrieve the stake distribution which signed the block, so we
   //subtract ValidatorUpdateDelay from the block height, and subtract an
   //additional 1 since this is the LastCommit.
   //
   //Note, that this CAN result in a negative "distributionHeight" up to
   //-ValidatorUpdateDelay-1, i.e. at the end of the pre-genesis block (none) = at the beginning of the genesis block.
   //That's fine since this is just used to filter unbonding delegations & redelegations.
    distributionHeight := height - sdk.ValidatorUpdateDelay - 1

    Slash(vote.Validator.Address, distributionHeight, vote.Validator.Power, SlashFractionDowntime())
    Jail(vote.Validator.Address)

    signInfo.JailedUntil = block.Time.Add(DowntimeJailDuration())

   //We need to reset the counter & array so that the validator won't be
   //immediately slashed for downtime upon rebonding.
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
