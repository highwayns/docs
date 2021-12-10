# テラの料金

Terraネットワークでは、すべての取引にガス料金が発生します。 ステーブルコインを含む取引には、実行された取引の種類に基づいて追加料金が発生します。 次の表は、さまざまなタイプのステーブルコイン取引に追加する必要のある追加料金を説明しています。  

|                                                                        | [Gas](#gas) | [Tobin](#tobin-tax) | [Spread](#spread-fee) | [Stability](#stability-fee) |
|------------------------------------------------------------------------|-------------|---------------------|-----------------------|-----------------------------|
| [Market swaps](./glossary.md#market-swap) between stablecoins          | x           | x                   |                       |                             |
| [Market swaps](./glossary.md#market-swap) between stablecoins and Luna | x           |                     | x                     |                             |
| All other stablecoin transactions (non market swap)                    | x           |                     |                       | x                           |

LUNAの送付、委任、投票など、ルナのみが関与する取引には、ガス料金のみが発生します。
Terraswapまたは他のdAppは、Terraネットワーク料金に加えて独自の取引料金を請求する場合があります。

## ガソリン
[Gas]（./glossary.md＃fees）は、トランザクションの処理コストの支払いに使用される少額の計算料金です。ガスは推定され、TerraStationのすべてのトランザクションに追加されます。ガソリンが不足している取引は処理されません。
Terraでのガソリンの動作は、他のブロックチェーンでの動作とは異なります。

-検証者は、独自の最低ガス料金を設定できます。
-ほとんどの取引は、取引が確実に完了するように、最小ガス量を超えると推定されます。
-未使用のガスは返金されません。
-トランザクションは、ガスの数ではなく、受信順にキューに入れられます。

ガス料金の計算方法の詳細については、[terrad reference]（/ja/Reference/terrad/＃fees）ページをご覧ください。

ブラウザで現在のガソリン料金を表示するには、[ガス料金]（https://fcd.terra.dev/v1/txs/gas_prices）FCDページにアクセスしてください。

## 安定料金

安定性手数料は最も一般的な種類の手数料であり、[マーケットスワップ]（./glossary.md＃market-swap）を除くTerraステーブルコインを使用するすべてのトランザクションに追加されます。この料金は税率と呼ばれ、0.01％から1％の範囲です。各トランザクションの最大安定料金は1SDTです。現在の税率は、[税率]（https://fcd.terra.dev/terra/treasury/v1beta1/tax_rate）FCDページで確認できます。税率とその仕組みの詳細については、[財務モジュール]（/ja/Reference/Terra-core/Module-specifications/spec-treasury.md）にアクセスしてください。

## トービン税

トービン税は、テラステーブルコインの金種間の[マーケットスワップ]（./glossary.md＃market-swap）に追加される固定パーセンテージ料金です。料金レートは、Terraステーブルコインごとに異なります。たとえば、ほとんどの金種の税率は0.35％ですが、MNTの税率は2％です。トービン税率を確認するには、[オラクルに問い合わせ]（https://lcd.terra.dev/terra/oracle/v1beta1/denoms/tobin_taxes）してください。ステーブルコインのトービン税率が異なる場合、トランザクションはより高い税率を使用します。

 トービン税は、ユーザーを犠牲にしてオラクルの先制操作や外国為替取引を防ぐように設計されています。トービン税の実施の詳細については、[「スワップ手数料について：貪欲で賢明な」]（https://medium.com/terra-money/on-swap-fees-the-greedy-and-the -wise-b967f0c8914e）。

## スプレッド料金

 TerraとLunaの間の[marketswap]（./glossary.md＃market-swap）は、スプレッドコストを増加させます。最低スプレッド料金は0.5％です。極端なボラティリティの期間中、マーケットモジュールはスプレッド料金を調整して、[一定の商品]（/ja/Reference/Terra-core/Module-specifications/spec-market.html＃market-making-algorithm）プールを維持します。テラのサイズルナプールとルナプールの法定通貨価値は、契約の安定性を保証します。プールが一定の商品バランスに達すると、スプレッド率は通常に戻ります。

 スプレッド料金の詳細については、[マーケットモジュール]（/ja/Reference/Terra-core/Module-specifications/spec-market.md）にアクセスしてください。