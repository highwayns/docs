# オラクルのフィードバック

次のコードスニペットは、[LocalTerra](https://github.com/terra-money/LocalTerra)ネットワークを使用して、Terra.jsを使用してシンプルな価格のオラクルフィーダーを作成する方法を示しています。 この例では価格は表示されていません。 パブリックLCDノードに現在登録されているオラクルの価格を追跡し、ローカルテストネットに送信するだけです。

次の点に注意してください:

1. [`MsgAggregateExchangeRateVote.getPrevote()`](https://terra-money.github.io/terra.js/classes/msgexchangeratevote.html#getprevote)を使用して、prevoteを自動的に生成します

2. `MsgAggregateExchangeRateVote`メッセージは、トランザクションで順番に` MsgAggregateExchangeRatePrevote`メッセージの前に置く必要があります。そうしないと、 `MsgAggregateExchangeRatePrevote`が現在バリデーターに登録されている不完全な事前投票を上書きします。

### 誤ったフィードバック 

```ts
import { randomBytes } from 'crypto';
import {
  LCDClient,
  MnemonicKey,
  MsgAggregateExchangeRateVote,
} from "@terra-money/terra.js";

const {
  MAINNET_LCD_URL = "https://lcd.terra.dev",
  MAINNET_CHAIN_ID = "columbus-5",
  TESTNET_LCD_URL = "http://localhost:1317",
  TESTNET_CHAIN_ID = "localterra",
  MNEMONIC = "satisfy adjust timber high purchase tuition stool faith fine install that you unaware feed domain license impose boss human eager hat rent enjoy dawn",
} = process.env;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFirstBlock(client: LCDClient) {
  let shouldTerminate = false;

  console.info("waiting for first block");

  while (!shouldTerminate) {
    shouldTerminate = await client.tendermint
      .blockInfo()
      .then(async (blockInfo) => {
        await delay(5000);

        if (blockInfo?.block) {
          return +blockInfo.block?.header.height > 0;
        }

        return false;
      })
      .catch(async (err) => {
        console.error(err);
        await delay(1000);
        return false;
      });

    if (shouldTerminate) {
      break;
    }
  }
}

async function main() {
  const mainnetClient = new LCDClient({
    URL: MAINNET_LCD_URL,
    chainID: MAINNET_CHAIN_ID,
  });

  const testnetClient = new LCDClient({
    URL: TESTNET_LCD_URL,
    chainID: TESTNET_CHAIN_ID,
    gasPrices: "0.15uluna",
    gasAdjustment: 1.4,
  });

  const mk = new MnemonicKey({
    mnemonic: MNEMONIC,
  });

  const wallet = testnetClient.wallet(mk);

  let lastSuccessVotePeriod: number;
  let lastSuccessVoteMsg: MsgAggregateExchangeRateVote;

  await waitForFirstBlock(testnetClient);

  while (true) {
    const [rates, oracleParams, latestBlock] = await Promise.all([
      mainnetClient.oracle.exchangeRates(),
      testnetClient.oracle.parameters(),
      testnetClient.tendermint.blockInfo(),
    ]).catch((err) => []);

    if (!rates) {
      await delay(5000);
      continue;
    }

    const oracleVotePeriod = oracleParams.vote_period;
    const currentBlockHeight = parseInt(latestBlock.block.header.height, 10);
    const currentVotePeriod = Math.floor(currentBlockHeight / oracleVotePeriod);
    const indexInVotePeriod = currentBlockHeight % oracleVotePeriod;

    if (
      (lastSuccessVotePeriod && lastSuccessVotePeriod === currentVotePeriod) ||
      indexInVotePeriod >= oracleVotePeriod - 1
    ) {
      await delay(1000);
      continue;
    }

    const coins = rates
      .toArray()
      .map((r) => `${r.amount}${r.denom}`)
      .join(",");

    const voteMsg = new MsgAggregateExchangeRateVote(
      coins,
      randomBytes(2).toString('hex'),
      mk.accAddress,
      mk.valAddress
    );

    const msgs = [lastSuccessVoteMsg, voteMsg.getPrevote()].filter(Boolean);
    const tx = await wallet.createAndSignTx({ msgs });

    await testnetClient.tx
      .broadcast(tx)
      .then((result) => {
        console.log(
          `vote_period: ${currentVotePeriod}, txhash: ${result.txhash}`
        );

        lastSuccessVotePeriod = currentVotePeriod;
        lastSuccessVoteMsg = voteMsg;
      })
      .catch((err) => {
        console.error(err.message);
      });

    await delay(5000);
  }
}

main().catch(console.error);
```
