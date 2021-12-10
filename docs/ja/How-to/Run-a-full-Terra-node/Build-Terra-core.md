## Terraコアのソースコードを取得する

`git`を使用して[Terracore]（https://github.com/terra-money/core/）を取得し、最新の安定バージョンを含む` main`ブランチを確認します。

LocalTerraを使用するか、バリデーターを実行する場合は、 `v0.x.x-oracle`タグを使用してください。 それ以外の場合は、 `v0.x.x`タグを使用します。 

```bash
git clone https://github.com/terra-money/core
cd core
git checkout [latest version]
```

**例:** 
```bash
git clone https://github.com/terra-money/core
cd core
git checkout v0.5.6-oracle
```


## ソースコードからTerraコアを構築する

Terraコアをビルドし、 `terrad`実行可能ファイルを` GOPATH`環境変数にインストールします。 

```bash
make install
```

## Terraコアのインストールを確認します

Terraコアが正しくインストールされていることを確認します。

```bash
terrad version --long
```

次の例は、Terraコアが正しくインストールされている場合のバージョン情報を示しています。

```bash
name: terra
server_name: terrad
client_name: terrad
version: 0.3.0-24-g3684f77
commit: 3684f77faadf6cf200d18e15763316d5d9c5a496
build_tags: netgo,ledger
go: go version go1.13.4 darwin/amd64
```

::: ヒント
`terrad:command not found`エラーメッセージが返される場合は、次のコマンドを実行して、Goバイナリパスが正しく構成されていることを確認してください。 

``
export PATH=$PATH:$(go env GOPATH)/bin
```
::: 