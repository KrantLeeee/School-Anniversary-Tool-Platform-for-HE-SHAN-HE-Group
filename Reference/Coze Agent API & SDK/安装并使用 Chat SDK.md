# 安装并使用 Chat SDK

> 来源: https://www.coze.cn/open/docs/developer_guides/install_web_sdk

| 浏览器​ | 版本限制​ |
| Chrome​ | 87.0 及以上​ |
| Edge​ | 88.0 及以上​ |
| Safari​ | 14.0 及以上​ |
| Firefox​ | 78.0 及以上​ |

| 场景​ | 推荐方案​ | 说明​ | 参考文档​ |
| 开发调试​ | 个人访问令牌（PAT）​ | 快速跑通 Chat SDK 的整体流程。​ | ​添加个人访问令牌​ |
| 生产环境​ | 服务访问令牌（SAT）​ | 操作更简单，能够有效简化授权流程，适合需要长期稳定访问且无需进行会话隔离的场景。​仅企业版（企业标准版、企业旗舰版）支持使用 SAT 鉴权。​ | ​添加服务访问令牌​ |
| ​ | OAuth 鉴权​ | 支持渠道用户访问智能体、会话隔离（即智能体不同账号的消息内容互相隔离）。​ | ​OAuth 应用管理​​OAuth JWT 授权（渠道场景）​ |

| 密钥类型​ | PAT /SAT /普通 OAuth​ | 渠道 OAuth 访问密钥​ |
| 权限点​​ | Bot管理​chat​getMetadata​会话管理​listConversation​createConversation​editConversation​对话​cancelChat​工作流​getMetadata​应用管理​getMetadata​文件​uploadFile​消息​listMessage​智能音视频​createTranscription​createSpeech​ | botChat​getMetadata​listConversation​createConversation​editConversation​uploadFile​listConversationMessage​cancelConversationChat​createTranscription​createSpeech​​ |

- Bot管理 ​

- chat ​

- getMetadata ​

- 会话管理 ​

- listConversation ​

- createConversation ​

- editConversation ​

- 对话 ​

- cancelChat ​

- 工作流 ​

- getMetadata ​

- 应用管理 ​

- getMetadata ​

- 文件 ​

- uploadFile ​

- 消息 ​

- listMessage ​

- 智能音视频 ​

- createTranscription ​

- createSpeech ​

- botChat ​

- getMetadata ​

- listConversation ​

- createConversation ​

- editConversation ​

- uploadFile ​

- listConversationMessage ​

- cancelConversationChat ​

- createTranscription ​

- createSpeech ​

- ​ 发布为 Chat SDK ​

- ​ 发布到 Chat SDK ​

- config ：必选参数，表示智能体的配置信息。 ​

- 调用智能体时，需要设置以下参数： ​

- ​

- auth ：表示鉴权方式。当未配置此参数时表示不鉴权。为了账号安全，建议配置鉴权。 ​

- ​

- config ：必选参数，表示应用的配置信息。 ​

- ​

- auth ：表示鉴权方式。当未配置此参数时表示不鉴权。为了账号安全，建议配置鉴权。 ​

- ​

- onHide： 当聊天框隐藏的时候，会回调该方法。 ​

- onShow: 当聊天框显示的时候，会回调该方法。 ​

- onBeforeShow: 聊天框显示前调用，如果返回了 false，则不会显示。支持异步函数。 ​

- onBeforeHide: 聊天框隐藏前调用，如果返回了 false，则不会隐藏。支持异步函数。 ​