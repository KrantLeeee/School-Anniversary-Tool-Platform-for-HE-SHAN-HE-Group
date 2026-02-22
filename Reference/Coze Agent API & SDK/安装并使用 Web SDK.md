# 安装并使用 Web SDK

> 来源: https://www.coze.cn/open/docs/developer_guides/ui_builder_web_sdk

- 无缝集成： 将已发布的低代码应用作为独立组件嵌入 Web 页面。 ​

- 开箱即用： 集成后，低代码应用的 UI 和逻辑 无需二次开发 即可运行。 ​

- 快速部署： 通过简单的代码引入，可在几分钟内完成集成。 ​

- 在内部业务系统中嵌入业务流程 AI 辅助工具，例如报销单填写助手等。 ​

- 在电商平台嵌入交易辅助工具，例如 AI 导购/推荐助手等。 ​

- 在内容平台嵌入内容处理工具，例如文本生成、信息提炼工具等。 ​

| 浏览器​ | 版本限制​ |
| Chrome​ | 87.0 及以上​ |
| Edge​ | 88.0 及以上​ |
| Safari​ | 14.0 及以上​ |
| Firefox​ | 78.0 及以上​ |

- 体验或调试场景 ：建议开发者生成一个短期的个人访问令牌（PAT），快速跑通 Web SDK 的整体流程。 具体步骤请参见 添加个人访问令牌 。 ​

- 线上环境 ：线上环境应使用 OAuth 鉴权或 SAT 鉴权，详细说明请参考 鉴权方式概述 。 ​

| 密钥类型​ | PAT / SAT /普通 OAuth​ | 渠道 OAuth 访问密钥​ |
| 权限点​​ | Bot管理​chat​会话管理​listConversation​createConversation​editConversation​对话​cancelChat​文件​uploadFile​消息​listMessage​工作流​getMetadata​智能音视频​createTranscription​ | botChat​listConversation​createConversation​editConversation​uploadFile​listConversationMessage​cancelConversationChat​createTranscription​​​​ |

- Bot管理 ​

- chat ​

- 会话管理 ​

- listConversation ​

- createConversation ​

- editConversation ​

- 对话 ​

- cancelChat ​

- 文件 ​

- uploadFile ​

- 消息 ​

- listMessage ​

- 工作流 ​

- getMetadata ​

- 智能音视频 ​

- createTranscription ​

- botChat ​

- listConversation ​

- createConversation ​

- editConversation ​

- uploadFile ​

- listConversationMessage ​

- cancelConversationChat ​

- createTranscription ​




- ​ ​ ​ ​ ​


- ​ ​ ​ ​ ​

| 参数​ | 类型​ | 是否必选​ | 示例​ | 说明​ |
| token​ | String​ | 必选​ | pat_zxzSAzxawer234zASNElEglZxcm***​ | 指定使用的访问密钥。​调试场景可直接使用准备工作中添加的访问密钥；正式上线时建议通过 SAT 或 OAuth 实现鉴权逻辑，并将获取的访问密钥填写在此处。​ |
| appId​ | String​ | 必选​ | 740849137970326****​ | 低代码应用的 ID。在低代码应用编排页面的URL 中，project-ide 参数之后的字符串就是 appId。​ |
| container​ | String​ | 必选​ | #app​​ | 网页中承载 Web SDK 所有交互内容的元素的 CSS 选择器，Web SDK 会将其所有交互内容渲染至该元素内部。​例如：Web SDK 的安装代码中定义了承载元素<div id="app"></div>，则container的值为#app。​ |

| 参数​ | 类型​ | 是否必选​ | 示例​ | 说明​ |
| url​ | String​ | 必选​ | https://example.com/avatars/user123.png​ | 用户头像的 URL 地址，必须是一个可公开访问的地址。SDK 会通过该地址加载并显示用户头像。​​ |
| nickname​ | String​ | 必选​ | 小明​ | 用户的昵称，将在应用界面中显示，用于区分不同的对话用户。​ |
| id​ | String​ | 可选​ | user_123456​ | 用户的 ID，即用户在你的网站或应用中的账号 ID。未指定时，Web SDK 会自动为用户分配一个用户 ID。​该参数用于在对话时标识具体的用户。​ |

| 参数​ | 类型​ | 是否必选​ | 示例​ | 说明​ |
| className​ | String​ | 可选​ | coze-app-sdk​ | 为 Web SDK 渲染到页面中的 iframe 元素指定 CSS 类名，开发者可以通过这个类名，自定义样式。​不配置时，iframe 使用 Web SDK 的默认样式。​例如，若设置为coze-app-sdk，则可在 CSS 中通过.coze-app-sdk选择器定义该 iframe 的样式，具体示例请参见​完整示例代码。​ |

- 支持的应用类型不同 ​

- Web SDK：仅支持 低代码应用 ，且用户界面为 Web 端，不支持小程序端。 ​

- Chat SDK：支持 智能体 和 低代码应用 两种类型，支持小程序端。 ​

- 功能特性差异 ​

- Web SDK：低代码应用发布 Web SDK 时，会将低代码应用的 用户界面（UI）和业务逻辑 完整打包发布，集成后可直接在网站中呈现应用的现成交互界面，开发者无需二次开发页面。 ​

- Chat SDK：低代码应用发布 Chat SDK 时，仅包含智能体/低代码应用中的对话流、对话容器部分（Chatbot 类），不包含应用户界面，主要用于实现用户与 AI 智能体或应用的对话相关功能。 ​