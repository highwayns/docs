# terradを使用

次の情報は、「terrad」(実行中の「terrad」プロセスに接続するコマンドラインインターフェイス)から使用できる機能について説明しています。 Terraにアクセスするために使用します。コマンドラインのより一般的な情報については、 `terrad--help`を実行してください。特定の `terrad`コマンドの詳細については、` terrad query--help`などの `-h`または` --help`フラグをコマンドに追加してください。

## 訪問ノード

ステータスを照会してトランザクションを送信するには、ピアツーピアネットワーク全体へのアクセスポイントであるノードに接続する必要があります。自分のフルノードを実行することも、他の人のノードに接続することもできます。

### 独自のフルノードを実行する

独自のフルノードを実行するのが最も安全な選択ですが、比較的高いリソースを必要とします。独自のフルノードを実行するための要件と `terrad`をインストールするためのチュートリアルの詳細については、[インストール](../../How-to/Run-a-full-Terra-node/Build-Terra-を参照してください。 Core.md)。既存のTerraネットワークに接続する方法を説明するチュートリアルについては、[Join Network](../../How-to/Run-a-full-Terra-node/Join-public-network.md)を参照してください。

### リモートフルノードに接続する

自分のフルノードを実行したくない場合は、他の人のフルノードに接続できます。悪意のある演算子が意図的に誤ったクエリ結果を返したり、トランザクションを確認したりする可能性があるため、演算子の選択を検討するときは、信頼できる演算子を優先してください。ただし、秘密鍵はコンピューターまたは元帳ハードウェアデバイスにローカルに保存されているため、資金を盗むことはできません。フルノードオペレーターの可能なオプションには、バリデーター、ウォレットプロバイダー、またはエクスチェンジが含まれます。

フルノードに接続するには、 `https://<host>:<port>`の形式のアドレスが必要です(例: `https://77.87.106.33:26657`)。このアドレスは、信頼することを選択したフルノードオペレーターによって伝達される必要があります。このアドレスは次のセクションで使用します。

## terradを構成する

`terrad`を使用すると、Terraネットワークを自分で実行しているかどうかに関係なく、Terraネットワークで実行されているノードと対話できます。 `terrad`を設定するには、`〜/.terra/config/`ディレクトリの` config.toml`ファイルを編集します。

## ブロックチェーンのステータスを照会する

アカウントの残高、結合されたトークンの数、未払いの報酬など、ブロックチェーンからのすべての関連情報をクエリするには、「テラドクエリ」を使用してください。次のリストは、委任者にとって最も便利なコマンドの一部を示しています。

```bash
# query account balances and other account-related information
terrad query account

# query the list of validators
terrad query staking validators

# query the information of a validator given their address
terrad query staking validator <validatorAddress>

# query all delegations made from a delegator given their address
# (note: delegator addresses are regular account addresses)
terrad query staking delegations <delegatorAddress>

# query a specific delegation made from a delegator to a validator
terrad query staking delegation <delegatorAddress> <validatorAddress>

# query the rewards of a delegator given a delegator address (e.g. terra10snjt8dmpr5my0h76xj48ty80uzwhraqalu4eg)
terrad query distr rewards <delegatorAddress>
```

## トランザクションを送信する

状態変更命令を含むモジュールメッセージを含むトランザクションを送信してブロックチェーンと対話するには、これらの命令が処理されてブロックに含まれます。「terradtx」を使用してください。 すべてのトランザクション送信操作は、次の形式に従います。

```bash
terrad tx ...
```

できますありなタイプのキンラ動の詳細振は、各移動の入力を参照してください。

### シミュレートされた取引

実境にできせずに冷凍をくるとこれ、化されにゾフラめランザ転る 

```bash
terrad tx send \
    <from_key_or_address> \
    <to_address> \
    <coins> \
    --chain-id=<chain_id> \
    --dry-run
```

### 送信せずにトランザクションを生成する

トランザクションを作成してJSON形式でSTDOUTに出力するには、コマンドラインパラメータリストに「--generate-only」を追加します。 これにより、トランザクションの作成と署名をブロードキャストから分離できます。 

```bash
terrad tx send \
    <from_key_or_address> \
    <to_address> \
    <coins> \
    --chain-id=<chain_id> \
    --generate-only > unsignedSendTx.json
```

```bash
terrad tx sign \
    --chain-id=<chain_id> \
    --from=<key_name> \
    unsignedSendTx.json > signedSendTx.json
```

次のように入力して、トランザクションの署名を確認できます。 

```bash
terrad tx sign --validate-signatures signedSendTx.json
```

You can broadcast the signed transaction to a node by providing the JSON file to the following command:

```bash
terrad tx broadcast --node=<node> signedSendTx.json
```


## 料金

Terraプロトコルネットワークでの取引には、処理する前に取引手数料を含める必要があります。この料金は、トランザクションの実行に必要なガスの支払いに使用されます。式は次のとおりです。

$$コスト=ガス* gasPrices $$

`gas`はトランザクションによって異なります。トランザクションが異なれば、必要な「ガス」の量も異なります。取引のガス量は処理中に計算されますが、ガスフラグの自動値を使用して事前に見積もる方法があります。もちろん、これは単なる見積もりです。トランザクションに十分な `gas`が提供されるようにする場合は、フラグ` --gas-adjustment` \(デフォルトは `1.0` \)を使用してこの見積もりを調整できます。

`gasPrice`は` gas`の単位あたりの価格です。各バリデーターは `min-gas-price`値を設定し、` min-gas-price`よりも大きい `gasPrice`のトランザクションのみを含みます。

トランザクション `fees`は` gas`と `gasPrice`の積です。ユーザーとして、3つのうち2つを入力する必要があります。 `gasPrice`/` Fees`が高いほど、トランザクションがブロックに含まれる可能性が高くなります。

### 料金の設定

料金またはガス価格は、トランザクションごとに提供される場合がありますが、同時に提供されることはありません。ほとんどのユーザーは通常、料金を提供します。これは、元帳に含まれるトランザクションに対して最終的に発生する最終的なコストであり、ガス価格はバリデーターに基づいて動的に計算されるためです。

バリデーターは、トランザクションを含めるかどうかを決定するために使用する最小ガス価格を指定します。これは、 `CheckTx`中に計算されます。ここで、` gasPrices> = minGasPrices`です。取引によって提供される料金は、検証者が要求する**任意の**額面以上でなければならないことに注意してください。

:::警告メモ
バリデーターは、メモリープール内の「gasPrice」を介してトランザクションの優先度の決定を開始する場合があるため、より高い料金またはガス価格を提供すると、ブロックに含まれる優先度が高くなる可能性があります。
:::

直接使用料: 

```bash
terrad tx send ... --fees=100000uluna
```

料金を使用する場合、バリデーターは、料金を推定ガス消費量で割って、トランザクションに正しい優先順位を正しく割り当てることにより、暗黙のminGasPricesを計算します。

ガソリン価格を使用します(金額と金額のコンマ区切りリストを使用します)。 

```bash
terrad tx send ... --gas-prices=0.15uusd
```

### 税

Terraの税金と手数料は、手数料の金額に含める必要があります。 ユーザーは、既存の方法を使用して、 `--fees`フラグを使用せずに、ガス価格フラグを使用して取引できます。 既存のガス料金に加えて、これは自動的に税金と返品料金を計算します。

### 自動コスト見積もり

`--gas`フラグを使用して、トランザクションで消費できる最大ガスを制限することをお勧めします。 `--gas = auto`を渡すと、トランザクションを実行する前にガスが自動的に推定されます。

シミュレーションの終了からトランザクションの実際の実行までの間に状態の変化が発生する可能性があるため、ガスの見積もりは不正確になる可能性があります。そのため、トランザクションが正常にブロードキャストされるように、元の見積もりに加えて調整が適用されます。

調整は `--gas-adjustment`フラグで制御でき、デフォルト値は1.0です。

「terrad」から直接コスト見積もりを取得するには:

```bash
terrad tx estimate-fee ...\
    --gas-prices=0.15uusd
    --gas-adjustment=1.4
```

要使用费用估算创建和发送交易，请使用以下模板作为格式: 

```bash
terrad tx send ... \
    --gas-prices=0.15uusd
    --gas=auto
    --gas-adjustment=1.4
```

## シェルの自動完了

`completion`コマンドを使用して、一般的なUNIXシェルインタープリター(` bash`や `zsh`など)のオートコンプリートスクリプトを生成できます。このコマンドは、` terrad`および `terrad`に使用できます。 これにより、コマンドラインを使用するときにTerraCoreエンドポイントと対話するためのより便利な方法が可能になります。

`bash`完了スクリプトを生成する場合は、次のコマンドを実行します。 

```bash
terrad completion > terrad_completion
terrad completion > terrad_completion
```

`zsh`完了スクリプトを生成する場合は、次のコマンドを実行します 

```bash
terrad completion --zsh > terrad_completion
terrad completion --zsh > terrad_completion
```

::: warning NOTE
ほとんどのUNIXシステムでは、このようなスクリプトを `.bashrc`または` .bash_profile`にロードして、Bashのオートコンプリートを有効にすることができます。

```bash
echo '. terrad_completion' >> ~/.bashrc
echo '. terrad_completion' >> ~/.bashrc
```

シェルのオートコンプリートを有効にする方法については、オペレーティングシステムが提供するインタプリタのユーザーマニュアルを参照してください。 
:::
