# Start the light client daemon(LCD)

::: warning NOTE
The Terra SDKs currently rely on an active connection to a running LCD server. Please set it up if you need a dedicated connection for the SDKs.
:::

The light client daemon (LCD) provides a REST-based adapter for the RPC endpoints, which also helps for decoding the Amino-encoded blockchain data into parseable JSON. This enables apps to communicate with a node through simple HTTP.

To enable the REST API and Swagger, and to start the LCD, complete the following steps:

1. Open `~/.terra/config/app.toml`.

2. Locate the `API Configuration` section (`[api]`).

3. Change `enable = false` to `enable = true`.

```toml
# Enable defines if the API server should be enabled.
enable = true
```

4. Optional: To enable Swagger, change `swagger = flase` to `swagger = true`.

```toml
# Swagger defines if swagger documentation should automatically be registered.
swagger = true
```
5. Restart.

Once restarted, the LCD will be available.

For more information about the Terra REST API endpoints, see the [Swagger documentation](https://lcd.terra.dev/swagger/).

For more information on configuring `App.toml`, visit the [configure general settings](/How-to/Start-LCD.md) page.
