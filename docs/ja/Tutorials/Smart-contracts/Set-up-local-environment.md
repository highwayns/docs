# 環境設定

スマートコントラクト開発者は、コントラクトをColumbusメインネットにデプロイする前に、コントラクトを作成、コンパイル、アップロード、およびテストする必要があります。この開発プロセスでは、複数の反復で複数の可動部品を手動で処理する必要がある場合があるため、開発を簡素化するために、最初に専用の環境をセットアップすると便利です。

## TerraCoreをローカルにインストールする

[build Terra core](/ja/How-to/Run-a-full-Terra-node/Build-Terra-core.md)にアクセスして、最新バージョンのTerra Coreをインストールし、利用可能なバージョンの `terrad`を入手します。スマートコントラクトを使用するには、ローカルのTerraテストネットワークに接続するために必要になります。

## LocalTerraをダウンロードする

Terraスマートコントラクトを使用するには、WASM統合を含むTerraネットワークにアクセスできる必要があります。

このチュートリアルでは、[LocalTerra](https://github.com/terra-money/localterra)を使用します。これは、ローカルのWASM対応のプライベートテストネットを簡単に開始できるパッケージです。これにより、プライベートTerraブロックチェーンを完全に制御し、世界の状態を簡単にリセットできるようになるため、開発の摩擦が軽減されます。

** LocalTerra **を使用するには、最初に[Docker入門チュートリアル](https://www.docker.com/get-started)に従って、Dockerがコンピューターにインストールされていることを確認する必要があります。また、マシンで[Docker Compose](https://docs.docker.com/compose/install/)をセットアップして構成する必要があります。 

```sh
git clone --depth 1 https://github.com/terra-money/localterra
cd localterra
docker-compose up
```

これで、次の構成でマシン上でローカルテストネットを実行する必要があります。 

-ノードはRPCポート `26657`を監視します
-LCDはポート `1317`で動作します
-[http://localhost:3060/swagger](http://localhost:3060/swagger)に関するSwaggerドキュメント

次のニーモニックを持つアカウントは、ネットワーク上の唯一のバリデーターであり、スマートコントラクトの使用を開始するのに十分な資金があります。 

``
satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn
``

## Rustをインストールする

理論的にはWASMスマートコントラクトは任意のプログラミング言語で記述できますが、CosmWasmに成熟したライブラリとツールがある唯一の言語であるRustのみを使用することを現在お勧めします。 このチュートリアルでは、[ここ](https://www.rust-lang.org/tools/install)で説明されているように、最新バージョンのRustもインストールする必要があります。

Rustとそのツールチェーン(貨物など)をインストールした後、 `wasm32-unknown-unknown`コンパイルターゲットを追加する必要があります。 

```sh
rustup default stable
rustup target add wasm32-unknown-unknown
```

Then, install `cargo-generate`, which we will need for bootstrapping new CosmWasm smart contracts via a template.

```sh
cargo install cargo-generate --features vendored-openssl
```

Next, install `cargo-run-script`, which is required to optimize smart contracts.

```sh
cargo install cargo-run-script
```
