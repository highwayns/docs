# 编写合约

::: 小费
为了更好地理解您将在本教程中构建的智能合约的构建块，请查看 [完整合约](https://github.com/CosmWasm/cw-template)。
:::

可以将智能合约视为单例对象的实例，其内部状态保存在区块链上。用户可以通过向其发送 JSON 消息来触发状态变化，用户也可以通过发送格式为 JSON 消息的请求来查询其状态。这些消息不同于 Terra 区块链消息，例如“MsgSend”和“MsgSwap”。

作为智能合约编写者，您的工作是定义 3 个定义智能合约接口的函数:

- `instantiate()`:在合约实例化期间调用以提供初始状态的构造函数
- `execute()`:当用户想要调用智能合约上的方法时被调用
- `query()`:当用户想要从智能合约中获取数据时被调用

在本节中，我们将定义预期的消息及其实现。

## 从模板开始

在您的工作目录中，通过运行以下命令，使用推荐的文件夹结构和构建选项快速启动您的智能合约: 
```sh
cargo generate --git https://github.com/CosmWasm/cw-template.git --branch 0.16 --name my-first-contract
cd my-first-contract
```

这通过提供智能合约的基本样板和结构来帮助您入门。 你会在 `src/lib.rs` 文件中发现标准 CosmWasm 入口点 `instantiate()`、`execute()` 和 `query()` 被正确暴露和连接。

## 合约状态

起始模板具有以下基本状态:

- a singleton struct `State` containing:
  - a 32-bit integer `count`
  - a Terra address `owner`

```rust
// src/state.rs
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

Terra 智能合约能够通过 Terra 的原生 LevelDB(一种基于字节的键值存储)保持持久状态。因此，您希望保留的任何数据都应分配一个唯一的键，在该键上可以对数据进行索引并在以后检索。我们上面例子中的单例被分配了键`config`(以字节为单位)。

数据只能作为原始字节持久化，因此任何结构或数据类型的概念都必须表示为一对序列化和反序列化函数。例如，对象必须存储为字节，因此您必须提供将对象编码为字节以将其保存在区块链上的函数，以及将字节解码回合约逻辑可以理解的数据类型的函数。字节表示的选择取决于您，只要它提供干净的双向映射即可。

幸运的是，CosmWasm 团队提供了诸如 [cosmwasm_storage](https://github.com/CosmWasm/cosmwasm/tree/master/packages/storage) 之类的实用工具箱，它为数据容器提供了方便的高级抽象，例如“ singleton”和“bucket”，它们自动为常用类型(如结构和 Rust 数字)提供序列化和反序列化。

注意 `State` 结构如何同时保存 `count` 和 `owner`。此外，`derive` 属性用于自动实现一些有用的特征:

- `Serialize`: provides serialization
- `Deserialize`: provides deserialization
- `Clone`: makes our struct copyable
- `Debug`: enables our struct to be printed to string
- `PartialEq`: gives us equality comparison
- `JsonSchema`: auto-generates a JSON schema for us

`Addr`，是指以 `terra...` 为前缀的人类可读的 Terra 地址。 它的对应物是“CanonicalAddr”，它指代 Terra 地址的本地解码 Bech32 格式(以字节为单位)。


## 实例化消息

当用户通过“MsgInstantiateContract”在区块链上创建合约时，会提供“InstantiateMsg”。 这为合约提供了它的配置以及它的初始状态。

在 Terra 区块链上，与以太坊不同，合约代码的上传和合约的实例化被视为单独的事件。 这是为了允许一小组经过审查的合约原型作为多个实例存在，这些实例共享相同的基本代码但配置了不同的参数(想象一个规范的 ERC20，以及多个使用其代码的代币)。

### 例子

对于我们的合约，我们希望合约创建者在 JSON 消息中提供初始状态: 

```json
{
  "count": 100
}
```

### Message Definition

```rust
// src/msg.rs

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub count: i32,
}

```

### 逻辑

在这里，我们定义了我们的第一个入口点，`instantiate()`，或者合约被实例化并传递其 `InstantiateMsg` 的位置。 我们从消息中提取计数并设置我们的初始状态，其中:

- `count` is assigned the count from the message
- `owner` is assigned to the sender of the `MsgInstantiateContract`

```rust
// src/contract.rs
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

## 执行消息

`ExecuteMsg` 是通过 `MsgExecuteContract` 传递给 `execute()` 函数的 JSON 消息。 与 `InstantiateMsg` 不同，`ExecuteMsg` 可以作为几种不同类型的消息存在，以说明智能合约可以向用户公开的不同类型的功能。 `execute()` 函数将这些不同类型的消息多路分解到其适当的消息处理程序逻辑。

### 例子

#### 增量

任何用户都可以将当前计数加 1。

```json
{
  "increment": {}
}
```

#### 重启

只有所有者才能将计数重置为特定数字。 

```json
{
  "reset": {
    "count": 5
  }
}
```

### 消息定义

至于我们的 `ExecuteMsg`，我们将使用一个 `enum` 来复用我们的合约可以理解的不同类型的消息。 `serde` 属性以蛇形大小写和小写形式重写了我们的属性键，因此在跨 JSON 序列化和反序列化时，我们将使用 `increment` 和 `reset` 而不是 `Increment` 和 `Reset`。 

```rust
// src/msg.rs

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Increment {},
    Reset { count: i32 },
}
```

### Logic

```rust
// src/contract.rs

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

这是我们的 `execute()` 方法，它使用 Rust 的模式匹配将接收到的 `ExecuteMsg` 路由到适当的处理逻辑，根据接收到的消息调度 `try_increment()` 或 `try_reset()` 调用。

```rust
pub fn try_increment(deps: DepsMut) -> Result<Response, ContractError> {
    STATE.update(deps.storage, |mut state| -> Result<_, ContractError> {
        state.count += 1;
        Ok(state)
    })?;

    Ok(Response::new().add_attribute("method", "try_increment"))
}
```

遵循 `try_increment()` 的逻辑非常简单。 我们获取对存储的可变引用，以更新位于键“b”config”处的单例，可通过“src/state.rs”中定义的“config”便利函数访问。 然后我们通过返回带有新状态的“Ok”结果来更新当前状态的计数。 最后，我们通过返回带有“Response”的“Ok”结果来确认成功终止合约的执行。

```rust
// src/contract.rs

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

重置的逻辑与增量非常相似——除了这次，我们首先检查消息发送者是否被允许调用重置函数。 

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

为了支持对我们的数据契约的查询，我们必须定义一个 `QueryMsg` 格式(代表请求)，以及提供查询输出的结构——在这种情况下是 `CountResponse`。 我们必须这样做，因为`query()` 将通过结构中的 JSON 将信息发送回用户，并且我们必须使我们的响应的形状已知。

将以下内容添加到您的 `src/msg.rs`:

```rust
// src/msg.rs
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // GetCount returns the current count as a json-encoded number
    GetCount {},
}

// We define a custom struct for each query response
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct CountResponse {
    pub count: i32,
}
```

### Logic

`query()` 的逻辑应该类似于 `execute()` 的逻辑，除了因为 `query()` 是在没有最终用户进行交易的情况下调用的，我们省略了 `env` 参数，因为有 无信息。 
```rust
// src/contract.rs

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

要构建您的合约，请运行以下命令。 这将在优化之前检查任何初步错误。 

```sh
cargo wasm
```

### Optimizing your build

::: warning NOTE
You will need [Docker](https://www.docker.com) installed to run this command.
:::

您需要确保输出的 WASM 二进制文件尽可能小，以最大限度地减少费用并保持在区块链的大小限制之下。 在 Rust 智能合约的项目文件夹的根目录中运行以下命令。 

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

这将导致在您的工作目录中优化构建 `artifacts/my_first_contract.wasm` 或 `artifacts/my_first_contract-aarch64.wasm`。

::: 警告注意
请注意，rust-optimizer 会在 Intel 和 ARM 机器上生成不同的合约。 因此，对于可重复的构建，您必须坚持使用一个。
:::


## 架构

为了利用 JSON 模式自动生成，我们应该注册我们需要模式的每个数据结构。 

```rust
// examples/schema.rs

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

您新生成的模式应该在您的 `schema/` 目录中可见。 以下是`schema/query_msg.json` 的示例。 

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
