# モジュールを追加

新しいモジュールをTerraコアに追加するときは、Terra.jsの複数の場所にも追加する必要があります。 追加するには、次の手順を実行します。

## 新しいフォルダを作成します

`src/core`フォルダーに新しいフォルダーを作成し、新しいモジュールにちなんで名前を付けます。 たとえば、 `src/core/greeting`です。

## メッセージを追加

1.次の例に示すように、新しいモジュール用に作成したフォルダのサブディレクトリに新しいメッセージを登録します。

`src/core/greeting/msgs`

この例では、 `MsgHello`と` MsgGoodbye`の2つの新しいメッセージを作成するとします。 次の例は、 `MsgHello`のコードを示しています。このコードから、` MsgGoodbye`の実装方法を推測できます。

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

2.次のファイルを作成します。これにより、新しいメッセージのインデックスが作成されます。

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

3.正しい分析のために、メッセージを `src/core/Msg.ts`に登録します。 

`src/core/Msg.ts` 

```ts
//import greeting module messages
...
import {
  MsgHello,
  MsgGoodbye,
  GreetingMsg
} from './greeting/msgs';
...

//register GreetingMsg
export type Msg =
  | BankMsg
  | DistributionMsg
  | GovMsg
  | GreetingMsg//ADD HERE
  | MarketMsg
  | MsgAuthMsg
  | OracleMsg
  | SlashingMsg
  | StakingMsg
  | WasmMsg;

...

//register GreetingMsg.Data
export namespace Msg {
  export type Data =
    | BankMsg.Data
    | DistributionMsg.Data
    | GovMsg.Data
    | Greeting.Data//ADD HERE
    | MarketMsg.Data
    | MsgAuthMsg.Data
    | OracleMsg.Data
    | SlashingMsg.Data
    | StakingMsg.Data
    | WasmMsg.Data;
...

 //register deserializer in Msg.fromData(...)
  export function fromData(data: Msg.Data): Msg {
  ...
     //greeting
      case 'greeting/MsgHello':
        return MsgHello.fromData(data);
      case 'greeting/MsgGoodbye':
        return MsgGoodbye.fromData(data);
  ...
  }
}
```

4.エクスポートするメッセージを `src/core/index.ts`に登録します。 

```ts
...
//greeting
export 'greeting/msgs';
```

5.パラメータの変更を追加します。

Terra.jsは、モジュールに関連付けられたブロックチェーンパラメーターを変更するための提案である `ParameterChangeProposal`を生成する簡単な方法を提供します。 モジュールにプロポーザルを通じて変更できるパラメーターがある場合は、次のファイルを作成する必要があります。 

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
  GreetingParamChanges &//ADD HERE
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
    ...GreetingParamChanges.ConverstionTable,//ADD HERE
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
  | GreetingParamChange//ADD HERE
  | MarketParamChange
  | OracleParamChange
  | SlashingParamChange
  | StakingParamChange
  | TreasuryParamChange
  | WasmParamChange;

...

```

## LCDClientにAPI関数を追加します

新しいモジュールのAPIエンドポイントがある場合は、それらにアクセスできるように、この関数を「LCDClient」に追加する必要があります。

グリーティングモジュールに次のエンドポイントがあるとします。

-`GET/greeting/hello/{accAddress} `
-`Get/Greetings/Parameters`

1.次の内容で `src/client/lcd/api/GreetingAPI.ts`を作成します。 

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

2.API関数を `src/client/lcd/api/index.ts`に登録します。 

```ts
export * from './AuthAPI';
export * from './BankAPI';
export * from './DistributionAPI';
export * from './GovAPI';
export * from './GreetingAPI';//ADD HERE
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

3.関数を `src/client/lcd/LCDClient.ts`に追加します。 

```ts
...
import {
  AuthAPI,
  BankAPI,
  DistributionAPI,
  GovAPI,
  GreetingAPI,//ADD HERE
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

 //API access
  public auth: AuthAPI;
  public bank: BankAPI;
  public distribution: DistributionAPI;
  public gov: GovAPI;
  public greeting: GreetingAPI;//ADD HERE
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

   //instantiate APIs
    this.auth = new AuthAPI(this.apiRequester);
    this.bank = new BankAPI(this.apiRequester);
    this.distribution = new DistributionAPI(this.apiRequester);
    this.gov = new GovAPI(this.apiRequester);
    this.greeting = new GreetingAPI(this.apiRequester);//ADD HERE
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
