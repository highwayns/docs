# 概述

本节中的任务描述了如何设置 Terra 验证器。虽然设置基本验证节点很容易，但运行具有强大架构和安全功能的生产质量验证器节点需要进行大量设置。

Terra 核心由 Tendermint 共识提供支持。验证者运行全节点，通过广播投票参与共识，向区块链提交新区块，并参与区块链的治理。验证者可以代表他们的委托人投票。验证者的投票权根据他们的总股份进行加权。排名前 130 的验证者构成了 **Active Validator Set**，并且是唯一签署区块并获得收入的验证者。

验证者及其委托人赚取以下费用:

- [Gas](./fees.md#gas):计算每笔交易的费用以避免垃圾邮件。验证者设置最低 gas 价格并拒绝隐含 gas 价格低于此阈值的交易。

- [稳定费用](./fees.md#stability-fees):为提供市场稳定性而添加到任何交易中的费用，上限为 1SDT。费率是可变的，称为税率。

- **交换费用**:交换 Terra 稳定币面额的费用称为 [托宾税](./fees.md#tobin-tax)。 Terra 和 Luna 之间的交易需要支付 [点差费](./fees.md#spread-fees)。

有关费用的更多信息，请访问 [费用页面](./fees.md)。

验证者可以根据他们收到的费用设置佣金作为额外奖励。

如果验证者双重签名、经常离线或不参与治理，他们质押的 Luna（包括委托给他们的用户的 Luna）可能会被削减。处罚会根据违规的严重程度而有所不同。

有关验证器的更多一般信息，请访问概念页面的 [验证器部分](/zh/Concepts/Protocol.md#validators)。

## 其他资源

- [The Terra 验证器 Discord](https://discord.com/invite/xfZK6RMFFx)。
- [如何在 Terra 上启动节点 - Terra Bites 视频](https://www.youtube.com/watch?v=2lKAvltKX6w&ab_channel=TerraBites)。
- [验证器常见问题](./faq.md) 