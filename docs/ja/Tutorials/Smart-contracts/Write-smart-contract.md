# 契約書を書く

::: ヒント
このチュートリアルで構築するスマートコントラクトの構成要素をよりよく理解するには、[完全なコントラクト](https://github.com/CosmWasm/cw-template)を確認してください。
:::

スマートコントラクトはシングルトンオブジェクトのインスタンスと見なすことができ、その内部状態はブロックチェーンに保存されます。ユーザーは、JSONメッセージを送信することでステータス変更をトリガーできます。また、ユーザーは、JSONメッセージとしてフォーマットされたリクエストを送信することでステータスを照会することもできます。これらのメッセージは、「MsgSend」や「MsgSwap」などのTerraブロックチェーンメッセージとは異なります。

スマートコントラクトライターとしてのあなたの仕事は、スマートコントラクトインターフェイスを定義する3つの関数を定義することです。

-`instantiate() `:初期状態を提供するためにコントラクトのインスタンス化中に呼び出されるコンストラクター
-`execute() `:ユーザーがスマートコントラクトのメソッドを呼び出したいときに呼び出されます
-`query() `:ユーザーがスマートコントラクトからデータを取得したいときに呼び出されます

このセクションでは、予想されるメッセージとその実装を定義します。

## テンプレートから開始

作業ディレクトリで、推奨されるフォルダー構造とビルドオプションを使用して、次のコマンドを実行することでスマートコントラクトをすばやく起動します。
```sh
cargo generate --git https://github.com/CosmWasm/cw-template.git --branch 0.16 --name my-first-contract
cd my-first-contract
```

これは、スマートコントラクトの基本的なテンプレートと構造を提供することから始めるのに役立ちます。 `src/lib.rs`ファイルで、標準のCosmWasmエントリポイント` instantiate() `、` execute() `、および` query() `が正しく公開され、接続されていることがわかります。

## 契約状況

開始テンプレートには、次の基本的な状態があります。 

- a singleton struct `State` containing:
  - a 32-bit integer `count`
  - a Terra address `owner`

```rust
//src/state.rs
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::Addr;
use cw_storage_plus::Item;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub count: i32,
    pub owner: Addr,
}

pub const STATE: Item<State> = Item::new("state");
```

Terraスマートコントラクトは、TerraのネイティブLevelDB(バイトベースのKey-Valueストア)を介して永続的な状態を維持できます。したがって、保持するデータには、後でデータのインデックスを作成して取得できる一意のキーを割り当てる必要があります。上記の例のシングルトンには、キー `config`(バイト単位)が割り当てられています。

データは生のバイトとしてのみ永続化できるため、構造またはデータ型の概念は、シリアル化関数と逆シリアル化関数のペアとして表現する必要があります。たとえば、オブジェクトはバイトとして格納する必要があるため、オブジェクトをバイトとしてエンコードしてブロックチェーンに保存する関数と、バイトをデコードしてコントラクトロジックが理解できるデータ型に戻す関数を提供する必要があります。クリーンな双方向マッピングを提供する限り、バイト表現の選択はあなた次第です。

幸い、CosmWasmチームは、[cosmwasm_storage](https://github.com/CosmWasm/cosmwasm/tree/master/packages/storage)などの便利なツールボックスを提供します。これにより、「シングルトン」などのデータコンテナに便利な高レベルの抽象化が提供されます。 「バケット」と「バケット」は、一般的なタイプ(構造やRust番号など)のシリアル化と逆シリアル化を自動的に提供します。

`State`構造が` count`と `owner`の両方をどのように保存するかに注意してください。さらに、 `derive`属性は、いくつかの便利な機能を自動的に実装するために使用されます。

- `Serialize`: provides serialization
- `Deserialize`: provides deserialization
- `Clone`: makes our struct copyable
- `Debug`: enables our struct to be printed to string
- `PartialEq`: gives us equality comparison
- `JsonSchema`: auto-generates a JSON schema for us

`Addr`は、接頭辞が` terra ... `である人間が読める形式のTerraアドレスを指します。 対応するものは「CanonicalAddr」です。これは、TerraアドレスのローカルでデコードされたBech32形式(バイト単位)を指します。


##メッセージをインスタンス化します

ユーザーが「MsgInstantiateContract」を介してブロックチェーン上にコントラクトを作成すると、「InstantiateMsg」が提供されます。 これにより、コントラクトにその構成と初期状態が提供されます。

Terraブロックチェーンでは、Ethereumとは異なり、コントラクトコードのアップロードとコントラクトのインスタンス化は別々のイベントとして扱われます。 これは、精査されたコントラクトプロトタイプの小さなグループが、同じ基本コードを共有するが、異なるパラメーターで構成された複数のインスタンスとして存在できるようにするためです(正規のERC20とそのコードを使用する複数のトークンを想像してください)。

### 例

コントラクトでは、コントラクトの作成者がJSONメッセージで初期状態を提供する必要があります。 

```json
{
  "count": 100
}
```

### Message Definition

```rust
//src/msg.rs

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub count: i32,
}

```

### ロジック

ここでは、最初のエントリポイント `instantiate()`を定義するか、コントラクトがインスタンス化され、その場所である `InstantiateMsg`を渡します。 メッセージからカウントを抽出し、初期状態を設定します。ここで、 

- `count` is assigned the count from the message
- `owner` is assigned to the sender of the `MsgInstantiateContract`

```rust
//src/contract.rs
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let state = State {
        count: msg.count,
        owner: info.sender.clone(),
    };
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    STATE.save(deps.storage, &state)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender)
        .add_attribute("count", msg.count.to_string()))
}
```

## 実行メッセージ

`ExecuteMsg`は、` MsgExecuteContract`を介して `execute()`関数に渡されるJSONメッセージです。 `InstantiateMsg`とは異なり、` ExecuteMsg`は、スマートコントラクトがユーザーに公開できるさまざまなタイプの機能を示すために、いくつかの異なるタイプのメッセージとして存在できます。 `execute()`関数は、これらのさまざまなタイプのメッセージを適切なメッセージハンドラロジックに逆多重化します。

### 例

#### インクリメント

すべてのユーザーが現在のカウントを1つ増やすことができます。 

```json
{
  "increment": {}
}
```

#### リブート

所有者のみがカウントを特定の数にリセットできます。  

```json
{
  "reset": {
    "count": 5
  }
}
```

### メッセージ定義

`ExecuteMsg`については、` enum`を使用して、コントラクトが理解できるさまざまなタイプのメッセージを再利用します。 `serde`プロパティは、プロパティキーをスネークケースと小文字で書き換えるため、JSON全体でシリアル化および逆シリアル化する場合は、` Increment`と `Reset`の代わりに` increment`と `reset`を使用します。

```rust
//src/msg.rs

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Increment {},
    Reset { count: i32 },
}
```

### Logic

```rust
//src/contract.rs

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Increment {} => try_increment(deps),
        ExecuteMsg::Reset { count } => try_reset(deps, info, count),
    }
}
```

これは `execute()`メソッドであり、Rustのパターンマッチングを使用して、受信した `ExecuteMsg`を適切な処理ロジックにルーティングし、受信したメッセージに基づいて` try_increment() `または` try_reset() `呼び出しをディスパッチします。 

```rust
pub fn try_increment(deps: DepsMut) -> Result<Response, ContractError> {
    STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
        state.count += 1;
        Ok(state)
    })?;

    Ok(Response::new().add_attribute("method", "try_increment"))
}
```

`try_increment()`のロジックに従うのは非常に簡単です。 ストレージへの変数参照を取得して、キー「b」configにあるシングルトンを更新します。これには、「src/state.rs」で定義された「config」コンビニエンス関数を介してアクセスできます。状態「OK」の結果で現在の状態カウントを更新します。最後に、「応答」で「OK」の結果を返すことにより、コントラクトの実行が正常に終了したことを確認します。 

```rust
//src/contract.rs

pub fn try_reset(deps: DepsMut, info: MessageInfo, count: i32) -> Result<Response, ContractError> {
    STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
        if info.sender != state.owner {
            return Err(ContractError::Unauthorized {});
        }
        state.count = count;
        Ok(state)
    })?;
    Ok(Response::new().add_attribute("method", "reset"))
}
```

リセットのロジックはインクリメントと非常に似ています。今回を除いて、最初にメッセージの送信者がリセット関数を呼び出すことが許可されているかどうかを確認します。

## QueryMsg

### Example

The template contract only supports one type of `QueryMsg`:

#### Balance

The request:

```json
{
  "get_count": {}
}
```

Which should return:

```json
{
  "count": 5
}
```

### Message Definition

データコントラクトのクエリをサポートするには、 `QueryMsg`形式(リクエストを表す)を定義し、クエリ出力の構造(この場合は` CountResponse`)を提供する必要があります。 `query()`は構造内のJSONを介してユーザーに情報を送り返すため、これを行う必要があります。また、応答の形状を知らせる必要があります。

`src/msg.rs`に以下を追加します。 

```rust
//src/msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
   //GetCount returns the current count as a json-encoded number
    GetCount {},
}

//We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CountResponse {
    pub count: i32,
}
```

### Logic

`query()`のロジックは、 `execute()`のロジックと似ている必要がありますが、エンドユーザーがトランザクションを実行せずに `query()`が呼び出されるため、 `env`パラメータがないため省略します。情報。 
```rust
//src/contract.rs

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCount {} => to_binary(&query_count(deps)?),
    }
}

fn query_count(deps: Deps) -> StdResult<CountResponse> {
    let state = STATE.load(deps.storage)?;
    Ok(CountResponse { count: state.count })
}
```

## Building the Contract

コントラクトを作成するには、次のコマンドを実行します。 これにより、最適化の前に予備的なエラーがないかチェックされます。  

```sh
cargo wasm
```

### Optimizing your build

::: warning NOTE
You will need [Docker](https://www.docker.com) installed to run this command.
:::

コストを最小限に抑え、ブロックチェーンのサイズ制限内にとどまるために、出力WASMバイナリファイルが可能な限り小さいことを確認する必要があります。 Rustスマートコントラクトのプロジェクトフォルダーのルートディレクトリで次のコマンドを実行します。 

```sh
cargo run-script optimize
```

Or, if you are on an arm64 machine:

```sh
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer-arm64:0.12.4
  ```

これにより、作業ディレクトリに `artifacts/my_first_contract.wasm`または` artifacts/my_first_contract-aarch64.wasm`のビルドが最適化されます。

:::警告メモ
rust-optimizerは、IntelマシンとARMマシンで異なるコントラクトを生成することに注意してください。 したがって、繰り返し可能なビルドの場合は、1つに固執する必要があります。
:::


## 構築

JSONスキーマの自動生成を利用するには、スキーマが必要な各データ構造を登録する必要があります。 

```rust
//examples/schema.rs

use std::env::current_dir;
use std::fs::create_dir_all;

use cosmwasm_schema::{export_schema, remove_schemas, schema_for};

use my_first_contract::msg::{CountResponse, HandleMsg, InitMsg, QueryMsg};
use my_first_contract::state::State;

fn main() {
    let mut out_dir = current_dir().unwrap();
    out_dir.push("schema");
    create_dir_all(&out_dir).unwrap();
    remove_schemas(&out_dir).unwrap();

    export_schema(&schema_for!(InstantiateMsg), &out_dir);
    export_schema(&schema_for!(ExecuteMsg), &out_dir);
    export_schema(&schema_for!(QueryMsg), &out_dir);
    export_schema(&schema_for!(State), &out_dir);
    export_schema(&schema_for!(CountResponse), &out_dir);
}
```

You can then build the schemas with:

```sh
cargo schema
```

新しく生成されたスキーマは、 `schema/`ディレクトリに表示されます。 以下は `schema/query_msg.json`の例です。 

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "QueryMsg",
  "anyOf": [
    {
      "type": "object",
      "required": ["get_count"],
      "properties": {
        "get_count": {
          "type": "object"
        }
      }
    }
  ]
}
```

You can use an online tool such as [JSON Schema Validator](https://www.jsonschemavalidator.net/) to test your input against the generated JSON schema.
