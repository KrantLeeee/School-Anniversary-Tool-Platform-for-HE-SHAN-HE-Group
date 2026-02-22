# 成员管理（火山 API）

> 来源: https://www.coze.cn/open/docs/developer_guides/create_coze_user

- 鉴权方式 ：仅支持火山引擎的鉴权方式，需使用火山账号的 AccessKey 和 SecretKey ，不支持扣子编程的访问令牌。 ​

- 调用方法 ：成员管理使用火山引擎 OpenAPI 的请求结构和返回结构，具体请参见 请求结构 、 返回结构 。 ​

- 在线调用工具 ：你可以通过火山引擎 API Explorer 快速发起 API 调用，获取响应结果和代码示例。扣子编程 Playground 不支持调用本文所列的 API。 ​

- SDK ：你 可以使用火山引擎提供的 Volcengine SDK 实现成员管理 ， 该 SDK 已内置 AK/SK 签名逻辑，无需自行实现， SDK 接入方法请参见 Volcengine SDK 接入指南 。 扣子编程自身的 SDK 不含成员管理相关接口。 ​

- 每次请求只能新增一位成员。如需添加多位，请依次发送请求。 ​

- 该 API 不支持并发请求。 ​

- 创建成员后，会自动将其加入扣子编程的团队/企业中。 ​