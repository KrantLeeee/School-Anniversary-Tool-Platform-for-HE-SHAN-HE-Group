# OAuth PKCE

> 来源: https://www.coze.cn/open/docs/developer_guides/oauth_pkce

- ​ 配置 ​ 说明 ​ 应用类型 ​ OAuth 应用的类型，此处设置为 普通 。 ​ 客户端类型 ​ 客户端类型，此处设置为 移动端/PC 桌面端/单页面应用 。 ​ 应用名称 ​ 应用的名称，在扣子编程中全局唯一。 ​ 描述 ​ 应用的基本描述信息。 ​ ​

| 配置​ | 说明​ |
| 应用类型​ | OAuth 应用的类型，此处设置为普通。​ |
| 客户端类型​ | 客户端类型，此处设置为移动端/PC 桌面端/单页面应用。​ |
| 应用名称​ | 应用的名称，在扣子编程中全局唯一。​ |
| 描述​ | 应用的基本描述信息。​ |


- ​ 配置 ​ 说明 ​ 权限 ​ 应用程序调用扣子 API 时需要的权限范围。 ​ 说明 此处配置旨在于划定应用的权限范围，并未完成授权操作。授权操作可参考 授权流程 部分。 ​ ​ 重定向 URL ​ 重定向的 URL 地址。用户完成授权后，扣子编程的授权服务器将通过重定向 URL 返回授权相关的凭据。最多可添加 3 个不同的 URL 地址。 ​ 重定向 URL 仅支持 HTTP 和 HTTPs。为了保证数据传输安全，请勿在生产环境使用HTTP 协议地址。 ​ 对于测试场景，您可以指定引用本地机器的 URL，例如 http://localhost:8080 。 ​ 客户端 ID ​ 客户端 ID，即 client id，是应用程序的公共标识符。 由扣子编程自动生成。 ​ ​

| 配置​ | 说明​ |
| 权限​ | 应用程序调用扣子 API 时需要的权限范围。​说明此处配置旨在于划定应用的权限范围，并未完成授权操作。授权操作可参考授权流程部分。​​ |
| 重定向 URL​ | 重定向的 URL 地址。用户完成授权后，扣子编程的授权服务器将通过重定向 URL 返回授权相关的凭据。最多可添加 3 个不同的 URL 地址。​重定向 URL 仅支持 HTTP 和 HTTPs。为了保证数据传输安全，请勿在生产环境使用HTTP 协议地址。​对于测试场景，您可以指定引用本地机器的 URL，例如http://localhost:8080。​ |
| 客户端 ID​ | 客户端 ID，即 client id，是应用程序的公共标识符。 由扣子编程自动生成。​ |

- 重定向 URL 仅支持 HTTP 和 HTTPs。为了保证数据传输安全，请勿在生产环境使用HTTP 协议地址。 ​

- 对于测试场景，您可以指定引用本地机器的 URL，例如 http://localhost:8080 。 ​


- 例如点击和 Bot 对话的按钮。该动作对应扣子 发起对话 API，应用程序需要获得扣子账号的授权。 ​


- 客户端生成一个随机值 code_verifier，并根据指定算法将其转换为 code_challenge。其中转换算法为 code_challenge_method，转换通常使用 SHA-256 算法，并进行 Base64URL 编码，即 code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier))) 。 ​


- 应用程序通过 302 重定向方式发起 ​ 获取授权页面 URL API 请求。请求中携带 OAuth 应用的客户端 ID、重定向 URL、临时密钥 code_challenge、转换算法 code_challenge_method 等信息。请求示例如下： ​

- ​

- ​


- Response Header 中的 location 字段中为跳转链接。例如 https://www.coze.cn/oauth/consent?authorize_key=JacVeqTW93ps5m5N9n34 *** rnNp 。浏览器跳转到此 URL，引导用户完成扣子账号授权。授权页面示例如下： ​

- ​

- ​ ​ ​ ​ ​


- 从重定向的 URL 地址中获取 code，例如本示例中 code 为 code_WZmPRDcjJhfwHD**** 。 ​

- ​


- 原始的随机值 code_verifier ​

- 转换算法 code_challenge_method ​

- 临时密钥 code_challenge ​


- 其中： ​

- access_token 即访问令牌，用于发起扣子 API 请求时鉴权，有效期为 15 分钟。 ​

- refresh_token 用于刷新 access_token，有效期为 30 天。refresh_token 到期前可以多次调用 ​ 刷新 OAuth Access Token 接口获取新的 refresh_token 和 access_token。 ​

- 如果当前用户未合法登录态，则 302 重定向至授权页 https://www.coze.cn/oauth2/authorize?authorize_key=1234gdaskljgflan 。 ​

- 如果当前用户未登录，则 302 重定向至登录页，登录页重定向至授权页 https://www.coze.cn/sign?redirect=https://www.coze.cn/oauth2/authorize?authorize_key=1234gdaskljgflan 。 ​