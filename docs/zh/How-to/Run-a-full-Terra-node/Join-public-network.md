# 加入公网

[运行简单的本地 Terra 网络](Set-up-private-network.md) 后，通过完成以下步骤加入公共 Terra 网络，例如 Columbus 主网或 Bombay 测试网。

## 设置

这些说明用于从头开始设置全新的完整节点。

### 初始化和配置名字对象

首先，初始化节点并创建必要的配置文件: 

```bash
terrad init <your_custom_moniker>
```

::: 警告 Moniker 字符
名字对象只能包含 ASCII 字符； 使用 Unicode 字符将使您的节点无法被网络中的其他对等方访问。
:::

你可以稍后在 `~/.terra/config/config.toml` 文件中编辑这个 `moniker`:

``` toml
# 此节点的自定义人类可读名称
moniker = "<your_custom_moniker>"
```

### 设置交易的最低 gas 价格(推荐)

您可以编辑 `~/.terra/config/app.toml` 以通过拒绝隐含 gas 价格低于指定最小值的传入交易来启用反垃圾邮件。 为 Terra 主网推荐的最低 gas 价格如下:

``` toml
# 验证者愿意接受的最低gas价格来处理a
# 交易。 交易费用必须满足任何面额的最低要求
# 在此配置中指定(例如 0.25token1,0.0001token2)。
minimum-gas-prices = "0.01133uluna,0.15uusd,0.104938usdr,169.77ukrw,428.571umnt,0.125ueur,0.98ucny,16.37ujpy,0.11ugbp,10.88uinr,0.19ucad,0.14uchf,0.19uaud,0.2usgd,4.62uthb,1.25usek,1.25unok,0.9udkk,2180.0uidr,7.6uphp,1.17uhkd"
```

您的完整节点现已初始化！

## 选择一个网络

通过设置**创世文件**和**种子**来指定您要加入的网络。 如果您需要有关过去网络的更多信息，请访问 [Networks Repo](https://github.com/terra-money/testnet)。

| Network      | Description | Homepage                                                             | Address Book                                    |
| ------------ | ----------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `columbus-5` | Mainnet     | [Link](https://github.com/terra-money/mainnet/tree/master/columbus-5)| https://network.terra.dev/addrbook.json         |
| `bombay-12`  | Testnet     | [Link](https://github.com/terra-money/testnet/tree/master/bombay-12) | https://network.terra.dev/testnet/addrbook.json |

### 下载创世文件

选择你想加入的网络并将它的 `genesis.json` 文件下载到你的 `~/.terra/config` 目录中。 该文件指定了重放交易和同步时要使用的创世账户余额和参数。

- Columbus-5 主网起源: 

```bash
wget https://columbus-genesis.s3.ap-northeast-1.amazonaws.com/columbus-5-genesis.json -O ~/.terra/config/genesis.json
```
- Bombay-12 testnet genesis:

```bash
wget https://raw.githubusercontent.com/terra-money/testnet/master/bombay-12/genesis.json -I ~/.terra/config/genesis.json
```

请注意，我们使用 [networks repo](https://github.com/terra-money/testnet) 中的 `latest` 目录，其中包含最新测试网的详细信息。 如果您要连接到不同的测试网，请确保您获得正确的文件。

要启动 terrad，请输入以下内容: 
```bash
terrad start
```

### 下载地址簿(推荐用于主网)

为了给你的节点选择拨号和查找其他节点的节点，下载`addrbook.json`并将其移动到`~/.terra/config/addrbook.json`。

有关高级设置，请访问 [定义种子节点](#define-seed-nodes)。

- 哥伦布主网地址簿: 
```bash
wget https://network.terra.dev/addrbook.json -O ~/.terra/config/addrbook.json
```

- Bombay testnet address book:

```bash
wget https://raw.githubusercontent.com/terra-money/testnet/master/bombay-12/addrbook.json -O ~/.terra/config/addrbook.json
```

## 连接到网络

### 运行你的节点

使用以下命令启动完整节点: 
```bash
terrad start
```

检查一切是否顺利运行: 
```bash
terrad status
```

### 等待节点同步

::: 警告同步开始时间
节点至少需要一个小时才能开始同步。这种等待很正常。在对同步进行故障排除之前，请等待一小时同步开始。
:::

您的节点通过重放创世中的所有交易并在本地重新创建区块链状态来赶上网络。这将需要很长时间，因此请确保您已将其设置为稳定的连接，以便您可以在同步时离开。

- 验证者可以使用 [Terra Finder](https://finder.terra.money) 查看网络状态。
- 一旦您的全节点同步到当前区块高度，它就会出现在 [全节点列表](https://terra.stake.id/) 上。
- 要在测试期间更快地同步，请参阅[用于测试的节点同步](#node-sync-for-testing)

恭喜！您已作为全节点操作员成功加入网络。如果您是验证者，请继续[管理 Terra 验证者](/zh/How-to/Manage-a-Terra-validator/Overview.html) 以了解后续步骤。

### 使用数据备份(推荐用于主网)

如果您要连接到您有数据备份的现有网络(来自您信任的提供商)，您可以选择将备份加载到您的节点存储中，而不是从头开始同步。

如需访问 ChainLayer 提供的 Columbus-5 节点数据备份，请访问 [Terra QuickSync](https://terra.quicksync.io/)。

## 附录

### 升级测试网

这些说明适用于已在以前的测试网上运行并希望升级到最新测试网上的完整节点。

#### 重置数据

首先，删除过时的文件并重置数据。

```bash
rm ~/.terra/config/genesis.json
rm ~/.terra/config/addrbook.json
terrad unsafe-reset-all
```

您的节点现在处于原始状态，同时保留原始的 `priv_validator.json` 和 `config.toml`。 如果您之前设置了任何哨兵节点或完整节点，您的节点仍会尝试连接到它们，但如果它们还没有升级，则可能会失败。

::: 危险
确保每个节点都有一个唯一的 `priv_validator.json`。 不要将`priv_validator.json` 从旧节点复制到多个新节点。 使用相同的 `priv_validator.json` 运行两个节点会导致双重签名。
:::

#### 软件升级

现在是升级软件的时候了。 转到项目目录，然后运行: 
```bash
git checkout master && git pull
make
```

::: 警告注意
如果您在这一步遇到问题，请检查您是否安装了最新的稳定版 GO。
:::

请注意，我们在这里使用 `master`，因为它包含最新的稳定版本。 有关哪个测试网需要哪个版本的详细信息，请参阅 [testnet repo](https://github.com/terra-money/testnet) 以及 [Terra Core 发布页面](https://github.com/terra -money/core/releases) 了解每个版本的详细信息。 您的完整节点已完全升级！

### 导出状态

Terra 可以将整个应用程序状态转储到 JSON 文件中，这对于手动分析很有用，也可以用作新网络的创世文件。

导出状态: 

```bash
terrad export > [filename].json
```

您还可以从特定高度导出状态\(在处理该高度的块结束时\):

```bash
terrad export --height [height] > [filename].json
```

如果您打算从导出状态开始一个新网络，请使用 `--for-zero-height` 标志导出: 

```bash
terrad export --height [height] --for-zero-height > [filename].json
```

### 节点同步测试

有时您可能希望通过前面的检查来更快地同步。 此命令仅应由非生产环境中的高级用户使用。 要在测试期间加快同步过程，请使用以下命令: 

```bash
terrad start --x-crisis-skip-assert-invariants
```

::: warning NOTE

有关种子和同行的更多信息，请访问 [Tendermint 的文档](https://github.com/tendermint/tendermint/blob/master/docs/tendermint-core/using-tendermint.md#peers)。

:::

有关种子模式和 p2p 设置，请访问 [其他设置页面](/zh/How-to/Run-a-full-Terra-node/Configure-general-settings.html#additional-settings)。
