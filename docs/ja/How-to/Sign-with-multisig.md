# マルチシグニチャアカウントを使用して署名する

** Multisigアカウント**は、トランザクションに署名するために複数の署名が必要な特別なキーを持つTerraアカウントです。 これは、アカウントのセキュリティを向上させたり、複数の関係者に取引の実施に同意するよう要求したりする場合に非常に役立ちます。 次の方法を指定して、マルチシグニチャアカウントを作成できます。

-必要な署名のしきい値数
-署名に参加している公開鍵

マルチ署名アカウントを使用して署名するには、トランザクションは、そのアカウントに指定された別のキーによって個別に署名される必要があります。 次に、署名はマルチ署名に結合され、トランザクションの署名に使用できます。 既存の署名の数が必要なしきい値数より少ない場合、生成されたマルチ署名は無効と見なされます。

## マルチ署名キーを生成する 

```bash
terrad keys add --multisig=name1,name2,name3[...] --multisig-threshold=K new_key_name
```

`K`は、トランザクションで署名する必要のある秘密鍵の最小数であり、これらのトランザクションは、署名者として公開鍵アドレスを保持します。

`--multisig`フラグには、公開鍵に結合される公開鍵の名前が含まれている必要があります。公開鍵は、ローカルデータベースに生成され、` new_key_name`として保存されます。 `--multisig`を介して提供されるすべての名前は、ローカルデータベースにすでに存在している必要があります。

「--nosort」フラグが設定されていない限り、コマンドラインでキーが提供される順序は重要ではありません。つまり、次のコマンドは2つの同一のキーを生成します。

```bash
terrad keys add --multisig=p1,p2,p3 --multisig-threshold=2 multisig_address
terrad keys add --multisig=p2,p3,p1 --multisig-threshold=2 multisig_address
```

マルチシグアドレスは、即座に生成して、次のコマンドで出力することもできます。

```bash
terrad keys show --multisig-threshold=K name1 name2 name3 [...]
```

## トランザクションに署名します

:::警告メモ
この例では、[LocalTerra]（https://github.com/terra-money/LocalTerra）の `test1`、` test2`、 `test3`キーを使用しています。 後続の操作のために、それらを `terrad`キーストアにインポートします。
:::

### ステップ1:マルチ署名キーを作成する

`test1`と` test2`があり、 `test3`を使用してマルチシグニチャアカウントを作成するとします。

まず、「test3」の公開鍵をキーリングにインポートします。

```sh
terrad keys add \
    test3 \
    --pubkey=terrapub1addwnpepqgcxazmq6wgt2j4rdfumsfwla0zfk8e5sws3p3zg5dkm9007hmfysxas0u2
```

しきい値が2/3のマルチシグニチャキーを生成します。 

```sh
terrad keys add \
    multi \
    --multisig=test1,test2,test3 \
    --multisig-threshold=2
```

あなたはそのアドレスと詳細を見ることができます

```sh
terrad keys show multi

- name: multi
  type: multi
  address: terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m
  pubkey: terrapub1ytql0csgqgfzd666axrjzq3mxw59ys6yqcd3ydjvhgs0uzs6kdk5fp4t73gmkl8t6y02yfq7tvfzd666axrjzq3sd69kp5usk492x6nehqjal67ynv0nfqapzrzy3gmdk27la0kjfqfzd666axrjzq6utqt639ka2j3xkncgk65dup06t297ccljmxhvhu3rmk92u3afjuyz9dg9
  mnemonic: ""
  threshold: 0
  pubkeys: []
```

マルチシグニチャウォレットに10個のLUNAを追加しましょう

```bash
terrad tx send \
    test1 \
    terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m \
    10000000uluna \
    --chain-id=localterra \
    --gas=auto \
    --fees=100000uluna \
    --broadcast-mode=block
```

### ステップ2:マルチシグニチャトランザクションを作成する

マルチシグニチャアカウントから `terra1fmcjjt6yc9wqup2r06urnrd928jhrde6gcld6n`に5つのLUNAを送信します。 

```bash
terrad tx bank send \
    terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m \
    terra1fmcjjt6yc9wqup2r06urnrd928jhrde6gcld6n \
    5000000uluna \
    --gas=200000 \
    --fees=100000uluna \
    --chain-id=localterra \
    --generate-only > unsignedTx.json
```

ファイル `unsignedTx.json`には、JSONでエンコードされた署名されていないトランザクションが含まれています。

```json
{
  "type": "core/StdTx",
  "value": {
    "msg": [
      {
        "type": "bank/MsgSend",
        "value": {
          "from_address": "terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m",
          "to_address": "terra1fmcjjt6yc9wqup2r06urnrd928jhrde6gcld6n",
          "amount": [{ "denom": "uluna", "amount": "5000000" }]
        }
      }
    ],
    "fee": {
      "amount": [{ "denom": "uluna", "amount": "100000" }],
      "gas": "200000"
    },
    "signatures": null,
    "memo": ""
  }
}
```

### ステップ3:個別の署名

`test1`と` test2`を使用して署名し、個別の署名を作成します。
```sh
terrad tx sign \
    unsignedTx.json \
    --multisig=terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m \
    --from=test1 \
    --output-document=test1sig.json \
    --chain-id=localterra
```

```sh
terrad tx sign \
    unsignedTx.json \
    --multisig=terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m \
    --from=test2 \
    --output-document=test2sig.json \
    --chain-id=localterra
```

### ステップ4:マルチシグニチャを作成する

署名を組み合わせてトランザクションに署名します。 
```sh
terrad tx multisign \
    unsignedTx.json \
    multi \
    test1sig.json test2sig.json \
    --chain-id=localterra > signedTx.json
```

TXが署名されました:

```json
{
  "type": "core/StdTx",
  "value": {
    "msg": [
      {
        "type": "bank/MsgSend",
        "value": {
          "from_address": "terra1e0fx0q9meawrcq7fmma9x60gk35lpr4xk3884m",
          "to_address": "terra1fmcjjt6yc9wqup2r06urnrd928jhrde6gcld6n",
          "amount": [{ "denom": "uluna", "amount": "5000000" }]
        }
      }
    ],
    "fee": {
      "amount": [{ "denom": "uluna", "amount": "100000" }],
      "gas": "200000"
    },
    "signatures": [
      {
        "pub_key": {
          "type": "tendermint/PubKeyMultisigThreshold",
          "value": {
            "threshold": "2",
            "pubkeys": [
              {
                "type": "tendermint/PubKeySecp256k1",
                "value": "AjszqFJDRAYbEjZMuiD+ChqzbUSGq/RRu3zr0R6iJB5b"
              },
              {
                "type": "tendermint/PubKeySecp256k1",
                "value": "AjBui2DTkLVKo2p5uCXf68SbHzSDoRDESKNtsr3+vtJI"
              },
              {
                "type": "tendermint/PubKeySecp256k1",
                "value": "A1xYF6iW3VSia08ItqjeBfpai+xj8tmuy/Ij3YquR6mX"
              }
            ]
          }
        },
        "signature": "CgUIAxIBoBJA6oiaOabR1jBIbDyFj/1sYjMbYNxe+BSTnp0XYM+frC8fHxXStJ+Tl5Hf+3BsyBg1wvX1pDFsTHI7nMKNlJkKfRJAAt2cOJuViJvtwVRGwhNDORmekDSbcodnyMHTwz2Ve4db7B9m/CjYZmJtilV7zk8RWVX6Agjrl/0K5PSQZv29/A=="
      }
    ],
    "memo": ""
  }
}
```

### ステップ5:ブロードキャストトランザクション 
```sh
terrad tx broadcast signedTx.json \
    --chain-id=localterra \
    --broadcast-mode=block
```
