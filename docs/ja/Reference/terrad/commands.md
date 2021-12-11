# コマンド

このセクションでは、実行中の `terrad`プロセスに接続するためのコマンドラインインターフェイスである` terrad`から使用できるコマンドについて説明します。

## `add-genesis-account`

ジェネシスアカウントを `genesis.json`に追加します。 

**Syntax**
```bash
terrad add-genesis-account <address-or-key-name> '<amount><coin-denominator>,<amount><coin-denominator>'
```

**Example**
```bash
terrad add-genesis-account acc1 '200000000uluna,550000ukrw'
```

## `collect-gentxs`

ジェネシストランザクションを収集し、「genesis.json」に出力します。 

**Syntax**
```bash
terrad collect-gentxs
```

## `debug`

アプリケーションのデバッグを支援します。 構文とサブコマンドのリストについては、[debug subcommands](subcommands.md#debug-addr)を参照してください。 

## `export`

ステータスをJSONにエクスポートします。

**Syntax**
```bash
terrad export
```

## `gentx`

ジェネシストランザクションを `genesis.json`に追加します。 

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

ヘルプ情報を表示します。 

**Syntax**
```bash
terrad help
```

## `init`

バリデーターとノードの構成ファイルを初期化します。

**Syntax**
```bash
terrad init <moniker>
```

**Example**
```bash
terrad init myNode
```

## `keys`

キーリングコマンドを管理します。 構文とサブコマンドのリストについては、[keys subcommands](subcommands.md#keys-add)を参照してください。


## `migrate`
ソースコードをターゲットバージョンに移行し、STDOUTに出力します。 

**Syntax**
```bash
terrad migrate <path-to-genesis-file>
```

**Example**
```bash
terrad migrate/genesis.json --chain-id=testnet --genesis-time=2020-04-19T17:00:00Z --initial-height=4000
```

## `query`

クエリを管理します。 構文とサブコマンドのリストについては、[クエリサブコマンド](subcommands.md#query-account)を参照してください。 

## `rosetta`

Rosettaサーバーを作成します。

**Syntax**
```bash
terrad rosetta
```

## `start`

Tendermintを使用して、フルノードアプリケーションをインプロセスまたはアウトプロセスで実行します。 デフォルトでは、アプリケーションはTendermintプロセスで実行されます。

**Syntax**
```bash
terrad start
```

## `status`

リモートノードのステータスを表示します。 

**Syntax**
```bash
terrad status
```

## `tendermint`

Tendermintプロトコルを管理します。 サブコマンドのリストについては、[]()を参照してください。 

## `testnet`

指定された数のディレクトリでテストネットを作成し、各ディレクトリに必要なファイルを入力します。 

**Syntax**
```bash
terrad testnet
```

**Example**
```bash
terrad testnet --v 6 --output-dir ./output --starting-ip-address 192.168.10.2
```

## `tx`

ハッシュ、アカウントシーケンス、または署名によってトランザクションを取得します。 構文とサブコマンドの完全なリストについては、[txサブコマンド](subcommands.md#tx-authz-exec)を参照してください。 

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

結果ページの指定されたイベントに一致するトランザクションを取得します。 

**Syntax**
```bash
terrad query txs --events '<event>' --page <page-number> --limit <number-of-results>
```

**Example**
```bash
terrad query txs --events 'message.sender=cosmos1...&message.action=withdraw_delegator_reward' --page 1 --limit 30
```

## `unsafe-reset-all`

ブロックチェーンデータベースをリセットし、アドレスブックファイルを削除して、 `data/priv_validator_state.json`を作成状態にリセットします。 

**Syntax**
```bash
terrad unsafe-reset-all
```

## `validate-genesis`

デフォルトの場所または指定された場所にあるジェネシスファイルを確認します。

**Syntax**
```bash
terrad validate-genesis </path-to-file>
```

**Example**
```bash
terrad validate-genesis </genesis.json>
```

## `version`

実行しているTerraのバージョンに戻ります。

**Syntax**
```bash
terrad version
```
