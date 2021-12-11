# ライトクライアントデーモン(LCD)を起動します

:::警告メモ
Terra SDKは現在、実行中のLCDサーバーへのアクティブな接続に依存しています。 SDK専用の接続が必要な場合は、設定してください。
:::

Light Client Daemon(LCD)は、RPCエンドポイント用のRESTベースのアダプターを提供します。これは、アミノエンコードされたブロックチェーンデータを解析可能なJSONにデコードするのにも役立ちます。 これにより、アプリケーションは単純なHTTPを介してノードと通信できるようになります。

REST APIとSwaggerを有効にし、LCDをアクティブ化するには、次の手順を実行します。

1. `〜/ .terra / config / app.toml`を開きます。

2. `API構成`セクション( `[api]`)を見つけます。

3. `enable = false`を` enable = true`に変更します。

```toml
# Enable defines if the API server should be enabled.
enable = true
```

4. オプション:Swaggerを有効にするには、 `swagger = flase`を` swagger = true`に変更してください。

```toml
#Swaggerは、Swaggerドキュメントを自動的に登録するかどうかを定義します。 
swagger = true
```

5. 再起動します。

再起動後、LCDが使用可能になります。

Terra REST APIエンドポイントの詳細については、[Swaggerドキュメント](https://lcd.terra.dev/swagger/)を参照してください。

`App.toml`の設定の詳細については、[設定の一般設定](/ja/How-to/Start-LCD.md)ページをご覧ください。 