# 开发者指南

本文档包含提示和指南，可帮助您了解 Terra 的工作原理并有效导航 Terra Core 的代码库，Terra 节点软件的官方 Golang 参考实现。

::: 提示建议
Terra Core 是使用 [Cosmos SDK](https://cosmos.network/sdk) 构建的，它提供了一个强大的框架来构建运行在 [Tendermint](https://tendermint.com/) 共识协议之上的区块链.

强烈建议您在深入研究 Terra 开发人员文档之前查看这些项目，因为它们假定您熟悉 ABCI、验证器、Keepers、消息处理程序等概念。
:::

## 如何使用文档

作为开发人员，您可能会发现 **模块规范** 部分提供的信息最多。每个规范都从系统架构中模块主要功能的简短描述开始，以及它如何有助于实现 Terra 的功能。

除了介绍之外，每个模块都会对其主要流程和算法进行更详细的描述，以及您可能需要了解的任何概念。建议您从这里开始理解一个模块，因为它通常与规范中更深层次的更具体部分交叉引用，例如可能感兴趣的特定状态变量、消息处理程序和函数。

当前的函数文档不是详尽的参考，而是编写为那些需要直接使用 Terra Core 代码库或理解它的人的参考伴侣。已经涵盖了每个模块中的重要功能，为了经济起见，省略了许多琐碎的功能（例如 getter 和 setter）。其他可以找到模块逻辑的地方是消息处理程序或块转换（begin-blocker 和 end-blocker）。

最后，规范列出了各种模块参数及其默认值，并简要说明了它们的用途，以及模块发出的相关事件/标签和错误。

## 模块架构

节点软件被组织成以下单独的模块，这些模块实现了 Terra 协议的不同部分。它们按照它们在创世期间初始化的顺序列出：

1. `genaccounts` - 导入和导出创世账户
2. [`distribution`](./Module-specifications/spec-distribution.md)：在验证者和委托者之间分配奖励
   - 税收和奖励分配
   - 社区游泳池
3. [`staking`](./Module-specifications/spec-staking.md)：验证者和Luna
4. [`auth`](./Module-specifications/spec-auth.md): ante 处理程序
   - 归属账户
   - 稳定层费用
5. [`bank`](./Module-specifications/spec-bank.md) - 从账户到账户发送资金
6. [`slashing`](./Module-specifications/spec-slashing.md) - 低级 Tendermint slashing（双重签名等）
7. [`oracle`](./Module-specifications/spec-oracle.md) - 汇率饲料oracle
   - 计票加权中位数
   - 投票奖励
   - 削减行为不端的神谕
8. [`treasury`](./Module-specifications/spec-treasury.md)：矿工激励稳定
   - 宏观经济监测
   - 货币政策杠杆（税率、奖励权重）
   - 铸币税结算：从哥伦布 5 号开始，所有铸币税都被烧毁
9. [`gov`](./Module-specifications/spec-governance.md)：链上治理
    - 提案
    - 参数更新
10. [`market`](./Module-specifications/spec-market.md)：价格稳定
    - Terra<>Terra 现货转换，托宾税
    - Terra<>Luna 做市商，恒定产品点差
11. `crisis` - 报告共识失败状态，并提供停止链的证据
12. `genutil` - 处理 `gentx` 命令
    - 过滤和处理 `MsgCreateValidator` 消息

###继承的模块

Terra Core 中的许多模块都继承自 Cosmos SDK，并通过在创世参数中进行自定义或通过使用附加代码增强其功能来配置为与 Terra 一起使用。

## 块生命周期

在每个块转换期间执行以下过程：

### 开始块

1. 分布

   - 为前一个区块分配奖励

2. 削减
   - 检查违规证据或验证器的停机时间以进行双重签名和停机处罚。

### 处理消息

3. 消息被路由到负责处理它们的模块，然后由适当的消息处理程序处理。

### 结束块

4. 危机

   - 检查所有已注册的不变量并断言它们仍然为真

5. 预言机

   - 如果在`VotePeriod`结束，运行[投票程序](/ja/Module-specifications/spec-oracle.md#voting-procedure)并**更新Luna Exchange Rate**。
   - 如果在 `SlashWindow` 的末尾，**惩罚 [missed](/ja/Module-specifications/spec-slashing.md) 超过允许的 `VotePeriod`s 的验证器**。

6. 治理

   - 删除不活跃的提案，检查投票期结束的活跃提案是否通过，并运行已通过提案的注册提案处理程序。

7. 市场

   - [补充](/ja/Module-specifications/spec-market.md#end-block) 流动性池，**允许点差费用减少**。

8. 国库

   - 在“纪元”结束时，为下一个纪元更新指标、燃烧铸币税并重新调整货币政策杠杆（税率、奖励权重）。

9. 质押
   - 新的活跃验证者集是从前 130 名 Luna 质押者中确定的。在集合中失去位置的验证器开始解除绑定过程。

## 约定

### 货币面额

在 Terra 协议中，账户和钱包可以持有两种类型的代币：

1. **Terra 稳定币** 跟踪各种法定货币的汇率。每个 Terra 稳定币都以其相应的 3 个字母 [ISO 4217 法定货币代码](https://www.xe.com/iso4217.php) 命名，写作`Terra<currencycode>`。当用作值时，每个货币代码缩写的最后一个字母被替换为 T 以表示它是 Terra 稳定币。例如，与韩元 KRW 挂钩的 Terra 稳定币被命名为 TerraKRW，其缩写为 KRT。

   Terra 协议的标准基础货币是 TerraSDR，或 SDT，与 IMF 的特别提款权挂钩。 Terra 协议使用 SDT 进行计算和设置速率标准。

2. **Luna** 是 Terra 协议的原生质押资产。当委托人将他们的 Luna 质押给活跃的验证者时，他们将获得挖矿奖励。 Luna 通过吸收 Terra 稳定币的价格波动来稳定 Terra 经济，也用于提出治理建议。

微单位（$\times 10^{-6}$）是 Terra 稳定币和 Luna 的最小原子单位。

| Denomination | Micro-Unit | Code    | Value         |
| :----------- | :--------- | :------ | :------------ |
| Luna         | µLuna      | `uluna` | 0.000001 Luna |
| TerraSDR     | µSDR       | `usdr`  | 0.000001 SDT  |
| TerraKRW     | µKRW       | `ukrw`  | 0.000001 KRT  |
| TerraUSD     | µUSD       | `uusd`  | 0.000001 UST  |
| TerraMNT     | µMNT       | `umnt`  | 0.000001 MNT  |

请注意，由于套利活动，Terra 协议仅通过其 Terra 稳定币对应物了解法定货币的价值，假设它们的交易相对接近与其挂钩的法定货币的价值。 
