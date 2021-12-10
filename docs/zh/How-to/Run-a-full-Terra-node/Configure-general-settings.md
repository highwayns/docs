# 配置常规设置

以下信息描述了最重要的节点配置设置，它们位于 `~/.terra/config/` 目录中。 我们建议您使用自己的信息更新这些设置。

有关配置设置的更多详细说明，包括 WASM 的设置，请浏览每个配置文件。

## 更新您的绰号

1. 打开`~/.terra/config/config.toml`。

2. 修改 `moniker` 来命名你的节点。 

```toml
# A custom human readable name for this node
moniker = "cx-mbp-will.local"
```

## 下载通讯录

选择并下载 `addrbook.json` 并将其移动到 `~/.terra/config/addrbook.json`。 这将为您的节点提供一个选择的对等点拨号以查找其他节点。

有关更多 p2p 和种子设置，请访问 [附加设置](#additional-settings)

- 主网地址簿: 

```bash
wget https://network.terra.dev/addrbook.json -O ~/.terra/config/addrbook.json
```

- 测试网地址簿: 

```bash
wget https://network.terra.dev/testnet/addrbook.json -O ~/.terra/config/addrbook.json
```

## 更新最低汽油价格

1. 打开`~/.terra/config/app.toml`。

2. 修改 `minimum-gas-prices` 以设置验证者为验证交易和防止垃圾邮件而接受的最低 gas 价格。

``` toml
# 验证者愿意接受的最低gas价格来处理a
# 交易。 交易费用必须满足任何面额的最低要求
# 在此配置中指定（例如 0.25token1;0.0001token2）。minimum-gas-prices = "0.01133uluna,0.15uusd,0.104938usdr,169.77ukrw,428.571umnt,0.125ueur,0.98ucny,16.37ujpy,0.11ugbp,10.88uinr,0.19ucad,0.14uchf,0.19uaud,0.2usgd,4.62uthb,1.25usek,1.25unok,0.9udkk,2180.0uidr,7.6uphp,1.17uhkd"
```


## 启动轻客户端守护进程（LCD）

要启用 REST API 和 Swagger，并启动 LCD，请完成以下步骤:

1. 打开`~/.terra/config/app.toml`。

2. 找到`API 配置` 部分（`[api]`）。

3. 将`enable = false`改为`enable = true`。

``` toml
# Enable 定义是否应该启用 API 服务器。
enable = true
```

4. 可选:要启用 Swagger，请将 `swagger = flase` 更改为 `swagger = true`。

``` toml
# Swagger 定义是否应该自动注册 swagger 文档。
swagger = true
```
5. 重新启动。

重新启动后，LCD 将可用。

有关 Terra REST API 端点的更多信息，请参阅 [Swagger 文档](https://lcd.terra.dev/swagger/)。

## 其他设置

### `seed_mode`

在种子模式下，一个节点不断地为对等点爬行网络，并且在传入连接时共享一些对等点并断开连接。

``` toml
# 种子模式，节点不断地爬取网络并寻找
#同行。 如果另一个节点向它询问地址，它会响应并断开连接。
# 如果禁用对等交换反应器，则不起作用。
seed_mode = true
```

### `seeds`

要手动识别种子节点，请在 `config.toml` 中编辑以下 dsetting。

``` toml
# 逗号分隔的种子节点列表 
seeds = "id100000000000000000000000000000000@1.2.3.4:26656,id200000000000000000000000000000000@2.3.4.5:4444"
```

### `persistent_peers`

您指定的节点是受信任的持久对等点，可以帮助将您的节点锚定在 p2p 网络中。 如果连接失败，它们会被拨号并在 24 小时内自动重拨。 自动重拨功能使用指数退避，并在尝试连接 24 小时后停止。

如果“persistent_peers_max_dial_period”的值大于零，则在指数退避期间，每次调用每个持久对等点之间的暂停不会超过“persistent_peers_max_dial_period”，自动重拨过程将继续。

``` toml
# 逗号分隔的节点列表，以保持持久连接 
persistent_peers = "id100000000000000000000000000000000@1.2.3.4:26656,id200000000000000000000000000000000@2.3.4.5:26656"
```

通过 Rosetta API 将 Terra 与 Coinbase 集成。 Rosetta 是一种开源 API，可将区块链数据组织成标准化格式，便于开发者构建跨链应用程序。 Rosetta 不是为每个链创建特定的代码，而是允许不同的区块链集成到任何使用 Rosetta API 的交易所中。

有关更多信息，请访问 [Rosetta 文档站点](https://www.rosetta-api.org/docs/welcome.html)。 
