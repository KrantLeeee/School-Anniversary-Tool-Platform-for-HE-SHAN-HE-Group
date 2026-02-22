# Java SDK 概述

> 来源: https://www.coze.cn/open/docs/developer_guides/java_overview

- Coze Java SDK 支持扣子所有 OpenAPI，对应的 API 文档可参考 ​ API 介绍 。 ​

- 示例代码将持续更新和补充，各种场景的 Coze Java SDK 最新版本 示例代码可参考 GitHub 。 ​

| 模块​ | 示例文件​ | 说明​ |
| 授权​ | TokenAuthExample.java​ | 通过个人访问密钥实现 OpenAPI 鉴权。​ |
| ​ | WebOAuthExample.java​ | 通过 OAuth 授权码方式实现授权与 OpenAPI 鉴权。​ |
| ​ | JWTsOauthExample.java​ | 通过 OAuth JWT 方式实现授权与 OpenAPI 鉴权。​ |
| ​ | PKCEOauthExample.java​ | 通过 OAuth PKCE 方式实现授权与 OpenAPI 鉴权。​ |
| ​ | DevicesOAuthExample.java​ | 通过 OAuth 设备码方式实现授权与 OpenAPI 鉴权。​ |
| 对话​ | ChatExample.java​ | 发起对话，响应方式为非流式响应。​ |
| ​ | StreamChatExample.java​ | 发起对话，响应方式为流式响应。​ |
| ​ | ChatWithImageExample.java​ | 发起对话，对话中上传文件，并发送多模态内容。​ |
| ​ | SubmitToolOutputExample.java​ | 端插件。​ |
| 会话与消息管理​ | CreateConversationExample.java​ | 创建会话。​ |
| ​ | ListConversationsExample.java​ | 查询会话列表。​ |
| ​ | MessageCrudExample.java​ | 创建、更新、删除消息。​ |
| ​ | MessageListExample.java​ | 查询指定对话中的消息列表。​ |
| 工作流​ | RunWorkflowExample.java​ | 运行工作流，响应方式为非流式响应。​ |
| ​ | StreamWorkflowExample.java​ | 运行工作流，响应方式为流式响应，且工作流中包含问答节点。​ |
| ​ | StreamWorkflowChatExample.java​ | 运行对话流。​ |
| ​ | AsyncRunWorkflowExample.java​ | 异步运行工作流。​ |
| 智能体管理​ | BotPublishExample.java​ | 创建一个草稿状态的智能体，更新智能体，并发布智能体为 API 服务。​ |
| 语音​ | AudioRoomsCreateExample.java​ | RTC 音视频通话场景中，创建音视频房间。​ |
| ​ | SpeechCreateExample.java​ | 语音合成，将文本转为语音，并将生成的语音保存为音频文件。​ |
| ​ | CreateTranscriptionExample.java​ | 语音识别，将指定音频文件转录为文本。​ |
| ​ | VoiceCloneExample.java​ | 克隆音色。​ |
| ​ | VoiceListExample.java​ | 查询音色列表。​ |
| WebSocket 语音通话​ | ChatExample.java​ | WebSocket 语音通话。​ |
| ​ | WebsocketAudioSpeechExample.java​ | 语音合成，将文本转为语音，并将生成的语音保存为音频文件。​ |
| ​ | WebsocketTranscriptionsExample.java​ | 语音识别，将指定音频文件转录为文本。​ |
| 工作空间​ | ListWorkspaceExample.java​ | 查询工作空间列表。​ |
| 知识库​ | DatasetCrudExample.java​ | 创建、更新和删除知识库。​ |
| ​ | DatasetListExample.java​ | 查询指定工作空间下的知识库。​ |
| ​ | datasets/image​ | 图片知识库管理，包含：​上传图片类型的知识库文件。​更新知识库的图片描述。​查看知识库图片列表。​ |
| ​ | datasets/document​ | 文本知识库管理，包含：​上传文本类型的知识库文件。​查询、修改和删除文本知识库文件。​ |
| 文件​ | FileExample.java​ | 文件上传，包含：​文件上传。​获取文件详情。​ |
| 变量​ | VariableExample.java​ | 变量管理，包含：​获取用户变量的值。​设置用户变量的值。​ |
| 复制模板​ | TemplateDuplicateExample.java​ | 复制商店中的模板到指定工作空间。​ |
| 账单和权益额度​ | benefit/bill/CrudExample.java​ | 导出账单并查询账单文件。​ |
| ​ | benefit/limitations/CrudExample.java​ | 创建、查询、更新硬件设备的权益额度。​ |
| 异常处理​ | HandlerExceptionExample.java​ | 处理 API 异常。​ |
| 客户端管理​ | HandlerExceptionExample.java​ | 修改日志级别。​ |
| ​ | SetRequestTimeoutExample.java​ | 设置请求超时时间。​ |
| ​ | InitServiceExample.java​ | 初始化客户端。​ |

- 上传图片类型的知识库文件。 ​

- 更新知识库的图片描述。 ​

- 查看知识库图片列表。 ​

- 上传文本类型的知识库文件。 ​

- 查询、修改和删除文本知识库文件。 ​

- 文件上传。 ​

- 获取文件详情。 ​

- 获取用户变量的值。 ​

- 设置用户变量的值。 ​