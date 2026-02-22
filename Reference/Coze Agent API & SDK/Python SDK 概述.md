# Python SDK 概述

> 来源: https://www.coze.cn/open/docs/developer_guides/python_overview

- Coze Python SDK 支持扣子所有 OpenAPI，对应的 API 文档可参考 ​ API 介绍 。 ​

- 示例代码将持续更新和补充，各种场景的 Coze Python SDK 最新版本 示例代码可参考 GitHub 。 ​

| 模块​ | 示例文件​ | 说明​ |
| 授权​ | examples/auth_pat.py​ | 通过个人访问密钥实现 OpenAPI 鉴权。​ |
| ​ | examples/auth_oauth_web.py​ | 通过 OAuth 授权码方式实现授权与 OpenAPI 鉴权。​ |
| ​ | examples/auth_oauth_jwt.py​ | 通过 OAuth JWT 方式实现授权与 OpenAPI 鉴权。​ |
| ​ | examples/auth_oauth_pkce.py​ | 通过 OAuth PKCE 方式实现授权与 OpenAPI 鉴权。​ |
| ​ | examples/auth_oauth_device.py​ | 通过 OAuth 设备码方式实现授权与 OpenAPI 鉴权。​ |
| 对话​ | examples/chat_no_stream.py​ | 发起对话，响应方式为非流式响应。​ |
| ​ | examples/chat_stream.py​ | 发起对话，响应方式为流式响应。​ |
| ​ | examples/chat_multimodal_stream.py​ | 发起对话，对话中上传文件，并发送多模态内容。​ |
| ​ | examples/chat_simple_audio.py​ | 语音消息，对话时通过语音输入消息。​ |
| ​ | examples/chat_oneonone_audio.py​ | 实时语音通话。​ |
| ​ | examples/chat_local_plugin.py​ | 端插件。​ |
| 会话​ | examples/conversation.py​ | 创建对话、向对话中添加消息以及清除对话内容等。​ |
| ​ | examples/conversation_list.py​ | 查询对话列表。​ |
| 工作流​ | examples/workflow_no_stream.py​ | 运行工作流，响应方式为非流式响应。​ |
| ​ | examples/workflow_stream.py​ | 运行工作流，响应方式为流式响应，且工作流中包含问答节点。​ |
| ​ | examples/workflow_async.py​ | 异步运行工作流，并获取工作流运行结果。​ |
| ​ | ​examples/workflow_chat_stream.py​ | 运行对话流。​ |
| ​ | examples/workflow_chat_multimode_stream.py​ | ​在对话流中上传图片，实现多模态交互。包括图片上传、流式响应处理及对话管理等操作。​ |
| 智能体管理​ | examples/bot_publish.py​ | 创建一个草稿状态的智能体，更新智能体，并发布智能体为 API 服务。​ |
| 工作空间​ | /examples/workspaces_list.py​ | 查询所有工作空间列表。​ |
| ​ | /examples/workspaces_members_create.py​ | 批量邀请用户加入指定的工作空间。​ |
| ​ | /examples/workspaces_members_delete.py​ | 批量移除工作空间中的成员。​ |
| 知识库​ | examples/dataset_create.py​ | 创建知识库、上传知识库文件。​ |
| 语音合成​ | examples/audio.py​ | 将文本转为语音，并将生成的语音保存为音频文件。​ |
| 文件管理​ | examples/files_upload.py​ | 文件上传。​ |
| 复制模板​ | examples/template_duplicate.py​ | 复制商店中的模板到指定工作空间。​ |
| 用户​ | examples/users_me.py​ | 获取当前用户信息，如用户 ID、用户名等。​ |
| 变量​ | examples/variable_retrieve.py​ | 获取用户变量的值。​ |
| ​ | examples/variable_update.py​ | 设置用户变量的值。​ |
| 异常处理​ | examples/exception.py​ | 处理 API 异常。​ |
| 日志处理​ | examples/log.py​ | 修改日志级别。​ |
| 超时时间​ | examples/timeout.py​ | 配置超时时间，确保 API 请求在规定时间内完成。​ |