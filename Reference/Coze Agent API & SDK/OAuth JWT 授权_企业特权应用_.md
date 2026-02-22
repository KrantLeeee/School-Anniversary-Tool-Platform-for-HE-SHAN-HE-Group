# OAuth JWT 授权（企业特权应用）

> 来源: https://www.coze.cn/open/docs/developer_guides/oauth_jwt_privilege

- 套餐版本 ：企业版（企业旗舰版、企业标准版）。 ​

- 角色限制 ：组织的超级管理员、管理员。 ​

- 组织限制 ：仅支持在 默认组织 中创建 OAuth JWT 授权（企业特权应用）。 ​









- ​ 配置 ​ 说明 ​ 应用类型 ​ 应用的类型，此处应指定为 企业特权应用 。 ​ 客户端类型 ​ 客户端类型，仅支持 服务类应用 。 ​ 应用名称 ​ 应用的名称，在扣子编程中全局唯一。 ​ 描述 ​ 应用的基本描述信息。 ​ ​

| 配置​ | 说明​ |
| 应用类型​ | 应用的类型，此处应指定为企业特权应用。​ |
| 客户端类型​ | 客户端类型，仅支持服务类应用。​ |
| 应用名称​ | 应用的名称，在扣子编程中全局唯一。​ |
| 描述​ | 应用的基本描述信息。​ |


- ​ ​ ​ ​ ​

- ​ 配置 ​ 说明 ​ 公钥和私钥 ​ 用于应用程序客户端身份认证的非对称密钥。 ​ 单击 创建 Key ，页面将自动创建一对公钥和私钥，公钥自动配置在扣子编程中，私钥以 private_key.pem 文件格式由网页自动下载至本地 Downloads 目录下。支持创建最多三对公钥和私钥。 ​ 说明 建议将 private_key.pem 文件安全地存储在只有您的应用可以访问的位置。 ​ 扣子编程使用符合行业标准的 WebCrypto 加密标准，在浏览器前端创建非对称密钥，密钥强度符合行业标准。扣子编程任何时候都不会上传私钥到后端。请您放心使用。 ​ ​ 权限 ​ 应用程序调用扣子 API 时需要的权限范围。不同层级权限的生效范围请参见 ​ 权限层级 。 ​ 说明 此处配置旨在于划定应用的权限范围，并未完成授权操作。创建 OAuth 应用后还需要参考后续操作完成授权。 ​ ​ ​

| 配置​ | 说明​ |
| 公钥和私钥​ | 用于应用程序客户端身份认证的非对称密钥。​单击创建 Key，页面将自动创建一对公钥和私钥，公钥自动配置在扣子编程中，私钥以private_key.pem文件格式由网页自动下载至本地Downloads目录下。支持创建最多三对公钥和私钥。​说明建议将private_key.pem文件安全地存储在只有您的应用可以访问的位置。​扣子编程使用符合行业标准的 WebCrypto 加密标准，在浏览器前端创建非对称密钥，密钥强度符合行业标准。扣子编程任何时候都不会上传私钥到后端。请您放心使用。​​ |
| 权限​ | 应用程序调用扣子 API 时需要的权限范围。不同层级权限的生效范围请参见​权限层级。​说明此处配置旨在于划定应用的权限范围，并未完成授权操作。创建 OAuth 应用后还需要参考后续操作完成授权。​​ |

- 建议将 private_key.pem 文件安全地存储在只有您的应用可以访问的位置。 ​

- 扣子编程使用符合行业标准的 WebCrypto 加密标准，在浏览器前端创建非对称密钥，密钥强度符合行业标准。扣子编程任何时候都不会上传私钥到后端。请您放心使用。 ​



- ​ ​ ​ ​ ​

- Header ​

- Header 部分的参数定义如下： ​

- ​ 参数 ​ 类型 ​ 是否必选 ​ 说明 ​ alg ​ String ​ 必选 ​ 签名使用的加密算法。固定为 RS256，即非对称加密算法，一种基于 RSA（非对称加密算法）+ SHA256（安全哈希函数）的签名算法，该算法使用私钥进行签名，公钥进行验证。 ​ typ ​ String ​ 必选 ​ 固定为 JWT。 ​ kid ​ String ​ 必选 ​ OAuth 应用的 公钥指纹 ，可以在 OAuth 应用 页面找到这个应用，在 操作 列单击编辑图标，进入 配置 页面查看公钥指纹。 ​ ​ ​ ​ ​ ​ ​

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| alg​ | String​ | 必选​ | 签名使用的加密算法。固定为 RS256，即非对称加密算法，一种基于 RSA（非对称加密算法）+ SHA256（安全哈希函数）的签名算法，该算法使用私钥进行签名，公钥进行验证。​ |
| typ​ | String​ | 必选​ | 固定为 JWT。​ |
| kid​ | String​ | 必选​ | OAuth 应用的公钥指纹，可以在OAuth 应用页面找到这个应用，在操作列单击编辑图标，进入配置页面查看公钥指纹。​​​​​​ |

- Header 示例如下： ​

- ​ JSON 复制 { ​ "alg" : "RS256" , // 固定为RS256 ​ "typ" : "JWT" , // 固定为 JWT ​ "kid" : "gdehvaDegW....." // OAuth 应用的公钥指纹 ​ } ​ ​

- Payload： ​

- Payload 部分的参数定义如下： ​

- ​ 参数 ​ 类型 ​ 是否必选 ​ 说明 ​ iss ​ String ​ 必选 ​ OAuth 应用的 ID，可以在 OAuth 应用 页面查看。 ​ aud ​ String ​ 必选 ​ 扣子 API 的 Endpoint，即 api.coze.cn 。 ​ iat ​ Integer ​ 必选 ​ JWT 开始生效的时间，Unixtime 时间戳格式，精确到秒。一般为当前时刻。 ​ exp ​ Integer ​ 必选 ​ JWT 过期的时间，Unixtime 时间戳格式，精确到秒。必须晚于 iat。 ​ jti ​ String ​ 必选 ​ 随机字符串，用于防止重放攻击。建议长度大于 32 字节。每次签署 JWT 时应指定为不同的字符串。 ​ session_name ​ String ​ 可选 ​ 访问令牌的会话标识。目前仅限在会话隔离场景下使用，即将 session_name 指定为用户在业务侧的 UID，以此区分不同业务侧用户的对话历史。 ​ 若未指定 session_name，不同用户的对话历史可能会掺杂在一起。 ​ 说明 会话隔离的详细实现方法请参见 ​ 如何实现会话隔离 。 ​ ​ session_context ​ Object ​ 可选 ​ 会话上下文信息，包含设备相关信息等。 ​ ​ session_context.device_info ​ Object ​ 可选 ​ 用于配置设备相关信息，扣子编程基于该部分信息对设备做用量管控以及账单记录。 ​ 说明 仅扣子企业旗舰版支持该参数。硬件设备用量管控的具体操作可参考 ​ 终端用户用量查询和配额管控 。 ​ ​ session_context.device_info.device_id ​ String ​ 可选 ​ IoT 等硬件设备 ID，一个设备对应一个唯一的设备号。 ​ 当需要记录设备用量或对设备用量进行管控时，需要填写该参数，否则，无法对设备进行用量管控，用量统计页面对应的设备 ID 将显示为 N/A。 ​ session_context.device_info.custom_consumer ​ ​ String ​ 可选 ​ 自定义维度的实体 ID，你可以根据业务需要进行设置，例如 APP 上的用户名等。 ​ 当需要记录设备用量或对设备用量进行管控，需要填写该参数，否则，无法对设备进行用量管控，用量统计页面对应的自定义 ID 将显示为 N/A。 ​ 说明 device_id 和 custom_consumer 建议选择其中一个即可。 ​ custom_consumer 参数用于设备用量管控，与对话等 API 传入的 user_id 无关， user_id 主要用于上下文、数据库隔离等场景。 ​ 出于数据隐私及信息安全等方面的考虑，不建议使用业务系统中定义的用户敏感标识（如手机号等）作为 custom_consumer 的值。 ​ ​ ​

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| iss​ | String​ | 必选​ | OAuth 应用的 ID，可以在OAuth 应用页面查看。​ |
| aud​ | String​ | 必选​ | 扣子 API 的 Endpoint，即api.coze.cn。​ |
| iat​ | Integer​ | 必选​ | JWT 开始生效的时间，Unixtime 时间戳格式，精确到秒。一般为当前时刻。​ |
| exp​ | Integer​ | 必选​ | JWT 过期的时间，Unixtime 时间戳格式，精确到秒。必须晚于 iat。​ |
| jti​ | String​ | 必选​ | 随机字符串，用于防止重放攻击。建议长度大于 32 字节。每次签署 JWT 时应指定为不同的字符串。​ |
| session_name​ | String​ | 可选​ | 访问令牌的会话标识。目前仅限在会话隔离场景下使用，即将 session_name 指定为用户在业务侧的 UID，以此区分不同业务侧用户的对话历史。​若未指定 session_name，不同用户的对话历史可能会掺杂在一起。​说明会话隔离的详细实现方法请参见​如何实现会话隔离。​​ |
| session_context​ | Object​ | 可选​ | 会话上下文信息，包含设备相关信息等。​​ |
| session_context.device_info​ | Object​ | 可选​ | 用于配置设备相关信息，扣子编程基于该部分信息对设备做用量管控以及账单记录。​说明仅扣子企业旗舰版支持该参数。硬件设备用量管控的具体操作可参考​终端用户用量查询和配额管控。​​ |
| session_context.device_info.device_id​ | String​ | 可选​ | IoT 等硬件设备 ID，一个设备对应一个唯一的设备号。​当需要记录设备用量或对设备用量进行管控时，需要填写该参数，否则，无法对设备进行用量管控，用量统计页面对应的设备 ID 将显示为 N/A。​ |
| session_context.device_info.custom_consumer​​ | String​ | 可选​ | 自定义维度的实体 ID，你可以根据业务需要进行设置，例如 APP 上的用户名等。​当需要记录设备用量或对设备用量进行管控，需要填写该参数，否则，无法对设备进行用量管控，用量统计页面对应的自定义 ID 将显示为 N/A。​说明device_id和custom_consumer建议选择其中一个即可。​custom_consumer参数用于设备用量管控，与对话等 API 传入的user_id无关，user_id主要用于上下文、数据库隔离等场景。​出于数据隐私及信息安全等方面的考虑，不建议使用业务系统中定义的用户敏感标识（如手机号等）作为custom_consumer的值。​​ |

- device_id 和 custom_consumer 建议选择其中一个即可。 ​

- custom_consumer 参数用于设备用量管控，与对话等 API 传入的 user_id 无关， user_id 主要用于上下文、数据库隔离等场景。 ​

- 出于数据隐私及信息安全等方面的考虑，不建议使用业务系统中定义的用户敏感标识（如手机号等）作为 custom_consumer 的值。 ​

- Payload 示例如下： ​

- ​ JSON 复制 { ​ "iss" : "310000000002" , // OAuth 应用的 ID ​ "aud" : "api.coze.cn" , // 扣子 API 的 Endpoint ​ "iat" : 1516239022 , // JWT 开始生效的时间，秒级时间戳 ​ "exp" : 1516259022 , // JWT 过期时间，秒级时间戳 ​ "jti" : "fhjashjgkhalskj" , // 随机字符串，防止重放攻击 ​ "session_name" : "user_2222" , //用户在业务侧的 UID ​ "session_context" : { ​ "device_info" : { ​ "device_id" : "1234567890" // IoT 等硬件设备的唯一标识 ID ​ } ​ } ​ } ​ ​

- JWT 仅能使用一次，如需再次申请 OAuth Access Token，必须重新生成一个 JWT。 ​

- OAuth Access Token 的有效期默认为 15 分钟，不支持刷新。如需获取新的 Access Token，你需要再次生成一个 JWT，并调用此接口。 ​

| 请求方式​ | POST​ |
| 请求地址​ | https://api.coze.cn/api/permission/oauth2/enterprise_id/{enterprise_id}/token​ |

| 参数​ | 取值​ | 说明​ |
| Content-Type​ | application/json​ | 请求正文的方式。​ |
| Authorization​ | Bearer$JWT​ | 使用应用的客户端私钥签署的 JWT。生成方式可参考​2 签署 JWT。​ |

| 字段​ | 类型​ | 是否必选​ | 说明​ |
| enterprise_id​ | String​ | 必选​ | 企业 ID。你可以在组织管理>组织设置页面查看企业 ID。​​​​​​ |

| 字段​ | 类型​ | 是否必选​ | 说明​ |
| grant_type​ | String​ | 必选​ | 固定为urn:ietf:params:oauth:grant-type:jwt-bearer。​ |
| duration_seconds​ | Integer​ | 可选​ | 申请的 AccessToken 有效期，单位为秒，默认 900 秒，即 15 分钟。最大可设置为 86399 秒，即 24 小时。​ |

| 字段​ | 类型​ | 说明​ |
| access_token​ | String​ | OAuth Access Token。​ |
| expires_in​ | Integer​ | OAuth Access Token 的过期时间，Unixtime 时间戳格式，单位为秒。​ |

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