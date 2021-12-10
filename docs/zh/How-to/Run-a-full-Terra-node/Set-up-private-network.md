# 建立本地私有网络

验证者可以建立一个私有 Terra 网络，以便在加入公共网络之前熟悉运行 Terra 全节点。

::: 提示 LocalTerra
如果您是开发人员并且想要为智能合约设置本地的、支持 WASM 的私有测试网，请访问 [下载 LocalTerra](/zh/Tutorials/Smart-contracts/Set-up-local-environment.html#download-localterra)。
:::

##创建单个节点

您可以设置的最简单的 Terra 网络是只有一个节点的本地测试网。 在单节点环境中，您拥有一个帐户，并且您是私有网络的唯一验证者签名块。

1. 初始化将引导网络的创世文件。 用您自己的信息替换变量。

```bash
terrad init --chain-id=<testnet-name> <node-moniker>
```

2. 生成一个 Terra 账户。 将变量替换为您的帐户名称

```bash
terrad keys add <account-name>
```

:::tip 获取令牌
为了让 Terrad 识别钱包地址，它必须包含代币。 对于测试网，使用 [the faucet](https://faucet.terra.money/) 将 Luna 发送到您的钱包。 如果您在主网上，请从现有钱包发送资金。 1-3 luna 足以满足大多数设置过程。
:::

## 将您的帐户添加到创世纪

运行以下命令添加您的帐户并设置初始余额:

```bash
terrad add-genesis-account $(terrad keys show <account-name> -a) 100000000uluna,1000usd
terrad gentx <my-account> 10000000uluna --chain-id=<testnet-name>
terrad collect-gentxs
```

## 启动您的私人 Terra 网络

运行以下命令: 

```bash
terrad start
```

如果私有 Terra 网络设置正确，则您的 `terrad` 节点将在 `tcp://localhost:26656` 上运行一个节点，监听传入的交易并签署区块。 