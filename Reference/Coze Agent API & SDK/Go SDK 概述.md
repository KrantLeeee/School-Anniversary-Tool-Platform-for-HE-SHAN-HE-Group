# Go SDK 概述

> 来源: https://www.coze.cn/open/docs/developer_guides/go_overview

- Coze Go SDK 支持扣子所有 OpenAPI，对应的 API 文档可参考 ​ API 介绍 。 ​

- 示例代码将持续更新和补充，各种场景的 Coze Go SDK 最新版本 示例代码可参考 GitHub 。 ​

| 模块​ | 示例文件​ | 说明​ |
| 授权​ | pat_example.go​ | 通过个人访问密钥实现 OpenAPI 鉴权。​ |
| ​ | web_oauth_example.go​ | 通过 OAuth 授权码方式实现授权与 OpenAPI 鉴权。​ |
| ​ | jwt_example.go​ | 通过 OAuth JWT 方式实现授权与 OpenAPI 鉴权。​ |
| ​ | pkce_example.go​ | 通过 OAuth PKCE 方式实现授权与 OpenAPI 鉴权。​ |
| ​ | device_example.go​ | 通过 OAuth 设备码方式实现授权与 OpenAPI 鉴权。​ |
| 对话​ | non_stream_chat_example.go​ | 发起对话，响应方式为非流式响应。​ |
| ​ | stream_chat_example.go​ | 发起对话，响应方式为流式响应。​ |
| ​ | multi_modal_chat_example.go​ | 发起对话，对话中上传文件，并发送多模态内容。​ |
| ​ | submit_tool_output_example.go​ | 对话时调用端插件。​ |
| 会话和消息​ | conversation_example.go​ | 创建对话、向对话中添加消息以及清除对话内容等。​ |
| ​ | list_conversation_example.go​ | 查询对话列表。​ |
| ​ | create_update_delete_message_example.go​ | 创建、更新和删除消息​ |
| 工作流​ | non_stream_run_example.go​ | 运行工作流，响应方式为非流式响应。​ |
| ​ | stream_run_example.go​ | 运行工作流，响应方式为流式响应，且工作流中包含问答节点。​ |
| ​ | async_workflow_run_example.go​ | 异步运行工作流，并获取工作流运行结果。​ |
| ​ | workflow_stream_chat_example.go​ | 运行对话流。​ |
| 智能体管理​ | publish_bot_example.go​ | 创建一个草稿状态的智能体，更新智能体，并发布智能体为 API 服务。​ |
| WebSocket 语音​ | websockets_audio_chat_example.go​ | WebSocket 语音通话。​ |
| ​ | websockets_speech_example.go​ | 语音合成，将文本转为语音，并将生成的语音保存为音频文件。​ |
| ​ | websockets_transcriptions_example.go​ | 语音识别，将指定音频文件转录为文本。​ |
| 语音​ | audio_rooms_create_main.go​ | RTC 音视频通话场景中，创建音视频房间。​ |
| ​ | audio_speech_create_example.go​ | 语音合成，将文本转为语音，并将生成的语音保存为音频文件。​ |
| ​ | audio_transcription_create_example.go​ | 语音识别，将指定音频文件转录为文本。​ |
| ​ | audio_voices_clone_example.go​ | 克隆音色。​ |
| ​ | audio_voices_list_example.go​ | 查询音色列表。​ |
| 工作空间​ | list_workspace_example.go​ | 查询所有工作空间列表。​ |
| 知识库​ | dataset_documents_example.go​ | 知识库管理，包含：​创建、查询、更新和删除知识库。​上传文本和图片类型的知识库文件。​更新图片知识库的描述。​查看知识库图片列表。​ |
| 文件管理​ | files_examples.go​ | 文件上传。​ |
| 文件夹​ | folders_examples.go​ | 查询文件夹列表和文件夹详情。​ |
| 异常处理​ | handle_error_example.go​ | 处理 API 异常。​ |
| 客户端管理​ | init_client_example.go​ | 修改日志级别。​ |
| ​ | ​ | 初始化客户端。​ |
| 获取日志​ | get_log_id_example.go​ | 获取日志。​ |

- 创建、查询、更新和删除知识库。 ​

- 上传文本和图片类型的知识库文件。 ​

- 更新图片知识库的描述。 ​

- 查看知识库图片列表。 ​