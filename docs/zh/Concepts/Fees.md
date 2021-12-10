# Terra 的费用

在 Terra 网络上，所有交易都会产生 gas 费用。 涉及稳定币的交易会根据进行的交易类型产生额外费用。 下表解释了不同类型的稳定币交易需要添加哪些额外费用: 

|                                                                        | [Gas](#gas) | [Tobin](#tobin-tax) | [Spread](#spread-fee) | [Stability](#stability-fee) |
|------------------------------------------------------------------------|-------------|---------------------|-----------------------|-----------------------------|
| [Market swaps](./glossary.md#market-swap) between stablecoins          | x           | x                   |                       |                             |
| [Market swaps](./glossary.md#market-swap) between stablecoins and Luna | x           |                     | x                     |                             |
| All other stablecoin transactions (non market swap)                    | x           |                     |                       | x                           |

仅涉及 Luna 的交易，例如发送 Luna、委托或投票仅会产生 gas 费用。
Terraswap 或其他 dApp 可能会在 Terra 网络费用之外收取自己的交易费用。

## 汽油
[Gas](./glossary.md#fees) 是一笔很小的计算费用，用于支付处理交易的成本。汽油被估算并添加到 Terra Station 中的每笔交易中。任何不包含足够汽油的交易都不会处理。
汽油在 Terra 上的工作方式与在其他区块链上的工作方式不同:

- 验证者可以设置自己的最低gas费用。
- 大多数交易将估计超过最小gas量，以确保交易完成。
- 未使用的燃气不予退还。
- 交易不是根据 Gas 数量排队，而是按照收到的顺序排列。

有关如何计算 gas 费用的深入说明，请访问 [terrad reference](/zh/Reference/terrad/#fees) 页面。

要在浏览器中查看当前的汽油费率，请访问 [汽油费率](https://fcd.terra.dev/v1/txs/gas_prices) FCD 页面。

## 稳定费

稳定费是最常见的费用类型，会添加到使用 Terra 稳定币的任何交易中，不包括 [市场掉期](./glossary.md#market-swap)。此费用称为税率，介于 0.01% 至 1% 之间。每笔交易的稳定费上限为 1 SDT。当前税率可在 [税率](https://fcd.terra.dev/terra/treasury/v1beta1/tax_rate) FCD 页面上找到。有关税率及其运作方式的更多信息，请访问 [treasury module](/zh/Reference/Terra-core/Module-specifications/spec-treasury.md)。

## 托宾税

托宾税是添加到 Terra 稳定币面额之间的任何 [市场互换](./glossary.md#market-swap) 的固定百分比费用。费率因每个 Terra 稳定币而异。例如，虽然大多数面额的税率为 0.35%，但 MNT 的税率为 2%。要查看托宾税率，请[查询预言机](https://lcd.terra.dev/terra/oracle/v1beta1/denoms/tobin_taxes)。当稳定币有不同的托宾税率时，交易将使用较高的税率。

 托宾税旨在阻止以牺牲用户利益为代价抢先运行预言机和外汇交易。有关托宾税实施的更多信息，请阅读 [“关于掉期费:贪婪和明智”](https://medium.com/terra-money/on-swap-fees-the-greedy-and- the-wise-b967f0c8914e）。

## 点差费

 Terra 和 Luna 之间的任何 [市场掉期](./glossary.md#market-swap) 都会增加点差费用。最低点差费为 0.5%。在极端波动时期，市场模块会调整点差费用以在 Terra 的大小之间保持 [恒定产品](/zh/Reference/Terra-core/Module-specifications/spec-market.html#market-making-algorithm)池和 Luna 池的法币值，确保协议的稳定性。随着池达到恒定的产品平衡，传播率恢复到正常值。

 有关点差费用的更多信息，请访问 [市场模块](/zh/Reference/Terra-core/Module-specifications/spec-market.md)。 