# Realtime 下行事件

> 来源: https://www.coze.cn/open/docs/developer_guides/signaling_downlink_event

- 事件类型 ： session.created ​

- 事件说明 ：用户成功进房后会发送此事件。 ​

- 事件结构 ： ​

- ​ 参数 ​ 类型 ​ 是否必选 ​ 说明 ​ id ​ String ​ 必选 ​ 服务端生成的唯一 ID。 ​ event_type ​ String ​ 必选 ​ 固定为 session.created 。 ​ data ​ Object ​ 必选 ​ 事件数据，包含对话的详细信息。 ​ data.voice_id ​ String ​ 必选 ​ 音色 ID。 ​ data.log_id ​ String ​ 必选 ​ 服务端日志 ID，用于查找问题。 ​ ​

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| id​ | String​ | 必选​ | 服务端生成的唯一 ID。​ |
| event_type​ | String​ | 必选​ | 固定为session.created。​ |
| data​ | Object​ | 必选​ | 事件数据，包含对话的详细信息。​ |
| data.voice_id​ | String​ | 必选​ | 音色 ID。​ |
| data.log_id​ | String​ | 必选​ | 服务端日志 ID，用于查找问题。​ |

- 事件示例 ： ​

- ​ JSON 复制 { ​ "id" : "7446668538246561800" , ​ "event_type" : "session.created" , ​ "data" : { ​ "voice_id" : "134" , ​ "log_id" : "xxx" ​ } ​ } ​ ​

- 事件类型 ： session.updated ​

- 事件说明 ：房间内的配置更新成功，返回房间内最新的配置。 ​

- 事件结构 ： ​

| 参数​ | 类型​ | 是否必选​ | 说明​ |
| id​ | String​ | 必选​ | 服务端生成的唯一 ID。​ |
| event_type​ | String​ | 必选​ | 固定为session.updated。​ |
| data​ | Object​ | 必选​ | 事件数据，包含对话的详细信息。​ |
| data.voice_id​ | String​ | 必选​ | 音色 ID。​ |
| data.speech_rate​ | Integer​ | 必选​ | 模型回复的语速，取值范围 [-50, 100]，默认为 0。-50 表示 0.5 倍速，100 表示 2 倍速。​ |
| data.loudness_rate​ | Integer​ | 可选​ | 输出音频的音量，取值范围 [-50, 100]，默认为 0。-50 表示 0.5 倍音量，100 表示 2 倍音量。​ |
| data.longest_silence_ms​ | Integer​ | 可选​ | 当智能体处于长时间沉默状态时，房间将自动解散。此时间以毫秒（ms）为单位计量，默认时长为 180,000 毫秒。​ |
| data.event_subscriptions​ | Array<String>​ | 可选​ | 订阅的下行事件的事件类型列表。​ |
| data.chat_config​ | Object​ | 必选​ | 聊天配置信息。​ |
| data.chat_config.meta_data​ | Map<String, String>​ | 必选​ | 附加信息，通常用于封装一些业务相关的字段。查看对话消息详情时，系统会透传此附加信息。自定义键值对，应指定为 Map 对象格式。长度为 16 对键值对，其中键（key）的长度范围为 1～64 个字符，值（value）的长度范围为 1～512 个字符。​ |
| data.chat_config.custom_variables​ | Map<String, String>​ | 必选​ | 智能体中定义的变量。在智能体 prompt 中设置变量 {{key}} 后，可以通过该参数传入变量值，同时支持 Jinja2 语法。变量名只支持英文字母和下划线。​ |
| data.chat_config.extra_params​ | Map<String, String>​ | 必选​ | 附加参数，通常用于特殊场景下指定一些必要参数供模型判断，例如指定经纬度，并询问智能体此位置的天气。自定义键值对格式，其中键（key）仅支持设置为：​latitude（纬度，值为纬度值，例如 39.9800718）​longitude（经度，值为经度值，例如 116.309314）。​ |
| data.chat_config.plugin_interrupt_mode​ | String​ | 必选​ | 端插件执行模式，可选值有blocking/nonblocking，默认为nonblocking。​blocking模式下，遇到端插件执行后，会阻塞后续的对话，直到提交端插件结果。​nonblocking模式下，遇到端插件执行后，若未提交端插件结果继续对话，则端插件请求会被丢弃。​ |
| data.chat_config.allow_voice_interrupt​ | Boolean​ | 可选​ | 是否打开语音打断功能，默认为true。​ |
| data.chat_config.interrupt_config​ | Object​ | 可选​ | 语音打断配置，仅在 allow_voice_interrupt 为true时生效​ |
| data.chat_config.interrupt_config.mode​ | String​ | 必选​ | 语音打断模式，可选值有all/keyword_contains/keyword_prefix，默认为all。​all模式下，任意内容都可以打断模型回复。​keyword_contains模式下，说话内容包含关键词才会打断模型回复。​keyword_prefix模式下，说话内容前缀匹配关键词才会打断模型回复。​ |
| data.chat_config.interrupt_config.keywords​ | Array<String>​ | 可选​ | 关键词列表，每个关键词长度不超过8个字，最多10个关键词，仅在keyword_contains/keyword_prefix模式下生效。​ |
| data.turn_detection​ | Object​ | 可选​ | 声音检测配置。​ |
| data.turn_detection.type​ | String​ | 可选​ | 语音检测模式，默认为server_vad，可选项包括：​server_vad：语音活动检测由扣子编程服务端完成，客户端将音频流持续发送到服务端，服务端在接收到音频后，通过服务端 VAD 检测语音的开始和结束。​client_vad：客户端使用自己的 VAD 检测语音的开始和结束，并将检测到的语音片段发送到服务器进行识别。​semantic_vad：采用语义判停的自由对话模式（此功能仅对企业旗舰版用户开放），由服务端识别语义来判断是否停止说话。​详细的检测逻辑请参见​如何设置扣子的语音检测模式？。​ |
| data.turn_detection.silence_duration_ms​ | Integer​ | 可选​ | server_vad模式下，检测语音停止的静音持续时间，单位为 ms。默认为 500ms。​ |
| data.turn_detection.semantic_vad_config​ | Object​ | 可选​ | semantic_vad模式下，配置判定语音停止的语义检测策略。​ |
| data.turn_detection.semantic_vad_config.silence_threshold_ms​ | Integer​ | 可选​ | 当用户暂停说话时，持续静音多久后，触发语义判停检测。单位为 ms。默认为 300ms。​ |
| data.turn_detection.semantic_vad_config.semantic_unfinished_wait_time_ms​ | Integer​ | 可选​ | 当语义检测判断该语句未结束时，持续静音多久后，扣子编程认定语音结束。单位为 ms。默认为 500ms。​ |
| data.asr_config.enable_itn​ | Boolean​ | 可选​ | 将语音转为文本时，是否开启文本规范化（ITN）处理，将识别结果转换为更符合书面表达习惯的格式以提升可读性。默认为true。​开启后，会将口语化数字转换为标准数字格式，示例：​将两点十五分转换为14:15。​将一百美元转换为$100。​ |
| data.asr_config.enable_punc​ | Boolean​ | 可选​ | 将语音转为文本时，是否给文本加上标点符号。默认为true。​ |
| data.asr_config.enable_ddc​ | Boolean​ | 可选​ | 将语音转为文本时，是否启用顺滑，默认为true。​true：系统在进行语音处理时，会去掉识别结果中诸如 “啊”“嗯” 等语气词，使得输出的文本语义更加流畅自然，符合正常的语言表达习惯，尤其适用于对文本质量要求较高的场景，如正式的会议记录、新闻稿件生成等。​false：系统不会对识别结果中的语气词进行处理，识别结果会保留原始的语气词。​ |
| data.asr_config.enable_nostream​ | Boolean​ | 可选​ | 当前是否开启二次识别模式，枚举值：​true：已开启二次识别模式。会实时返回逐字识别的文本；当一句话结束时，会结合整句音频进行上下文分析并重新识别，生成优化后的识别结果并返回。这种机制既能满足客户实时上屏的需求，又能确保最终结果的识别准确率。​false：未开启二次识别模式。仅进行一次实时识别，逐字返回文本，不会在一句话结束时重新识别分句，可能存在一定的识别误差。​ |
| data.asr_config.enable_emotion​ | Boolean​ | 可选​ | 当前是否开启说话人情绪识别功能，枚举值：​true：已开启情绪识别，会返回说话人的情绪标签，仅在data.asr_config.stream_mode为output_no_stream时生效。​false：未开启情绪识别。​支持的情绪标签包括：​angry：表示情绪为生气​happy：表示情绪为开心​neutral：表示情绪为平静或中性​sad：表示情绪为悲伤​surprise：表示情绪为惊讶​ |
| data.asr_config.enable_gender​ | Boolean​ | 可选​ | 当前是否开启说话人性别识别功能，枚举值：​true：已开启性别识别，会返回说话人性别（male/female），仅在data.asr_config.stream_mode为output_no_stream时生效。​false：未开启性别识别。​ |
| data.asr_config.sensitive_words_filter​ | Object​ | 可选​ | 当前敏感词过滤功能的配置状态，支持以下 3 种过滤方式：​过滤系统敏感词，并替换为*。​过滤自定义敏感词，并替换为空。​过滤自定义敏感词，并替换为*。​ |
| data.asr_config.sensitive_words_filter.system_reserved_filter​ | Boolean​ | 可选​ | 当前是否启用系统自带敏感词过滤（匹配到的敏感词替换为*），枚举值：​true：已启用，系统会过滤系统自带敏感词（主要包含限制级词汇）并替换为*。​false：未启用系统自带敏感词的过滤。​ |
| data.asr_config.sensitive_words_filter.filter_with_empty​ | Array<string>​ | 可选​ | 自定义的需替换为空的敏感词列表。​ |
| data.asr_config.sensitive_words_filter.filter_with_signed​ | Array<string>​ | 可选​ | 自定义的需替换为*的敏感词列表。​ |
| data.voice_print_config​ | Array<String>​ | 可选​ | 声纹识别配置。​ |
| data.voice_print_config.group_id​ | String​ | 可选​ | 声纹组 ID。语音通话时，扣子编程会在该声纹组内进行查找匹配对应的声纹，当声纹匹配度高于score阈值，则认为是同一个人的声音。​ |
| data.voice_print_config.score​ | Integer​ | 可选​ | 声纹匹配的命中阈值，即声音匹配度的最低标准。当声音匹配度达到或超过该阈值时，扣子编程才会认定声纹匹配成功。你可以根据应用的安全性要求进行自定义设置。如果匹配了多轮声纹，扣子编程会取相似度最高的一个。​取值范围：0~100，默认值：40。​ |
| data.voice_print_config.reuse_voice_info​ | Boolean​ | 可选​ | 当本轮对话未命中任何声纹时，是否沿用历史声纹信息。默认为false。​true：未命中声纹时，智能体将返回上一次命中的声纹。适用于连续对话场景，当收音不好等情况导致声纹没能正确被识别时，保障对话的连贯性。​false：未命中声纹时，智能体返回空的声纹信息。​ |
| data.voice_processing_config​ | Object​ | 可选​ | 语音降噪配置。默认不启用降噪。​说明仅扣子企业旗舰版支持该配置。​ |
| data.voice_processing_config.enable_ans​ | Boolean​ | 可选​ | 主动噪声抑制。自动识别并过滤掉背景环境中的各种噪音（如键盘声、空调声、街道嘈杂声），让说话者的声音更清晰。​此功能与下面的enable_pdns（声纹降噪）只能二选一开启，不能同时使用。​ |
| data.voice_processing_config.enable_pdns​ | Boolean​ | 可选​ | 声纹降噪。专门针对特定说话人的声音进行优化，能更精准地保留目标人声。​此功能与上面的enable_ans只能二选一开启，不能同时使用。​提供两种模式，你可以根据需要选择：​自动提取：设置简单，开箱即用。默认为该模式。降噪生效稍微有延迟，服务端需要先听你说一会儿话才能提取出你的声纹特征，在此期间降噪效果可能不佳。另外，提取声纹会受到用户说话场景影响，准确性上可能会弱于主动设置。​主动设置：降噪效果更精准、更快速，在对话开始时就立即生效。不过需要提前录制声纹并在voice_print_feature_id中设置声纹 ID。​ |
| data.voice_print_config.feature_id​ | String​ | 可选​ | 目标说话人的声纹 ID。当你选择开启enable_pdns（声纹降噪）并希望使用主动设置模式时，需要在此处填入你提前录制好的声纹 ID。​ |

- latitude（纬度，值为纬度值，例如 39.9800718） ​

- longitude（经度，值为经度值，例如 116.309314）。 ​

- blocking 模式下，遇到端插件执行后，会阻塞后续的对话，直到提交端插件结果。 ​

- nonblocking 模式下，遇到端插件执行后，若未提交端插件结果继续对话，则端插件请求会被丢弃。 ​

- all 模式下，任意内容都可以打断模型回复。 ​

- keyword_contains 模式下，说话内容 包含 关键词才会打断模型回复。 ​

- keyword_prefix 模式下，说话内容 前缀匹配 关键词才会打断模型回复。 ​

- server_vad ：语音活动检测由扣子编程服务端完成，客户端将音频流持续发送到服务端，服务端在接收到音频后，通过服务端 VAD 检测语音的开始和结束。 ​

- client_vad ：客户端使用自己的 VAD 检测语音的开始和结束，并将检测到的语音片段发送到服务器进行识别。 ​

- semantic_vad ：采用语义判停的自由对话模式（ 此功能仅对企业旗舰版用户开放 ），由服务端识别语义来判断是否停止说话。 ​

- 将 两点十五分 转换为 14:15 。 ​

- 将 一百美元 转换为 $100 。 ​

- true ：系统在进行语音处理时，会去掉识别结果中诸如 “啊”“嗯” 等语气词，使得输出的文本语义更加流畅自然，符合正常的语言表达习惯，尤其适用于对文本质量要求较高的场景，如正式的会议记录、新闻稿件生成等。 ​

- false ：系统不会对识别结果中的语气词进行处理，识别结果会保留原始的语气词。 ​

- true ：已开启二次识别模式。会实时返回逐字识别的文本；当一句话结束时，会结合整句音频进行上下文分析并重新识别，生成优化后的识别结果并返回。这种机制既能满足客户实时上屏的需求，又能确保最终结果的识别准确率。 ​

- false ：未开启二次识别模式。仅进行一次实时识别，逐字返回文本，不会在一句话结束时重新识别分句，可能存在一定的识别误差。 ​

- true ：已开启情绪识别，会返回说话人的情绪标签，仅在 data.asr_config.stream_mode 为 output_no_stream 时生效。 ​

- false ：未开启情绪识别。 ​

- angry ：表示情绪为生气 ​

- happy ：表示情绪为开心 ​

- neutral ：表示情绪为平静或中性 ​

- sad ：表示情绪为悲伤 ​

- surprise ：表示情绪为惊讶 ​

- true ：已开启性别识别，会返回说话人性别（ male / female ），仅在 data.asr_config.stream_mode 为 output_no_stream 时生效。 ​

- false ：未开启性别识别。 ​

- 过滤系统敏感词，并替换为 * 。 ​

- 过滤自定义敏感词，并替换为空。 ​

- 过滤自定义敏感词，并替换为 * 。 ​

- true ：已启用，系统会过滤系统自带敏感词（主要包含限制级词汇）并替换为 * 。 ​

- false ：未启用系统自带敏感词的过滤。 ​

- true ：未命中声纹时，智能体将返回上一次命中的声纹。适用于连续对话场景，当收音不好等情况导致声纹没能正确被识别时，保障对话的连贯性。 ​

- false ：未命中声纹时，智能体返回空的声纹信息。 ​

- 自动提取：设置简单，开箱即用。默认为该模式。 降噪生效稍微有延迟 ，服务端需要先听你说一会儿话才能提取出你的声纹特征，在此期间降噪效果可能不佳。另外，提取声纹会受到用户说话场景影响，准确性上可能会弱于主动设置。 ​

- 主动设置： 降噪效果更精准、更快速 ，在对话开始时就立即生效。不过需要提前录制声纹并在 voice_print_feature_id 中设置声纹 ID。 ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.created ​

- 事件说明 ：用户成功进房后会发送此事件，收到此事件即表明 房间初始化完成。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.chat.created ​

- 事件说明 ：创建对话的事件，表示对话开始。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.chat.in_progress ​

- 事件说明 ：服务端正在处理对话。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.message.delta ​

- 事件说明 ：增量消息，通常是 type=answer 时的增量消息。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.message.completed ​

- 事件说明 ：消息已完成（用户或智能体）。此时事件中带有所有 message.delta 的拼接结果，且每个消息均为 completed 状态。 ​

- 事件结构 ： ​

- 事件示例： ​

- 事件类型 ： conversation.chat.completed ​

- 事件说明 ：表示对话已完成。 ​

- 事件结构 ： ​

- 事件示例 ： ​

- 事件类型 ：conversation.chat.requires_action ​

- 事件说明 ：对话中断，需要使用方上报工具的执行结果。 ​

- 事件结构 ： ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.chat.failed ​

- 事件说明 ：此事件用于标识对话失败。 ​

- 事件结构 ： ​

- 事件示例 ： ​

- 事件类型 ： audio.user.speech_started ​

- 事件说明 ：此事件表示服务端识别到用户正在说话。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： audio.user.speech_stopped ​

- 事件说明 ：此事件表示服务端识别到用户已停止说话。 ​

- 事件结构 ： ​

- 事件示例 ： ​

- 事件类型 ： audio.agent.speech_started ​

- 事件说明 ：此事件表示智能体正在说话。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： audio.agent.speech_stopped ​

- 事件说明 ：此事件表示智能体已停止说话。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： session.pre_answer.updated ​

- 事件说明 ：房间内的安抚配置更新成功，返回房间内最新的安抚配置。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.chat.pre_answer ​

- 事件说明 ：此事件表明触发了安抚策略。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： conversation.audio_transcript.delta ​

- 事件说明 ：用户语音识别的中间值，每次返回都是全量文本。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​

- 事件类型 ： mode.updated ​

- 事件说明 ：房间模式更新成功，返回最新的房间模式设置。 ​

- 事件结构 ： ​

- 事件示例 ： ​

- 事件类型 ： input_audio_buffer.started ​

- 事件说明 ：表示服务端成功处理用户开始说话事件。 ​

- 事件结构 ： ​

- ​

- 事件示例： ​

- ​

- 事件类型 ： input_audio_buffer.completed ​

- 事件说明 ：表示服务端成功处理用户结束说话事件。 ​

- 事件结构 ： ​

- ​

- 事件示例： ​

- ​

- 事件类型 ： error ​

- 事件说明 ：对话过程中的错误事件。 ​

- 事件结构 ： ​

- ​

- 事件示例 ： ​

- ​