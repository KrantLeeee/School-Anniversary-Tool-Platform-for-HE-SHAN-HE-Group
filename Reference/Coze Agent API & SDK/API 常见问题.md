# API 常见问题

> 来源: https://www.coze.cn/open/docs/developer_guides/api_faq

- 流式 API ：调用时会在返回结果中直接包含模型生成的内容。 ​

- 非流式 API ：响应消息中 不会即时返回模型生成的内容 ，需通过后续 API 查询结果。例如：调用 ​ 发起对话 API 时，如果设置 stream=false，你需要通过如下方法查询模型生成的内容： ​