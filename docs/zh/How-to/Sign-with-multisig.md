# 使用多重签名帐户签名

**multisig 帐户** 是具有特殊密钥的 Terra 帐户，需要多个签名才能签署交易。 这对于提高帐户的安全性或要求多方同意进行交易非常有用。 可以通过指定以下方式创建多重签名帐户:

- 所需签名的阈值数量
- 参与签名的公钥

要使用多重签名帐户进行签名，交易必须由为该帐户指定的不同密钥单独签名。 然后，签名将组合成一个多重签名，可用于签署交易。 如果存在的签名数量少于所需的阈值数量，则生成的多重签名将被视为无效。

## 生成多重签名密钥 

```bash
terrad keys add --multisig=name1,name2,name3[...] --multisig-threshold=K new_key_name
```

`K` 是必须签署交易的最小私钥数量，这些交易携带公钥地址作为签名者。

`--multisig` 标志必须包含将组合成一个公钥的公钥的名称，该公钥将在本地数据库中生成并存储为 `new_key_name`。 通过 `--multisig` 提供的所有名称必须已经存在于本地数据库中。

除非设置了“--nosort”标志，否则在命令行上提供键的顺序无关紧要，即以下命令生成两个相同的键:

```bash
terrad keys add --multisig=p1,p2,p3 --multisig-threshold=2 multisig_address
terrad keys add --multisig=p2,p3,p1 --multisig-threshold=2 multisig_address
```

Multisig 地址也可以即时生成并通过 which 命令打印: 

```bash
terrad keys show --multisig-threshold=K name1 name2 name3 [...]
```

## 签署交易

::: 警告注意
此示例使用来自 [LocalTerra](https://github.com/terra-money/LocalTerra) 的 `test1`、`test2`、`test3` 键。 将它们导入您的 `terrad` 密钥库以进行后续操作。
:::

### 第 1 步:创建多重签名密钥

假设您有 `test1` 和 `test2` 想要使用 `test3` 创建一个多重签名帐户。

首先将“test3”的公钥导入您的密钥环。

```sh
terrad keys add \
    test3 \
    --pubkey=terrapub1addwnpepqgcxazmq6wgt2j4rdfumsfwla0zfk8e5sws3p3zg5dkm9007hmfysxas0u2
```

生成具有 2/3 阈值的多重签名密钥。

```sh
terrad keys add \
    multi \
    --multisig=test1,test2,test3 \
    --multisig-threshold=2
```

你可以看到它的地址和详细信息

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

让我们将 10 个 LUNA 添加到多重签名钱包中:

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

### 第 2 步:创建多重签名交易

我们想从我们的多重签名账户发送 5 个 LUNA 到 `terra1fmcjjt6yc9wqup2r06urnrd928jhrde6gcld6n`。

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

文件 `unsignedTx.json` 包含以 JSON 编码的未签名交易。

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

### 第 3 步:单独签名

使用 `test1` 和 `test2` 签名并创建单独的签名。 
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

### 第 4 步:创建多重签名

结合签名来签署交易。 
```sh
terrad tx multisign \
    unsignedTx.json \
    multi \
    test1sig.json test2sig.json \
    --chain-id=localterra > signedTx.json
```

TX 现在已签署: 

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

### 第 5 步:广播交易 
```sh
terrad tx broadcast signedTx.json \
    --chain-id=localterra \
    --broadcast-mode=block
```
