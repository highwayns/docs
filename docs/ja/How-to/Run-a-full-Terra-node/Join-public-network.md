# パブリックネットワークに参加する

[単純なローカルTerraネットワークを実行する]（Set-up-private-network.md）、次の手順を実行して、ColumbusメインネットワークやBombayテストネットワークなどのパブリックTerraネットワークに参加します。

## 設定

これらの手順は、まったく新しいフルノードを最初から設定するために使用されます。

### モニカを初期化して構成する

まず、ノードを初期化し、必要な構成ファイルを作成します。 

```bash
terrad init <your_custom_moniker>
```

:::警告モニカーキャラクター
モニカにはASCII文字のみを含めることができます。Unicode文字を使用すると、ネットワーク上の他のピアがノードにアクセスできなくなります。
:::

この `moniker`は後で`〜/.terra/config/config.toml`ファイルで編集できます。

``` toml
#このノードのカスタムの人間が読める名前 
moniker = "<your_custom_moniker>"
```

### 取引の最低ガス価格を設定する（推奨）

`〜/.terra/config/app.toml`を編集して、指定された最低価格を下回る暗黙のガソリン価格で着信トランザクションを拒否することにより、スパム対策を有効にすることができます。 Terraメインネットの推奨最低ガス価格は次のとおりです。

``` toml
#検証者が処理するために受け入れることをいとわない最低ガス価格
# トレード。 取引手数料は、あらゆる宗派の最低要件を満たしている必要があります
#この構成で指定します（たとえば、0.25token1,0.0001token2）
minimum-gas-prices = "0.01133uluna,0.15uusd,0.104938usdr,169.77ukrw,428.571umnt,0.125ueur,0.98ucny,16.37ujpy,0.11ugbp,10.88uinr,0.19ucad,0.14uchf,0.19uaud,0.2usgd,4.62uthb,1.25usek,1.25unok,0.9udkk,2180.0uidr,7.6uphp,1.17uhkd"
```

これでフルノードが初期化されました！

## ネットワークを選択してください

** Genesis File **と** Seed **を設定して、参加するネットワークを指定します。 過去のネットワークの詳細については、[Networks Repo]（https://github.com/terra-money/testnet）にアクセスしてください。

| Network      | Description | Homepage                                                             | Address Book                                    |
| ------------ | ----------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `columbus-5` | Mainnet     | [Link](https://github.com/terra-money/mainnet/tree/master/columbus-5)| https://network.terra.dev/addrbook.json         |
| `bombay-12`  | Testnet     | [Link](https://github.com/terra-money/testnet/tree/master/bombay-12) | https://network.terra.dev/testnet/addrbook.json |

### ジェネシスファイルをダウンロードする

参加するネットワークを選択し、その `genesis.json`ファイルを`〜/.terra/config`ディレクトリにダウンロードします。 このファイルは、トランザクションの再生および同期時に使用されるジェネシスアカウントの残高とパラメーターを指定します。

-コロンバス-5メインネットの起源:

```bash
wget https://columbus-genesis.s3.ap-northeast-1.amazonaws.com/columbus-5-genesis.json -O ~/.terra/config/genesis.json
```
- Bombay-12 testnet genesis:

```bash
wget https://raw.githubusercontent.com/terra-money/testnet/master/bombay-12/genesis.json -I ~/.terra/config/genesis.json
```

[networks repo]（https://github.com/terra-money/testnet）の `latest`ディレクトリを使用していることに注意してください。このディレクトリには、最新のテストネットの詳細が含まれています。 別のテストネットに接続する場合は、正しいファイルを取得していることを確認してください。

terradを開始するには、次のように入力します。

```bash
terrad start
```

### 名簿のダウンロード（メインネットに推奨）

ダイヤルするノードを選択し、そのノードの他のノードを見つけるには、 `addrbook.json`をダウンロードして、`〜/.terra/config/addrbook.json`に移動します。

詳細設定については、[シードノードの定義]（#define-seed-nodes）にアクセスしてください。

-コロンバスメインネット名簿: 
```bash
wget https://network.terra.dev/addrbook.json -O ~/.terra/config/addrbook.json
```

- Bombay testnet address book:

```bash
wget https://raw.githubusercontent.com/terra-money/testnet/master/bombay-12/addrbook.json -O ~/.terra/config/addrbook.json
```

## ネットワークに接続する

### ノードを実行します

次のコマンドを使用して、ノード全体を起動します。 
```bash
terrad start
```

すべてがスムーズに実行されているかどうかを確認します。 
```bash
terrad status
```

### ノードの同期を待機しています

:::警告同期開始時刻
ノードが同期を開始するのに少なくとも1時間かかります。この種の待機は正常です。同期のトラブルシューティングを行う前に、同期が開始されるまで1時間待ちます。
:::

ノードは、作成中のすべてのトランザクションを再生し、ブロックチェーン状態をローカルで再作成することにより、ネットワークに追いつきます。これには時間がかかるため、同期中に離れることができるように、安定した接続に設定していることを確認してください。

-ベリファイアは、[Terra Finder]（https://finder.terra.money）を使用してネットワークステータスを確認できます。
-フルノードが現在のブロックの高さに同期されると、[フルノードリスト]（https://terra.stake.id/）に表示されます。
-テスト中の同期を高速化するには、[テスト用ノード同期]（#node-sync-for-testing）を参照してください。

おめでとう！フルノードオペレーターとしてネットワークに正常に参加しました。バリデーターの場合は、[Terraバリデーターの管理]（/ja/How-to/Manage-a-Terra-validator/Overview.html）に進んで、次の手順を確認してください。

###データバックアップを使用する（メインネットに推奨）

データバックアップがある既存のネットワーク（信頼できるプロバイダーから）に接続している場合は、最初から同期するのではなく、バックアップをノードストレージにロードすることを選択できます。

ChainLayerが提供するColumbus-5ノードのデータバックアップにアクセスするには、[Terra QuickSync]（https://terra.quicksync.io/）にアクセスしてください。

## 付録

### テストネットをアップグレードする

これらの手順は、以前のテストネットで実行されていて、最新のテストネットにアップグレードしたいフルノードに適用されます。

#### データをリセット

まず、廃止されたファイルを削除し、データをリセットします。

```bash
rm ~/.terra/config/genesis.json
rm ~/.terra/config/addrbook.json
terrad unsafe-reset-all
```

これで、ノードは元の状態になりますが、元の `priv_validator.json`と` config.toml`は保持されます。以前にセンチネルノードまたはフルノードを設定したことがある場合でも、ノードはそれらに接続しようとしますが、アップグレードされていない場合は失敗する可能性があります。

::: 危険
各ノードに一意の `priv_validator.json`があることを確認してください。 `priv_validator.json`を古いノードから複数の新しいノードにコピーしないでください。同じ `priv_validator.json`で2つのノードを実行すると、二重署名が発生します。
:::

#### ソフトウェアの更新

今がソフトウェアをアップグレードする時です。プロジェクトディレクトリに移動して、以下を実行します。
`` `bash
git checkout master && git pull
作る
`` `

:::警告メモ
このステップで問題が発生した場合は、GOの最新の安定バージョンがインストールされているかどうかを確認してください。
:::

ここでは、最新の安定バージョンが含まれているため、 `master`を使用していることに注意してください。どのテストネットにどのバージョンが必要かについては、[testnetリポジトリ]（https://github.com/terra-money/testnet）と[Terra Coreリリースページ]（https://github.com/terra-money）を参照してください。/core/releases）各バージョンの詳細をご覧ください。フルノードが完全にアップグレードされました！

### エクスポートステータス

Terraは、アプリケーションの状態全体をJSONファイルにダンプできます。これは、手動分析に役立ち、新しいネットワークの作成ファイルとしても使用できます。

エクスポートステータス: 

```bash
terrad export > [filename].json
```

特定の高さから状態を導出することもできます\（その高さのブロック処理の最後に\）: 

```bash
terrad export --height [height] > [filename].json
```

エクスポート状態から新しいネットワークを開始する場合は、 `--for-zero-height`フラグを使用して以下をエクスポートします。 

```bash
terrad export --height [height] --for-zero-height > [filename].json
```

### ノード同期テスト

前のチェックとより速く同期したい場合があります。 このコマンドは、非実稼働環境の上級ユーザーのみが使用する必要があります。 テスト中の同期プロセスを高速化するには、次のコマンドを使用します。

```bash
terrad start --x-crisis-skip-assert-invariants
```

::: warning NOTE

トレントとピアの詳細については、[Tendermintのドキュメント]（https://github.com/tendermint/tendermint/blob/master/docs/tendermint-core/using-tendermint.md#peers）にアクセスしてください。

:::

シードモードとp2p設定については、[その他の設定ページ]（/ja/How-to/Run-a-full-Terra-node/Configure-general-settings.html#additional-settings）にアクセスしてください。 