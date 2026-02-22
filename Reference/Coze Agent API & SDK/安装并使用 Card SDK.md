# 安装并使用 Card SDK

> 来源: https://www.coze.cn/open/docs/developer_guides/card_sdk

| 功能​ | 说明​ |
| 自定义内容格式​ | Card SDK 提供了强大的自定义功能，允许开发者根据具体需求定义卡片的布局和内容。开发者可以通过配置卡片的 DSL（Domain Specific Language，领域特定语言）数据，指定卡片中各个元素的类型、样式和交互逻辑。无论是简单的文本卡片，还是包含图片、按钮和列表的复杂卡片，都可以通过Card SDK 轻松实现。​ |
| 自定义卡片样式​ | Card SDK 还允许开发者自定义卡片中按钮、图片等组件的渲染逻辑，实现个性化的样式和交互效果。通过customComponentMap接口，开发者可以为每个组件定义独特的渲染函数，从而实现更加丰富的视觉效果和交互行为。开发者可以根据具体的业务需求，设计出个性化的卡片样式。​ |

| 操作系统​ | 浏览器​ | 版本限制​ |
| PC​ | Chrome​ | 87.0 及以上​ |
| ​ | Edge​ | 100.0 及以上​ |
| ​ | Safari​ | 14.0 及以上​ |
| ​ | Firefox​ | 79.0 及以上​ |
| Android​ | Chrome​ | 100.0 及以上​ |
| ​ | Edge​ | 100.0 及以上​ |
| iOS​​ | Chrome​ | 87.0 及以上​ |
| ​ | Safari​ | 14.0 及以上​ |

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| el​ | HTML Element​ | 必选​ | 卡片需要渲染的 HTML 元素。​ |
| customComponentMap​ | Object​ | 必选​ | 自定义组件样式，其中 key 为组件的名称。你可以从 data 字段的卡片配置中获取组件名称。例如：@flowpd/cici-components/NewImage。​ |
| runtimeOptions​ | Object​ | 可选​ | 运行时的选项。​ |
| runtimeOptions.dsl​ | Object​ | 可选​ | DSL 数据，定义卡片的结构和内容。​ |
| runtimeOptions.remoteForce​ | Boolean​ | 可选​ | 是否每次都从远程拉取组件。​true：每次自动拉取。​false：不自动拉取。​ |
| runtimeOptions.debug​ | Boolean​ | 可选​ | 是否打印报错信息。​true：打印。​false：不打印。​ |
| runtimeOptions.readonly​ | Boolean​ | 可选​ | 是否开启只读模式，只读模式下卡片的交互效果不生效，例如无法跳转到其他网页等。​ |
| runtimeOptions.lang​ | String​ | 可选​ | 设置卡片内容的语言。例如 zh。​ |
| runtimeOptions.theme​ | String​ | 可选​ | 卡片的深浅模式。​light：浅色模式。​dark：深色模式。​ |
| runtimeOptions.afterRender​ | Function​ | 可选​ | 回调函数，在组件加载成功时自动触发。​ |
| runtimeOptions.onError​ | Function​ | 可选​ | 回调函数，在渲染卡片失败时自动触发。​ |
| runtimeOptions.eventCallbacks​ | Object​ | 可选​ | 交互事件的回调函数，包括：​onElementOut（targetElemtent, linkurl）=> void：当鼠标从卡片链接上移出的时候，触发此函数。​onElementOver（targetElemtent, linkurl）=> void：当鼠标在卡片链接上移动的时候，触发此函数。​sendMsg：当点击发送消息按钮时触发此函数。​previewImage（{url}）=> void：当点击图片的时候触发此函数。​ |

- true ：每次自动拉取。 ​

- false ：不自动拉取。 ​

- true ：打印。 ​

- false ：不打印。 ​

- light ：浅色模式。 ​

- dark ：深色模式。 ​

- onElementOut（targetElemtent, linkurl）=> void ：当鼠标从卡片链接上移出的时候，触发此函数。 ​

- onElementOver（targetElemtent, linkurl）=> void ：当鼠标在卡片链接上移动的时候，触发此函数。 ​

- sendMsg ：当点击发送消息按钮时触发此函数。 ​

- previewImage（{url}）=> void ：当点击图片的时候触发此函数。 ​

- RenderCustomComponentFunc 是用于渲染卡片组件的渲染函数。你需要自行实现该函数，函数会接收到卡片组件传递的参数，并返回一个销毁函数。RenderCustomComponentFunc 支持的属性设置如下： ​

- ​ 参数 ​ 类型 ​ 是否必选 ​ 示例 ​ 说明 ​ name ​ String ​ 必选 ​ @flowpd/cici-components/NewImage ​ 元素的名称，通常用于标识和描述元素。 ​ element ​ Object ​ 必选 ​ { style: { width: '100px', height: '100px' } } ​ 指定挂载自定义组件的 HTML 元素，默认为一个空的 <div> 容器。 ​ props ​ Object ​ 必选 ​ props: ​ { ​ blockId:{ element.id } ​ children: {子节点} ​ lang: zh ​ cardState： （dsl.status || {}) ​ ...elementProps (处理后的） ​ } ​ 渲染组件时使用的属性，你可以从浏览器的开发者工具中查看 props 属性的值。 ​ renderChildren ​ Function ​ 必选 ​ - ​ 渲染子组件的方法。如果组件中有子组件，可以使用 renderChildren 函数将子组件渲染到指定的 HTML 元素中。 ​ ​

| 参数​ | 类型​ | 是否必选​ | 示例​ | 说明​ |
| name​ | String​ | 必选​ | @flowpd/cici-components/NewImage​ | 元素的名称，通常用于标识和描述元素。​ |
| element​ | Object​ | 必选​ | { style: { width: '100px', height: '100px' } }​ | 指定挂载自定义组件的 HTML 元素，默认为一个空的 <div> 容器。​ |
| props​ | Object​ | 必选​ | props:​{​blockId:{element.id}​children: {子节点}​lang: zh​cardState： （dsl.status || {})​...elementProps (处理后的）​}​ | 渲染组件时使用的属性，你可以从浏览器的开发者工具中查看 props 属性的值。​ |
| renderChildren​ | Function​ | 必选​ | -​ | 渲染子组件的方法。如果组件中有子组件，可以使用 renderChildren 函数将子组件渲染到指定的 HTML 元素中。​ |

- RenderCustomComponentFunc 的返回值是一个销毁函数，不需要某个组件时可以调用此函数销毁组件。你可以根据业务场景按需选择是否销毁组件。 ​