# 实施安全实践

鼓励每个验证者候选人独立运行其操作。多样化的个人设置增加了网络的弹性。

## 使用 HSM 管理数字密钥

密钥管理对验证者来说至关重要。如果攻击者获得了验证者私钥的访问权，那么验证者的整个委托权益就会面临风险。硬件安全模块是减轻这种风险的重要策略。

考虑通过 Iqulusion 实施此 [密钥管理方法](https://github.com/iqlusioninc/tmkms)。

## 防御 DDoS 攻击

验证者负责确保网络能够抵御拒绝服务攻击。

验证者可以通过在哨兵节点架构中仔细构建他们的网络拓扑来减轻这些攻击。

验证器节点应该只连接到他们信任的完整节点。它们可以由同一个验证器或他们认识的其他验证器运行。验证器节点通常会在数据中心内运行。大多数数据中心提供与主要云提供商的直接链接。验证者可以使用这些链接连接到云中的哨兵节点。这将拒绝服务的负担从验证者的节点直接转移到其哨兵节点。这可能需要启动或激活新的哨兵节点以减轻对现有哨兵节点的攻击。

Sentry 节点可以快速启动或用于更改 IP 地址。由于指向哨兵节点的链接位于私有 IP 空间中，因此基于 Internet 的攻击无法直接干扰它们。这将确保验证者的区块提议和投票总是能够到达网络的其余部分。

详细了解 [哨兵节点架构](https://forum.cosmos.network/t/sentry-node-architecture-overview/454)。

1. 对于验证器节点，编辑`config.toml`:

```bash
# Comma separated list of nodes to keep persistent connections to
# Do not add private peers to this list if you don't want them advertised
persistent_peers =[list of sentry nodes]

# Set true to enable the peer-exchange reactor
pex = false
```

2. 对于哨兵节点，编辑`config.toml`:

```bash
# Comma separated list of peer IDs to keep private (will not be gossiped to other peers)
private_peer_ids = "ipaddress of validator nodes"
```

## 环境变量

默认情况下，具有以下前缀的大写环境变量将替换小写命令行标志:

- `TE` \(用于 Terra 标志\)
- `TM` \(用于 Tendermint 标志\)
- `BC` \(用于 democli 或 basecli 标志\)

例如，环境变量“TE_CHAIN_ID”将映射到命令行标志“--chain-id”。虽然显式命令行标志将优先于环境变量，但环境变量将优先于您的任何配置文件。因此，您必须锁定您的环境，以便将任何关键参数定义为 CLI 上的标志，或者防止修改任何环境变量。 