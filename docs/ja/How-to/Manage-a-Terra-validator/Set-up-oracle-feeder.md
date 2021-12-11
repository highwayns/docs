# オラクルフィーダーを設定する

すべてのTerra検証者は、オラクルプロセスに参加し、ホワイトリストに登録されているすべての金種のルナ為替レートに定期的に投票する必要があります。 このプロセスは30秒ごとに発生するため、検証者は、切断や投獄を回避するために自動化されたプロセスを確立する必要があります。

## Oracle投票用の新しいキーを作成します

検証者のアカウントを制御するために使用されるキーを、検証者に代わってOracle投票を送信するために使用されるキーから分離できます。 走る: 

```bash
terrad keys add <feeder>
```


フィーダーアカウントの詳細を表示する: 
```bash
terrad keys show <feeder>
```

## 委託フィーダーは同意します

オラクル投票トランザクションの送信に使用されるアカウントアドレスは、「フィーダー」と呼ばれます。 オラクルの投票プロセスを初めて設定するときは、フィーダーの権限をアカウントに委任する必要があります。

```bash
terrad tx oracle set-feeder <feeder-address> --from=<validator>
```

## フィーダーに資金を送る

フィーダーは、オラクルの投票メッセージを送信するための取引手数料を支払うための資金を必要とします。 TerraKRWの最小原子単位はLunaよりもはるかに安いため、Lunaの代わりにTerraKRWを使用してオラクルの投票料金を支払います。 次のコマンドを実行して、TerraKRWをフィーダーアドレスに送信するか、Lunaを送信してオンチェーン交換を実行できます。

```bash
terrad tx send <from-address> <feeder-address> <luna-amount>uluna
``

**フィーダーからの交換の構文** 

```bash
terrad tx market swap <luna-amount>uluna ukrw --from=<feeder>
```

## オラクルフィーダープログラムを設定する

フィーダーアカウントを使用してオラクルメッセージの送信を開始するには、オラクルフィーダーをインストールして設定してください。

-[TerraのオラクルフィーダーGithubリポジトリ](https://github.com/terra-)[`oracle-feeder`](https://github.com/terra-money/oracle-feeder]にアクセスしてTerraのNode.jsをインストールします)money/oracle-feeder)。

検証者に独自のオラクルフィーダーを構築するように促します。

OracleFeederプロジェクトの例は次のとおりです。
-[`terra_oracle_voter`](https://github.com/b-harvest/terra_oracle_voter)は[B-Harvest](https://bharvest.io/)によって作成されました。
-[`terra-oracle`](https://github.com/node-a-team/terra-oracle)は[Node A-Team](https://nodeateam.com/)によって作成されました。 