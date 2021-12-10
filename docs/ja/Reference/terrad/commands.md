# 命令

本节描述了从 `terrad` 可用的命令，这是连接正在运行的 `terrad` 进程的命令行界面。

## `add-genesis-account`

将 genesis 帐户添加到 `genesis.json`。 

**Syntax**
```bash
terrad add-genesis-account <address-or-key-name> '<amount><coin-denominator>,<amount><coin-denominator>'
```

**Example**
```bash
terrad add-genesis-account acc1 '200000000uluna,550000ukrw'
```

## `collect-gentxs`

收集创世交易并将它们输出到“genesis.json”。

**Syntax**
```bash
terrad collect-gentxs
```

## `debug`

帮助调试应用程序。 有关语法和子命令的列表，请参阅 [debug subcommands](subcommands.md#debug-addr)。 

## `export`

将状态导出到 JSON。 

**Syntax**
```bash
terrad export
```

## `gentx`

将创世交易添加到 `genesis.json`。 

**Syntax**
```bash
terrad gentx <key-name> <amount><coin-denominator>
```

**Example**
```bash
terrad gentx myKey 1000000uluna --home=/path/to/home/dir --keyring-backend=os --chain-id=test-chain-1 \
    --moniker="myValidator" \
    --commission-max-change-rate=0.01 \
    --commission-max-rate=1.0 \
    --commission-rate=0.07 \
    --details="..." \
    --security-contact="..." \
    --website="..."
```

## `help`

显示帮助信息。 

**Syntax**
```bash
terrad help
```

## `init`

初始化验证器和节点的配置文件。 

**Syntax**
```bash
terrad init <moniker>
```

**Example**
```bash
terrad init myNode
```

## `keys`

管理密钥环命令。 有关语法和子命令的列表，请参阅 [keys subcommands](subcommands.md#keys-add)。


## `migrate`
将源代码迁移到目标版本并打印到 STDOUT。

**Syntax**
```bash
terrad migrate <path-to-genesis-file>
```

**Example**
```bash
terrad migrate /genesis.json --chain-id=testnet --genesis-time=2020-04-19T17:00:00Z --initial-height=4000
```

## `query`

管理查询。 有关语法和子命令的列表，请参阅 [查询子命令](subcommands.md#query-account)。 

## `rosetta`

创建 Rosetta 服务器。 

**Syntax**
```bash
terrad rosetta
```

## `start`

在进程内或进程外使用 Tendermint 运行全节点应用程序。 默认情况下，应用程序在 Tendermint 进程中运行。 

**Syntax**
```bash
terrad start
```

## `status`

显示远程节点的状态。 

**Syntax**
```bash
terrad status
```

## `tendermint`

管理 Tendermint 协议。 有关子命令的列表，请参阅 []()

## `testnet`

使用指定数量的目录创建一个测试网，并用必要的文件填充每个目录。

**Syntax**
```bash
terrad testnet
```

**Example**
```bash
terrad testnet --v 6 --output-dir ./output --starting-ip-address 192.168.10.2
```

## `tx`

通过哈希、帐户序列或签名检索交易。 有关完整语法和子命令的列表，请参阅 [tx 子命令](subcommands.md#tx-authz-exec)

**Syntax to query by hash**
```bash
terrad query tx <hash>
```

**Syntax to query by account sequence**
```bash
terrad query tx --type=acc_seq <address>:<sequence>
```

**Syntax to query by signature**
```bash
terrad query tx --type=signature <sig1_base64,sig2_base64...>
```

## `txs`

检索与结果分页的指定事件匹配的事务。

**Syntax**
```bash
terrad query txs --events '<event>' --page <page-number> --limit <number-of-results>
```

**Example**
```bash
terrad query txs --events 'message.sender=cosmos1...&message.action=withdraw_delegator_reward' --page 1 --limit 30
```

## `unsafe-reset-all`

重置区块链数据库，删除地址簿文件，并将 `data/priv_validator_state.json` 重置为创世状态。 

**Syntax**
```bash
terrad unsafe-reset-all
```

## `validate-genesis`

在默认位置或指定位置验证创世文件。

**Syntax**
```bash
terrad validate-genesis </path-to-file>
```

**Example**
```bash
terrad validate-genesis </genesis.json>
```

## `version`

返回您正在运行的 Terra 版本。

**Syntax**
```bash
terrad version
```
