# ミンティング

## 概念

### ミンティングメカニズム

キャストメカニズムの目的は次のとおりです。

-市場の需要によって決定される柔軟なインフレ率が特定の債券シェア比率をターゲットにすることを可能にする
-市場の流動性と住宅ローンの供給のバランスをとる

インフレ報酬の適切な市場金利を最適に決定するために、変動金利が使用されます。 移動変化率メカニズムにより、結合率が目標結合率よりも高いまたは低い場合、インフレ率が個別に調整され、結合がさらに促進されるか、または促進されないことが保証されます。 ％-bondedターゲットを100％未満に設定すると、ネットワークが無担保トークンを維持するようになり、流動性を提供するのに役立ちます。

次のように分類できます。

インフレ率が目標の％-bondedよりも低い場合、インフレ率は最大値に達するまで増加します
目標パーセンテージが維持されている場合(コスモスハブでは67％)、インフレ率は変化しません。
インフレ率が目標の％結合インフレ率よりも高い場合、最小値に達するまで低下します

## パラメーター

Mintモジュールの部分空間は `mint`です。 

```go
type Params struct {
	// type of coin to mint
	MintDenom string `protobuf:"bytes,1,opt,name=mint_denom,json=mintDenom,proto3" json:"mint_denom,omitempty"`
	// maximum annual change in inflation rate
	InflationRateChange github_com_cosmos_cosmos_sdk_types.Dec `protobuf:"bytes,2,opt,name=inflation_rate_change,json=inflationRateChange,proto3,customtype=github.com/cosmos/cosmos-sdk/types.Dec" json:"inflation_rate_change" yaml:"inflation_rate_change"`
	// maximum inflation rate
	InflationMax github_com_cosmos_cosmos_sdk_types.Dec `protobuf:"bytes,3,opt,name=inflation_max,json=inflationMax,proto3,customtype=github.com/cosmos/cosmos-sdk/types.Dec" json:"inflation_max" yaml:"inflation_max"`
	// minimum inflation rate
	InflationMin github_com_cosmos_cosmos_sdk_types.Dec `protobuf:"bytes,4,opt,name=inflation_min,json=inflationMin,proto3,customtype=github.com/cosmos/cosmos-sdk/types.Dec" json:"inflation_min" yaml:"inflation_min"`
	// goal of percent bonded atoms
	GoalBonded github_com_cosmos_cosmos_sdk_types.Dec `protobuf:"bytes,5,opt,name=goal_bonded,json=goalBonded,proto3,customtype=github.com/cosmos/cosmos-sdk/types.Dec" json:"goal_bonded" yaml:"goal_bonded"`
	// expected blocks per year
	BlocksPerYear uint64 `protobuf:"varint,6,opt,name=blocks_per_year,json=blocksPerYear,proto3" json:"blocks_per_year,omitempty" yaml:"blocks_per_year"`
}
```

### MintDenom

- type: `string`

### InflationRateChange

- type: `sdk.Dec`

### InflationMax

- type: `sdk.Dec`

### InflationMin

- type: `sdk.Dec`

### GoalBonded

- type: `sdk.Dec`

### BlocksPerYear

- type: `uint64`
