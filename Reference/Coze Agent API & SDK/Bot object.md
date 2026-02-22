# Bot object

> 来源: https://www.coze.cn/open/docs/developer_guides/bot_object

| 字段​ | 类型​ | 说明​ |
| bot_id​ | String​ | 智能体的唯一标识。​ |
| name​ | String​ | 智能体的名称。​ |
| description​ | String​ | 智能体的描述信息。​ |
| icon_url​ | String​ | 智能体头像地址。​ |
| create_time​ | Integer​ | 创建时间，格式为 10 位的 Unixtime 时间戳，单位为秒（s）。​ |
| update_time​ | Integer​ | 更新时间，格式为 10 位的 Unixtime 时间戳，单位为秒（s）。​ |
| version​ | String​ | 智能体最新版本的版本号。​ |
| prompt_info​ | Object​ | 智能体的提示词配置，参考Prompt object说明。​ |
| onboarding_info​ | Object​ | 智能体的开场白配置，参考Onboarding object说明。​ |
| bot_mode​​ | Integer​ | 智能体模式，取值：​0：单 Agent 模式​1：多 Agent 模式​ |
| plugin_info_list​ | Array of Object​ | 智能体置的插件，参考Plugin object说明。​ |
| model_info​ | Object​ | 智能体置的模型，参考Model object说明。​ |
| knowledge​ | Object​ | 智能体定的知识库，参考Knowledge object说明。​ |

- 0 ：单 Agent 模式 ​

- 1 ：多 Agent 模式 ​

| 字段​ | 类型​ | 说明​ |
| prompt​ | String​ | 智能体配置的提示词。​ |

| 字段​ | 类型​ | 说明​ |
| prologue​ | String​ | 智能体配置的开场白内容。​ |
| suggested_questions​ | Array of String​ | 智能体配置的推荐问题列表。未开启用户问题建议时，不返回此字段。​ |

| 字段​ | 类型​ | 说明​ |
| plugin_id​ | String​ | 插件唯一标识。​ |
| name​ | String​ | 插件名称。​ |
| description​ | String​ | 插件描述。​ |
| icon_url​ | String​ | 插件头像。​ |
| api_info_list​ | Array of Object​ | 插件的工具列表信息，详情参考PluginAPI object。​ |

| 字段​ | 类型​ | 说明​ |
| api_id​ | String​ | 工具的唯一标识。​ |
| name​ | String​ | 工具的名称。​ |
| description​ | String​ | 工具的描述。​ |

| 字段​ | 类型​ | 说明​ |
| model_id​ | String​ | 模型的唯一标识。​ |
| model_name​ | String​ | 模型名称。​ |

| 字段​ | 类型​ | 说明​ |
| knowledge_infos​ | Array of Object​ | 智能体绑定的知识库列表，参考KnowledgeInfo object说明。​ |

| 字段​ | 类型​ | 说明​ |
| id​ | String​ | 知识库 ID。​ |
| name​ | String​ | 知识库名称。​ |