# 身份验证

authz(消息授权)模块允许用户授权另一个账户代表他们发送消息。某些授权，例如花费另一个帐户的代币，可以参数化以限制受赠者的权限(例如设置花费限制)。

## 消息类型

### MsgGrantAuthorization

```go
// MsgGrantAuthorization 将所提供的授权授予授予者的被授予者
// 在提供的时间段内的帐户
type MsgGrantAuthorization struct {
	Granter       sdk.AccAddress `json:"granter"`
	Grantee       sdk.AccAddress `json:"grantee"`
	Authorization Authorization  `json:"authorization"`
	Period        time.Duration  `json:"period"`
}
```

### MsgRevokeAuthorization

```go
// MsgRevokeAuthorization 使用提供的 sdk.Msg 类型撤销任何授权
// 授予者的帐户已授予受赠者
type MsgRevokeAuthorization struct {
	Granter sdk.AccAddress `json:"granter"`
	Grantee sdk.AccAddress `json:"grantee"`
	// AuthorizationMsgType is the type of sdk.Msg that the revoked Authorization refers to.
	// i.e. this is what `Authorization.MsgType()` returns
	AuthorizationMsgType string `json:"authorization_msg_type"`
}
```

### MsgExecAuthorized

```go
// MsgExecAuthorized 尝试使用提供的消息执行
// 授予受让人的授权。每条消息应该只有
// 与授权授予者相对应的一个签名者。
type MsgExecAuthorized struct {
	Grantee sdk.AccAddress `json:"grantee"`
	Msgs    []sdk.Msg      `json:"msgs"`
}
```
