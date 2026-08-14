# 模型配置插件设计

> 状态：草稿。依据本仓库 `deepseek-harness/docs/` 与 `packages/` 的既有架构与约定编写；本文件不声称任何部分已实现。

## 1. 目标与范围

设计一个"模型配置插件"：在 Web 前端提供一个设置入口，让用户

1. 配置新的**自定义模型端点**（base URL、API 协议、API Key、显示名）；
2. **拉取**端点公开的模型列表；
3. 按**模型名称**设置该模型的参数：上下文大小（`contextWindow`）、推理强度（reasoning effort）、最大输出长度（`maxTokens`）等。

配置即刻生效（无需重启），并通过会话级模型选择器被使用。本设计复用 harness 既有能力 seams，不重复实现已存在的机制。

## 2. 现状分析：需求 → 现有支撑

逐条映射到仓库内已实现的支撑（这是"参考当前项目文档"得到的结论）：

| 需求 | 现有支撑（包 / 服务 / RPC / 槽位） | 差距 |
|---|---|---|
| 前端配置入口 | `ui-settings-models` 的 Models 页：三域 join（`llm.providers` + `settings.describe` + `credentials.describe`），注册于 `settings.section` 与 `settings.onboarding` | 无 |
| 配置自定义端点 | `llm-pi-ai` 的 `CustomProviderCard`：`providers.<route>` 整段写入（`api`/`baseURL`/`models`），协议选项读自 adapter 自身 schema | 无 |
| 拉取模型 | `llm.discoverModels` RPC（pi-ai discovery：catalog 路由从 registry 回答，未知路由走 `GET /models`）→ picker 采纳 | 无 |
| 每模型上下文 / 最大输出 | `ModelListEditor` 行内 disclosure：`contextWindow`、`maxTokens`（`K`/`M` 后缀，存纯计数） | 无 |
| 模型目录（host 侧） | `llm.models` RPC：跨会话的每路由模型分组（设置面视图，与 `session.models` 同构） | 无 |
| **每模型推理强度** | route 级 `reasoning`（pi-ai）/`reasoningEffort`（deepseek）已在既有卡片"自定义设置"折叠区可编辑；pi-ai profile 的**每模型** `reasoningEfforts`（级别 → wire 拼写）仅 `settings.yaml` 可写；`llm-deepseek` 的 `models` 条目根本不支持按模型 effort | **有：每模型级别的 UI 编辑面缺失** |
| 保存与安全 | `settings.mutate`（path ops + `expectedRevision`）+ `describe({redactSecrets})`；API Key 走 `credentials.set` write-only（派生 `<ROUTE>_API_KEY`） | 无 |
| 配置生效 | adapter 以 thunk 每操作重读；`llm/adapters-updated`、`settings/document-updated` 推送失效 | 无 |
| 被会话使用 | `agent-default-model`（默认选择）+ `ui-model-selection`（`session.models` / `session.selectModel`） | 无 |

**结论**：需求的运输与存储主体已由架构承载。仓库 [web-config-plane 笔记](../deepseek-harness/.agents/notes/implemented/architecture/2026-07-30-web-config-plane.md) 明确否决过"统一 models bridge 插件"——provider 配置必须待在 adapter 自己的 settings 命名空间，目录声明只有四个字段。因此本插件设计的实质增量是：

- **G1**：每模型推理强度等参数的 Web 编辑面（`reasoningEfforts` UI）；
- **G2**：将散落能力组装为独立可安装的插件（独立 `settings.section` 入口 + host 侧最小支撑）。

## 3. 总体架构

插件由两半组成，遵循仓库 [插件即一切](../deepseek-harness/docs/architecture.md) 与 [capability seam](../deepseek-harness/docs/architecture.md#capability-seams) 的约定：

```
┌──────────────────────────────────────────────────────────┐
│ Web（浏览器）                                             │
│  @deepseek-ai/dsh-client-ui-models-config                 │
│   settings.section "模型配置"                              │
│   ProviderRow / CustomProviderCard / ModelListEditor      │
│   （含 reasoningEfforts 编辑器 —— G1）                     │
│   │  llm.providers · llm.discoverModels · llm.models      │
│   │  settings.describe/update/replace/mutate              │
│   │  credentials.describe/set/unset                       │
└───┼──────────────────────────────────────────────────────┘
    │ RPC（apiproxy，loopback + same-origin 守卫）
┌───┼──────────────────────────────────────────────────────┐
│ Host                                                        │
│  复用：llm-pi-ai（dormant 装载）· llm-deepseek              │
│        settings（命名空间/分层）· credentials（引用）        │
│        agent-default-model · apiproxy（llm.* 域已存在）     │
│  新增（最小）：每模型 reasoningEfforts 的 schema/校验/编辑面 │
└──────────────────────────────────────────────────────────┘
```

- **不新增协议适配器**（决策 D1）：自定义端点由 `llm-pi-ai` dormant 装载承担——它已实现 OpenAI-compatible 端点、协议表、模型 catalog、发现与推理方言。
- **不新增 settings 桥**（决策 D2）：沿用 [web-config-plane 的否决](../deepseek-harness/.agents/notes/implemented/architecture/2026-07-30-web-config-plane.md#alternatives-considered)；配置留在 adapter 自己的命名空间。

## 4. 配置模型（schema 设计）

### 4.1 命名空间与分层

插件使用 `llm-pi-ai` 的 `llm-pi-ai` 命名空间（复用）作为端点与每模型参数的承载：

- 解析顺序：schema 默认值 → 注册者 composition `base`（`cordis.yml` 条目，dormant 时为空）→ 用户层（`settings.yaml`，或前端写入）。
- 写入面：`settings.update`（合并补丁）/ `settings.mutate`（path ops）/ `settings.replace`（整体重置，未出现的键回退到 base）。
- 每个 profile 即一个 route：`providers.<route>`。

### 4.2 端点 profile（复用 pi-ai 已有字段）

```yaml
providers:
  acme-gateway:
    displayName: Acme Gateway      # 目录/UI 显示名
    api: openai-completions        # 协议；未知路由必填
    baseURL: https://gateway.acme.example/v1
    apiKeyEnv: ACME_GATEWAY_API_KEY  # 凭据引用；UI 输入键时派生并写回
    defaultContextWindow: 262144   # 未描述模型的后备
    defaultMaxTokens: 32768
    models: []
```

### 4.3 每模型参数（G1 的核心 schema）

每个 `models` 条目以模型 id 为键轴，未配置的模型走 route 级默认：

```yaml
models:
  - id: acme-large
    name: Acme Large
    contextWindow: 65536      # 上下文大小
    maxTokens: 4096           # 最大输出长度
    reasoningEfforts:         # 推理强度：key=可选级别，value=wire 拼写
      off:                    # off 三态：不声明/空声明（按方言映射）/命名值
      high: high
      max: ultra
    compat:                   # 仅 openai-completions 路由
      thinkingFormat: deepseek
```

语义（与 pi-ai 现有一致）：

- `contextWindow` / `maxTokens`：正整数；省略时解析到 route 后备（`defaultContextWindow`/`defaultMaxTokens`）。
- `reasoningEfforts`：可取值 `false`（非推理模型，不提供任何级别）或一个 dict。dict 的**键**受 schema 约束为 pi-ai 规范级别集（`off`/`minimal`/`low`/`medium`/`high`/`xhigh`/`max`）——键约束随 `settings.describe` 的 schema 信封过网，UI 无需硬编码级别集（与 `api` 协议从 schema 读取同机制）。`off` 是唯一三态键：不声明 = 不提供 Off；空声明（`off:`）= 提供 Off，选中后按方言映射（deepseek 方言发 `thinking: {type:'disabled'}`，其他方言省略参数）；命名值 = 该值上 wire。非 `off` 级别必须带 wire 拼写。未声明级别 = 不支持。该声明经 `resolveModelInfo` 暴露为 `reasoning` 元数据（ordered），供会话选择器渲染。
- 校验（adapter 的 schema 解析在写入处拒绝，`settings.mutate` 以 `settings-rejected` 应答）：重复模型 id、空 `reasoningEfforts`（既非 `false` 也非省略）、`off` 之外的空值级别、只声明 `off` 一个级别、`thinkingFormat` 用在非 `openai-completions` 模型上。

若端点即 DeepSeek 官方（`llm-deepseek`），其级别固定为 `off`/`high`/`max`：路由级 `reasoningEffort` 已覆盖"默认强度"，按模型覆盖需要给 `models` 条目增加可选 `reasoningEffort` 字段（决策 D3，改动极小，属可选扩展）。

### 4.4 发现结果的每模型参数回填

`llm.discoverModels` 只披露 `id`/`name`/`contextWindow`/`maxTokens`，**不披露推理能力**。采纳发现结果后，推理强度由用户手工声明（picker 中每个待采纳模型默认不预填 effort）。这是 G1 的边界：发现是"候选"，参数是"声明"。

## 5. 端到端流程设计

### 5.1 入口注册（Client）

- 注册 `settings.section`（"模型配置"页）：经 `ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', … }))`——`inject` 等待声明、声明塌缩时移除贡献、重声明后重跑（应用顺序不受约束，`ui-settings-models` 即此形态）；`children` 声明本页所需槽位；数据经注入面（inject `connection`/`remote`，三域 RPC）进入，组件只拿 props 四份 share。
- 页面 join 四域快照：`llm.providers`（configurable-provider 目录 + 活跃态）、`llm.models`（host 侧每路由模型分组）、`settings.describe({redactSecrets})`（分层+脱敏+`secrets` 槽位）、`credentials.describe`（configured/source/writable 徽标）。失效订阅：`settings/document-updated`、`credentials/updated`、`llm/adapters-updated`（转发后重取）。
- 若宿主已装载 `ui-settings-models`，则树内形态**不重复注册页面**，而是演进既有 Models 页（新增 G1 编辑面）；独立插件形态（out-of-tree）注册自己的 section，互斥由 profile 层禁用 `ui-settings-models` 行实现（决策 D4）。

### 5.2 新增自定义端点

复用 `CustomProviderCard` 形态：Provider ID（小写字母开头，作为 `providers.<route>` 键与派生凭据引用词干）、端点（baseURL）、协议（读自命名空间自身 schema 的 union，防漂移）、至少一个唯一 id 模型——三者门控创建。一次 `settings.mutate` 写入整段 profile + 一次 `credentials.set`（`<ROUTE>_API_KEY` 派生）。API Key 输入仅存在于组件内存，绝不进 `settings.yaml`。

### 5.3 拉取模型

"拉取模型"针对**表单当前值**发起 `llm.discoverModels`（含未保存的 baseURL、未存储的键），回复进 picker（候选，不直接写入）；已配置候选默认不选中，采纳不覆盖用户调优过的容量。拉取失败（`DISCOVERY_FAILED`/`NO_DISCOVERY`/`DISCOVERY_UNSUPPORTED`/`INVALID_CREDENTIAL`）在行内显示 adapter 的消息，模型行保持手编可编辑。

### 5.4 每模型参数编辑（G1，新增）

`ModelListEditor` 每行 disclosure 在既有上下文/输出字段之上增加推理强度区：

| 字段 | 控件 | 写路径 |
|---|---|---|
| 上下文大小 | 计数输入（`K`/`M` 后缀，存纯计数） | draft 内编辑，随整组 `models` 数组一次落盘 |
| 最大输出长度 | 同上 | 同上 |
| 推理强度 | 三态开关（继承/禁用/声明）+ 级别行列表：级别名 + wire 拼写输入 | 同上 |

- **落盘形态与既有编辑器一致**：持 draft 数组，一次 `settings.mutate` 写整组 `models`（或重置时 unset 该数组）——逐索引 path op 在数组位移时脆弱，不使用。
- 推理强度三态：省略（继承 catalog 能力）/ `false`（非推理模型）/ 声明 dict。声明 dict 时只渲染**已声明**级别 + 一个"添加级别"入口，级别候选读自命名空间 schema 的 dict 键约束（见 4.3），排除已声明者；省略某级别即"不支持"，不做隐式默认。
- `off` 三态 UI：不声明（无行）/ 空值行（`off:`，按方言映射）/ 带值行。清空非 `off` 级别的拼写 = 删除该级别行（unset），不写空串——空串与空 dict 都是被拒绝的非法值。
- 校验在 draft 上先行（重复 id、非法级别、`off` 之外空值、非正整数容量），写入前再经 schema；行内报错。
- 继承视图：`base` 层的 models 数组在用户层未覆盖时以继承态显示；首次编辑把完整数组物化进用户层；重置 = unset 该数组。

### 5.5 保存路径

所有编辑落为**路径寻址**的 `settings.mutate` ops + `expectedRevision`（读自描述符）；`settings-conflict` 时重读重放，绝不覆盖更新的写入。凭据走 `credentials.set`/`unset`。页面只持有脱敏描述符，因此删除 profile 时不会误删它从未见过的秘密——只删除引用等于派生词干的写透凭据。

### 5.6 生效与联动

- adapter 每次 `stream()`/`resolveModelInfo()` 经 thunk 重读命名空间；一次编辑在**下一次请求**生效，运行中的流保持其开始时的快照。
- 注册级事实（路由集、retryPolicy、目录声明）变化时，pi-ai 以 `replace` 原子更新注册；`llm/adapters-updated` 在每次拓扑提交后发出，客户端据此刷新 join。
- 会话使用链路（复用）：`agent-default-model`（默认选择：provider/model/effort）→ 新会话 → `ui-model-selection`（`session.models` 目录 + `session.selectModel`）→ 下一次 prompt 组装时 `installModelSelection` 应用。

## 6. 关键设计决策

| # | 决策 | 理由 | 引用 |
|---|---|---|---|
| D1 | 不新增协议适配器，复用 `llm-pi-ai` dormant 装载 | 自定义端点/发现/推理方言已由 pi-ai 实现；新 adapter 重复其协议表 | [llm-pi-ai README](../deepseek-harness/packages/llm/llm-pi-ai/README.md) |
| D2 | 不建统一 models bridge；配置留在 adapter 命名空间 | 目录四字段 + 每插件命名空间已给 UI 一切所需；bridge 重引入 adapter 映射间接 | [web-config-plane 笔记](../deepseek-harness/.agents/notes/implemented/architecture/2026-07-30-web-config-plane.md) |
| D3 | 每模型推理强度落在 `reasoningEfforts`（pi-ai 语义）；deepseek 按需扩展单字段 | 级别是 opaque id、wire 拼写适配器拥有；off 三态不可用空值消除 | [pi-ai catalog 语义](../deepseek-harness/packages/llm/llm-pi-ai/README.md#catalog-resolution) |
| D4 | 树内形态演进 `ui-settings-models`；独立插件形态注册自己的 section，互斥由 profile 层禁用 `ui-settings-models` 行实现 | 双模型页互相漂移；槽位是唯一组合通道 | [ui-settings README](../deepseek-harness/packages/client/ui-settings/README.md) |
| D5 | UI 手写卡片而非 schema 通用渲染器 | 通用渲染器已被实现并否决：无层次、不可用 | [web-config-plane 笔记](../deepseek-harness/.agents/notes/implemented/architecture/2026-07-30-web-config-plane.md) |
| D6 | 发现结果不自动回填推理强度 | 发现只披露 id/容量，回填即猜测；声明是用户决定 | [pi-ai 发现语义](../deepseek-harness/packages/llm/llm-pi-ai/README.md#endpoint-interrogation) |

## 7. 错误处理与安全

- **秘密**：`settings.yaml` 与 cordis.yml 永不携带键值；wire 面强制 `redactSecrets`；键入键在 `credentials.set` 前按 `normalizeApiKey` 同规则校验（trim + 可打印 ASCII，拒绝 `NAME=value` 粘贴行）。
- **并发**：所有写携带 `expectedRevision`；冲突重读不覆盖。
- **拒绝在写入处发生**：adapter 的 schema 解析（含 `validate` 之外的跨字段检查）使 `settings.mutate` 以 `settings-rejected` 拒绝坏值，不落盘；已存坏 section 由命名空间保留最后良值并告警。
- **拉取**：4MB 接收上限；401/403 归因于凭据；不可达/非 JSON 归 `DISCOVERY_FAILED`；不支持的协议归 `DISCOVERY_UNSUPPORTED`（降级为手编）。
- **凭据派生**：Provider ID 必须 POSIX 标识符词干（小写字母开头），否则派生引用在凭据 seam 处才报错——创建卡片在字段处先行拒绝。

## 8. 事件与扩展点

- 复用事件：`llm/adapters-updated`（拓扑）、`settings/updated` + `settings/document-updated`（命名空间）、`credentials/updated`（徽标刷新）。
- 复用扩展点：`ctx.llm.registerConfigurableProviders`（目录）、`registerModelDiscovery`（发现）、`ctx.settings.register`（命名空间）、`settings.section`（页面槽位）、`agent-default-model` + `session.selectModel`（使用链路）。
- 本插件不新增事件；若 deepseek 按模型 effort（D3 扩展）落地，也只改其 schema 与 resolve 路径，不动事件面。

## 9. 模型体验（Model Experience）

- 配置本身不进模型请求：模型看到的是选定 provider/model/effort 对应的系统提示、历史、工具与调用配置；adapter 不注入配置散文。
- 每模型参数通过 `request/header` 已记录路径生效：`maxTokens` 物化为 `GenerateOptions.maxTokens`、effort 经 `prepareCall` 校验后记录——**模型可见 ⟺ 已记录**不变式保持。
- KV Cache：切换 route/模型改变缓存域；只改 effort/容量不改变提示前缀。

## 10. 验证方案

- **单元**：schema 校验（重复 id、`reasoningEfforts` 非法形态、off 三态）、解析拒绝、draft → path op 生成、容量 `K/M` 解析与最短回写、凭据派生与 ownership 判定。
- **REAL-composition**：boot 测试专用 cordis.yml 经 Loader 与 app/process 装载，断言"写 profile → 路由注册 → `llm.providers` 目录生效 → 下一次请求使用新配置"。
- **组件（jsdom）**：ProviderCard 门控、拉取携带表单当前值、picker 采纳不覆盖调优行、每模型 effort 编辑与 unset、冲突重试、只读姿态。
- **e2e 快照（keyless）**：仿照 `apps/web/tests/models-settings.e2e.ts` 钉死"新增自定义端点 → 拉取 → 配置每模型参数 → 设置页渲染"全链路，scaffold `harnessHome`。
- **覆盖门**：client 包进每文件 100% 覆盖门；`test:gui` + `DSH_SNAPSHOT=replay test:web`。

## 11. 已知限制与后续

- 拉取仅覆盖 OpenAI-compatible `GET /models`；其他协议手编。
- 每模型 effort 仅对已声明级别可编辑；catalog 继承级别不可见（省略 = 沿用 catalog，无法在 UI 中"取消声明"）。
- 独立插件形态与 `ui-settings-models` 互斥（D4）：共存时双页面由同一命名空间驱动，修改相互可见但 UX 重复。
- schema-generic 的"高级参数"（retryPolicy、超时等）延续既有姿态：留在 `settings.yaml`。

## 12. 参考文档

- [架构文档](../deepseek-harness/docs/architecture.md)、[Cordis 入门](../deepseek-harness/docs/cordis-primer.md)
- [LLM 流式子系统](../deepseek-harness/docs/subsystems/llm-streaming.md)、[设置子系统](../deepseek-harness/docs/subsystems/settings.md)、[凭据子系统](../deepseek-harness/docs/subsystems/credentials.md)
- [新增 LLM 适配器 cookbook](../deepseek-harness/docs/cookbook/adding-an-llm-adapter.md)、[新增包 cookbook](../deepseek-harness/docs/cookbook/adding-a-package.md)
- 包 README：`llm`、`llm-pi-ai`、`llm-deepseek`、`settings`、`credentials`、`agent-default-model`、`ui-settings`、`ui-settings-models`、`ui-model-selection`
- Agent Notes：`2026-07-30-web-config-plane`、`2026-08-04-declaring-a-provider-from-the-models-page`、`2026-07-29-request-level-llm-config-credentials`、`2026-08-04-configuration-source-ownership`
