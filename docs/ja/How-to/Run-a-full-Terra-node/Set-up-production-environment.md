# 本番環境を構築する

次の情報を使用して、実稼働レベルの完全なTerraノードをセットアップおよび管理します。

バリデーターノードの実行については、[バリデーターガイド]（/ja/How-to/Manage-a-Terra-validator/Overview.md）にアクセスしてください。

:::警告推奨オペレーティングシステム
このガイドは、RPMベースのLinuxディストリビューションに対してのみテストされています。 実稼働環境を正常にセットアップするために、RPMベースのLinuxシステムでのセットアップを検討してください。
:::

## 専用ユーザーを作成する

`terrad`はスーパーユーザーアカウントを必要としませんが、セットアッププロセス中に特定のファイルを作成および変更するにはスーパーユーザー権限が必要です。 `terrad`を実行するときは、通常のユーザーを使用することを強くお勧めします。

## `terrad`が開くことができるファイルの最大数を増やします

`terrad`のデフォルト設定は1024ファイルを開くことです。 この数を増やすことをお勧めします。

`/etc/security/limits.conf`を変更して数を増やします。ここで、` nofile`は `terrad`で開くことができるファイルの数です。  
```
*                soft    nofile          65535
*                hard    nofile          65535
```

## 共通ポート

`terrad`は次のTCPポートを使用します。環境に合わせて設定を切り替えてください。

ほとんどのバリデーターは、次のポートを開くだけで済みます。

-`26656`:P2Pプロトコルのデフォルトポート。このポートは他のノードとの通信に使用され、ネットワークに参加するには開く必要があります。ただし、一般に公開する必要はありません。バリデーターノードの場合、「persistent_peers」を構成し、このポートを公開することをお勧めします。

追加のポート:

-`1317`:[Lite Client Daemon]（/ja/How-to/Start-LCD.md）（LCD）のデフォルトポート。`terradrest-server`で実行できます。 LCDはHTTPRESTful APIレイヤーを提供し、アプリケーションとサービスがRPCを介して「terrad」インスタンスと対話できるようにします。使用例については、[Terra REST API]（https://lcd.terra.dev/swagger/）を参照してください。使用しない限り、このポートを開く必要はありません。

-`26660`:[Prometheus]（https://prometheus.io）データベースと対話するためのデフォルトのポート。環境の監視に使用できます。デフォルト設定では、このポートは開いていません。

-`26657`:RPCプロトコルのデフォルトポート。このポートはトランザクションのクエリと送信に使用されるため、 `terrad`からクエリサービスを提供するにはポートを開く必要があります。

:::危険警告
パブリックノードを実行する予定がない限り、ポート「26657」を公開しないでください。
:::

## サーバーをデーモンとして実行します

`terrad`は常に実行されている必要があります。さまざまな方法で実行を継続できますが、システムの再起動やその他のイベントが発生したときに自動的に開始されるように、 `terrad`を` systemd`サービスとして登録することをお勧めします。

## terradをサービスとして登録する

1. 次の例に示すように、 `/etc/systemd/system/terrad.service`にサービス定義ファイルを作成します。 

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

2. ご使用の環境の「サービス」セクションを変更します。 開くファイルの数を増やしても、 `LimitNOFILE`を含める必要があります。

3. `systemctldaemon-reload`と` systemctl enableterrad`を実行します。

## コントロールサービス

`systemctl`を使用して、サービスを開始、停止、再起動します。

```bash
# Start
systemctl start terrad
# Stop
systemctl stop terrad
# Restart
systemctl restart terrad
```

## Access logs

`journalctl -t`を使用して、ログ全体にアクセスし、ログ全体に逆アクセスし、最新の継続的なログにアクセスします 

```bash
# Entire log
journalctl -t terrad
# Entire log reversed
journalctl -t terrad -r
# Latest and continuous
journalctl -t terrad -f
```
