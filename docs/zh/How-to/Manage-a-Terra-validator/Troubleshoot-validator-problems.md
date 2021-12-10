# 解决验证器问题

以下是您在运行验证器节点时可能会遇到的一些常见问题及其解决方案。

## 验证者的投票权为 0

如果您的验证人的投票权为 0，则您的验证人已自动解除绑定。在主网上，当验证者没有对最后“10000”块中的“9500”（测试网上最后“100”块中的“50”）投票时，他们就会解除绑定。由于区块每约 5 秒提出一次，因此在约 13 小时（在测试网上约 4 分钟）内没有响应的验证器将被解除绑定。这个问题通常发生在你的 `terrad` 进程崩溃时。

要将投票权返还给验证者:

1. 如果 `terrad` 没有运行，重启它:

  ```bash
  terrad start
  ```


1. 等待你的全节点到达最新的区块，然后运行:

  ```bash
  terrad tx slashing unjail <terra> --chain-id=<chain_id> --from=<from>
  ```

在哪里


- `<terra>` 是你的验证者账户的地址。
- `<name>` 是验证器帐户的名称。要查找此信息，请运行“terrad keys list”。

  ::: 警告
  如果你在运行 `unjail` 之前没有等待 `terrad` 同步，一条错误消息会通知你你的验证器仍然被监禁。
  :::

1. 再次检查您的验证器，看看您的投票权是否恢复:

  ```bash
  terrad status
  ```

如果您的投票权比以前少，那是因为您因停机而被削减。

## Terrad 因为打开的文件太多而崩溃

Linux 每个进程可以打开的默认文件数是“1024”。众所周知，`terrad` 打开的数量超过了这个数量，从而导致进程崩溃。要解决此问题:

1.通过运行`ulimit -n 4096`来增加允许打开的文件数。

2. 用 `terrad start` 重新启动进程。

  如果您使用 `systemd` 或其他进程管理器来启动 `terrad`，您可能需要配置它们。以下示例 `systemd` 文件修复了该问题:

  ```systemd
  # /etc/systemd/system/terrad.service
  [Unit]
  Description=Terra Columbus Node
  After=network.target

  [Service]
  Type=simple
  User=ubuntu
  WorkingDirectory=/home/ubuntu
  ExecStart=/home/ubuntu/go/bin/terrad start
  Restart=on-failure
  RestartSec=3
  LimitNOFILE=4096

  [Install]
  WantedBy=multi-user.target
  ```


## Oracle 投票错误

您可能会通过 [Terra Oracle feeder](https://github.com/terra-money/oracle-feeder) 收到以下错误消息:

    `广播错误:代码:3，raw_log:验证器不存在:terravaloperxxx`

出现此消息的原因如下:

### 验证器不活跃

由于以下原因之一，验证器可能不处于活动状态:

- 验证者被监禁。要解决此问题，请通过运行“解除”验证器:

    `terrad tx slashing unjail <terra> --chain-id=<chain_id> --from=<from>`

- 验证器不在活动的 [验证器集](/zh/validators.html#delegations) 中。只有前 130 个验证者在这个集合中。要解决此问题，请增加您的总赌注，使其包含在前 130 名中。

### 网络不对。

oracle feeder 可能正在提交到错误的网络。要解决此问题，请使用指定的 lite 客户端守护程序 (LCD) 运行馈送器:

```bash
nom start vote --\
  --source http://localhost:8532/latest \
  --lcd ${LCD} \
  --chain-id "${CHAIN_ID}" \
  --validator "${VALIDATOR_KEY}" \
  --password "${PASSWORD}" \
```

投票者连接的 LCD 可能在与您的节点不同的网络上运行。不同网络的远程 LCD 有:

- https://lcd.terra.dev 用于哥伦布主网
- https://bombay-lcd.terra.dev 用于 Bombay 测试网

确保为节点连接的同一网络指定 LCD。

如果您运行 [local LCD](../Start-LCD.md)（例如，localhost:1317），请确保您的 LCD 连接到同一节点。

## Terrad 因为内存碎片而崩溃

如[本期](https://github.com/terra-money/core/issues/592) 中所述，巨大的内存分配会导致内存碎片问题。临时解决方案只是使用较小的 wasm 缓存大小，如 50~100MB。

如果您使用 v0.5.10+，

```toml
contract-memory-cache-size = 100
```


如果使用 v0.5.7~v0.5.9，
```toml
write-vm-memory-cache-size = 100
``` 