# OAuth JWT 授权（跨账号授权场景）

> 来源: https://www.coze.cn/open/docs/developer_guides/oauth_jwt_collaborate

| Python​ | Node.js​ | Java​ | Go​ |
| examples/auth_oauth_jwt.py​ | auth/auth-oauth-jwt.ts​auth/auth-oauth-jwt-channel.ts​ | JWTsOauthExample.java​ | jwt_example.go​ |











- ​ 配置 ​ 说明 ​ 应用类型 ​ 应用的类型，此处应指定为 普通 。 ​ 客户端类型 ​ 客户端类型，此处设置为 服务类应用 。 ​ 应用名称 ​ 应用的名称，在扣子编程中全局唯一。 ​ 应用描述 ​ 应用的基本描述信息。 ​ ​

| 配置​ | 说明​ |
| 应用类型​ | 应用的类型，此处应指定为普通。​ |
| 客户端类型​ | 客户端类型，此处设置为服务类应用。​ |
| 应用名称​ | 应用的名称，在扣子编程中全局唯一。​ |
| 应用描述​ | 应用的基本描述信息。​ |


- ​ 配置 ​ 说明 ​ 公钥和私钥 ​ 用于应用程序客户端身份认证的非对称密钥。 ​ 单击 创建 Key ，页面将自动创建一对公钥和私钥，公钥自动配置在扣子编程中，私钥以 private_key.pem 文件格式由网页自动下载至本地。支持创建最多三对公钥和私钥。 ​ 建议将 private_key.pem 文件安全地存储在只有你的应用可以访问的位置。 ​ 扣子编程使用符合行业标准的 WebCrypto 加密标准，在浏览器前端创建非对称密钥，密钥强度符合行业标准。扣子编程任何时候都不会上传私钥到后端。请你放心使用。 ​ 权限 ​ 应用程序调用扣子 API 时需要的权限范围。不同层级权限的生效范围请参见 ​ 权限层级 。 ​ 说明 此处配置旨在于划定应用的权限范围，并未完成授权操作。创建 OAuth 应用后还需要参考后续操作完成授权。 ​ ​ ​

| 配置​ | 说明​ |
| 公钥和私钥​ | 用于应用程序客户端身份认证的非对称密钥。​单击创建 Key，页面将自动创建一对公钥和私钥，公钥自动配置在扣子编程中，私钥以private_key.pem文件格式由网页自动下载至本地。支持创建最多三对公钥和私钥。​建议将private_key.pem文件安全地存储在只有你的应用可以访问的位置。​扣子编程使用符合行业标准的 WebCrypto 加密标准，在浏览器前端创建非对称密钥，密钥强度符合行业标准。扣子编程任何时候都不会上传私钥到后端。请你放心使用。​ |
| 权限​ | 应用程序调用扣子 API 时需要的权限范围。不同层级权限的生效范围请参见​权限层级。​说明此处配置旨在于划定应用的权限范围，并未完成授权操作。创建 OAuth 应用后还需要参考后续操作完成授权。​​ |

- 建议将 private_key.pem 文件安全地存储在只有你的应用可以访问的位置。 ​

- 扣子编程使用符合行业标准的 WebCrypto 加密标准，在浏览器前端创建非对称密钥，密钥强度符合行业标准。扣子编程任何时候都不会上传私钥到后端。请你放心使用。 ​



- 在弹出的 安装并授权 对话框中，请务必认真核对应用名称、权限列表等重要信息，确认无误后单击 授权 。 ​

- ​ ​ ​ ​ ​


- ​ ​ ​ ​ ​


- 个人版：需分享给目标工作空间所有者。 ​

- 企业版：需分享给目标组织的超级管理员或管理员。 ​


- ​ ​ ​ ​ ​

- Header ​

- Header 部分的参数定义如下： ​

- ​ 参数 ​ 类型 ​ 是否必选 ​ 说明 ​ alg ​ String ​ 必选 ​ 签名使用的加密算法。固定为 RS256，即非对称加密算法，一种基于 RSA（非对称加密算法）+ SHA256（安全哈希函数）的签名算法，该算法使用私钥进行签名，公钥进行验证。 ​ typ ​ String ​ 必选 ​ 固定为 JWT。 ​ kid ​ String ​ 必选 ​ OAuth 应用的 公钥指纹 ，可以在 OAuth 应用 页面找到这个应用，在 操作 列单击编辑图标，进入 配置 页面查看公钥指纹。 ​ ​

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| alg​ | String​ | 必选​ | 签名使用的加密算法。固定为 RS256，即非对称加密算法，一种基于 RSA（非对称加密算法）+ SHA256（安全哈希函数）的签名算法，该算法使用私钥进行签名，公钥进行验证。​ |
| typ​ | String​ | 必选​ | 固定为 JWT。​ |
| kid​ | String​ | 必选​ | OAuth 应用的公钥指纹，可以在OAuth 应用页面找到这个应用，在操作列单击编辑图标，进入配置页面查看公钥指纹。​ |

- Header 示例如下： ​

- ​ JSON 复制 { ​ "alg" : "RS256" , // 固定为RS256 ​ "typ" : "JWT" , // 固定为 JWT ​ "kid" : "gdehvaDegW....." // OAuth 应用的公钥指纹 ​ } ​ ​

- Payload： ​

- Payload 部分的参数定义如下： ​

- ​ 参数 ​ 类型 ​ 是否必选 ​ 说明 ​ iss ​ String ​ 必选 ​ OAuth 应用的 ID，可以在 OAuth 应用 页面查看。 ​ aud ​ String ​ 必选 ​ 扣子 API 的 Endpoint，即 api.coze.cn 。 ​ iat ​ Integer ​ 必选 ​ JWT 开始生效的时间，Unixtime 时间戳格式，精确到秒。一般为当前时刻。 ​ exp ​ Integer ​ 必选 ​ JWT 过期的时间，Unixtime 时间戳格式，精确到秒。必须晚于 iat。 ​ jti ​ String ​ 必选 ​ 随机字符串，用于防止重放攻击。建议长度大于 32 字节。每次签署 JWT 时应指定为不同的字符串。 ​ session_name ​ String ​ 可选 ​ 访问令牌的会话标识。目前仅限在会话隔离场景下使用，即将 session_name 指定为用户在业务侧的 UID，以此区分不同业务侧用户的对话历史。 ​ 若未指定 session_name，不同用户的对话历史可能会掺杂在一起。 ​ session_context ​ Object ​ 可选 ​ 会话上下文信息，包含设备相关信息等。 ​ ​ ​

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| iss​ | String​ | 必选​ | OAuth 应用的 ID，可以在OAuth 应用页面查看。​ |
| aud​ | String​ | 必选​ | 扣子 API 的 Endpoint，即api.coze.cn。​ |
| iat​ | Integer​ | 必选​ | JWT 开始生效的时间，Unixtime 时间戳格式，精确到秒。一般为当前时刻。​ |
| exp​ | Integer​ | 必选​ | JWT 过期的时间，Unixtime 时间戳格式，精确到秒。必须晚于 iat。​ |
| jti​ | String​ | 必选​ | 随机字符串，用于防止重放攻击。建议长度大于 32 字节。每次签署 JWT 时应指定为不同的字符串。​ |
| session_name​ | String​ | 可选​ | 访问令牌的会话标识。目前仅限在会话隔离场景下使用，即将 session_name 指定为用户在业务侧的 UID，以此区分不同业务侧用户的对话历史。​若未指定 session_name，不同用户的对话历史可能会掺杂在一起。​ |
| session_context​ | Object​ | 可选​ | 会话上下文信息，包含设备相关信息等。​​ |

- Payload 示例如下： ​

- ​ JSON 复制 { ​ "iss" : "310000000002" , // OAuth 应用的 I D ​ "aud" : "api.coze.cn" , //扣子 API 的Endpoin t ​ "iat" : 1516239022 , // JWT开始生效的时间，秒级时间 戳 ​ "exp" : 1516259022 , // JWT过期时间，秒级时间 戳 ​ "jti" : "fhjashjgkhalskj" // 随机字符串，防止重放攻 击 ​ } ​ ​

- 扣子个人版： {account_id} 为目标资源所属工作空间的所有者 UID。获取 UID 的具体步骤，请参考 ​ 获取资源所属工作空间的所有者 UID 。 ​

- 扣子企业版多组织场景： {account_id} 为目标资源所属组织的组织 ID。组织超级管理员或管理员可以在 组织设置 页面查看对应的组织 ID。 ​

- 请求示例 ​

- ​ Shell 复制 curl --location --request POST 'https:// api.coze.cn /api/permission/oauth2/account/292298289606****/token' \ ​ --header 'Content-Type: application/json' \ ​ --header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZZd2ZsdFR1OWZBbWtwWFhSdnR5UmREc3RONVMzZWNFcDFqVzB6dVQyRE****.eyJpc3MiOiIzMTAwMDAwMDAwMDIiLCJhdWQiOiJhcGkuY296ZS5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTkxNjI1OTAyMiwianRpIjoiZmhqaGFsc2tqZmFkc2pld3F****.CuoiCCF-nHFyGmu2EKlwFoyd3uDyKQ3Drc1CrXQyMVySTzZlZd2M7zKWsziB3AktwbUZiRJlQ1HbghR05CW2YRHwKL4-dlJ4koR3onU7iQAO5DkPCaIxbAuTsQobtCAdkkZTg8gav9EnN1QN_1xq0w8BzuuhS7wCeY8UbaskkTK9GnO4eU9tEINmVw-2CrfB-kNbEHlEDwXfcrb4YPpkw3GhmuPShenNLObfSWS0CqIyakXL8qD5AgXLoB-SejAsRdzloSUInNXENJHfSVMkThxRhJy7yEjX3BmculC54fMKENRfLElBqwJyLLUjeRHsYnaru2ca4W8_yaPJ7F****' \ ​ --data '{ ​ "duration_seconds": 86399, ​ "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer" ​ }' ​ ​

- 返回示例 ​

- ​ Bash 复制 { ​ "access_token" : "czs_RQOhsc7vmUzK4bNgb7hn4wqOgRBYAO6xvpFHNbnl6RiQJX3cSXSguIhFDzgy****" , ​ "expires_in" : 1721135859 ​ } ​ ​





- ​ ​ ​ ​ ​


- ​ ​ ​ ​ ​

- JWT 仅能使用一次，如需再次申请 OAuth Access Token，必须重新生成一个 JWT。 ​

- OAuth Access Token 的有效期默认为 15 分钟，不支持刷新。如需获取新的 Access Token，你需要再次生成一个 JWT，并调用此接口。 ​

| 请求方式​ | POST​ |
| 请求地址​ | https://api.coze.cn/api/permission/oauth2/account/{account_id}/token​ |

| 参数​ | 取值​ | 说明​ |
| Content-Type​ | application/json​ | 请求正文的方式。​ |
| Authorization​ | Bearer$JWT​ | 使用应用的客户端私钥签署的 JWT。生成方式可参考​2 签署 JWT。​ |

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| account_id​ | String​ | 必选​ | 扣子个人版：account_id为目标资源所属工作空间的所有者 UID。获取 UID 的具体步骤，请参考​获取资源所属工作空间的所有者 UID。​扣子企业版多组织场景：account_id为目标资源所属组织的组织 ID。你可以在组织管理>组织设置页面查看对应的组织 ID。​​​​​​ |

- 扣子个人版： account_id 为目标资源所属工作空间的所有者 UID。获取 UID 的具体步骤，请参考 ​ 获取资源所属工作空间的所有者 UID 。 ​

- 扣子企业版多组织场景： account_id 为目标资源所属组织的组织 ID。你可以在 组织管理 > 组织设置 页面查看对应的组织 ID。 ​

- ​ ​ ​ ​ ​

| 字段​ | 类型​ | 是否必选​ | 说明​ |
| grant_type​ | String​ | 必选​ | 固定为urn:ietf:params:oauth:grant-type:jwt-bearer。​ |
| duration_seconds​ | Integer​ | 可选​ | 申请的 AccessToken 有效期，单位为秒，默认 900 秒，即 15 分钟。最大可设置为 86399 秒，即 24 小时。​ |

| 字段​ | 类型​ | 说明​ |
| access_token​ | String​ | OAuth Access Token。​ |
| expires_in​ | Integer​ | OAuth Access Token 的过期时间，Unixtime 时间戳格式，精度为秒。​ |

| error_code​ | error_message​ | 说明​ |
| invalid_request​ | invalid request: {parameter}​​ | 原因：请求参数 {parameter} 错误。​解决方案：请参考 API 文档查看参数说明。​ |
| invalid_client​ | /​ | 原因：客户端凭证（JWT Token 或者 Client Secret）无效。​解决方案：请校验您的客户端凭证。​ |
| unsupported_grant_type​ | not supported grant type: {grant type}​ | 原因：不支持的授权类型 {grant type}。​解决方案：请参考 API 文档指定正确的授权类型。​ |
| access_deny​ | app: {app name} is currently deactivated by the owner​ | 原因：OAuth 应用已被禁用。​解决方案：在扣子编程中启用 OAuth 应用。​ |
| ​ | invalid app type​ | 原因：应用类型错误。​解决方案：渠道应用暂不支持授权码模式。​ |
| ​ | login session invalid​ | 原因：登录态无效。​解决方案：用户需要重新登录扣子编程。​ |
| internal_error​ | Service internal error.​ | 原因：服务内部错误。​解决方案：建议稍后重试。​ |

- 原因：请求参数 {parameter} 错误。 ​

- 解决方案：请参考 API 文档查看参数说明。 ​

- 原因：客户端凭证（JWT Token 或者 Client Secret）无效。 ​

- 解决方案：请校验您的客户端凭证。 ​

- 原因：不支持的授权类型 {grant type}。 ​

- 解决方案：请参考 API 文档指定正确的授权类型。 ​

- 原因：OAuth 应用已被禁用。 ​

- 解决方案：在 扣子 编程中启用 OAuth 应用。 ​

- 原因：应用类型错误。 ​

- 解决方案：渠道应用暂不支持授权码模式。 ​

- 原因：登录态无效。 ​

- 解决方案：用户需要重新登录 扣子 编程。 ​

- 原因：服务内部错误。 ​

- 解决方案：建议稍后重试。 ​