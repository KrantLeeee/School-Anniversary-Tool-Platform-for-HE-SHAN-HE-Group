# OAuth 设备授权

> 来源: https://www.coze.cn/open/docs/developer_guides/oauth_device_code

- ​ 配置 ​ 说明 ​ 应用类型 ​ OAuth 应用的类型，此处设置为 普通 。 ​ 客户端类型 ​ 客户端类型，此处设置为 TV端/设备应用/类命令行程序 。 ​ 应用名称 ​ 应用的名称，在 扣子 编程中全局唯一。 ​ 描述 ​ 应用的基本描述信息。 ​ ​

| 配置​ | 说明​ |
| 应用类型​ | OAuth 应用的类型，此处设置为普通。​ |
| 客户端类型​ | 客户端类型，此处设置为TV端/设备应用/类命令行程序。​ |
| 应用名称​ | 应用的名称，在扣子编程中全局唯一。​ |
| 描述​ | 应用的基本描述信息。​ |


- ​ 配置 ​ 说明 ​ 权限 ​ 应用程序调用 扣子 API 时需要的权限范围。 ​ 说明 此处配置旨在于划定应用的权限范围，并未完成授权操作。授权操作可参考 授权流程 部分。 ​ ​ 客户端 ID ​ 客户端 ID，即 client id，是应用程序的公共标识符。 由 扣子 编程自动生成。 ​ ​

| 配置​ | 说明​ |
| 权限​ | 应用程序调用扣子API 时需要的权限范围。​说明此处配置旨在于划定应用的权限范围，并未完成授权操作。授权操作可参考授权流程部分。​​ |
| 客户端 ID​ | 客户端 ID，即 client id，是应用程序的公共标识符。 由扣子编程自动生成。​ |


- 说明 扣子 编程支持多人协作场景下跨账号的 OAuth 授权，发起 API 请求时如果指定空间 ID，空间协作者也可以为应用程序授予团队空间中的资源权限。详细说明可参考 ​ OAuth 授权（多人协作场景） 。 ​ ​





| 请求方式​ | POST​ |
| 请求地址​ | 普通授权场景：https://api.coze.cn/api/permission/oauth2/device/code​多人协作场景：https://api.coze.cn/api/permission/oauth2/workspace_id/${workspace_id}/device/code​ |

- 普通授权场景： https:// api.coze.cn /api/permission/oauth2 /device/code ​

- 多人协作场景： https:// api.coze.cn /api/permission/oauth2/workspace_id/ ${workspace_id} /device/code ​

| 字段​ | 类型​ | 是否必选​ | 说明​ |
| workspace_id​ | String​ | 可选​ | 空间 ID。多人协作场景下必选。​请求的 Path 中不指定空间 ID 时，授予 Access Token 当前登录账号拥有的所有空间权限；如果指定了空间 ID，表示授予 Access Token 指定空间的权限。资源范围为此空间下的所有资源，包括智能体、知识库、工作流等资源。详细说明可参考​OAuth 授权（多人协作场景）。​ |

| 参数​ | 取值​ | 说明​ |
| Content-Type​ | application/json​ | 请求正文的方式。​ |

| 字段​ | 类型​ | 是否必选​ | 说明​ |
| client_id​ | String​ | 必选​ | 客户端 ID。创建 OAuth 应用时获取的客户端 ID。​ |

| 字段​ | 类型​ | 说明​ |
| device_code​ | String​ | 设备验证码​ |
| user_code​ | Integer​ | 用户验证码​ |
| verification_uri​ | String​ | 验证页面地址​ |
| expires_in​ | Integer​ | device_code 和 user_code 可用时间，单位：秒，默认返回300秒；​ |
| interval​​ | Integer​ | 客户端轮询Token请求的最短间隔时间，单位：秒， 默认为5秒。​ |

| 请求方式​ | POST​ |
| 请求地址​ | https://api.coze.cn/api/permission/oauth2/token​ |

| 参数​ | 取值​ | 说明​ |
| Content-Type​ | application/json​ | 请求正文的方式。​ |

| 字段​ | 类型​ | 是否必选​ | 说明​ |
| client_id​ | String​ | 必选​ | 创建 OAuth 应用时获取的客户端 ID。​ |
| grant_type​ | String​ | 必选​ | 固定值，"urn:ietf:params:oauth:grant-type:device_code"​ |
| device_code​​ | String​ | 必选​ | 设备验证码，从 Device Authorization API response 中获取​ |

| 字段​ | 类型​ | 说明​ |
| access_token​ | String​ | 访问令牌。​ |
| expires_in​ | Integer​ | 访问令牌过期时间，秒级时间戳。​ |
| refresh_token​ | String​ | 新的 refresh_token，用于重新获取 OAuth Access Token。​ |
| error​ | String​ | 错误码：​authorization_pending：用户还未完成授权，请稍后重试​slow_down：请求太频繁，请稍后重试​access_denied：用户已拒绝授权请求​expired_token：“device_code”已过期​ |
| error_description​ | String​ | 错误详细描述​ |

- authorization_pending：用户还未完成授权，请稍后重试 ​

- slow_down：请求太频繁，请稍后重试 ​

- access_denied：用户已拒绝授权请求 ​

- expired_token：“device_code”已过期 ​