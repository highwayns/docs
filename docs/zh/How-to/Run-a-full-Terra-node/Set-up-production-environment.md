# 搭建生产环境

使用以下信息来设置和管理您的生产级完整 Terra 节点。

有关运行验证器节点的信息，请访问 [验证器指南](/zh/How-to/Manage-a-Terra-validator/Overview.md)。

:::warning 推荐的操作系统
本指南仅针对基于 RPM 的 Linux 发行版进行了测试。 为确保您成功设置生产环境，请考虑在基于 RPM 的 Linux 系统上设置它。
:::

## 创建一个专用用户

尽管 `terrad` 不需要超级用户帐户，但在设置过程中，您需要超级用户权限才能创建和修改某些文件。 强烈建议在运行 `terrad` 时使用普通用户。

## 增加`terrad`可以打开的最大文件数

`terrad` 默认设置为打开 1024 个文件。 建议您增加此数量。

修改`/etc/security/limits.conf`增加数量，其中`nofile`是`terrad`可以打开的文件数。 
```
*                soft    nofile          65535
*                hard    nofile          65535
```

##常用端口

`terrad` 使用以下 TCP 端口。切换它们的设置以适应您的环境。

大多数验证器只需要打开以下端口:

- `26656`:P2P 协议的默认端口。此端口用于与其他节点通信，必须打开才能加入网络。但是，它不必向公众开放。对于验证器节点，我们建议配置“persistent_peers”并向公众关闭此端口。

附加端口:

- `1317`:[Lite Client Daemon](/zh/How-to/Start-LCD.md) (LCD) 的默认端口，可以由 `terrad rest-server` 执行。 LCD 提供了一个 HTTP RESTful API 层，以允许应用程序和服务通过 RPC 与您的“terrad”实例进行交互。有关使用示例，请参阅 [Terra REST API](https://lcd.terra.dev/swagger/)。除非你有使用它，否则你不需要打开这个端口。

- `26660`:与[Prometheus](https://prometheus.io)数据库交互的默认端口，可用于监控环境。在默认配置中，此端口未打开。

- `26657`:RPC 协议的默认端口。由于此端口用于查询和发送交易，因此必须打开它才能提供来自 `terrad` 的查询服务。

::: 危险警告
除非您计划运行公共节点，否则不要向公众开放端口“26657”。
:::

## 作为守护进程运行服务器

`terrad` 必须一直运行。它可以通过多种方式保持运行，但我们建议您将 `terrad` 注册为 `systemd` 服务，以便在系统重新启动和其他事件发生时自动启动。

## 将 terrad 注册为服务

1、在`/etc/systemd/system/terrad.service`中创建服务定义文件，如下例所示: 

```
[Unit]
Description=Terra Daemon
After=network.target

[Service]
Type=simple
User=terra
ExecStart=/data/terra/go/bin/terrad start
Restart=on-abort

[Install]
WantedBy=multi-user.target

[Service]
LimitNOFILE=65535
```

2. 为您的环境修改“Service”部分。 即使您增加了打开文件的数量，您也必须包含 `LimitNOFILE`。

3. 运行`systemctl daemon-reload`和`systemctl enable terrad`。

##控制服务

使用`systemctl` 来启动、停止和重启服务。 
```bash
# Start
systemctl start terrad
# Stop
systemctl stop terrad
# Restart
systemctl restart terrad
```

## Access logs

使用 `journalctl -t` 可以访问整个日志，反向访问整个日志，以及最新和连续的日志

```bash
# Entire log
journalctl -t terrad
# Entire log reversed
journalctl -t terrad -r
# Latest and continuous
journalctl -t terrad -f
```
