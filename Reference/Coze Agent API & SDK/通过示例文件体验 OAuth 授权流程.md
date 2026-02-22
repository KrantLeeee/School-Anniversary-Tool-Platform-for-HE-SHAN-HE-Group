# 通过示例文件体验 OAuth 授权流程

> 来源: https://www.coze.cn/open/docs/developer_guides/ouath_demo

- 此方式仅用于测试验证阶段快速了解和体验 OAuth 授权流程，为了安全起见，获取的 OAuth Token 不建议应用在线上生产环境。线上环境可使用扣子编程提供的各种语言 SDK，参考各个 SDK 的鉴权示例，详细说明可参考 ​ 示例代码 。 ​

- OAuth Token 存在有效期限制，你可以根据页面提示刷新 Token。 ​




- 授权码授权方式对应的客户端类型为 Web 后端应用。 ​

- ​ ​ ​ ​ ​


- 预览 client_id 等配置信息，确认无误后选择配置语言。扣子编程提供 Python、 JavaScript 、Go 和 Java 四种语言类型的示例文件，此处我们选择默认的 Python。 ​


- ​ ​ ​ ​ ​

- 运行脚本之前，应确认本地已安装了对应开发语言的运行环境。各个语言的版本要求如下： ​

- Python：3.7 及后续版本。 ​

- JavaScript ： Node 14 及后续版本。 ​

- Go：1.18 及后续版本。 ​

- Java：Java 8、Java 11 或 Java 17。 ​

- 请确保本地主机的 8080 端口未被占用。 ​



- Linux 或 macOS： ​

- ​ Bash 复制 bash bootstrap.sh ​ ​

- Windows： ​

- ​ Bash 复制 .\bootstrap.ps1 ​ ​


- ​ ​ ​ ​ ​


- 注意 此示例项目仅用于体验授权流程，生成的 Token 虽然是一个真实有效的 OAuth Token，可以在 API Playground 中在线调试 OpenAPI，但不建议用于线上生产环境。 ​ OAuth Token 存在有效期限制，使用前需要注意过期时间。 ​ ​

- 此示例项目仅用于体验授权流程，生成的 Token 虽然是一个真实有效的 OAuth Token，可以在 API Playground 中在线调试 OpenAPI，但不建议用于线上生产环境。 ​

- OAuth Token 存在有效期限制，使用前需要注意过期时间。 ​

- ​ ​ ​ ​ ​

- 需要注意的是，这个 OAuth Token 必须已被授予对应 OpenAPI 的权限，否则 Playground 调试时会报错 Token 无权限。你需要在下载示例文件之前在 OAuth 应用中选择正确的权限。 ​

- 通过示例项目生成的 Token 均可在 API Playground 中使用。 ​