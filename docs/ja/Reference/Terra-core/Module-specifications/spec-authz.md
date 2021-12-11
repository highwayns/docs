#認証

authz(メッセージ認証)モジュールを使用すると、ユーザーは別のアカウントに自分に代わってメッセージを送信することを認証できます。 別のアカウントからの支出トークンなどの特定の承認は、被付与者の権限を制限するためにパラメーター化できます(支出制限の設定など)。

## メッセージタイプ 

### MsgGrantAuthorization

```go
// MsgGrantAuthorizationは、提供された承認を被付与者に付与します
//指定された期間のアカウント 
type MsgGrantAuthorization struct {
	Granter       sdk.AccAddress `json:"granter"`
	Grantee       sdk.AccAddress `json:"grantee"`
	Authorization Authorization  `json:"authorization"`
	Period        time.Duration  `json:"period"`
}
```

### MsgRevokeAuthorization

```go
// MsgRevokeAuthorizationは、提供されたsdk.Msgタイプを使用して、承認を取り消します
//被付与者のアカウントが被付与者に付与されました 
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
// MsgExecAuthorizedは、提供されたメッセージを使用して実行を試みます
//譲受人の承認を付与します。 各メッセージには
//承認された付与者に対応する署名者。 
type MsgExecAuthorized struct {
	Grantee sdk.AccAddress `json:"grantee"`
	Msgs    []sdk.Msg      `json:"msgs"`
}
```
