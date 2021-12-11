# 启动轻客户端守护进程(LCD)

::: 警告注意
Terra SDK 目前依赖于与正在运行的 LCD 服务器的活动连接。 如果您需要 SDK 的专用连接，请进行设置。
:::

轻客户端守护进程 (LCD) 为 RPC 端点提供了一个基于 REST 的适配器，这也有助于将 Amino 编码的区块链数据解码为可解析的 JSON。 这使应用程序能够通过简单的 HTTP 与节点通信。

要启用 REST API 和 Swagger，并启动 LCD，请完成以下步骤:

1. 打开`~/.terra/config/app.toml`。

2. 找到`API 配置` 部分(`[api]`)。

3. 将`enable = false`改为`enable = true`。 

```toml
# Enable defines if the API server should be enabled.
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

有关配置`App.toml`的更多信息，请访问[配置常规设置](/zh/How-to/Start-LCD.md)页面。 