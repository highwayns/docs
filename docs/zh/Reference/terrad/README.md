# 使用 terrad

以下信息解释了您可以从“terrad”（连接正在运行的“terrad”进程的命令行界面）中使用的功能。使用它来访问 Terra。有关命令行的更多一般信息，请运行`terrad --help`。有关特定`terrad` 命令的更多信息，请在命令后附加`-h` 或`--help` 标志，例如`terrad query --help`。

## 访问节点

要查询状态并发送交易，您必须连接到一个节点，该节点是整个对等连接网络的接入点。您可以运行自己的完整节点或连接到其他人的。

### 运行你自己的全节点

运行自己的全节点是最安全的选择，但它对资源的要求相对较高。有关运行您自己的完整节点的要求和安装 `terrad` 的教程的更多信息，请参阅 [安装](../../How-to/Run-a-full-Terra-node/Build-Terra-核心.md）。有关解释如何连接到现有 Terra 网络的教程，请参阅[加入网络](../../How-to/Run-a-full-Terra-node/Join-public-network.md)。

### 连接远程全节点

如果您不想运行自己的完整节点，则可以连接到其他人的完整节点。当您考虑运营商的选择时，请优先考虑您信任的运营商，因为恶意运营商可能会故意返回不正确的查询结果或审查您的交易。但是，他们永远无法窃取您的资金，因为您的私钥本地存储在您的计算机或 Ledger 硬件设备上。全节点运营商的可能选项包括验证器、钱包提供商或交易所。

连接全节点需要一个`https://<host>:<port>`格式的地址，例如`https://77.87.106.33:26657`。该地址必须由您选择信任的全节点运营商传达。您将在下一节中使用此地址。

## 配置 terrad

`terrad` 使您能够与在 Terra 网络上运行的节点进行交互，无论您是否自己运行它。要配置`terrad`，请编辑`~/.terra/config/` 目录中的`config.toml` 文件。

## 查询区块链状态

要从区块链查询所有相关信息，例如账户余额、保税代币数量、未偿奖励等，请使用“terrad query”。以下列表显示了一些对委托者最有用的命令: 

```bash
# query account balances and other account-related information
terrad query account

# query the list of validators
terrad query staking validators

# query the information of a validator given their address
terrad query staking validator <validatorAddress>

# query all delegations made from a delegator given their address
# (note: delegator addresses are regular account addresses)
terrad query staking delegations <delegatorAddress>

# query a specific delegation made from a delegator to a validator
terrad query staking delegation <delegatorAddress> <validatorAddress>

# query the rewards of a delegator given a delegator address (e.g. terra10snjt8dmpr5my0h76xj48ty80uzwhraqalu4eg)
terrad query distr rewards <delegatorAddress>
```

## 发送交易

要通过发送包含带有状态更改指令的模块消息的交易与区块链进行交互，这些指令会被处理并包含在块中，请使用“terrad tx”。 所有交易发送操作都遵循以下形式: 

```bash
terrad tx ...
```

要了解有关您可以发出的不同类型交互的更多信息，请参阅每个模块的部分。

### 模拟交易

要模拟交易而不实际广播它，请将 `--dry-run` 标志附加到命令语句: 

```bash
terrad tx send \
    <from_key_or_address> \
    <to_address> \
    <coins> \
    --chain-id=<chain_id> \
    --dry-run
```

### 生成交易而不发送

要构建交易并将其 JSON 格式打印到 STDOUT，请将 `--generate-only` 附加到命令行参数列表。 这允许您将交易的创建和签名与广播分开。 

```bash
terrad tx send \
    <from_key_or_address> \
    <to_address> \
    <coins> \
    --chain-id=<chain_id> \
    --generate-only > unsignedSendTx.json
```

```bash
terrad tx sign \
    --chain-id=<chain_id> \
    --from=<key_name> \
    unsignedSendTx.json > signedSendTx.json
```

您可以通过键入以下内容来验证交易的签名:

```bash
terrad tx sign --validate-signatures signedSendTx.json
```

You can broadcast the signed transaction to a node by providing the JSON file to the following command:

```bash
terrad tx broadcast --node=<node> signedSendTx.json
```


## 费用

Terra 协议网络上的交易需要包括交易费才能进行处理。这笔费用用于支付运行交易所需的 gas。公式如下:

$$ 费用 = gas * gasPrices$$

`gas` 取决于交易。不同的交易需要不同数量的“gas”。交易的 `gas` 金额是在处理过程中计算的，但是有一种方法可以通过使用 `gas` 标志的 `auto` 值来预先估计它。当然，这只是一个估计。如果你想确保为交易提供足够的`gas`，你可以使用标志`--gas-adjustment` \（默认`1.0`\）来调整这个估计。

`gasPrice` 是每单位 `gas` 的价格。每个验证器都会设置一个 `min-gas-price` 值，并且只会包含 `gasPrice` 大于其 `min-gas-price` 的交易。

交易`fees`是`gas`和`gasPrice`的乘积。作为用户，您必须输入 3 中的 2。`gasPrice`/`fees` 越高，您的交易被包含在一个区块中的机会就越大。

### 设置费用

每笔交易可能提供费用或天然气价格，但不能同时提供。大多数用户通常会提供费用，因为这是您最终为包含在分类账中的交易而产生的最终成本，而 gas 价格将根据验证器动态计算。

验证器指定他们用来确定是否包括交易的最低 gas 价格，他们在 `CheckTx` 期间计算，其中 `gasPrices >= minGasPrices`。请注意，您的交易提供的费用必须大于或等于验证者要求的 **任何** 面额。

::: 警告注意
验证者可能会开始通过内存池中的 `gasPrice` 来确定交易的优先级，因此提供更高的费用或 gas 价格可能会产生更高的包含在区块中的优先级。
:::

直接使用费用: 

```bash
terrad tx send ... --fees=100000uluna
```

如果您使用费用，验证器将通过将您的费用除以估计的 gas 消耗来计算隐含的 `minGasPrices`，以正确地为您的交易分配正确的优先级。

使用汽油价格（使用逗号分隔的金额和面额列表）。 

```bash
terrad tx send ... --gas-prices=0.15uusd
```

### 税收

Terra 的税费必须包含在费用金额中。 用户可以使用现有方法进行交易，无需`--fees` 标志，但带有gas price 标志。 除了现有的gas费用外，这将自动计算税费和退货费。

### 自动费用估算

您可能希望通过 `--gas` 标志限制交易可以消耗的最大气体。 如果您通过`--gas=auto`，将在执行交易前自动估算gas。

Gas 估计可能不准确，因为在模拟结束和交易实际执行之间可能发生状态变化，因此在原始估计之上应用调整以确保交易成功广播。

可以通过`--gas-adjustment` 标志控制调整，其默认值为 1.0。

要从“terrad”获得直接费用估算:

```bash
terrad tx estimate-fee ...\
    --gas-prices=0.15uusd
    --gas-adjustment=1.4
```

要使用费用估算创建和发送交易，请使用以下模板作为格式: 

```bash
terrad tx send ... \
    --gas-prices=0.15uusd
    --gas=auto
    --gas-adjustment=1.4
```

## shell自动完成

可以通过 `completion` 命令生成流行的 UNIX shell 解释器（如 `bash` 和 `zsh`）的自动完成脚本，该命令可用于 `terrad` 和 `terrad`。 这允许在使用命令行时以更方便的方式与 Terra Core 端点交1互。

如果要生成`bash`完成脚本，请运行以下命令: 11

```bash
terrad completion > terrad_completion
terrad completion > terrad_completion
```

如果要生成 `zsh` 完成脚本，请运行以下命令

```bash
terrad completion --zsh > terrad_completion
terrad completion --zsh > terrad_completion
```

::: warning NOTE
在大多数 UNIX 系统上，此类脚本可能会加载到 `.bashrc` 或 `.bash_profile` 中以启用 Bash 自动完成功能。

```bash
echo '. terrad_completion' >> ~/.bashrc
echo '. terrad_completion' >> ~/.bashrc
```

有关如何启用 shell 自动完成的信息，请参阅操作系统提供的解释器用户手册。 
:::
