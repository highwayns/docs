以下信息提供了一组为 Terra Docs 存储库做出贡献的指南。运用您的最佳判断力，如果您认为有改进的余地，请提出对本文档的更改。

贡献以编写文档、提出问题和任何其他有助于开发 Terra 协议文档的行动的形式出现。

##只是想问一个问题？

请不要提交拉取请求来提问。相反，加入我们以下社区，并提出您的所有问题。

- [Terra Telegram 社区](https://t.me/TerraLunaChat)
- [Terra Discord 社区](https://discord.gg/bYfyhUT)
- [Terra Validator Discord 社区](https://discord.gg/Bf4Ug2Zf)

## 第一步

第一步是找到您要解决的问题。为了确定我们认为对首次贡献者有利的问题，我们添加了 **good first issue** 标签。

如果您发现要处理的现有问题或要创建新问题，请了解 Terra Docs 存储库维护人员期望的工作流程。

### 提出文档更改

Terra Docs 要求所有人无一例外地使用拉取请求 (PR) 提交文档更改建议。 PR 支持来自社区的贡献、简单的测试和直接的同行评审。

要提交文档更改提案，请使用以下工作流程:

1. [分叉存储库](https://github.com/terra-money/docs)。
1. [添加一个上游](https://docs.github.com/en/github/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) 以便您可以更新您的fork。
1. 将你的 fork 克隆到你的电脑上。
1. 创建一个分支并适当命名。
1. 在一个拉取请求中只处理一个更改。
1. 遵循以下约定:

    1. 根据 [Terra Docs 样式指南](STYLE-GUIDE.md) 和下面描述的编码约定进行更改。通常，提交服务于单一目的，差异应该很容易理解。不要将格式修复或代码移动与实际代码更改混合在一起。
    1. 提交您的更改。编写简单、直接的提交消息。要了解更多信息，请参阅 [如何编写 Git 提交消息](https://chris.beams.io/posts/git-commit/)。
    1. 将更改推送到远程分支。
    1. 在 Terra Docs 存储库上创建 PR。
    1. 通过添加标签来识别 PR 的类型。例如，如果您仍在进行更改，请添加 **work-in-progress** 标签。如果您提出增强功能，请添加 **enhancement** 标签。
    1. 等待您的更改被审核。如果您是维护者，您可以将您的 PR 分配给一个或多个审阅者。如果您不是维护者，其中一位维护者将指派一名审阅者。
    1. 收到审阅者的反馈后，进行请求的更改，将它们提交到您的分支，然后再次将它们推送到您的远程分支。

在你的 PR 被批准和验证后，不存在冲突，它会被一个维护者合并。