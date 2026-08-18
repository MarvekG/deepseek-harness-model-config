# llm-pi-ai 参数参考

本文说明 `@deepseek-ai/dsh-llm-pi-ai` provider profile 支持的全部主要参数，以及它们对模型解析、请求发送和配置保存的影响。

## 配置结构

provider 以路由名为 key，配置位于 `llm-pi-ai.providers.<route>`：

```yaml
llm-pi-ai:
  providers:
    my-endpoint:
      apiKeyEnv: MY_ENDPOINT_API_KEY
      displayName: My Endpoint
      api: openai-completions
      baseURL: https://gateway.example/v1
      models:
        - id: my-model
```

`apiKeyEnv` 只保存凭据引用，不保存 API Key 内容。实际密钥由 Harness 凭据系统或运行环境提供。

配置解析顺序通常是：schema 默认值 → composition base → 用户层 `settings.yaml`。用户层只需要写要覆盖的字段。

## Provider 参数

下表中的参数位于 `llm-pi-ai.providers.<route>`。

| 参数 | 类型 | 默认值 | 作用 | 注意事项 |
|---|---|---:|---|---|
| `apiKeyEnv` | `string` | 无 | API Key 的凭据引用名称，例如 `OPENAI_API_KEY`。 | 只保存引用，不要把密钥写入 `settings.yaml`。 |
| `displayName` | `string` | 路由名 | Web UI、模型选择器和状态信息中显示的名称。 | 不改变实际 provider route。 |
| `api` | `openai-completions` / `openai-responses` / `anthropic-messages` | 内置 provider 可继承；自定义 provider 必填 | 指定该 route 使用的协议实现。 | `compat` 推理开关只适用于 `openai-completions`。 |
| `baseURL` | `string` | 内置 provider 可继承；自定义 provider 必填 | Provider 请求和模型发现使用的端点前缀。 | 自定义路径会保留，例如 `https://host/openai/v1`。 |
| `models` | `ModelProfile[]` | 内置 provider 继承完整模型列表 | 明确指定该 route 服务的模型列表。 | 一旦存在，就会替换整个内置模型列表，不是追加。 |
| `modelOverrides` | `Record<string, ModelOverride>` | 无 | 修改内置 catalog route 中某几个模型，同时保留其余模型。 | 只能与内置模型列表一起使用，不能和 `models` 并用；不能用于自定义 route。 |
| `headers` | `Record<string, string>` | 无 | 调用模型时附加的 HTTP Header。 | 获取 `/models` 时不会发送；Harness attribution Header 优先。 |
| `defaultContextWindow` | 正整数 | `262144` | 当模型条目和内置模型都没有上下文大小时使用的能力值。 | 只是模型能力回退值，不代表真实服务商保证。 |
| `defaultMaxTokens` | 正整数 | `32768` | 当模型条目和内置模型都没有最大输出值时使用的能力值。 | 只是能力回退值，不会自动变成请求默认 `maxTokens`。 |
| `defaultInput` | `text[]`，可选 `image` | `[text]` | 当模型条目和内置模型都没有输入模态时使用的回退值。 | 空列表不能作为 route 的最终默认值；图片能力需要谨慎声明。 |
| `reasoning` | `off` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max` | 无 | Provider 级默认推理强度。 | 这是 route 默认值；单个请求和模型级能力可以覆盖它。 |
| `thinkingBudgets` | 对象 | 无 | 为支持预算的推理 provider 设置各级别 token budget。 | 支持 `minimal`、`low`、`medium`、`high`。 |
| `compat` | `CompatProfile` | 无 | 设置 OpenAI Completions 推理参数的发送格式。 | route 级设置作用于该 route 上可兼容的模型。 |
| `cacheRetention` | `none` / `short` / `long` | pi-ai 默认 | 设置 provider prompt cache 的保留策略。 | 实际效果取决于协议和服务商。 |
| `transport` | `sse` / `websocket` / `websocket-cached` / `auto` | pi-ai 默认 | 选择流式传输方式。 | 不是所有 provider 都支持所有传输方式。 |
| `timeoutMs` | 非负整数 | 无 | Provider SDK/HTTP 请求超时时间。 | `0` 的具体含义由底层传输实现决定。 |
| `websocketConnectTimeoutMs` | 非负整数 | 无 | WebSocket 建立连接的超时时间。 | 只影响 WebSocket 传输。 |
| `streamIdleTimeoutMs` | 正数 | `300000` | 单次 provider 读取允许的最大空闲时间，单位毫秒。 | 不包括用户或 agent 的思考时间。 |
| `retryPolicy` | `RetryPolicy` | normal 默认策略 | 配置 provider 请求失败后的重试策略。 | 重试由 `dsh-llm-retry` 在 agent failed-step 扩展点执行。 |

## Model 参数

### `models` 条目

```yaml
models:
  - id: my-model
    name: My Model
    contextWindow: 131072
    maxTokens: 16384
    input:
      - text
      - image
    reasoningEfforts:
      off:
      low: low
      high: high
    compat:
      thinkingFormat: deepseek
      supportsReasoningEffort: true
```

| 参数 | 类型 | 默认值 | 作用 | 注意事项 |
|---|---|---:|---|---|
| `id` | `string`，必填 | 无 | 发给 provider 的实际模型 ID，也是 Harness 模型选择的 key。 | 不支持通配符展开；`gpt-*` 只会被当成字面量 ID。 |
| `name` | `string` | 模型 ID | 模型选择器显示名称。 | 不改变请求中的模型 ID。 |
| `contextWindow` | 正整数 | 从内置模型或 route 默认值继承 | 声明模型可承载的最大上下文。 | 影响上下文容量判断和超限处理。 |
| `maxTokens` | 正整数 | 从内置模型或 route 默认值继承 | 声明模型最大输出能力。 | **显式写在模型条目中时，会成为该模型的请求默认输出上限。** |
| `input` | `text[]`，可选 `image` | 从内置模型或 `defaultInput` 继承 | 声明模型支持的输入模态。 | 误声明 `image` 可能导致 provider 在请求中途拒绝。 |
| `reasoningEfforts` | `false` 或 effort map | 继承内置模型；自定义模型默认无推理 | 声明模型支持的推理级别及发送到 wire 的名称。 | 空对象非法；除 `off` 外的级别必须有非空 wire 值。 |
| `compat` | `CompatProfile` | 继承 route 或内置模型 | 为单个模型覆盖推理协议兼容设置。 | 只适用于 `openai-completions`。 |

### `modelOverrides` 条目

`modelOverrides` 使用模型 ID 作为 key，value 使用与 `models` 条目相同的字段，但不再写 `id`：

```yaml
modelOverrides:
  deepseek-v4-pro:
    maxTokens: 8192
    reasoningEfforts:
      off:
      high: high
      max: max
```

它适合“只修正一个内置模型，其余模型保持原样”的场景。以下组合会被拒绝：

- 自定义 provider 使用 `modelOverrides`
- 同一个 provider 同时使用 `models` 和 `modelOverrides`
- `modelOverrides` 引用不存在的内置模型
- override value 自己携带 `id`

## 推理参数

### `reasoningEfforts`

可用 key 为：

```text
off, minimal, low, medium, high, xhigh, max
```

| 写法 | 含义 |
|---|---|
| 省略 `reasoningEfforts` | 继承内置模型的推理能力；自定义模型则没有推理能力。 |
| `reasoningEfforts: false` | 明确声明模型不支持推理。 |
| `off:` | 提供关闭推理选项，值为 `null`。 |
| `high: high` | 选择 `high` 时向 provider 发送 `high`。 |
| `max: ultra` | Harness 使用 `max`，发送给 provider 的 wire 名称是 `ultra`。 |
| 只声明 `off` | 非法，因为没有可用的推理级别。 |
| 非 `off` 级别写空值 | 非法，必须提供 wire 名称。 |

### `compat`

```yaml
compat:
  thinkingFormat: deepseek
  supportsReasoningEffort: true
```

| 参数 | 类型 | 作用 |
|---|---|---|
| `thinkingFormat` | `openai` / `deepseek` / `openrouter` / `together` / `zai` / `qwen` / `string-thinking` / `ant-ling` | 指定 reasoning 参数如何编码到请求协议。 |
| `supportsReasoningEffort` | `boolean` | 明确声明端点是否接受 `reasoning_effort` 字段。 |

model 级 `compat` 覆盖 route 级 `compat`。如果两级都没有设置，则保留内置模型值或 pi-ai 的自动判断。

## `thinkingBudgets`

```yaml
thinkingBudgets:
  minimal: 1024
  low: 4096
  medium: 8192
  high: 16384
```

| 参数 | 类型 | 作用 |
|---|---|---|
| `minimal` | number | `minimal` 推理级别使用的预算。 |
| `low` | number | `low` 推理级别使用的预算。 |
| `medium` | number | `medium` 推理级别使用的预算。 |
| `high` | number | `high` 推理级别使用的预算。 |

底层 provider 不支持预算时，该配置不会自动让 provider 获得预算能力。

## 缓存与传输

### `cacheRetention`

| 值 | 含义 |
|---|---|
| `none` | 不保留 prompt cache。 |
| `short` | 短期保留。 |
| `long` | 长期保留。 |

### `transport`

| 值 | 含义 |
|---|---|
| `sse` | 使用 Server-Sent Events。 |
| `websocket` | 使用 WebSocket。 |
| `websocket-cached` | 使用带缓存行为的 WebSocket。 |
| `auto` | 交给 pi-ai 自动选择。 |

## 超时参数

| 参数 | 单位 | 影响范围 |
|---|---|---|
| `timeoutMs` | 毫秒 | Provider SDK/HTTP 请求。 |
| `websocketConnectTimeoutMs` | 毫秒 | WebSocket 建连阶段。 |
| `streamIdleTimeoutMs` | 毫秒 | 已建立流中，等待 provider 下一次数据的时间。 |

`streamIdleTimeoutMs` 默认 `300000`，即 5 分钟。它不会限制模型生成总时长，也不会计算用户查看或 agent 思考的时间。

## 重试策略

### normal

```yaml
retryPolicy:
  mode: normal
  maxRetries: 2
  retryableCodes:
    - EMPTY_RESPONSE
    - RATE_LIMIT
    - SERVER
    - TIMEOUT
    - TRANSPORT
  backoff:
    initialDelayMs: 500
    maxDelayMs: 10000
    jitterRatio: 0.1
```

| 参数 | 默认值 | 作用 |
|---|---:|---|
| `mode` | 必填 | 固定为 `normal`。 |
| `maxRetries` | `2` | 首次请求之后最多重试次数。允许 `0`。 |
| `retryableCodes` | `EMPTY_RESPONSE`、`RATE_LIMIT`、`SERVER`、`TIMEOUT`、`TRANSPORT` | 允许触发重试的稳定错误码。 |
| `backoff.initialDelayMs` | `500` | 第一次退避延迟。 |
| `backoff.maxDelayMs` | `10000` | 单次退避和 provider retry-after 接受的最大延迟。 |
| `backoff.jitterRatio` | `0.1` | 退避随机抖动比例，范围 `0` 到 `1`。 |

### always

```yaml
retryPolicy:
  mode: always
  backoff:
    initialDelayMs: 500
    maxDelayMs: 10000
    jitterRatio: 0.1
```

`always` 会对模型请求失败持续重试，直到成功、取消或资源释放。应谨慎使用，避免服务异常时产生持续请求。

## 参数解析和保存规则

| 场景 | 行为 |
|---|---|
| 新增端点高级参数为空 | 不写入 profile，使用 adapter/schema 默认行为。空数组和空对象也视为空。 |
| 编辑端点时不修改参数 | 不生成对应 settings op。 |
| 编辑端点后清空参数 | 对应字段使用 `unset`，恢复 base 或 schema 默认值。空数组和空对象也视为清空。 |
| 显式配置模型 `maxTokens` | 既声明模型能力，也成为请求默认输出上限。 |
| 只继承 catalog 的 `maxTokens` | 只作为模型能力，不自动成为请求默认值。 |
| `models` 非空 | 替换 route 的完整模型列表。 |
| `modelOverrides` 存在 | 只修改内置模型，不能与 `models` 并用。 |

## 当前 UI 暴露范围

模型高级配置页面目前支持：

- 端点名称、URL、协议、API Key
- 自定义 Header 和继承 Header
- 端点高级参数
- 模型 ID、名称、上下文、最大输出
- 模型文本/图片输入能力
- 模型 reasoningEfforts
- 模型级 `compat`
- 模型元数据 provider 来源选择
- 新增和已保存端点的模型拉取

`modelOverrides` 仍建议直接写入配置，因为它与显式 `models` 列表的语义不同，需要独立的内置模型覆盖编辑器。

## 不属于 profile 的请求参数

以下是单次请求参数，不是 provider profile 参数：

| 参数 | 说明 |
|---|---|
| `temperature` | 单次请求采样温度。 |
| `maxTokens` | 单次请求输出上限，会覆盖模型和 provider 默认值。 |
| `reasoningEffort` | 单次请求使用的推理级别，会覆盖 profile 默认值。 |
| `system`、`messages`、`tools` | 请求上下文和工具定义。 |
| `stop` | 当前 `llm-pi-ai` adapter 明确不支持的请求选项。 |
