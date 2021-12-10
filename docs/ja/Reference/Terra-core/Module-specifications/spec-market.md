# 市场

Market 模块支持不同 Terra 稳定币面额之间以及 Terra 和 Luna 之间的原子交换。 该模块确保协议资产之间的可用、流动性市场、稳定的价格和公平的汇率。

TerraSDR 的价格稳定是通过 Terra<>Luna 对协议算法做市商的套利活动实现的，该套利活动扩大和收缩 Terra 的供应以维持其挂钩。

## 概念

### 掉期费

由于 Terra 的价格馈送源自验证者预言机，因此链上报告的价格与实时价格之间存在延迟。

延迟持续大约一分钟（我们的预言机“VotePeriod”是 30 秒），这对于几乎所有实际交易都可以忽略不计。 但是，抢先攻击者可以利用这种延迟并从网络中提取价值。

为了抵御这种类型的攻击，市场模块强制执行以下掉期费用: 

- [**Tobin tax**](#tobintax) for spot-converting Terra<>Terra swaps

例如，假设当前 KRT 的托宾税为 0.35%，oracle 报告 Luna<>SDT 汇率为 10，Luna<>KRT 汇率为 10,000。交换 1 SDT 将返回 0.1 Luna，即 1,000 KRT。应用托宾税后，您将拥有 996.5 KRT（1,000 的 0.35% 为 3.5），这比任何零售货币兑换和汇款都要优惠[^1]。

[^1]:最初我们维持零费用掉期政策。然而，为了防止抢先攻击者利用汇率延迟并以牺牲用户利益为代价获利，我们实施了托宾税。有关更多信息，请参阅 [“关于掉期费:贪婪和明智”](https://medium.com/terra-money/on-swap-fees-the-greedy-and-the-wise-b967f0c8914e)。

- [**最小点差**](#minspread) 用于 Terra<>Luna 掉期

  最低点差为 0.5%。使用我们上面使用的相同汇率，交换 1 SDT 将返回价值 995 KRT 的 Luna（1000 的 0.5% 为 5，这作为交换费用）。如果您反转掉期，1 Luna 将返回 9.95 SDT（10 的 0.5% 为 0.05）或 9,950 KRT（10,000 的 0.5% = 50）。

### 做市算法

Terra 使用恒定乘积做市算法来确保 Terra<>Luna 掉期的流动性。 [^2]

[^2]:要更深入地了解我们更新的做市算法，请查看 [Nick Platias 的 SFBW 2019 演讲](https://agora.terra.money/t/terra-stability-swap-mechanism-deep -dive-at-sfbw/135）。

对于 Constant Product，我们定义了一个值 $CP$，该值设置为 Terra 池的大小乘以 Luna 的一组**法定值**，并确保我们的做市商通过调整点差在任何掉期期间保持不变。

::: 警告 注意:
我们对 Constant Product 的实现与 Uniswap 不同，因为我们使用 Luna 的法定价值而不是 Luna 池的大小。这种细微差别意味着 Luna 价格的变化不会影响产品，而是影响 Luna 池的大小。
:::

$$CP = Pool_{Terra} * Pool_{Luna} * (Price_{Luna}/Price_{SDR})$$

例如，我们将从相等的 Terra 和 Luna 池开始，两者的总价值为 1000 SDR。 Terra 矿池的大小为 1000 SDT，假设 Luna<>SDR 的价格为 0.5，则 Luna 矿池的大小为 2000 Luna。 用 100 SDT 交换 Luna 将返回价值约 90.91 SDR 的 Luna（≈ 181.82 Luna）。 100 SDT的offer加入Terra矿池，价值90.91 SDT的Luna从Luna矿池中取出。 

```
CP = 1000000 SDR
(1000 SDT) * (1000 SDR of Luna) = 1000000 SDR
(1100 SDT) * (909.0909... SDR of Luna) = 1000000 SDR
```

这是一个例子。 实际上，流动资金池要大得多，从而缩小了价差的幅度。

Constant-Product 的主要优势在于它提供了“无限”的流动性，并且可以提供任何规模的掉期服务。

### 虚拟流动资金池

市场开始时有两个大小相等的流动性池，一个代表 Terra 的所有面额，另一个代表 Luna。 参数 [`BasePool`](#basepool) 定义了 Terra 和 Luna 流动性池的初始大小 $Pool_{Base}$。

该信息不是跟踪两个池的大小，而是以数字 $\delta$ 编码，区块链将其存储为“TerraPoolDelta”。 这表示 Terra 池与其基本大小的偏差，单位为 µSDR。

Terra 和 Luna 流动性池的大小可以使用以下公式从 $\delta$ 生成:

$$Pool_{Terra} = Pool_{Base} + \delta$$
$$Pool_{Luna} = ({Pool_{Base}})^2 / Pool_{Terra}$$

在[每个区块的末尾](#end-block)，市场模块尝试通过降低 Terra 和 Luna 矿池之间的 $\delta$ 大小来补充矿池。将池补充到平衡的速率由参数 [`PoolRecoveryPeriod`](#poolrecoveryperiod) 设置。较低的周期意味着对交易的敏感性较低:以前的交易会更快地被遗忘，市场能够提供更多的流动性。

这种机制确保流动性并充当低通滤波器，允许点差费用（这是“TerraPoolDelta”的函数）在需求发生变化时回落，导致供应发生必要的变化，这需要吸收了。

### 交换程序

1. Market 模块接收 [`MsgSwap`](#msgswap) 消息并执行基本验证检查。

2. 使用[`k.ComputeSwap()`](#k-computeswap)计算汇率$ask$和$spread$。

3. 使用 [`k.ApplySwapToPool()`](#k-applyswaptopool) 更新 `TerraPoolDelta`。

4. 使用 `supply.SendCoinsFromAccountToModule()` 将 `OfferCoin` 从账户转移到模块。

5. 使用 `supply.BurnCoins()` 销毁提供的硬币。

6.让$fee = spread * ask$，这就是点差费用。

7. 使用 `supply.MintCoins()` 铸造 $ask - 费用 $ 硬币的 `AskDenom`。当 $fee$ 硬币被销毁时，这隐含地应用了点差费用。

8. 使用 `supply.SendCoinsFromModuleToAccount()` 将新铸造的硬币发送给交易者。

9. 发出`swap`事件来宣传掉期并记录点差费用。

如果交易者的“账户”余额不足以执行掉期，则掉期交易失败。

成功完成 Terra<>Luna 掉期后，将记入用户账户的部分代币作为点差费用被扣留。

### 铸币税

当 Luna 交换到 Terra 时，被协议重新捕获的 Luna 称为 seigniorage——发行新 Terra 产生的价值。每个时期结束时的总铸币税被计算并重新引入经济，作为汇率预言机的选票奖励和财政部模块的社区池，更完整地描述 [here](/ja/Reference/Terra-core/Module-spec/spec-treasury.html#k-settleseigniorage）。

::: 警告 注意:
从 Columbus-5 开始，所有铸币税都被烧毁，社区资金池不再被资助。掉期费被用作汇率预言机的投票奖励。
:::

## State

### Terra Pool Delta δ

- type: `sdk.Dec`

这表示当前 Terra 池大小与其原始基本大小之间的差异，以 µSDR 为单位。

## 消息类型

### 消息交换

“MsgSwap”交易表示“交易者”打算将他们的“OfferCoin”余额换成新的“AskDenom”。 这用于 Terra<>Terra 和 Terra<>Luna 交换。 

```go
// MsgSwap contains a swap request
type MsgSwap struct {
	Trader    sdk.AccAddress `json:"trader" yaml:"trader"`         // Address of the trader
	OfferCoin sdk.Coin       `json:"offer_coin" yaml:"offer_coin"` // Coin being offered
	AskDenom  string         `json:"ask_denom" yaml:"ask_denom"`   // Denom of the coin to swap to
}
```

### MsgSwapSend

A `MsgSendSwap` first performs a swap of `OfferCoin` into `AskDenom` and then sends the resulting coins to `ToAddress`. Tax is charged normally, as if the sender were issuing a `MsgSend` with the resulting coins of the swap.

```go
type MsgSwapSend struct {
	FromAddress sdk.AccAddress `json:"from_address" yaml:"from_address"` // Address of the offer coin payer
	ToAddress   sdk.AccAddress `json:"to_address" yaml:"to_address"`     // Address of the recipient
	OfferCoin   sdk.Coin       `json:"offer_coin" yaml:"offer_coin"`     // Coin being offered
	AskDenom    string         `json:"ask_denom" yaml:"ask_denom"`       // Denom of the coin to swap to
}
```

## Functions

### `k.ComputeSwap()`

```go
func (k Keeper) ComputeSwap(ctx sdk.Context, offerCoin sdk.Coin, askDenom string)
    (retDecCoin sdk.DecCoin, spread sdk.Dec, err sdk.Error)
```

此函数从报价中检测掉期类型并询问面额并返回:

1. 给定的“offerCoin”应该返回的被询问的硬币数量。 这是通过首先将“offerCoin”现货转换为 µSDR，然后使用 Oracle 报告的适当汇率从 µSDR 转换为所需的“askDenom”来实现的。

2. 给定掉期类型应作为掉期费的点差百分比。 Terra<>Terra 掉期只有托宾税点差费。 Terra<>Luna 掉期使用`MinSpread` 或恒定产品定价点差，以较大者为准。

如果 `offerCoin` 的面额与 `askDenom` 相同，这将引发 `ErrRecursiveSwap`。

::: 警告 注意:
`k.ComputeSwap()` 在内部使用了 `k.ComputeInternalSwap()`，它只包含计算适当的要交换的要币的逻辑，而不是常量产品点差。
:::

### `k.ApplySwapToPool()`

```go
func (k Keeper) ApplySwapToPool(ctx sdk.Context, offerCoin sdk.Coin, askCoin sdk.DecCoin) sdk.Error
```

`k.ApplySwapToPools()` 在交换期间被调用以更新区块链的 $\delta$ 度量，`TerraPoolDelta`，当 Terra 和 Luna 流动性池的余额发生变化时。

所有 Terra 稳定币共享相同的流动性池，因此在 Terra<>Terra 掉期期间，“TerraPoolDelta”保持不变。

对于 Terra<>Luna 交换，交换后池的相对大小会有所不同，$\delta$ 将使用以下公式更新:

- 对于 Terra 到 Luna，$\delta' = \delta + Offer_{\mu SDR}$
- 对于 Luna 到 Terra，$\delta' = \delta - Ask_{\mu SDR}$

## 交易

### 结束块

Market 模块在每个块的末尾调用 `k.ReplenishPools()`，这会根据 `PoolRecoveryPeriod` $pr$ 减少 `TerraPoolDelta`（Terra 和 Luna 池之间的差异）的值。

这允许网络在价格剧烈波动期间大幅增加点差费用。一段时间后，价差会自动恢复到长期价格变化的正常水平。

## 参数

Market 模块的子空间是“market”。

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

Terra & Luna 矿池通过自动池补充自然“重置”到平衡（$\delta \to 0$）所需的块数。 

### BasePool

- type: `Dec`
- default: 250,000 SDR (= 250,000,000,000 µSDR)

Terra 和 Luna 流动性池的初始起始大小。

### MinSpread

- type: `Dec`
- default: 0.5%

对 Terra<>Luna 收取的最低点差交换，以防止因抢先攻击而泄漏价值。

### TobinTax

- type: `Dec`
- default: 0.35%

在 Terra 货币之间交换的额外费用（现货交易）。 汇率不同，取决于面额。 例如，虽然大多数面额的税率为 0.35%，但 MNT 的税率为 2%。 要查看费率，请[查询预言机](/ja/Reference/terrad/subcommands.html#query-oracle-tobin-taxes)。
