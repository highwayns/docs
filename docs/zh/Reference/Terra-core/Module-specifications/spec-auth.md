# 认证

::: 警告注意
Terra 的 Auth 模块继承自 Cosmos SDK 的 [`auth`](https://docs.cosmos.network/master/modules/auth/) 模块。本文档是一个存根，主要涵盖有关如何使用它的 Terra 特定的重要说明。
:::

Terra 的 Auth 模块扩展了 Cosmos SDK 的 `auth` 模块的功能，并使用修改后的 ante 处理程序将稳定性层费用与所有基本交易有效性检查（签名、随机数、辅助字段）一起应用。此外，还定义了一个特殊的归属账户类型，它处理来自 Luna 预售的代币归属逻辑。

## 费用

Auth 模块从 [`Treasury`](./spec-treasury.md) 模块读取当前有效的 `TaxRate` 和 `TaxCap` 参数以强制执行稳定层费用。

### 汽油费

与任何其他交易一样，[`MsgSend`](./spec-bank.md#msgsend) 和 [`MsgMultiSend`](./spec-bank.md#msgmultisend) 支付 gas 费用，其大小取决于验证者的偏好（每个验证者设置自己的最低汽油费）和交易的复杂性。 [gas 和费用的注释](/Reference/terrad/#fees) 更详细地解释了 gas 是如何计算的。这里要注意的重要细节是，gas 费用是在交易出站时由发件人指定的。

### 稳定费

除了gas费之外，赌注处理者仅对**稳定币**（**LUNA**除外）收取稳定费，该费用占交易价值的百分比。它从 [`Treasury`](./spec-treasury.md) 模块读取税率和税收上限参数，以计算需要收取的稳定税金额。

**税率** 是网络商定的一个参数，它指定将在区块奖励中作为税收收入收集的支付交易的百分比，这些百分比将在验证者之间分配。分发模型有点复杂，详细解释[这里](../validator/faq.md#how-are-block-provisions-distributed)。每笔交易收取的税款不能超过为该交易的面额定义的特定 **Tax Cap**。每一个时期，网络都会自动重新校准税率和税收上限；有关更多详细信息，请参见 [此处](spec-treasury.md#monetary-policy-levers)。

对于 µSDR 代币的“MsgSend”交易示例，

```text
stability fee = min(1000 * tax_rate, tax_cap(usdr))
```

对于“MsgMultiSend”交易，每笔出站交易都会收取稳定费。

## 参数

Auth 模块的子空间是`auth`。

```go
type Params struct {
	MaxMemoCharacters      uint64 `json:"max_memo_characters" yaml:"max_memo_characters"`
	TxSigLimit             uint64 `json:"tx_sig_limit" yaml:"tx_sig_limit"`
	TxSizeCostPerByte      uint64 `json:"tx_size_cost_per_byte" yaml:"tx_size_cost_per_byte"`
	SigVerifyCostED25519   uint64 `json:"sig_verify_cost_ed25519" yaml:"sig_verify_cost_ed25519"`
	SigVerifyCostSecp256k1 uint64 `json:"sig_verify_cost_secp256k1" yaml:"sig_verify_cost_secp256k1"`
}
```

### MaxMemoCharacters

交易备忘录中允许的最大字符数。

- type: `uint64`
- default: `256`

### TxSigLimit

交易中的最大签名者数。单个交易可以有多个消息和多个签名者。 sig 验证成本远高于其他操作，因此我们将其限制为 100。

- type: `uint64`
- default: `100`

### TxSizeCostPerByte

用于计算交易的gas消耗，`TxSizeCostPerByte * txsize`。

- type: `uint64`
- default: `10`

### SigVerifyCostED25519

验证 ED25519 签名的 gas 成本。

- type: `uint64`
- default: `590`

### SigVerifyCostSecp256k1

验证Secp256k1签名的gas成本。

- type: `uint64`
- default: `1000`
