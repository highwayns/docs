# 能力

::: 警告注意
Terra 的能力模块继承自 Cosmos SDK 的 [`capability`](https://docs.cosmos.network/master/modules/capability/) 模块。本文档是一个存根，主要涵盖有关如何使用它的 Terra 特定的重要说明。
:::

能力模块允许您在运行时配置、跟踪和验证多所有者功能。

keeper 维护两种状态：持久和短暂的内存。持久状态维护一个全局唯一的自动递增索引和从能力索引到一组定义为模块和能力名称元组的能力所有者的映射。临时内存状态跟踪实际功能，表示为本地内存中的地址，具有正向和反向索引。前向索引将模块名称和能力元组映射到能力名称。反向索引将模块和功能名称映射到功能本身。

Keeper 允许创建作用域子管理器，这些子管理器按名称绑定到特定模块。初始化应用程序时，必须创建范围子管理员并将其传递给模块。然后，模块可以使用它们来声明它们接收的功能并检索它们按名称拥有的功能。此外，他们可以创建新功能并验证其他模块传递的功能。一个有作用域的 subkeeper 不能脱离它的作用域，所以一个模块不能干扰或检查其他模块拥有的能力。

Keeper 没有提供其他模块中可以找到的其他核心功能，例如查询器、REST 和 CLI 处理程序以及创世状态。

## 初始化

初始化应用程序时，必须使用持久存储密钥和临时内存存储密钥实例化 keeper。

```
type App struct {
  // ...

  capabilityKeeper *capability.Keeper
}

func NewApp(...) *App {
  // ...

  app.capabilityKeeper = capability.NewKeeper(codec, persistentStoreKey, memStoreKey)
}
```

Keeper 创建后，它可以创建作用域的 subkeeper，这些 subkeeper 会传递给其他可以创建、验证和声明功能的模块。在创建了所有必要的作用域 subkeeper 并加载了状态之后，您必须初始化并密封主要功能 keeper 以填充临时内存状态并防止创建更多作用域 subkeeper。

```
func NewApp(...) *App {
  // ...

  // Initialize and seal the capability keeper so all persistent capabilities
  // are loaded in-memory and prevent any further modules from creating scoped
  // sub-keepers.
  ctx := app.BaseApp.NewContext(true, tmproto.Header{})
  app.capabilityKeeper.InitializeAndSeal(ctx)

  return app
}
```

## 概念

能力是多所有者的。作用域子管理员可以通过“NewCapability”创建一个能力，它创建一个独特的、不可伪造的、对象能力引用。新创建的功能会自动持久化。调用模块不需要调用`ClaimCapability`。调用“NewCapability”创建了调用模块的能力，并将名称作为元组作为能力的第一所有者。

其他模块可以声明功能，这些模块将它们添加为所有者。 `ClaimCapability` 允许模块声明它从另一个模块接收到的功能密钥，以便稍后进行的 `GetCapability` 调用将成功。如果接收到能力的模块以后想通过名称访问它，则必须调用`ClaimCapability`。由于能力是多所有者的，如果多个模块有一个能力引用，则所有模块都拥有它。如果一个模块从另一个模块接收到一个能力但没有调用`ClaimCapability`，它可能会在执行事务中使用它，但之后将无法访问它。

任何模块都可以调用“AuthenticateCapability”来检查功能是否对应于特定名称，包括不受信任的用户输入，调用模块之前与该名称相关联。

`GetCapability` 允许模块获取它之前通过名称声明的功能。不允许模块检索不属于它的功能。

### Stores

- MemStore

## States

- Index
- CapabilityOwners
- Capability
