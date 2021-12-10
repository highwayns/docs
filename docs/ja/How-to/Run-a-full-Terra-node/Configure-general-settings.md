# 一般設定を構成する

次の情報は、 `〜/.terra/config/`ディレクトリにある最も重要なノード構成設定について説明しています。これらの設定を独自の情報で更新することをお勧めします。

WASM設定を含む構成設定の詳細については、各構成ファイルを参照してください。

## ニックネームを更新する

1. `〜/.terra/config/config.toml`を開きます。

2. `moniker`を変更してノードに名前を付けます。

```toml
#このノードのカスタムの人間が読める名前
moniker = "cx-mbp-will.local"
```

## 名簿をダウンロード

`addrbook.json`を選択してダウンロードし、`〜/.terra/config/addrbook.json`に移動します。これにより、他のノードを見つけるために選択したピアダイヤルがノードに提供されます。

p2pとシードの設定の詳細については、[追加設定]（#additional-settings）にアクセスしてください。

-メインネットの名簿：

```bash
wget https://network.terra.dev/addrbook.json -O〜/.terra/config/addrbook.json
```

-テストネットの名簿：

```bash
wget https://network.terra.dev/testnet/addrbook.json -O〜/.terra/config/addrbook.json
```

## ガソリンの最低価格を更新

1. `〜/.terra/config/app.toml`を開きます。

2. `minimum-gas-prices`を変更して、検証者がトランザクションを検証し、スパムを防ぐために受け入れる最小ガス価格を設定します。

```toml
#検証者が処理するために受け入れることをいとわない最低ガス価格
# トレード。取引手数料は、あらゆる宗派の最低要件を満たしている必要があります
#この構成で指定します（たとえば、0.25token1; 0.0001token2）。 
minimum-gas-prices = "0.01133uluna、0.15uusd、0.104938usdr、169.77ukrw、428.571umnt、0.125ueur、0.98ucny、16.37ujpy、0.11ugbp、10.88uinr、0.19ucad、0.14uchf、0.19uaud、0.2usgd、4.62 uthb、1.25usek、1.25unok、0.9udkk、2180.0uidr、7.6uphp、1.17uhkd "
```


## ライトクライアントデーモン（LCD）を起動します

REST APIとSwaggerを有効にし、LCDをアクティブ化するには、次の手順を実行します。

1. `〜/.terra/config/app.toml`を開きます。

2. `API構成`セクション（ `[api]`）を見つけます。

3. `enable = false`を` enable = true`に変更します。

```toml
#有効化APIサーバーを有効にするかどうかを定義します。
enable = true
```

4. オプション：Swaggerを有効にするには、 `swagger = flase`を` swagger = true`に変更してください。

```toml
#Swaggerは、Swaggerドキュメントを自動的に登録するかどうかを定義します。
swagger = true
```
5. 再起動します。

再起動後、LCDが使用可能になります。

Terra REST APIエンドポイントの詳細については、[Swaggerドキュメント]（https://lcd.terra.dev/swagger/）を参照してください。

## その他の設定

### `seed_mode`

シードモードでは、ノードはピアのネットワークを継続的にクロールし、一部のピアを共有し、接続の着信時に切断します。

```toml
#シードモード、ノードは継続的にネットワークをクロールし、
#ピア。別のノードがアドレスを要求すると、応答して切断します。
#ピアツーピア交換リアクターが無効になっている場合、それは機能しません。
seed_mode = true
```

### `seeds`

シードノードを手動で識別するには、 `config.toml`で次の設定を編集します。

```toml
#シードノードのコンマ区切りリスト
seeds = "id100000000000000000000000000000000@1.2.3.4:26656,id200000000000000000000000000000000@2.3.4.5:4444"
```

### `persistent_peers`

指定するノードは、ノードをp2pネットワークに固定するのに役立つ信頼できる永続的なピアです。接続に失敗した場合は、24時間以内にダイヤルされ、自動的にリダイヤルされます。自動リダイヤル機能は指数バックオフを使用し、24時間接続を試みた後に停止します。

「persistent_peers_max_dial_period」の値がゼロより大きい場合、指数バックオフ中、各永続ピアへの各呼び出し間の一時停止は「persistent_peers_max_dial_period」を超えず、自動リダイヤルプロセスが続行されます。

```toml
#永続的な接続を維持するためのノードのコンマ区切りリスト
persistent_peers = "id100000000000000000000000000000000@1.2.3.4:26656,id200000000000000000000000000000000@2.3.4.5:26656"
```

RosettaAPIを介してTerraをCoinbaseと統合します。 Rosettaは、ブロックチェーンデータを標準化された形式に編成するオープンソースAPIであり、開発者がクロスチェーンアプリケーションを構築するのに便利です。 Rosettaはチェーンごとに特定のコードを作成しませんが、RosettaAPIを使用する交換にさまざまなブロックチェーンを統合できます。

詳細については、[Rosettaドキュメントサイト]（https://www.rosetta-api.org/docs/welcome.html）にアクセスしてください。 