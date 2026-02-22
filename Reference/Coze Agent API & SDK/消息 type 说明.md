# 消息 type 说明

> 来源: https://www.coze.cn/open/docs/developer_guides/message_type

- 如果 autoSaveHistory=true，type 支持设置为 question 或 answer。 ​

- 如果 autoSaveHistory=false，type 支持设置为 question、answer、function_call、tool_output/tool_response。 ​

| type​ | 发起对话​ | ​ | ​ |
| ​ | Response​ | Request，且 autoSaveHistory=false​ | Request，且 autoSaveHistory=true​ |
| question​ | ❌​ | ✔️​ | ✔️​ |
| answer​ | ✔️​ | ✔️​ | ✔️​ |
| function_call​ | ✔️​ | ✔️​ | ❌​ |
| tool_output/tool_response​ | ✔️​ | ✔️​ | ❌​ |
| follow_up​ | ✔️​ | ❌​ | ❌​ |
| knowledge​ | ✔️​ | ❌​ | ❌​ |
| verbose​ | ✔️​ | ❌​ | ❌​ |

| 消息类型（type）​ | 角色​（role）​ | 内容类型​（content_type）​ | 示例​ |
| question​ | user​ | text​object_string​ | ​JSON复制{​"role":"user",​"content":"--- 只需要回答最新的这一条问题：搜几个最新的军事新闻",​"content_type":"text",​"type":"question"​}​​ |
| answer​ | assistant​ | text​ | ​JSON复制{​"role":"assistant",​"content":"以下是最新的体育新闻 ......",​"content_type":"text",​"type":"answer"​}​​ |
| function_call​ | assistant​ | text​ | ​JSON复制{​"role": "assistant",​"content": "{\"name\":\"toutiaosousuo-search\",\"arguments\":{\"cursor\":0,\"input_query\":\"体育新闻\"...}",​"content_type": "text",​"type": "function_call"​}​​ |
| tool_output/tool_response​ | assistant​ | text​ | ​JSON复制{​"role": "assistant",​"content": "{\"news\":[{\"title\":\"新闻内容：.....\"}]}",​"content_type": "text",​"type": "tool_output"​},​​ |
| follow_up​ | assistant​ | text​ | ​JSON复制{​"role":"assistant",​"type":"follow_up",​"content":"国足将会有哪些变化和调整？",​"content_type":"text"​}​​ |
| verbose​ | assistant​ | text​ | ​JSON复制{​"role":"assistant",​"type":"verbose",​// generate_answer_finish 表示全部 answer 已回复完毕​"content":"{\"msg_type\":\"generate_answer_finish\",\"data\":\"\",\"from_module\":null,\"from_unit\":null}",​"content_type":"text"​}​​ |

- text ​

- object_string ​