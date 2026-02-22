# 升级企业版后更新 API 授权

> 来源: https://www.coze.cn/open/docs/developer_guides/update_authorization

| 注意事项​ | 说明​ |
| 操作时段​ | 如果智能体、应用或工作流已发布到生产环境、线上用户量较大，为了保障平滑迁移，建议选择服务流量较少的时段执行本步骤，例如深夜或凌晨时段。​ |
| 权限设置​ | 请确保已覆盖原授权的所有权限点，以免因权限不足导致 API 访问失败。​操作时，访问空间建议选择所有工作空间，确保空间迁移后访问令牌能访问该企业中的所有空间，包括后续创建的新空间。​ |
| API 方式创建会话​ | 由于智能体等资源属于空间，API 方式创建的会话属于扣子用户，迁移空间之后，智能体无权限访问原个人账号下的会话，建议开发者创建新会话。创建方式可参考​创建会话。​ |
| 原 OAuth 应用​ | 请勿禁用或删除参考本文档完成改造的个人版 OAuth 应用，否则会影响在企业中的 OpenAPI 访问。​ |

- 请确保已覆盖原授权的所有权限点，以免因权限不足导致 API 访问失败。 ​

- 操作时，访问空间建议选择所有工作空间，确保空间迁移后访问令牌能访问该企业中的所有空间，包括后续创建的新空间。 ​

| 授权类型​ | 授权方式​ | 客户端类型​ |
| 个人访问令牌​ | ​添加个人访问令牌​ | 无​ |
| OBO 授权​ | ​OAuth 授权码授权​ | Web 后端应用​ |
| ​ | ​OAuth PKCE​ | 移动端/PC 桌面端/单页面应用​ |
| ​ | ​OAuth 设备授权​ | TV 端/设备应用/类命令行程序​ |
| AppAuth 授权​ | ​OAuth JWT 授权（开发者）​ | 服务类应用​ |



- ​ ​ ​ ​ ​


- 授权相关的设置方式如下： ​

- 授权范围选择企业 ​

- 工作空间选择所有工作空间 ​

- ​ ​ ​ ​ ​


- 企业的超级管理员或管理员切换到企业中。在左侧导航栏单击 企业 API ，访问 应用安装管理 页面，确认授权成功。 ​

- ​ ​ ​ ​ ​


- ​ 账号 ​ 获取方式 ​ 示例 ​ 个人账号 UID ​ （personalAccountId） ​ 必须是创建 OAuth 应用的扣子账号 UID。 ​ 在扣子编程左下角单击个人头像，并选择账号设置，在账号页面中查看 UID。 ​ ​ ​ ​ ​ ​ ​ 企业 ID ​ （enterpriseAccountId） ​ 你可以在 组织管理 > 组织设置 页面查看企业 ID。 ​ ​ ​ ​ ​ ​ ​

| 账号​ | 获取方式​ | 示例​ |
| 个人账号 UID​（personalAccountId）​ | 必须是创建 OAuth 应用的扣子账号 UID。​在扣子编程左下角单击个人头像，并选择账号设置，在账号页面中查看 UID。​​ | ​​​​​ |
| 企业 ID​（enterpriseAccountId）​ | 你可以在组织管理>组织设置页面查看企业 ID。​ | ​​​​​ |


- 以聊天接口为例，Go 语言代码改造方式如下，注意其中高亮部分： ​

- ​ Go 复制 package main ​ ​ import ( ​ "context" ​ "errors" ​ "fmt" ​ "github.com/coze-dev/coze-go" ​ "os" ​ ) ​ ​ func main () { ​ // The default access is api.coze.com, but if you need to access api.coze.cn, ​ // please use base_url to configure the api endpoint to access ​ cozeAPIBase := os.Getenv( "COZE_API_BASE" ) ​ jwtOauthClientID := os.Getenv( "COZE_JWT_OAUTH_CLIENT_ID" ) ​ jwtOauthPrivateKey := os.Getenv( "COZE_JWT_OAUTH_PRIVATE_KEY" ) ​ jwtOauthPrivateKeyFilePath := os.Getenv( "COZE_JWT_OAUTH_PRIVATE_KEY_FILE_PATH" ) ​ jwtOauthPublicKeyID := os.Getenv( "COZE_JWT_OAUTH_PUBLIC_KEY_ID" ) ​ botID := os.Getenv( "PUBLISHED_BOT_ID" ) ​ uid := os.Getenv( "USER_ID" ) ​ ​ // Read private key from file ​ privateKeyBytes, err := os.ReadFile(jwtOauthPrivateKeyFilePath) ​ if err != nil { ​ fmt.Printf( "Error reading private key file: %v\n" , err) ​ return ​ } ​ jwtOauthPrivateKey = string (privateKeyBytes) ​ ​ oauth , err := coze.NewJWTOAuthClient(coze.NewJWTOAuthClientParam{ ​ ClientID: jwtOauthClientID, PublicKey: jwtOauthPublicKeyID, PrivateKeyPEM: jwtOauthPrivateKey, ​ }, coze.WithAuthBaseURL(cozeAPIBase)) ​ if err != nil { ​ fmt.Printf( "Error creating JWT OAuth client: %v\n" , err) ​ return ​ } ​ ctx := context.Background() ​ ​ var personalAccountId int64 = 12345 // 个人版 账号 UID ​ var enterpriseAccountId int64 = 23456 // 企业版 账号 ID ​ ​ // 获取个人版下的访问凭证 ​ cozeCli := coze.NewCozeAPI(coze.NewJWTAuth(oauth, &coze.GetJWTAccessTokenReq{ ​ AccountID:   &personalAccountId, ​ }), coze.WithBaseURL(cozeAPIBase)) ​ // 获取企业版下的访问凭证 ​ cozeCli4Enterprise := coze.NewCozeAPI(coze.NewJWTAuth(oauth, &coze.GetJWTAccessTokenReq{ ​ EnterpriseID:   &enterpriseAccountId, ​ }), coze.WithBaseURL(cozeAPIBase)) ​ ​ req := &coze.CreateChatsReq{ ​ BotID:  botID, ​ UserID: uid, ​ Messages: []*coze.Message{ ​ coze.BuildUserQuestionText( "What can you do?" , nil ), ​ }, ​ } ​ ​ // 先尝试通过个人版的凭证请求chat接口 ​ resp, err := cozeCli.Chat.Create(ctx , req ) ​ if err == nil { ​ fmt.Println(resp) ​ return ​ } ​ // 当请求个人版接口出现鉴权失败时, 再尝试基于企业版的凭证请求chat接口 ​ cozeErr := coze.Error{} ​ if errors.As(err, &cozeErr) { ​ // no permission error code ​ if cozeErr.Code == 4101 || cozeErr.Code == 4100 { ​ // no permission try chat with enterprise account ​ resp, err = cozeCli4Enterprise.Chat.Create(ctx, req) ​ if err == nil { ​ fmt.Println(resp) ​ return ​ } ​ } ​ } ​ fmt.Println(err) ​ } ​ ​


- 修改授权相关代码之后，建议确认代码中增加的逻辑准确、有效。例如在企业中新建空间和智能体，使用更新后的授权代码访问新智能体，对齐接口能力，验证通过之后再迁移工作空间。 ​




- ​ ​ ​ ​ ​

- 建议仅在测试环境、调试场景中使用个人访问令牌，并严格限制其使用范围和有效期，生产环境中建议避免使用个人访问令牌。 ​

- 迁移成功且验证 API 访问正常之后，建议及时删除旧的个人访问令牌，以免令牌到期 后无法访问。 ​


- ​ ​ ​ ​ ​

- 说明 仅支持 PAT 和 AppAuth 授权，不支持 OBO 授权。 ​ 仅支持授权 账号层级 的权限，不支持授权 工作空间层级 的权限，你可以在授权对话框的权限列表中查看该权限的层级属性。 ​ ​

- 仅支持 PAT 和 AppAuth 授权，不支持 OBO 授权。 ​

- 仅支持授权 账号层级 的权限，不支持授权 工作空间层级 的权限，你可以在授权对话框的权限列表中查看该权限的层级属性。 ​


- ​ ​ ​ ​ ​


- 授权后，你可以使用该 Token 访问你个人账号下的账号级资源。 ​