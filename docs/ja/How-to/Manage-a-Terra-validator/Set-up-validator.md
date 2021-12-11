# Terraバリデーターを登録する

これは、Terraバリデーターを設定するための詳細なステップバイステップガイドです。 基本的な検証ノードのセットアップは簡単ですが、強力なアーキテクチャとセキュリティ機能を備えた本番品質のベリファイアノードを実行するには多くのセットアップが必要であることに注意してください。

バリデーターの設定の詳細については、[追加のリソース](./Overview.md#additional-resources)を参照してください。

## 前提条件

-[完全なTerraノードを実行する方法](/ja/How-to/Run-a-full-Terra-node/Hardware-requirements.html)を完了しました。これは、ノードのインストール、接続、および構成の方法の概要を示しています。 。
-あなたは[terrad](../../Reference/terrad/)に精通しています。
-[Verifier FAQ](./faq.md)を読みました
-ハードウェア要件:[フルノードを実行するための要件](../Run-a-full-Terra-node/Hardware-requirements.md)を参照してください。

## 1。ノードのコンセンサス公開鍵を取得します

新しいバリデーターを作成するには、ノードのコンセンサスPubKeyが必要です。 走る: 

```bash
--pubkey=$(terrad tendermint show-validator)
```

## 2。新しいバリデーターを作成します

::: tipトークンを取得
Terradがウォレットアドレスを認識するためには、トークンが含まれている必要があります。 テストネットの場合は、[蛇口](https://faucet.terra.money/)を使用してLunaをウォレットに送信します。 メインネットをご利用の場合は、既存のウォレットから資金を送金してください。 ほとんどのセットアップ手順では、1〜3ルナで十分です。
:::

バリデーターを作成し、自己委任を使用して初期化するには、次のコマンドを実行します。 `key-name`は、トランザクションの署名に使用される秘密鍵の名前です。 

```bash
terrad tx staking create-validator \
    --amount=5000000uluna \
    --pubkey=$(<your-consensus-PubKey>) \
    --moniker="<your-moniker>" \
    --chain-id=<chain_id> \
    --from=<key-name> \
    --commission-rate="0.10" \
    --commission-max-rate="0.20" \
    --commission-max-change-rate="0.01" \
    --min-self-delegation="1"
```

:::警告警告:
コミッションパラメータを指定すると、 `commission-max-change-rate`は` commission-rate`の変化率として測定されます。 たとえば、1％から2％への変更は100％のレート増加ですが、「commission-max-change-rate」は1％を測定します。
:::

## 3。バリデーターがアクティブであることを確認します

次のコマンドを実行すると何かが返される場合、バリデーターはアクティブです。 

```bash
terrad query tendermint-validator-set | grep "$(terrad tendermint show-validator)"
```

ファイル `〜/.terra/config/priv_validator.json`で` bech32`によってエンコードされた `address`を探しています。

:::警告注:
アクティブなバリデーターセットには、投票権が最も高い130のバリデーターのみが含まれます。
:::