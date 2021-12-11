# WASM

WASMモジュールは、[CosmWasm](https://cosmwasm.com)でサポートされているWebAssemblyスマートコントラクトの実行環境を実装します。

## 概念

### スマートコントラクト

スマートコントラクトは、人間が所有するアカウント、バリデーター、その他のスマートコントラクトなど、Terraブロックチェーン上の他のエンティティと対話できる自律エージェントです。すべてのスマートコントラクトには次のものがあります。

-一意の**契約アドレス**、アカウントは資金を保持します
-**コードID **、そのロジックを定義します
-独自の** Key-Valueストア**で、データを永続化および取得できます

#### 契約アドレス

インスタンス化後、各コントラクトには_contractaddress_と呼ばれるTerraアカウントアドレスが自動的に割り当てられます。アドレスはチェーン上のプログラムによって生成され、秘密鍵と公開鍵のペアは接続されておらず、契約番号の順序によって完全に決定できます。たとえば、2つの独立したTerraネットワークでは、最初のコントラクトは常にアドレス「terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5」を割り当て、2番目、3番目などは同様です。

#### コードID

Terraでは、コードのアップロードとコントラクトの作成は別々のイベントとして発生します。スマートコントラクトライターは、最初にWASMバイトコードをブロックチェーンにアップロードして_code ID_を取得し、次にそれを使用してコントラクトのインスタンスを初期化できます。ほとんどのコントラクトは同じ基本ロジックを共有し、初期構成のみが異なるため、このソリューションは効率的なストレージを促進します。交換可能なトークンやマルチシグニチャウォレットなどの一般的なユースケース向けの精査された高品質の契約は、新しいコードをアップロードしなくても簡単に再利用できます。

#### キー値ストレージ

各スマートコントラクトには、LevelDBに独自の秘密鍵スペースがあり、その前にコントラクトアドレスが付いています。契約コードは安全にサンドボックス化されており、新しいキーと値は、割り当てられたキースペースでのみ設定および削除できます。

### 交流

ユーザーはさまざまな方法でスマートコントラクトを操作できます。

#### インスタンス化

ユーザーは「MsgInstantiateContract」を送信することで新しいスマートコントラクトをインスタンス化できます。その中で、ユーザーは次のことができます。

-契約に所有者を割り当てます
-指定されたコードは、コードIDを介して契約で使用されます
-`InitMsg`を介して初期パラメータ/設定を定義します
-新しい契約のアカウントに初期資金を提供します
-契約を移行できるかどうかを示します(コードIDは変更できます)

`InitMsg`はJSONメッセージであり、予想される形式はコントラクトコードで定義されています。各コントラクトには、提供された `InitMsg`に従って初期状態を設定する方法を定義するセクションが含まれています。

#### 実行

ユーザーは、「MsgExecuteContract」を送信して定義された関数の1つを呼び出すことにより、スマートコントラクトを実行できます。その中で、ユーザーは次のことができます。

-`HandleMsg`で呼び出す関数を指定します
-契約に資金を送金します。これは実行中に発生する可能性があります

`HandleMsg`は、関数呼び出しパラメーターを含み、適切な処理ロジックにルーティングされるJSONメッセージです。そこから、コントラクトは関数の命令を実行します。その間、コントラクト自体の状態を変更できます。コントラクトは、自身の実行が終了した後にブロックチェーンメッセージ(「MsgSend」や「MsgSwap」など)のリストを返すことによってのみ、外部状態(他のコントラクトまたはモジュールの状態など)を変更できます。これらのメッセージは、 `MsgExecuteContract`と同じトランザクションに添付されます。いずれかのメッセージが無効な場合、トランザクション全体が無効になります。

#### 移民

ユーザーがコントラクトの所有者であり、コントラクトが移行可能としてインスタンス化されている場合、ユーザーは `MsgMigrateContract`を発行して、コードIDを新しいものにリセットできます。移行は `MigrateMsg`(JSONメッセージ)でパラメーター化されます。

#### 所有権の譲渡

スマートコントラクトの現在の所有者は、 `MsgUpdateContractOwner`を使用して、新しい所有者をコントラクトに再割り当てできます。

#### 聞く

コントラクトは、データ取得のためのクエリ関数または読み取り専用操作を定義できます。これにより、コントラクトは、低レベルのKey-Valueストアからの生のバイトの代わりにJSON応答を使用して豊富なカスタムデータエンドポイントを公開できます。ブロックチェーンの状態は変更できないため、ノードはトランザクションなしでクエリを直接実行できます。

ユーザーはJSON`QueryMsg`を使用して、どのクエリ関数と任意のパラメーターを指定できます。ガス料金がない場合でも、スパム対策の一環として、従量制の実行(無料)で決まるガスによってクエリ機能の実行が制限されます。

### Wasmer仮想マシン

WASMバイトコードの実際の実行は[wasmer](https://github.com/wasmerio/wasmer)によって実行されます。これは、計算のリソースコストを解決するために、従量制の実行を備えた軽量のサンドボックスランタイムを提供します。

#### ガスメーター

トランザクションを作成するための通常のガス料金に加えて、Terraはスマートコントラクトコードを実行するときに別のガスも計算します。これは**ガスメーター**によって追跡され、各オペコードの実行中に一定の乗数(現在は100に設定されています)を介してネイティブのテラガスに変換されます。

### ガソリン代

Wasmデータとイベントのコストは最大「1 *バイト」のガスです。イベントとデータを別の契約に渡すことも、対応としてガスの費用がかかります。 

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

最後にインスタンス化された契約番号のカウンター。 

### Code

- type: `map[uint64]CodeInfo`

コードIDを `CodeInfo`エントリにマップします。

### Contract Info

- type: `map[bytes]ContractInfo`

契約アドレスを対応する「ContractInfo」にマップします。  

### Contract Store

- type: `map[bytes]KVStore`

契約アドレスを専用のKVStoreにマップします。
## Message Types

### MsgStoreCode

新しいコードをブロックチェーンにアップロードし、成功した場合は、新しいコードIDを生成します。 `WASMByteCode`は、Base64としてエンコードされた非圧縮またはgzip圧縮されたバイナリデータとして受け入れられます。 

```go
type MsgStoreCode struct {
	Sender sdk.AccAddress `json:"sender" yaml:"sender"`
	//WASMByteCode can be raw or gzip compressed
	WASMByteCode core.Base64Bytes `json:"wasm_byte_code" yaml:"wasm_byte_code"`
}
```

### MsgInstantiateContract

スマートコントラクトの新しいインスタンスを作成します。 初期構成は、Base64でエンコードされたJSONメッセージである `InitMsg`で提供されます。 `Migratable`が` true`に設定されている場合、契約の所有者は契約のコードIDを新しいものにリセットできます。 

```go
type MsgInstantiateContract struct {
	//Sender is an sender address
	Sender string `protobuf:"bytes,1,opt,name=sender,proto3" json:"sender,omitempty" yaml:"sender"`
	//Admin is an optional admin address who can migrate the contract
	Admin string `protobuf:"bytes,2,opt,name=admin,proto3" json:"admin,omitempty" yaml:"admin"`
	//CodeID is the reference to the stored WASM code
	CodeID uint64 `protobuf:"varint,3,opt,name=code_id,json=codeId,proto3" json:"code_id,omitempty" yaml:"code_id"`
	//InitMsg json encoded message to be passed to the contract on instantiation
	InitMsg encoding_json.RawMessage `protobuf:"bytes,4,opt,name=init_msg,json=initMsg,proto3,casttype=encoding/json.RawMessage" json:"init_msg,omitempty" yaml:"init_msg"`
	//InitCoins that are transferred to the contract on execution
	InitCoins github_com_cosmos_cosmos_sdk_types.Coins `protobuf:"bytes,5,rep,name=init_coins,json=initCoins,proto3,castrepeated=github.com/cosmos/cosmos-sdk/types.Coins" json:"init_coins" yaml:"init_coins"`
}
```

### MsgExecuteContract

スマートコントラクトで定義された関数を呼び出します。 関数とパラメーターは、Base64でエンコードされたJSONメッセージである `ExecuteMsg`でエンコードされます。 

```go
type MsgExecuteContract struct {
	Sender     sdk.AccAddress   `json:"sender" yaml:"sender"`
	Contract   sdk.AccAddress   `json:"contract" yaml:"contract"`
	ExecuteMsg core.Base64Bytes `json:"execute_msg" yaml:"execute_msg"`
	Coins      sdk.Coins        `json:"coins" yaml:"coins"`
}
```

### MsgMigrateContract

移行可能なスマートコントラクトの所有者が発行して、コードIDを別のコードIDにリセットできます。 `MigrateMsg`は、Base64でエンコードされたJSONメッセージです。 

```go
type MsgMigrateContract struct {
	Owner      sdk.AccAddress   `json:"owner" yaml:"owner"`
	Contract   sdk.AccAddress   `json:"contract" yaml:"contract"`
	NewCodeID  uint64           `json:"new_code_id" yaml:"new_code_id"`
	MigrateMsg core.Base64Bytes `json:"migrate_msg" yaml:"migrate_msg"`
}
```

### MsgUpdateContractOwner

スマートコントラクトの所有者が所有権を譲渡するために発行することができます。

```go
type MsgUpdateContractOwner struct {
	Owner    sdk.AccAddress `json:"owner" yaml:"owner"`
	NewOwner sdk.AccAddress `json:"new_owner" yaml:"new_owner"`
	Contract sdk.AccAddress `json:"contract" yaml:"contract"`
}
```


## Parameters

WASMモジュールの部分空間は `wasm`です。 

```go
type Params struct {
	MaxContractSize    uint64 `json:"max_contract_size" yaml:"max_contract_size"`
	MaxContractGas     uint64 `json:"max_contract_gas" yaml:"max_contract_gas"`
	MaxContractMsgSize uint64 `json:"max_contract_msg_size" yaml:"max_contract_msg_size"`
}
```

### MaxContractSize

- type: `uint64`

コントラクトの最大バイトコードサイズ(バイト単位)。 

### MaxContractGas

- type: `uint64`

任意の実行期間中の最大契約ガス消費量。 

### MaxContractMsgSize

- type: `uint64`

コントラクトメッセージの最大サイズ(バイト単位)。 
