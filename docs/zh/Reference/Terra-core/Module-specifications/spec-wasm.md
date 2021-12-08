# WASM

WASM 模块实现了 WebAssembly 智能合约的执行环境，由 [CosmWasm](https://cosmwasm.com) 提供支持。

## 概念

### 智能合约

智能合约是自主代理，能够与 Terra 区块链上的其他实体进行交互，例如人类拥有的账户、验证器和其他智能合约。每个智能合约都有：

- 一个唯一的**合约地址**，账户持有资金
- **代码 ID**，其中定义了其逻辑
- 它自己的**键值存储**，它可以在其中持久化和检索数据

#### 合约地址

实例化后，每个合约都会自动分配一个 Terra 账户地址，称为_合约地址_。地址是链上程序生成的，没有附带的私钥/公钥对，完全可以由合约的编号存在顺序决定。例如，在两个独立的 Terra 网络上，第一个合约将始终分配地址“terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5”，第二个、第三个等类似。

#### 代码 ID

在 Terra 上，代码上传和合约创建作为单独的事件发生。智能合约编写者首先将 WASM 字节码上传到区块链以获得 _code ID_，然后他们可以使用它来初始化该合约的实例。该方案促进了高效存储，因为大多数合约共享相同的底层逻辑，并且仅在初始配置上有所不同。针对常见用例（例如可互换代币和多重签名钱包）的经过审查的高质量合同可以轻松重复使用，无需上传新代码。

#### 键值存储

每个智能合约在 LevelDB 中都有自己的专用密钥空间，以合约地址为前缀。合约代码被安全地沙箱化，只能在其分配的键空间内设置和删除新的键和值。

### 相互作用

用户可以通过多种方式与智能合约进行交互。

#### 实例化

用户可以通过发送“MsgInstantiateContract”来实例化一个新的智能合约。在其中，用户能够：

- 为合同分配一个所有者
- 指定代码将通过代码 ID 用于合同
- 通过`InitMsg`定义初始参数/配置
- 为新合约的账户提供一些初始资金
- 表示合约是否可迁移（可以更改代码ID）

`InitMsg` 是一个 JSON 消息，其预期格式在合约代码中定义。每个合约都包含一个部分，该部分定义了如何根据提供的 `InitMsg` 设置初始状态。 

#### Execution

用户可以通过发送“MsgExecuteContract”来执行智能合约以调用其定义的功能之一。在其中，用户能够：

- 指定使用 `HandleMsg` 调用哪个函数
- 向合约发送资金，这在执行期间可能会发生

`HandleMsg` 是一个 JSON 消息，包含函数调用参数并被路由到适当的处理逻辑。从那里，合约执行函数的指令，在此期间可以修改合约自己的状态。合约只能在其自身执行结束后通过返回区块链消息列表（例如“MsgSend”和“MsgSwap”）来修改外部状态（例如其他合约或模块中的状态）。这些消息被附加到与 `MsgExecuteContract` 相同的事务中，如果任何消息无效，则整个事务无效。

#### 移民

如果用户是合约的所有者，并且合约被实例化为可迁移的，他们可以发出 `MsgMigrateContract` 将其代码 ID 重置为新的。迁移通过一个 `MigrateMsg`（一个 JSON 消息）进行参数化。

####所有权转让

智能合约的当前所有者可以使用 `MsgUpdateContractOwner` 将新的所有者重新分配给合约。

#### 询问

合约可以定义查询函数，或用于数据检索的只读操作。这允许合约使用 JSON 响应而不是来自低级键值存储的原始字节公开丰富的自定义数据端点。由于区块链状态无法改变，节点可以直接运行查询，无需交易。

用户可以使用 JSON `QueryMsg` 指定哪个查询函数以及任何参数。即使没有 gas 费用，查询函数的执行也会受到计量执行（不收费）确定的 gas 的限制，作为一种垃圾邮件保护形式。

### Wasmer 虚拟机

WASM 字节码的实际执行由 [wasmer](https://github.com/wasmerio/wasmer) 执行，它提供了一个轻量级的沙盒运行时，具有计量执行以解决计算的资源成本。

#### 燃气表

除了创建交易产生的常规 gas 费用外，Terra 在执行智能合约代码时还会计算单独的 gas。这是由 **gas meter** 跟踪的，它在每个操作码的执行过程中都会通过一个常数乘数（当前设置为 100）转换回原生 Terra 气体。

### 汽油费

Wasm 数据和事件花费的 gas 高达“1 * 字节”。将事件和数据传递给另一个合约也会花费 gas 作为回复。

## Data

### CodeInfo

```go
type CodeInfo struct {
	CodeID   uint64           `json:"code_id"`
	CodeHash core.Base64Bytes `json:"code_hash"`
	Creator  sdk.AccAddress   `json:"creator"`
}
```

### ContractInfo

```go
type ContractInfo struct {
	Address    sdk.AccAddress   `json:"address"`
	Owner      sdk.AccAddress   `json:"owner"`
	CodeID     uint64           `json:"code_id"`
	InitMsg    core.Base64Bytes `json:"init_msg"`
	Migratable bool             `json:"migratable"`
}
```

## State

### Last Code ID

- type: `uint64`

A counter for the last uploaded code ID.

### Last Instance ID

- type: `uint64`

最后实例化的合约编号的计数器。

### Code

- type: `map[uint64]CodeInfo`

将代码 ID 映射到 `CodeInfo` 条目。 

### Contract Info

- type: `map[bytes]ContractInfo`

将合约地址映射到其对应的“ContractInfo”。 

### Contract Store

- type: `map[bytes]KVStore`

将合约地址映射到其专用的 KVStore。

## Message Types

### MsgStoreCode

将新代码上传到区块链，如果成功则生成新的代码 ID。 `WASMByteCode` 被接受为未压缩或 gzipped 二进制数据，编码为 Base64。 

```go
type MsgStoreCode struct {
	Sender sdk.AccAddress `json:"sender" yaml:"sender"`
	// WASMByteCode can be raw or gzip compressed
	WASMByteCode core.Base64Bytes `json:"wasm_byte_code" yaml:"wasm_byte_code"`
}
```

### MsgInstantiateContract

创建智能合约的新实例。 `InitMsg` 中提供了初始配置，它是一个以 Base64 编码的 JSON 消息。 如果 `Migratable` 设置为 `true`，则允许合约的所有者将合约的代码 ID 重置为新的。

```go
type MsgInstantiateContract struct {
	// Sender is an sender address
	Sender string `protobuf:"bytes,1,opt,name=sender,proto3" json:"sender,omitempty" yaml:"sender"`
	// Admin is an optional admin address who can migrate the contract
	Admin string `protobuf:"bytes,2,opt,name=admin,proto3" json:"admin,omitempty" yaml:"admin"`
	// CodeID is the reference to the stored WASM code
	CodeID uint64 `protobuf:"varint,3,opt,name=code_id,json=codeId,proto3" json:"code_id,omitempty" yaml:"code_id"`
	// InitMsg json encoded message to be passed to the contract on instantiation
	InitMsg encoding_json.RawMessage `protobuf:"bytes,4,opt,name=init_msg,json=initMsg,proto3,casttype=encoding/json.RawMessage" json:"init_msg,omitempty" yaml:"init_msg"`
	// InitCoins that are transferred to the contract on execution
	InitCoins github_com_cosmos_cosmos_sdk_types.Coins `protobuf:"bytes,5,rep,name=init_coins,json=initCoins,proto3,castrepeated=github.com/cosmos/cosmos-sdk/types.Coins" json:"init_coins" yaml:"init_coins"`
}
```

### MsgExecuteContract

调用智能合约中定义的函数。 函数和参数在 `ExecuteMsg` 中编码，它是一个以 Base64 编码的 JSON 消息。

```go
type MsgExecuteContract struct {
	Sender     sdk.AccAddress   `json:"sender" yaml:"sender"`
	Contract   sdk.AccAddress   `json:"contract" yaml:"contract"`
	ExecuteMsg core.Base64Bytes `json:"execute_msg" yaml:"execute_msg"`
	Coins      sdk.Coins        `json:"coins" yaml:"coins"`
}
```

### MsgMigrateContract

可由可迁移智能合约的所有者发布，以将其代码 ID 重置为另一个。 `MigrateMsg` 是一个以 Base64 编码的 JSON 消息。

```go
type MsgMigrateContract struct {
	Owner      sdk.AccAddress   `json:"owner" yaml:"owner"`
	Contract   sdk.AccAddress   `json:"contract" yaml:"contract"`
	NewCodeID  uint64           `json:"new_code_id" yaml:"new_code_id"`
	MigrateMsg core.Base64Bytes `json:"migrate_msg" yaml:"migrate_msg"`
}
```

### MsgUpdateContractOwner

可以由智能合约的所有者发行以转移所有权。

```go
type MsgUpdateContractOwner struct {
	Owner    sdk.AccAddress `json:"owner" yaml:"owner"`
	NewOwner sdk.AccAddress `json:"new_owner" yaml:"new_owner"`
	Contract sdk.AccAddress `json:"contract" yaml:"contract"`
}
```


## Parameters

WASM 模块的子空间是`wasm`。 

```go
type Params struct {
	MaxContractSize    uint64 `json:"max_contract_size" yaml:"max_contract_size"`
	MaxContractGas     uint64 `json:"max_contract_gas" yaml:"max_contract_gas"`
	MaxContractMsgSize uint64 `json:"max_contract_msg_size" yaml:"max_contract_msg_size"`
}
```

### MaxContractSize

- type: `uint64`

最大合约字节码大小，以字节为单位。

### MaxContractGas

- type: `uint64`

任何执行期间的最大合同气体消耗。

### MaxContractMsgSize

- type: `uint64`

最大合同消息大小，以字节为单位。
