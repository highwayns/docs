# 银行

::: 警告注意
Terra 的 Bank 模块继承自 Cosmos SDK 的 [`bank`](https://docs.cosmos.network/master/modules/bank/) 模块。本文档是一个存根，主要涵盖有关如何使用它的 Terra 特定的重要说明。
:::

Bank 模块是 Terra 区块链的基础交易层：它允许资产从一个“账户”发送到另一个“账户”。银行定义了两种类型的发送交易：`MsgSend` 和 `MsgMultiSend`。这些消息会自动产生稳定费，这是由 [`Auth` 模块中的 ante 处理程序](spec-auth.md#stability-fee) 执行的。

## 消息类型

### MsgSend

```go
// MsgSend - 硬币模块的高级交易
type MsgSend struct {
    FromAddress sdk.AccAddress `json:"from_address"`
    ToAddress   sdk.AccAddress `json:"to_address"`
    Amount      sdk.Coins      `json:"amount"`
}
```

Bank 模块可用于将硬币从一个 `Account`（`terra-` 前缀帐户）发送到另一个。构造了一个 `MsgSend` 来促进传输。如果“账户”中的硬币余额不足或接收方“账户”不允许通过银行模块接收资金，则交易失败。

### MsgMultiSend

```go
// MsgMultiSend - 硬币模块的高级交易
type MsgMultiSend struct {
    Inputs  []Input  `json:"inputs"`
    Outputs []Output `json:"outputs"`
}
```

银行模块可用于一次发送多笔交易。 `Inputs` 包含传入的交易，`Outputs` 包含传出的交易。 “输入”和“输出”的硬币余额必须完全匹配。通过 multisend 批量交易的好处是节省网络带宽和 gas 费用。

如果任何“帐户”失败，则不会退还已通过交易支付的税费。