# 添加模块

将新模块添加到 Terra 核心时，您也必须将其添加到 Terra.js 中的多个位置。 要添加它，请完成以下步骤:

##  新建一个文件夹

在 `src/core` 文件夹中，创建一个新文件夹并以新模块命名。 例如，`src/core/greeting`。

## 添加消息

1. 在您为新模块创建的文件夹的子目录中注册新消息，如以下示例所示:

`src/core/greeting/msgs`

在这个例子中，假设您正在创建两条新消息，`MsgHello` 和 `MsgGoodbye`。 以下示例显示了 `MsgHello` 的代码，您可以从中推断出实现 `MsgGoodbye` 的方式。

```ts
import { JSONSerializable } from '../../../util/json';
import { AccAddress } from '../../strings'

/**
 * Just a simple greeting on the blockchain.
 */
export class MsgHello extends JSONSerializable<MsgHello.Data> {
  constructor(
    public recipient: AccAddress
  ) {
    super();
  }

  public static fromData(data: MsgHello.Data): MsgHello {
    const {
      value: { recipient }
    } = data;
    return new MsgHello(recipient);
  }

  public toData(): MsgHello.Data {
    const { recipient } = this;
    return {
      type: 'greeting/MsgHello',
      value: {
        recipient
      },
    };
  }
}

export namespace MsgHello {
  export interface Data {
    type: 'greeting/MsgHello';
    value: {
      recipient: AccAddress
    };
  }
}

```

1. 创建以下文件，它将为您的新消息建立索引。

`src/core/greeting/msgs/index.ts` 

```ts
import { MsgHello } from './MsgHello';
import { MsgGoodbye } from './MsgGoodbye';

export * from './MsgHello';
export * from './MsgGoodbye';

export type GreetingMsg = MsgHello | MsgGoodbye;

export namespace GreetingMsg {
  export type Data = MsgHello.Data | MsgGoodbye.Data;
}
```

3.在`src/core/Msg.ts`中注册消息，以便正确解析。

`src/core/Msg.ts` 

```ts
// import greeting module messages
...
import {
  MsgHello,
  MsgGoodbye,
  GreetingMsg
} from './greeting/msgs';
...

// register GreetingMsg
export type Msg =
  | BankMsg
  | DistributionMsg
  | GovMsg
  | GreetingMsg // ADD HERE
  | MarketMsg
  | MsgAuthMsg
  | OracleMsg
  | SlashingMsg
  | StakingMsg
  | WasmMsg;

...

// register GreetingMsg.Data
export namespace Msg {
  export type Data =
    | BankMsg.Data
    | DistributionMsg.Data
    | GovMsg.Data
    | Greeting.Data // ADD HERE
    | MarketMsg.Data
    | MsgAuthMsg.Data
    | OracleMsg.Data
    | SlashingMsg.Data
    | StakingMsg.Data
    | WasmMsg.Data;
...

  // register deserializer in Msg.fromData(...)
  export function fromData(data: Msg.Data): Msg {
  ...
      // greeting
      case 'greeting/MsgHello':
        return MsgHello.fromData(data);
      case 'greeting/MsgGoodbye':
        return MsgGoodbye.fromData(data);
  ...
  }
}
```

4.在`src/core/index.ts`中注册要导出的消息: 

```ts
...
// greeting
export 'greeting/msgs';
```

5. 添加参数更改。

Terra.js 提供了一种简单的方法来生成`ParameterChangeProposal`s，这是一个改变与模块关联的区块链参数的提议。 如果您的模块具有可以通过提案更改的参数，您应该创建以下文件:

`src/core/greeting/params.ts` 

```ts
import { ParamChange } from '..';
import { Convert } from '../../util/convert';

type MaxHellos = ParamChange.Type<
  'greeting',
  'maxhellos',
  number
>;

type MaxGoodbyes = ParamChange.Type<
  'greeting',
  'maxgoodbyes',
  number
>;

export type GreetingParamChange =
  | MaxHellos
  | MaxGoodbyes;

export namespace GreetingParamChange {
  export type Data =
    | ParamChange.Data.Type<MaxHellos>
    | ParamChange.Data.Type<MaxGoodbyes>
}

export interface GreetingParamChanges {
  greeting?: {
    maxhellos?: number;
    maxgoodbyes?: number;
  };
}

export namespace GreetingParamChanges {
  export const ConversionTable = {
    greeting: {
      maxhellos: [Convert.toNumber, Convert.toFixed],
      maxgoodbyes: [Convert.toNumber, Convert.toFixed],
    },
  };
}
```

6. Register parameter change types

`src/core/params/ParamChange.ts`

```ts
...
import { GreetingParamChange, GreetingParamChanges } from '../greeting/params';
...

export type ParamChanges = DistributionParamChanges &
  GovParamChanges &
  GreetingParamChanges & // ADD HERE
  MarketParamChanges &
  OracleParamChanges &
  SlashingParamChanges &
  StakingParamChanges &
  TreasuryParamChanges &
  WasmParamChanges;

export namespace ParamChanges {
  export const ConversionTable = {
    ...DistributionParamChanges.ConversionTable,
    ...GovParamChanges.ConversionTable,
    ...GreetingParamChanges.ConverstionTable, // ADD HERE
    ...MarketParamChanges.ConversionTable,
    ...OracleParamChanges.ConversionTable,
    ...SlashingParamChanges.ConversionTable,
    ...StakingParamChanges.ConversionTable,
    ...TreasuryParamChanges.ConversionTable,
    ...WasmParamChanges.ConversionTable,
  };

...

export type ParamChange =
  | DistributionParamChange
  | GovParamChange
  | GreetingParamChange // ADD HERE
  | MarketParamChange
  | OracleParamChange
  | SlashingParamChange
  | StakingParamChange
  | TreasuryParamChange
  | WasmParamChange;

...

```

## 向 LCDClient 添加 API 功能

如果新模块存在 API 端点，则需要将此功能添加到“LCDClient”，以便它们可以访问。

假设我们的 `greeting` 模块具有以下端点:

-`GET /greeting/hello/{accAddress}`
-`获取/问候/参数`

1. 使用以下内容创建`src/client/lcd/api/GreetingAPI.ts`:

```ts
import { BaseAPI } from "./BaseAPI";
import { AccAddress } from "../../../core/strings";

export interface GreetingParams {
  max_hellos: number;
  max_goodbyes: number;
}

export namespace GreetingParams {
  export interface Data {
    max_hellos: string;
    max_goodbyes: string;
  }
}

export class GreetingAPI extends BaseAPI {
  public async hello(accAddress: AccAddress): Promise<AccAddress[]> {
    return this.c
      .get<AccAddress[]>(`/greeting/hello/${accAddress}`)
      .then(d => d.result);
  }

  public async parameters(): Promise<GreetingParams> {
    return this.c
      .get<GreetingParams.Data>(`/greeting/parameters`)
      .then(d => d.result)
      .then(d => ({
        max_hellos: Number.parseInt(d.max_hellos),
        max_goodbyes: Number.parseInt(d.max_goodbyes)
      }));
  }
}
```

2. 在 `src/client/lcd/api/index.ts` 中注册 API 功能:

```ts
export * from './AuthAPI';
export * from './BankAPI';
export * from './DistributionAPI';
export * from './GovAPI';
export * from './GreetingAPI'; // ADD HERE
export * from './MarketAPI';
export * from './MsgAuthAPI';
export * from './OracleAPI';
export * from './SlashingAPI';
export * from './StakingAPI';
export * from './SupplyAPI';
export * from './TendermintAPI';
export * from './TreasuryAPI';
export * from './TxAPI';
export * from './WasmAPI';
```

3. 将功能添加到`src/client/lcd/LCDClient.ts`:

```ts
...
import {
  AuthAPI,
  BankAPI,
  DistributionAPI,
  GovAPI,
  GreetingAPI, // ADD HERE
  MarketAPI,
  MsgAuthAPI,
  OracleAPI,
  SlashingAPI,
  StakingAPI,
  SupplyAPI,
  TendermintAPI,
  TreasuryAPI,
  TxAPI,
  WasmAPI,
} from './api';
...


export class LCDClient {
  public config: LCDClientConfig;
  public apiRequester: APIRequester;

  // API access
  public auth: AuthAPI;
  public bank: BankAPI;
  public distribution: DistributionAPI;
  public gov: GovAPI;
  public greeting: GreetingAPI; // ADD HERE
  public market: MarketAPI;
  public msgauth: MsgAuthAPI;
  public oracle: OracleAPI;
  public slashing: SlashingAPI;
  public staking: StakingAPI;
  public supply: SupplyAPI;
  public tendermint: TendermintAPI;
  public treasury: TreasuryAPI;
  public wasm: WasmAPI;
  public tx: TxAPI;

  /**
   * Creates a new LCD client with the specified configuration.
   *
   * @param config LCD configuration
   */
  constructor(config: LCDClientConfig) {
    this.config = {
      ...DEFAULT_LCD_OPTIONS,
      ...config,
    };

    this.apiRequester = new APIRequester(this.config.URL);

    // instantiate APIs
    this.auth = new AuthAPI(this.apiRequester);
    this.bank = new BankAPI(this.apiRequester);
    this.distribution = new DistributionAPI(this.apiRequester);
    this.gov = new GovAPI(this.apiRequester);
    this.greeting = new GreetingAPI(this.apiRequester); // ADD HERE
    this.market = new MarketAPI(this.apiRequester);
    this.msgauth = new MsgAuthAPI(this.apiRequester);
    this.oracle = new OracleAPI(this.apiRequester);
    this.slashing = new SlashingAPI(this.apiRequester);
    this.staking = new StakingAPI(this.apiRequester);
    this.supply = new SupplyAPI(this.apiRequester);
    this.tendermint = new TendermintAPI(this.apiRequester);
    this.treasury = new TreasuryAPI(this.apiRequester);
    this.wasm = new WasmAPI(this.apiRequester);
    this.tx = new TxAPI(this);
  }
```
