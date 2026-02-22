# Realtime 事件错误码

> 来源: https://www.coze.cn/open/docs/developer_guides/realtime_error_codes

| code​ | msg​ | 说明​ |
| 4027​ | Your account has an overdue payment, please recharge immediately.​ | 原因：账户欠费。​解决方案：请检查账户余额。​ |
| 4028​ | Insufficient coze credits balance, please wait for the quota refresh or upgrade to paid version.​ | 原因：免费版资源点不足。​解决方案：请检查账户余额。​ |
| 4029​ | The connection was closed due to prolonged user inactivity. Please retry your request.​ | 原因: 房间长时间没有对话，自动退出。​解决方案:  通过​Realtime 上行事件修改 longest_silence_ms 提高房间的静默时间（默认 3 分钟）。退出房间后需要重新创建房间。​ |

- 原因：账户欠费。 ​

- 解决方案：请检查 账户余额 。 ​

- 原因：免费版资源点不足。 ​

- 解决方案：请检查 账户余额 。 ​

- 原因: 房间长时间没有对话，自动退出。 ​

- 解决方案:  通过 ​ Realtime 上行事件 修改 longest_silence_ms 提高房间的静默时间（默认 3 分钟）。退出房间后需要重新创建房间。 ​