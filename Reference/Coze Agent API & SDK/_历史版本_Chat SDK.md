# （历史版本）Chat SDK

> 来源: https://www.coze.cn/open/docs/developer_guides/web_sdk

- 这个是智能体id，将在以后的配置中使用。 ​



- 发布 SDK 后才能在新的发布页面选择安装 SDK。 ​



- ​ ​ ​ ​ ​

- 页面将展示智能体的安装代码。直接将代码粘贴到网页的 <body> 区域中即可。你也可以按需添加各种属性配置，支持属性可参考 ​ 初始化 SDK 。 ​

- 说明 {{version}} 部分为 Chat SDK 的版本号，例如 0.1.0-beta.5 。 ​ ​

- 安装代码示例如下： ​

- ​ HTML 复制 < script src = "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/ {{version}} /libs/cn/index.js" ></ script > ​ < script > ​ new CozeWebSDK . WebChatClient ({ ​ config : { ​ bot_id : '738176858****' , ​ }, ​ componentProps : { ​ title : 'Coze' , ​ }, ​ }); ​ </ script > ​ ​

| 属性​ | 参数​ | 是否必选​ | 数据类型​ | 描述​ |
| config​ | bot_id​ | 必选​ | string​ | 智能体ID。​进入智能体的 开发页面，开发页面 URL 中 bot 参数后的数字就是智能体ID。例如https://www.coze.cn/space/341****/bot/73428668*****，智能体ID 为73428668*****。​说明确保该智能体已经发布为 Chat SDK。​​ |
| componentProps​ | title​ | 可选​ | string​ | 智能体名字，如果没有配置，使用默认名：扣子 Bot。​ |
| ​ | icon​ | 可选​ | string​ | 智能体的显示图标，如果不设置，则使用默认扣子图标。​ |
| ​ | lang​ | 可选​ | string​​ | 智能体的系统语言，例如智能体的工具提示。​en：（默认）英语​zh-CN：中文​​​​​​ |
| ​ | layout​​ | 可选​ | string​ | 智能体窗口的布局风格，支持设置为：​mobile：移动端风格。​pc：PC 端风格。​未设置此参数时，系统会自动识别设备，设置相应的布局风格。​ |
| ​ | width​ | 可选​ | number​ | PC 端智能体窗口的宽度，单位为 px，默认为 460。​建议综合考虑各种尺寸的屏幕，设置一个合适的宽度。​仅在 layout = pc 时生效。​ |

- en：（默认）英语 ​

- zh-CN：中文 ​

- mobile：移动端风格。 ​

- pc：PC 端风格。 ​

- 图标 1 是 icon 参数值。 ​

- 图标 2 是 title 参数值。 ​

- 图标 3 是 lang 参数控制的语言配置。 ​