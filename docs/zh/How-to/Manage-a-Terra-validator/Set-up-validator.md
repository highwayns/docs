# 注册您的 Terra 验证器

这是设置 Terra 验证器的详细分步指南。请注意，虽然设置基本验证节点很容易，但运行具有强大架构和安全功能的生产质量验证器节点需要进行大量设置。

有关设置验证器的更多信息，请参阅 [附加资源](./Overview.md#additional-resources)。

## 先决条件

- 您已完成[如何运行完整的 Terra 节点](/zh/How-to/Run-a-full-Terra-node/Hardware-requirements.html)，其中概述了如何安装、连接和配置节点。
- 你熟悉 [terrad](../../Reference/terrad/)。
- 您已阅读[验证器常见问题解答](./faq.md)
- 硬件要求:参见[运行完整节点的要求](../Run-a-full-Terra-node/Hardware-requirements.md)。

## 1. 检索节点的共识公钥

创建新的验证器需要您节点的共识 PubKey。跑:

```bash
--pubkey=$(terrad tendenmint show-validator)
``

## 2. 创建一个新的验证器

:::tip 获取令牌
为了让 Terrad 识别钱包地址，它必须包含代币。对于测试网，使用 [the faucet](https://faucet.terra.money/) 将 Luna 发送到您的钱包。如果您在主网上，请从现有钱包发送资金。 1-3 luna 足以满足大多数设置过程。
:::

要创建验证器并使用自委托对其进行初始化，请运行以下命令。 `key-name` 是用于签署交易的私钥的名称。

```bash
terrad tx 抵押创建验证器 \
    --amount=5000000uluna \
    --pubkey=$(<your-consensus-PubKey>) \
    --moniker="<你的名字>" \
    --chain-id=<chain_id> \
    --from=<key-name> \
    --commission-rate="0.10" \
    --commission-max-rate="0.20" \
    --commission-max-change-rate="0.01" \
    --min-self-delegation="1"
``

::: 警告警告:
当您指定佣金参数时，`commission-max-change-rate` 被衡量为`commission-rate` 的百分比变化。例如，从 1% 到 2% 的变化是 100% 的速率增加，但“commission-max-change-rate”测量为 1%。
:::

## 3. 确认您的验证器处于活动状态

如果运行以下命令返回一些内容，则验证器处于活动状态。

```bash
terrad 查询tendermint-validator-set | grep "$(terrad tendenmint show-validator)"
``

您正在`~/.terra/config/priv_validator.json` 文件中查找`bech32` 编码的`address`。

::: 警告 注意:
只有投票权最高的 130 个验证者才包含在活动验证者集中。
::: 