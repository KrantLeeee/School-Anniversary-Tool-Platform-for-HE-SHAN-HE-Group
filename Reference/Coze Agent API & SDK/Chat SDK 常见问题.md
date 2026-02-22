# Chat SDK 常见问题

> 来源: https://www.coze.cn/open/docs/developer_guides/chat_sdk_faq

- 在页面任意位置添加自定义按钮，点击后调用 Chat SDK 方法打开聊天窗口。 ​

- ​ HTML 复制 <!-- 自定义悬浮球按钮 --> ​ < button ​ id = "custom-asst-btn" ​ style = "position: fixed; right: 50px; bottom: 50px; z-index: 9999;" ​ onclick = "cozeWebSDK.showChatBot();" ​ > ​ </ button > ​ ​ < button onclick = "cozeWebSDK.showChatBot();" > 显示聊天框 </ button > ​ < button onclick = "cozeWebSDK.hideChatBot();" > 隐藏聊天框 </ button > ​ </ body > ​ ​