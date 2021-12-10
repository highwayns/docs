# 构建 Terra 核心

## 先决条件

- [Golang v1.16.1 或更高版本](https://golang.org/doc/install)
- 确保你的 `GOPATH` 和 `GOBIN` 环境变量设置正确。

##获取Terra核心源代码

使用 `git` 检索 [Terra core](https://github.com/terra-money/core/)，并检查包含最新稳定版本的 `main` 分支。

如果您使用 LocalTerra 或运行验证器，请使用 `v0.x.x-oracle` 标签。否则，使用 `v0.x.x` 标签。

```bash
git clone https://github.com/terra-money/core
cd core
git checkout [latest version]
```

**例子:**
```bash
git clone https://github.com/terra-money/core
cd core
git checkout v0.5.6-oracle
```


## 从源代码构建 Terra 核心

构建 Terra 核心，并将 `terrad` 可执行文件安装到你的 `GOPATH` 环境变量中。

```bash
make install
```

## 验证您的 Terra 核心安装

验证 Terra 核心是否安装正确。

```bash
terrad version --long
```

以下示例显示了正确安装 Terra 核心时的版本信息:

```bash
name: terra
server_name: terrad
client_name: terrad
version: 0.3.0-24-g3684f77
commit: 3684f77faadf6cf200d18e15763316d5d9c5a496
build_tags: netgo,ledger
go: go version go1.13.4 darwin/amd64
```

::: 小费
如果返回 `terrad: command not found` 错误信息，请通过运行以下命令确认正确配置了 Go 二进制路径:

``
export PATH=$PATH:$(go env GOPATH)/bin
```
::: 