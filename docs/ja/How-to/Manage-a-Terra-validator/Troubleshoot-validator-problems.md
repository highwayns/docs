# バリデーターの問題を解決する

以下は、バリデーターノードとそのソリューションを実行するときに発生する可能性のあるいくつかの一般的な問題です。

## 検証者の投票権は0です

バリデーターの投票力が0の場合、バリデーターは自動的にバインド解除されています。 メインネットでは、バリデーターが最後の「10000」ブロックで「9500」に投票しない場合（テストネットの最後の「100」ブロックで「50」）、バインドが解除されます。 ブロックは約5秒ごとに提案されるため、約13時間（テストネットでは約4分）以内に応答しないバリデーターはバインドされません。 この問題は通常、テラードプロセスがクラッシュしたときに発生します。

議決権を検証者に戻すには:

1. `terrad`が実行されていない場合は、再起動します。 

  ```bash
  terrad start
  ```


1.ノード全体が最新のブロックに到達するのを待ってから、以下を実行します。

  ```bash
  terrad tx slashing unjail <terra> --chain-id=<chain_id> --from=<from>
  ```

どこ


-` <terra> `はベリファイアアカウントのアドレスです。
-` <name> `はオーセンティケーターアカウントの名前です。 この情報を見つけるには、「テラキーリスト」を実行します。

   ::: 暖かい
   アンジェイルを実行する前にテラドが同期するのを待たなかった場合、エラーメッセージはバリデーターがまだ投獄されていることを通知します。
   :::

1.バリデーターをもう一度チェックして、議決権が回復したかどうかを確認します。 

  ```bash
  terrad status
  ```

議決権が以前より少なくなっている場合は、ダウンタイムにより議決権が行使されていないためです。

## 開いているファイルが多すぎるため、Terradがクラッシュしました

Linuxの各プロセスで開くことができるデフォルトのファイル数は「1024」です。 ご存知のとおり、開かれた `terrad`の数がこの数を超えているため、プロセスがクラッシュします。 この問題を解決するために:

1. `ulimit -n 4096`を実行して、開くことができるファイルの数を増やします。

2. `terradstart`でプロセスを再開します。

   `systemd`または別のプロセスマネージャーを使用して` terrad`を起動する場合は、それらを構成する必要があります。 次の例の `systemd`ファイルは問題を修正します: 

  ```systemd
  #/etc/systemd/system/terrad.service
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


## Oracleの投票エラー

[Terra Oracleフィーダー]（https://github.com/terra-money/oracle-feeder）から次のエラーメッセージが表示される場合があります。

     `ブロードキャストエラー:コード:3、raw_log:バリデーターが存在しません:terravaloperxxx`

このメッセージの理由は次のとおりです。

### バリデーターがアクティブではありません

次のいずれかの理由により、バリデーターがアクティブにならない場合があります。

-検証者は投獄されています。 この問題を解決するには、次のコマンドを実行してバリデーターを「非アクティブ化」してください。 

    `terrad tx slashing unjail <terra> --chain-id=<chain_id> --from=<from>`

-バリデーターがアクティブな[バリデーターセット]（/ja/validators.html#delegations）にありません。 このセットには、最初の130個のバリデーターのみが含まれます。 この問題を解決するには、合計ベットを増やして上位130に含まれるようにします。

### ネットワークが間違っています。

オラクルフィーダーが間違ったネットワークに送信している可能性があります。 この問題を解決するには、指定されたliteクライアントデーモン（LCD）を使用してフィーダーを実行します。 

```bash
nom start vote --\
  --source http://localhost:8532/latest \
  --lcd ${LCD} \
  --chain-id "${CHAIN_ID}" \
  --validator "${VALIDATOR_KEY}" \
  --password "${PASSWORD}" \
```

投票者が接続されているLCDは、ノードとは異なるネットワークで実行されている可能性があります。 さまざまなネットワークのリモートLCDは次のとおりです。

-コロンバスメインネットのhttps://lcd.terra.dev
-ボンベイテストネットのhttps://bombay-lcd.terra.dev

ノードが接続されているのと同じネットワークのLCDを必ず指定してください。

[ローカルLCD]（../Start-LCD.md）（たとえば、localhost:1317）を実行する場合は、LCDが同じノードに接続されていることを確認してください。

## メモリの断片化が原因でTerradがクラッシュする

[この問題]（https://github.com/terra-money/core/issues/592）で述べられているように、大量のメモリ割り当てはメモリの断片化の問題を引き起こす可能性があります。 一時的な解決策は、50〜100MBなどの小さいwasmキャッシュサイズを使用することです。

If you use v0.5.10+,

```toml
contract-memory-cache-size = 100
```

If you use v0.5.7~v0.5.9,
```toml
write-vm-memory-cache-size = 100
``` 