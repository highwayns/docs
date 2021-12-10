# 铸币

## 概念

### 铸币机制

铸造机制旨在:

- 允许由市场需求决定的灵活通胀率针对特定的保税股份比率
- 在市场流动性和抵押供应之间取得平衡

为了最好地确定通货膨胀奖励的适当市场利率，使用了移动变化率。移动变化率机制确保如果保税百分比高于或低于目标保税百分比，通货膨胀率将分别调整以进一步激励或不激励被保税。将 %-bonded 目标设置为低于 100% 鼓励网络维护一些非抵押代币，这应该有助于提供一些流动性。

它可以通过以下方式分解:

如果通胀率低于目标 %-bonded 通胀率将增加直到达到最大值
如果维持目标百分比（在 Cosmos-Hub 中为 67%），那么通货膨胀率将保持不变
如果通胀率高于目标 %-bonded 通胀率将下降，直到达到最小值

## 参数

Mint 模块的子空间是 `mint`。

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
