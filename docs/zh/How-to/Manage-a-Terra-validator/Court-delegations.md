# 法院代表团

考虑以下选项，以帮助提高您的知名度并让潜在委托人了解您。

##建立一个网站

建立一个网站，以便您的委托人可以找到您。我们建议为 Terra 委托人制作一个自定义部分，指示如何委托 Luna 代币。

## 在 Discord 上宣布自己

加入 [Terra Validators Discord](https://discord.gg/ZHBuKda) 频道，并自我介绍。

## 提交验证器配置文件

提交 [验证器配置文件](https://github.com/terra-money/validator-profiles) 使其正式化。

![validator-profile](/img/screens/validator-check.png)


## 在 Terra Station 上放一个缩略图

创建一个【Keybase 账户】(https://keybase.io/) 按照 Keybase 说明设置 PGP 密钥，并上传个人资料图片。
为了获得最佳连续性，请使用相同的 GitHub 帐户来验证您的 Keybase 和 [验证器配置文件](https://github.com/terra-money/validator-profiles)

现在将您的 Keybase 配置文件链接到您的验证器。打开验证器终端并执行以下命令:

```bash
terrad tx staking edit-validator \
    --identity="keybase identity" 
```
