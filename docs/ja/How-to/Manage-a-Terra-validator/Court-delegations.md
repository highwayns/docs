# 裁判所の代表団

可視性を高め、潜在的なクライアントにあなたを知らせるために、次のオプションを検討してください。

## ウェブサイトを構築する

クライアントがあなたを見つけられるようにウェブサイトを作成します。 Lunaトークンを委任する方法を示す、Terra委任者用のカスタムセクションを作成することをお勧めします。

## 不和について自分自身を発表する

[Terra Validators Discord](https://discord.gg/jaBuKda)チャンネルに参加して、自己紹介をしてください。

## バリデーター構成ファイルを送信する

[バリデータープロファイル](https://github.com/terra-money/validator-profiles)を送信して正式なものにします。

！[validator-profile](/img/screens/validator-check.png)


## TerraStationにサムネイルを配置

【Keybaseアカウント】(https://keybase.io/)を作成するKeybaseの指示に従って、PGPキーを設定し、プロフィール写真をアップロードします。
最高の継続性を得るには、同じGitHubアカウントを使用して、キーベースと[バリデータープロファイル](https://github.com/terra-money/validator-profiles)を確認してください。

次に、Keybase構成ファイルをバリデーターにリンクします。バリデータターミナルを開き、次のコマンドを実行します。 

```bash
terrad tx staking edit-validator \
    --identity="keybase identity" 
```
