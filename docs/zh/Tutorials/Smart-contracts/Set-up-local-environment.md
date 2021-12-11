# 环境设置

作为智能合约开发人员，您需要编写、编译、上传和测试您的合约，然后才能将它们部署到 Columbus 主网上。由于此开发过程可能涉及在多次迭代中手动处理多个移动部件，因此首先设置专门的环境以简化开发是有帮助的。

## 在本地安装 Terra Core

访问 [build Terra core](/zh/How-to/Run-a-full-Terra-node/Build-Terra-core.md) 安装最新版本的 Terra Core 以获得可用版本的 `terrad`。您将需要它来连接到您本地的 Terra 测试网络以使用智能合约。

## 下载 LocalTerra

为了使用 Terra 智能合约，您应该可以访问包含 WASM 集成的 Terra 网络。

在本教程中，我们将使用 [LocalTerra](https://github.com/terra-money/localterra)，这是一个使您能够轻松启动本地、支持 WASM 的私有测试网的包。这通过让您完全控制私有 Terra 区块链以及轻松重置世界状态的可能性来减少开发摩擦。

要使用 **LocalTerra**，您应该首先按照 [Docker 入门教程](https://www.docker.com/get-started) 确保您的计算机上安装了 Docker。您还需要在您的机器上设置和配置 [Docker Compose](https://docs.docker.com/compose/install/)。 

```sh
git clone --depth 1 https://github.com/terra-money/localterra
cd localterra
docker-compose up
```

您现在应该在您的机器上运行一个本地测试网，具有以下配置:

- 节点监听 RPC 端口`26657`
- LCD在端口`1317`上运行
- [http://localhost:3060/swagger](http://localhost:3060/swagger) 上的 Swagger 文档

具有以下助记符的帐户是网络上的唯一验证器，并且有足够的资金开始使用智能合约。

``
满足调整木材高额购买学费凳子信仰罚款安装你不知道饲料域许可证强加老板人类渴望帽子租金享受黎明
``

## 安装 Rust

虽然理论上 WASM 智能合约可以用任何编程语言编写，但我们目前只推荐使用 Rust，因为它是 CosmWasm 存在成熟库和工具的唯一语言。对于本教程，您还需要按照 [此处](https://www.rust-lang.org/tools/install) 的说明安装最新版本的 Rust。

安装 Rust 及其工具链(cargo 等)后，您需要添加 `wasm32-unknown-unknown` 编译目标。

```sh
rustup default stable
rustup target add wasm32-unknown-unknown
```

Then, install `cargo-generate`, which we will need for bootstrapping new CosmWasm smart contracts via a template.

```sh
cargo install cargo-generate --features vendored-openssl
```

Next, install `cargo-run-script`, which is required to optimize smart contracts.

```sh
cargo install cargo-run-script
```
