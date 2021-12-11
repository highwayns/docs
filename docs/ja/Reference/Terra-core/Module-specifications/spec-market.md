# 市場

Marketモジュールは、異なるTerra安定通貨単位間およびTerraとLuna間の原子交換をサポートします。このモジュールは、合意された資産間の可用性、市場の流動性、安定した価格、および公正な為替レートを保証します。

TerraSDRの価格安定性は、合意アルゴリズムのマーケットメーカーに対するTerra <> Lunaの裁定取引を通じて達成されます。この裁定取引は、Terraの供給を拡大および縮小してペグを維持します。

## 概念

### スワップ手数料

Terraの価格フィードはバリデーターのオラクルから派生しているため、チェーンで報告された価格とリアルタイムの価格の間には遅延があります。

遅延は約1分続きます（オラクルの「VotePeriod」は30秒です）。これは、ほとんどすべての実際のトランザクションでは無視できます。ただし、先制攻撃者はこの遅延を利用して、ネットワークから価値を引き出すことができます。

このタイプの攻撃から防御するために、マーケットモジュールは次のスワップ手数料を適用します。

-[**トービン税**]（#tobintax）スポット変換Terra <> Terraスワップ

たとえば、KRTの現在のトービン税が0.35％であり、オラクルがLuna <> SDTの為替レートが10であり、Luna <> KRTの為替レートが10,​​000であると報告したとします。 Exchange 1 SDTは、1,000KRTである0.1ルナを返します。トービン税を適用すると、996.5 KRT（1,000の0.35％は3.5）になります。これは、どの小売外貨両替や送金よりも安価です[^ 1]。

[^ 1]:当初は無料のスワップポリシーを維持していました。ただし、先制攻撃者が為替レートの遅延を利用してユーザーを犠牲にして利益を得るのを防ぐために、トービン税を導入しました。詳細については、[「スワップ手数料について:貪欲で賢明な」]（https://medium.com/terra-money/on-swap-fees-the-greedy-and-the-wise-b967f0c8914e）を参照してください。

-テラ<>ルナスワップの[**最小スプレッド**]（#minspread）

  最小スプレッドは0.5％です。上記で使用したのと同じ為替レートを使用して、1つのSDTを交換すると、995 KRT相当のルナが返されます（1000の0.5％は5であり、これは交換手数料です）。スワップを逆にすると、1ルナは9.95 SDT（10の0.5％は0.05）または9,950 KRT（10,000の0.5％= 50）を返します。

### マーケットメイクアルゴリズム

Terraは、一定の製品マーケットメイクアルゴリズムを使用して、Terra <> Lunaスワップの流動性を確保しています。 [^ 2]

[^ 2]:更新されたマーケットメイクアルゴリズムの詳細については、[NickPlatiasのSFBW2019スピーチ]（https://agora.terra.money/t/terra-stability-swap-mechanism-deep-）を確認してください。 dive-at-sfbw/135）。

コンスタントプロダクトの場合、値$ CP $を定義します。これは、TerraプールのサイズにLunaの**法的値**のセットを掛けたものに設定され、マーケットメーカーがスワップ期間中にそれを維持するように調整します。スプレッド定数。

:::警告注:
Constant Productの実装は、Lunaプールのサイズではなく、Lunaの法定値を使用するため、Uniswapとは異なります。このニュアンスは、ルナの価格の変更が製品に影響を与えるのではなく、ルナのプールのサイズに影響を与えることを意味します。
:::

$$ CP = Pool_ {Terra} * Pool_ {Luna} *（Price_ {Luna}/Price_ {SDR}）$$

たとえば、合計値が1000SDRの等しいTerraプールとLunaプールから始めます。 Terraマイニングプールのサイズは1000SDTです。Luna<> SDRの価格を0.5とすると、Lunaマイニングプールのサイズは2000Lunaです。 100 SDTをLunaに交換すると、約90.91 SDR（≈181.82Luna）に相当するLunaが返されます。 100 SDTのオファーがTerraマイニングプールに追加され、90.91SDTに相当するLunaがLunaマイニングプールから撤回されました。  

```
CP = 1000000 SDR
(1000 SDT) * (1000 SDR of Luna) = 1000000 SDR
(1100 SDT) * (909.0909... SDR of Luna) = 1000000 SDR
```

这是一个例子。 实际上，流动资金池要大得多，从而缩小了价差的幅度。

Constant-Product 的主要优势在于它提供了“无限”的流动性，并且可以提供任何规模的掉期服务。

### 仮想流動性プール

市場の初めには、同じサイズの2つの流動性プールがありました。1つはテラのすべての宗派を表し、もう1つはルナを表します。 パラメータ[`BasePool`]（#basepool）は、TerraおよびLuna流動性プール$ Pool_ {Base} $の初期サイズを定義します。

この情報は2つのプールのサイズを追跡しませんが、番号$ \ delta $でエンコードされ、ブロックチェーンはそれを「TerraPoolDelta」として格納します。 これは、Terraプールの基本サイズからの偏差をµSDRで表したものです。

TerraおよびLunaの流動性プールのサイズは、次の式を使用して$ \ delta $から生成できます。 

$$Pool_{Terra} = Pool_{Base} + \delta$$
$$Pool_{Luna} = ({Pool_{Base}})^2/Pool_{Terra}$$

[各ブロックの終わり]（#end-block）で、マーケットモジュールは、TerraマイニングプールとLunaマイニングプールの間の$ \ delta $のサイズを縮小することにより、マイニングプールを補充しようとします。バランスを取るためにプールを補充する速度は、パラメーター[`PoolRecoveryPeriod`]（#poolrecoveryperiod）によって設定されます。サイクルが低いということは、取引に対する感度が低いことを意味します。以前の取引はより早く忘れられ、市場はより多くの流動性を提供できます。

このメカニズムは流動性を確保し、ローパスフィルターとして機能し、需要の変化に応じてスプレッドコスト（「TerraPoolDelta」の機能）を下げ、必要な供給の変化を吸収する必要があります。

### 交換プログラム

1. Marketモジュールは、[`MsgSwap`]（#msgswap）メッセージを受信し、基本的な検証チェックを実行します。

2. [`k.ComputeSwap（）`]（#k-computeswap）を使用して、為替レート$ ask $と$ spread $を計算します。

3. [`k.ApplySwapToPool（）`]（#k-applyswaptopool）を使用して、 `TerraPoolDelta`を更新します。

4. `supply.SendCoinsFromAccountToModule（）`を使用して、 `OfferCoin`をアカウントからモジュールに転送します。

5. `supply.BurnCoins（）`を使用して、提供されたコインを破棄します。

6. $ fee =スプレッド* ask $とします。これは、スプレッド料金です。

7. `supply.MintCoins（）`を使用して、コスト$コインの$ ask-`AskDenom`を作成します。 $ fee $コインが破棄されると、これは暗黙的にスプレッド料金を適用します。

8. `supply.SendCoinsFromModuleToAccount（）`を使用して、新しく鋳造されたコインをトレーダーに送信します。

9. 「スワップ」イベントを発行して、スワップを促進し、スプレッドコストを記録します。

トレーダーの「口座」残高がスワップを実行するのに不十分である場合、スワップトランザクションは失敗します。

Terra <> Lunaスワップが正常に完了すると、ユーザーのアカウントにクレジットされたトークンの一部がスプレッド料金として差し引かれます。

### シニョリッジ

ルナがテラに交換されるとき、合意によって取り戻されたルナは、シニョリッジと呼ばれます。これは、新しいテラの発行によって生成される価値です。各期間の終わりの総シニョリッジ税が計算され、為替レートのオラクルと財務省モジュールのコミュニティプールの投票報酬として経済に再導入されます。詳細については[こちら]（/ja/Reference/Terra -core/Module- spec/spec-treasury.html#k-settleseigniorage）。

:::警告注:
Columbus-5以降、すべてのシニョリッジが燃やされ、コミュニティの資金プールには資金が提供されなくなりました。スワップ手数料は、為替レートオラクルの投票報酬として使用されます。 
:::

## State

### Terra Pool Delta δ

- type: `sdk.Dec`

これは、現在のTerraプールサイズと元の基本サイズの差をµSDRで表したものです。

## メッセージタイプ

### メッセージ交換

「MsgSwap」トランザクションは、「トレーダー」が「OfferCoin」の残高を新しい「AskDenom」と交換することを意図していることを示します。 これは、Terra <> TerraとTerra <> Lunaの交換に使用されます。  

```go
//MsgSwap contains a swap request
type MsgSwap struct {
	Trader    sdk.AccAddress `json:"trader" yaml:"trader"`        //Address of the trader
	OfferCoin sdk.Coin       `json:"offer_coin" yaml:"offer_coin"`//Coin being offered
	AskDenom  string         `json:"ask_denom" yaml:"ask_denom"`  //Denom of the coin to swap to
}
```

### MsgSwapSend

A `MsgSendSwap` first performs a swap of `OfferCoin` into `AskDenom` and then sends the resulting coins to `ToAddress`. Tax is charged normally, as if the sender were issuing a `MsgSend` with the resulting coins of the swap.

```go
type MsgSwapSend struct {
	FromAddress sdk.AccAddress `json:"from_address" yaml:"from_address"`//Address of the offer coin payer
	ToAddress   sdk.AccAddress `json:"to_address" yaml:"to_address"`    //Address of the recipient
	OfferCoin   sdk.Coin       `json:"offer_coin" yaml:"offer_coin"`    //Coin being offered
	AskDenom    string         `json:"ask_denom" yaml:"ask_denom"`      //Denom of the coin to swap to
}
```

## Functions

### `k.ComputeSwap()`

```go
func (k Keeper) ComputeSwap(ctx sdk.Context, offerCoin sdk.Coin, askDenom string)
    (retDecCoin sdk.DecCoin, spread sdk.Dec, err sdk.Error)
```

この関数は、見積もりからスワップタイプを検出し、金額を要求して次を返します。

1.特定の「offerCoin」に対して返される必要がある照会されたコインの数。 これは、最初に「offerCoin」スポットをµSDRに変換し、次にOracleによって報告された適切な為替レートを使用してµSDRから必要な「askDenom」に変換することによって実現されます。

2.所定のスワップタイプは、スワップ手数料のスプレッドのパーセンテージとして使用する必要があります。 Terra <> Terraスワップには、トービン税スプレッドのみがあります。 Terra <> Lunaスワップは、 `MinSpread`または一定の商品価格スプレッドのいずれか大きい方を使用します。

`offerCoin`の額面金額が` askDenom`の額面金額と同じである場合、これは `ErrRecursiveSwap`をトリガーします。

:::警告注:
`k.ComputeSwap（）`は内部で `k.ComputeInternalSwap（）`を使用します。これには、交換される適切な通貨を計算するロジックのみが含まれ、一定の商品スプレッドは含まれません。
::: 
### `k.ApplySwapToPool()`

```go
func (k Keeper) ApplySwapToPool(ctx sdk.Context, offerCoin sdk.Coin, askCoin sdk.DecCoin) sdk.Error
```

交換中に `k.ApplySwapToPools（）`が呼び出され、TerraとLunaの流動性プールのバランスが変更されたときに、ブロックチェーンの$ \ delta $メトリック `TerraPoolDelta`が更新されます。

すべてのTerraステーブルコインは同じ流動性プールを共有するため、Terra <> Terraスワップ中、「TerraPoolDelta」は変更されません。

Terra <> Luna交換の場合、交換後のプールの相対サイズは異なり、$ \ delta $は次の式を使用して更新されます。

-TerraからLunaの場合、$ \ delta '= \ delta + Offer _ {\ mu SDR} $
-LunaからTerraの場合、$ \ delta '= \ delta-Ask _ {\ mu SDR} $

## 取引

### エンドブロック

Marketモジュールは、各ブロックの最後で `k.ReplenishPools（）`を呼び出します。これにより、 `PoolRecoveryPeriod` $ pr $に従って、` TerraPoolDelta`（TerraプールとLunaプールの違い）の値が減少します。

これにより、ネットワークは、価格が大幅に変動する期間中にスプレッド料金を大幅に引き上げることができます。 一定期間後、スプレッドは自動的に通常の長期価格変動レベルに戻ります。

## パラメーター

Marketモジュールのサブスペースは「market」です。

```go
type Params struct {
	PoolRecoveryPeriod int64   `json:"pool_recovery_period" yaml:"pool_recovery_period"`
	BasePool           sdk.Dec `json:"base_pool" yaml:"base_pool"`
	MinSpread          sdk.Dec `json:"min_spread" yaml:"min_spread"`
	TobinTax           sdk.Dec `json:"tobin_tax" yaml:"tobin_tax"`
}
```

### PoolRecoveryPeriod

- type: `int64`
- default: `BlocksPerDay`

Terra＆Lunaマイニングプールは、自動プールを介してバランスをとる（$ \ delta \ to 0 $）自然な「リセット」に必要なブロック数を補充します。 

### BasePool

- type: `Dec`
- default: 250,000 SDR (= 250,000,000,000 µSDR)

TerraおよびLuna流動性プールの初期開始サイズ。

### MinSpread

- type: `Dec`
- default: 0.5%

先制攻撃による価値の漏洩を防ぐためにTerra <> Lunaに請求される最低のスプレッド交換。 

### TobinTax

- type: `Dec`
- default: 0.35%

Terra通貨間の交換（スポット取引）の追加料金。 為替レートは金種によって異なります。 たとえば、ほとんどの金種の税率は0.35％ですが、MNTの税率は2％です。 料金を確認するには、[query oracle]（/ja/Reference/terrad/subcommands.html#query-oracle-tobin-taxes）を実行してください。 
