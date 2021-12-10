# ローカルプライベートネットワークを構築する

検証者は、プライベートネットワークをセットアップして、パブリックネットワークに参加する前にTerraフルノードの実行に慣れることができます。

：：：ヒントLocalTerra
開発者であり、スマートコントラクト用にローカルのWASM対応プライベートテストネットをセットアップする場合は、[Download LocalTerra]（/ja/Tutorials/Smart-contracts/Setup-local-environment.html#download-）にアクセスしてください。 localterra）。
：：：

## 単一のノードを作成します

セットアップできる最も単純なTerraネットワークは、ノードが1つしかないローカルテストネットワークです。 シングルノード環境では、アカウントがあり、プライベートネットワークの唯一のバリデーター署名ブロックです。

1. ネットワークをガイドするジェネシスファイルを初期化します。 変数を独自の情報に置き換えます。

```bash
terrad init --chain-id=<testnet-name> <node-moniker>
```

2. Terraアカウントを生成します。 変数をアカウント名に置き換えます

```bash
terrad keys add <account-name>
```

::: tipトークンを取得
Terradがウォレットアドレスを認識するためには、トークンが含まれている必要があります。 テストネットの場合は、[蛇口]（https://faucet.terra.money/）を使用してLunaをウォレットに送信します。 メインネットをご利用の場合は、既存のウォレットから資金を送金してください。 ほとんどのセットアップ手順では、1〜3ルナで十分です。
：：：

## アカウントをGenesisに追加します

次のコマンドを実行してアカウントを追加し、初期残高を設定します。 

```bash
terrad add-genesis-account $(terrad keys show <account-name> -a) 100000000uluna,1000usd
terrad gentx <my-account> 10000000uluna --chain-id=<testnet-name>
terrad collect-gentxs
```

## プライベートTerraネットワークを開始します

次のコマンドを実行します。 

```bash
terrad start
```

プライベートTerraネットワークが正しく設定されている場合、 `terrad`ノードは` tcp：//localhost：26656`でノードを実行し、着信トランザクションをリッスンしてブロックに署名します。 