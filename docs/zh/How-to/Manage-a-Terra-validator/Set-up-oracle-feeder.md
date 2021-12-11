# 设置一个oracle feeder

每个 Terra 验证者都必须参与预言机流程，并定期提交对所有白名单面额的 Luna 汇率的投票。因为这个过程每 30 秒发生一次，验证者必须建立一个自动化的过程，以避免被削减和监禁。

## 为 oracle 投票创建一个新的密钥

您可以将用于控制验证者帐户的密钥与代表验证者提交预言机投票的密钥分开。跑:

```bash
terrad keys add <feeder>
```


显示馈线帐户详细信息:

```bash
terrad keys show <feeder>
```

## 委托馈线同意

用于提交预言机投票交易的账户地址称为“feeder”。当您第一次设置 oracle 投票流程时，您必须将 Feeder 权限委托给一个帐户。

```bash
terrad tx oracle set-feeder <feeder-address> --from=<validator>
```

## 向馈线发送资金

馈线需要资金来支付交易费用以提交预言机投票消息。 TerraKRW 而非 Luna 用于支付预言机投票费，因为 TerraKRW 的最小原子单位比 Luna 便宜得多。您可以通过运行以下命令将 TerraKRW 发送到您的馈线地址或发送 Luna 并执行链上交换:

```bash
terrad tx send <from-address> <feeder-address> <luna-amount>uluna
``

**从馈线交换的语法**

```bash
terrad tx market swap <luna-amount>uluna ukrw --from=<feeder>
```

## 设置oracle feeder程序

要开始使用您的 feeder 帐户提交 oracle 消息，请安装并设置 oracle feeder。

- 通过访问 [Terra's oracle feeder Github repo](https://github.com/terra-) 安装 Terra 的 Node.js [`oracle-feeder`](https://github.com/terra-money/oracle-feeder)金钱/oracle-feeder)。

鼓励验证者建立自己的预言机馈送器。

Oracle Feeder 项目的一些示例包括:
- [`terra_oracle_voter`](https://github.com/b-harvest/terra_oracle_voter) 由 [B-Harvest](https://bharvest.io/) 编写。
- [`terra-oracle`](https://github.com/node-a-team/terra-oracle) 由 [Node A-Team](https://nodeateam.com/) 编写。