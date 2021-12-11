# 証拠

:::警告メモ
Terraの証拠モジュールは、Cosmos SDKの[`evidence`](https://docs.cosmos.network/master/modules/evidence/)モジュールから継承されます。このドキュメントはスタブであり、主にその使用方法に関する重要なTerra固有の手順をカバーしています。
:::

証拠モジュールを使用すると、あいまいさや反事実的署名など、不正行為の任意の証拠を提出および処理できます。

一般に、標準の証拠処理では、基盤となるコンセンサスエンジンであるTendermintが発見されたときに自動的に証拠を送信し、顧客と外部チェーンがより複雑な証拠を直接送信できるようにすることを期待しています。証拠モジュールの動作は異なります。

すべての特定のエビデンスタイプは、「エビデンス」インターフェースコントラクトを実装する必要があります。まず、送信された「エビデンス」は、エビデンスモジュールの「ルーター」を経由してルーティングされます。ルーターは、特定のタイプの「エビデンス」に対応する登録済みの「ハンドラー」を見つけようとします。各 `Evidence`タイプには、正常にルーティングおよび実行されるために、証拠モジュールのキーパーに登録された` Handler`が必要です。

対応する各ハンドラーは、 `Handler`インターフェースコントラクトも満たす必要があります。特定の「証拠」タイプの「処理プログラム」は、削減、投獄、およびトゥームストーニングなどの任意の状態遷移を実行できます。

## 概念

### 証拠

モジュールに提出される特定の種類の証拠は、次の「証拠」契約を満たさなければなりません。すべての特定の種類の証拠が同じ方法でこの契約を実行するわけではなく、特定のデータは特定の種類の証拠とは完全に無関係である可能性があります。追加の「ValidatorEvidence」も作成されました。これは「Evidence」を拡張して、悪意のあるバリデーターに対する証拠契約を定義します。

```
//Evidence defines the contract which concrete evidence types of misbehavior
//must implement.
type Evidence interface {
	proto.Message

	Route() string
	Type() string
	String() string
	Hash() tmbytes.HexBytes
	ValidateBasic() error

	//Height at which the infraction occurred
	GetHeight() int64
}

//ValidatorEvidence extends Evidence interface to define contract
//for evidence against malicious validators
type ValidatorEvidence interface {
	Evidence

	//The consensus address of the malicious validator at time of infraction
	GetConsensusAddress() sdk.ConsAddress

	//The total power of the malicious validator at time of infraction
	GetValidatorPower() int64

	//The total validator set power at time of infraction
	GetTotalPower() int64
}
```

### 登録と処理

まず、証拠モジュールは、処理することが期待されるすべての種類の証拠を知っている必要があります。 `Router`を使用して、次のように定義されている` Evidence`コントラクトに `Route`メソッドを登録します。 `Router`は` Evidence`を受け入れ、 `Route`メソッドを介して` Evidence`に対応する `Handler`を見つけようとします。 

```
type Router interface {
  AddRoute(r string, h Handler) Router
  HasRoute(r string) bool
  GetRoute(path string) Handler
  Seal()
  Sealed() bool
}
```

以下に定義するように、 `Handler`は、` Evidence`を処理するビジネスロジック全体を実行する責任があります。 これを行うには、通常、証拠の検証、「ValidateBasic」によるステートレスチェック、および「ハンドラー」に提供されたホルダーによるステートフルチェックが含まれます。 さらに、 `Handler`は、バリデーターの切り取りや投獄など、いくつかの機能を実行することもできます。 `Handler`によって処理されるすべての` Evidence`は永続化される必要があります。 
```
//処理手順は、不明な証拠処理手順を定義します。 マネージャーが責任を負います
//検証を実行するために必要なすべての対応するビジネスロジック
//証拠は有効です。 さらに、ハンドラーは必要なものを実行できます
//削減と潜在的な投獄。 
type Handler func(sdk.Context, Evidence) error
```

### 状態

エビデンスモジュールは、有効に送信された「エビデンス」のステータスのみを保存します。 エビデンス状態は、エビデンスモジュールの「GenesisState」にも保存およびエクスポートされます。 

```
//GenesisStateは、証拠モジュールの生成状態を定義します。 
message GenesisState {
 //evidence defines all the evidence at genesis.
  repeated google.protobuf.Any evidence = 1;
}
```

## メッセージ

### MsgSubmitEvidence

証拠は「MsgSubmitEvidence」メッセージを通じて提出されました。 

```
//MsgSubmitEvidenceは、送信されたメッセージのサポートを示します
//あいまいな署名や事実に反する署名など、不正行為の証拠。 
message MsgSubmitEvidence {
  string              submitter = 1;
  google.protobuf.Any evidence  = 2;
}
```

`MsgSubmitEvidence`メッセージの` Evidence`は、正しく処理およびルーティングされるために、証拠モジュールの `Router`に登録された対応する` Handler`を持っている必要があります。

`Evidence`は対応する` Handler`に登録されているため、その処理は次のようになります。 

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

同じタイプの有効な提出された「証拠」があってはなりません。 `Evidence`は` Handler`にルーティングされ、実行されます。 証拠の処理中にエラーが発生しなかった場合、イベントが発行され、状態として永続化されます。

###イベント

エビデンスモジュールは、次のハンドライベントを発行します。

#### MsgSubmitEvidence

| Type            | Attribute Key | Attribute Value |
| --------------- | ------------- | --------------- |
| submit_evidence | evidence_hash | {evidenceHash}  |
| message         | module        | evidence        |
| message         | sender        | {senderAddress} |
| message         | action        | submit_evidence |

### BeginBlock

#### 証拠処理

テンダーミントブロックには次のものが含まれます
[証拠](https://github.com/tendermint/tendermint/blob/master/docs/spec/blockchain/blockchain.md#evidence)検証者が悪意のある動作をしているかどうかを示します。 関連情報は、ABCIの証拠としてabci.RequestBeginBlockでアプリケーションに転送されるため、バリデーターはそれに応じて罰せられます。

#### あいまいさ

現在、SDKはABCI`BeginBlock`で2種類の証拠を処理します。

-`DuplicateVoteEvidence`、
-`LightClientAttackEvidence`。

エビデンスモジュールは、これら2つのタイプのエビデンスを同じ方法で処理します。 まず、SDKは、特定のタイプとして「Equivocation」を使用して、Tendermintの特定のエビデンスタイプをSDKの「エビデンス」インターフェイスに変換します。 

```proto
//Equivocation implements the Evidence interface.
message Equivocation {
  int64                     height            = 1;
  google.protobuf.Timestamp time              = 2;
  int64                     power             = 3;
  string                    consensus_address = 4;
}
```

ブロックで送信されたEquivocationが有効であるためには、次の要件を満たしている必要があります。 
`Evidence.Timestamp >= block.Timestamp - MaxEvidenceAge`

where:

- `Evidence.Timestamp` is the timestamp in the block at height `Evidence.Height`.
- `block.Timestamp` is the current block timestamp.

ブロックに有効な「Equivocation」証拠が含まれている場合、検証者の公平性は
[slashing module](spec-slashing.md)で定義される `SlashFractionDoubleSign`を削減しました。 削減は、証拠が発見されたときではなく、違反が発生したときに実装されます。
再承認された場合やバインドが解除され始めた場合でも、違反の原因となったシェアは減少します。

さらに、検証者は永久に投獄され、墓石に入れられるため、検証者は検証者セットに再び入ることはできません。

:::詳細 `Equivocation`証拠処理コード 

```go
func (k Keeper) HandleEquivocationEvidence(ctx sdk.Context, evidence *types.Equivocation) {
	logger := k.Logger(ctx)
	consAddr := evidence.GetConsensusAddress()

	if _, err := k.slashingKeeper.GetPubkey(ctx, consAddr.Bytes()); err != nil {
		//Ignore evidence that cannot be handled.
		//
		//NOTE: We used to panic with:
		//`panic(fmt.Sprintf("Validator consensus-address %v not found", consAddr))`,
		//but this couples the expectations of the app to both Tendermint and
		//the simulator.  Both are expected to provide the full range of
		//allowable but none of the disallowed evidence types.  Instead of
		//getting this coordination right, it is easier to relax the
		//constraints and ignore evidence that cannot be handled.
		return
	}

	//calculate the age of the evidence
	infractionHeight := evidence.GetHeight()
	infractionTime := evidence.GetTime()
	ageDuration := ctx.BlockHeader().Time.Sub(infractionTime)
	ageBlocks := ctx.BlockHeader().Height - infractionHeight

	//Reject evidence if the double-sign is too old. Evidence is considered stale
	//if the difference in time and number of blocks is greater than the allowed
	//parameters defined.
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
		//Defensive: Simulation doesn't take unbonding periods into account, and
		//Tendermint might break this assumption at some point.
		return
	}

	if ok := k.slashingKeeper.HasValidatorSigningInfo(ctx, consAddr); !ok {
		panic(fmt.Sprintf("expected signing info for validator %s but not found", consAddr))
	}

	//ignore if the validator is already tombstoned
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

	//We need to retrieve the stake distribution which signed the block, so we
	//subtract ValidatorUpdateDelay from the evidence height.
	//Note, that this *can* result in a negative "distributionHeight", up to
	//-ValidatorUpdateDelay, i.e. at the end of the
	//pre-genesis block (none) = at the beginning of the genesis block.
	//That's fine since this is just used to filter unbonding delegations & redelegations.
	distributionHeight := infractionHeight - sdk.ValidatorUpdateDelay

	//Slash validator. The `power` is the int64 power of the validator as provided
	//to/by Tendermint. This value is validator.Tokens as sent to Tendermint via
	//ABCI, and now received as evidence. The fraction is passed in to separately
	//to slash unbonding and rebonding delegations.
	k.slashingKeeper.Slash(
		ctx,
		consAddr,
		k.slashingKeeper.SlashFractionDoubleSign(ctx),
		evidence.GetValidatorPower(), distributionHeight,
	)

	//Jail the validator if not already jailed. This will begin unbonding the
	//validator if not already unbonding (tombstoned).
	if !validator.IsJailed() {
		k.slashingKeeper.Jail(ctx, consAddr)
	}

	k.slashingKeeper.JailUntil(ctx, consAddr, types.DoubleSignJailEndTime)
	k.slashingKeeper.Tombstone(ctx, consAddr)
}
```
:::

スラッシュ、ジェイル、およびトゥームストーニングの呼び出しは、情報イベントを発行し、最終的にステーキングモジュールに呼び出しを委任するスラッシュモジュールを介して委任されます。 ステーキングと投獄の詳細については、[transitions](spec-staking.md#transitions)を参照してください。 