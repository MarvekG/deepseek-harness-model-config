window.__ModuleLoader__.load({
  id: 'dsh-models-config-plugin',
  factory: (require) => {
    const React = require('react')
    const { createElement: h, useEffect, useState, useSyncExternalStore } = React

    const NS = 'settings.modelConfig'
    const EFFORTS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']
    const THINKING_FORMATS = ['openai', 'deepseek', 'openrouter', 'together', 'zai', 'qwen', 'string-thinking', 'ant-ling']
    const PARAMETERS_DOC_URL = 'https://github.com/MarvekG/deepseek-harness-model-config/blob/main/docs/llm-pi-ai-parameters.md'
    const PROVIDER_ADVANCED_FIELDS = [
      'defaultContextWindow', 'defaultMaxTokens', 'defaultInput', 'reasoning', 'thinkingBudgets',
      'compat', 'cacheRetention', 'transport', 'timeoutMs', 'websocketConnectTimeoutMs',
      'streamIdleTimeoutMs', 'retryPolicy',
    ]
    const MODELS_DEV_METADATA_URL = 'https://models.dev/api.json'
    let modelsDevMetadataPromise
    const en = {
      nav: 'Advanced model config',
      title: 'Advanced model config',
      loading: 'Loading model configuration…',
      adapterMissing: 'llm-pi-ai is not loaded. Enable the llm-pi-ai adapter first.',
      intro: 'Create custom endpoints and declare each model\'s capacity and reasoning support.',
      parameterReference: 'Parameter reference',
      noProviders: 'No custom provider yet. Add an endpoint here, then fetch and select at least one model.',
      provider: 'Provider',
      inheritedModels: 'Editing the user-layer model list',
      materializedModels: 'Editing materializes the model list in the user layer',
      restoreInheritance: 'Restore inheritance',
      noModels: 'This provider has no editable models. Fetch models from this page, then select at least one.',
      discardReload: 'Discard and reload',
      save: 'Save',
      saving: 'Saving…',
      draftReloading: 'Configuration changed. Reloading the draft.',
      saved: 'Saved. New parameters apply to the next request.',
      restored: 'Restored the inherited model list.',
      addEndpoint: 'Add endpoint',
      deleteEndpoint: 'Delete endpoint',
      deleteEndpointConfirm: 'Delete endpoint "{provider}" and its generated credential?',
      deleteEndpointFailed: 'Could not delete the endpoint: {message}',
      reasoning: 'Reasoning effort',
      offPlaceholder: 'Blank disables per protocol',
      wirePlaceholder: 'Wire spelling',
      wireLabel: '{level} wire spelling',
      delete: 'Delete',
      addLevel: 'Add effort',
      clearReasoning: 'Clear reasoning levels',
      add: 'Add',
      modelIndex: 'Model {index}',
      modelId: 'Model ID',
      modelName: 'Display name',
      contextWindow: 'Context window',
      maxTokens: 'Max output tokens',
      input: 'Input modalities',
      inputText: 'Text',
      inputImage: 'Image',
      endpointTitle: 'Add custom endpoint',
      editEndpoint: 'Edit endpoint',
      endpointDescription: 'Fetch candidates through the OpenAI-compatible model-list endpoint.',
      endpointName: 'Name',
      endpointNamePlaceholder: 'AcmeGateway',
      endpointUrl: 'Endpoint URL',
      apiProtocol: 'API protocol',
      endpointAdvanced: 'Endpoint advanced parameters',
      endpointAdvancedDescription: 'Optional defaults and transport controls. Blank values use the default behavior.',
      defaultContextWindow: 'Default context window',
      defaultMaxTokens: 'Default max output tokens',
      defaultInput: 'Default input modalities',
      defaultReasoning: 'Default reasoning effort',
      thinkingBudgets: 'Thinking budgets',
      budgetMinimal: 'Minimal budget',
      budgetLow: 'Low budget',
      budgetMedium: 'Medium budget',
      budgetHigh: 'High budget',
      compat: 'Reasoning compatibility',
      modelCompatDescription: 'Only applies to openai-completions models.',
      thinkingFormat: 'Thinking format',
      supportsReasoningEffort: 'Supports reasoning_effort',
      cacheRetention: 'Prompt cache retention',
      transport: 'Transport',
      timeoutMs: 'Request timeout (ms)',
      websocketConnectTimeoutMs: 'WebSocket connect timeout (ms)',
      streamIdleTimeoutMs: 'Stream idle timeout (ms)',
      retryPolicy: 'Retry policy',
      retryMode: 'Retry mode',
      retryableCodes: 'Retryable codes',
      maxRetries: 'Max retries',
      backoff: 'Backoff',
      initialDelayMs: 'Initial delay (ms)',
      maxDelayMs: 'Max delay (ms)',
      jitterRatio: 'Jitter ratio',
      resetEndpointAdvanced: 'Reset endpoint advanced parameters',
      inheritDefault: 'Default',
      headers: 'Custom headers',
      headersDescription: 'These headers are sent when calling models, but not when fetching the model list. Store API keys and other secrets in credential settings.',
      inheritedHeaders: 'Inherited headers',
      inheritedHeadersDescription: 'These headers come from the default configuration. Add a header with the same name below to change its value. To remove it, edit the default configuration.',
      headerName: 'Header name',
      headerValue: 'Header content',
      headerNamePlaceholder: 'X-Custom-Header',
      headerValuePlaceholder: 'value',
      addHeader: 'Add header',
      headerNameRequired: 'Enter a header name.',
      headerNameInvalid: 'The header name has an invalid format. Use letters, numbers, and standard symbols only.',
      headerNameDuplicate: 'Duplicate header name: {name}',
      headerValueInvalid: 'The header content contains unsupported characters. Remove emoji, null characters, and line breaks.',
      endpointKey: 'API key',
      endpointKeyPlaceholder: 'Used only to fetch models and store the credential',
      endpointKeyExistingPlaceholder: 'Leave blank to keep the existing credential',
      endpointNameRequired: 'Enter an endpoint name.',
      endpointNameInvalid: 'The name must start with an English letter and contain only English letters and numbers.',
      endpointUrlRequired: 'Enter an endpoint URL.',
      endpointUrlInvalid: 'Enter a valid http:// or https:// URL.',
      endpointUrlProtocol: 'The URL must start with http:// or https://.',
      endpointKeyRequired: 'Enter an API key.',
      endpointKeyInvalid: 'The API key must be unquoted printable ASCII, not a NAME=value environment line.',
      routeTaken: 'Route {route} already exists.',
      routePreview: 'Uses route {route} and credential reference {ref}.',
      fetchModels: 'Fetch available models',
      refreshModels: 'Refresh models',
      fetching: 'Fetching…',
      refreshingModels: 'Refreshing…',
      discoveryEmpty: 'The endpoint returned no models to add.',
      chooseModels: 'Choose models to add',
      selectAll: 'Select all',
      invertSelection: 'Invert selection',
      selectNone: 'Select none',
      selectedModelParameters: 'Selected model parameters',
      configPreview: 'Configuration preview',
      keyPreviewNotice: 'The API key is saved separately and is not shown here. Header content is saved in settings, but is not sent when fetching the model list.',
      cancel: 'Cancel',
      confirmSave: 'Confirm and save',
      saveChanges: 'Save changes',
      retryKey: 'Retry saving API key',
      metadataApplied: 'Completed metadata for {matched} models. Official providers: {official}; default providers: {ambiguous}; no metadata match: {unmatched}.',
      metadataUnavailable: 'Could not load models.dev metadata. The endpoint results remain editable.',
      metadataSource: 'Metadata source',
      metadataSourceDescription: 'Each option is one provider metadata record. Switching it replaces all metadata fields for this model.',
      metadataDefault: 'Default provider: {provider} ({context}/{output})',
      metadataOfficial: 'Official provider: {provider} ({context}/{output})',
      metadataProvider: '{provider} ({context}/{output})',
      reasoningInvalid: 'Reasoning efforts must be false or an effort list.',
      reasoningEmpty: 'A declared reasoning list needs at least one effort.',
      reasoningOffOnly: 'A list with only off has no usable reasoning effort.',
      reasoningUnknown: 'Unknown reasoning effort: {level}',
      reasoningWire: '{level} needs a wire spelling.',
      reasoningOffWire: 'The off effort may be blank or have a wire spelling.',
      modelIdRequired: 'Every model needs a model ID.',
      modelIdDuplicate: 'Duplicate model ID: {id}',
      modelCapacityInvalid: '{id}: {field} must be a positive integer.',
    }
    const zh = {
      nav: '模型高级配置',
      title: '模型高级配置',
      loading: '正在加载模型配置…',
      adapterMissing: '未装载 llm-pi-ai。请先启用 llm-pi-ai 适配器。',
      intro: '在此新增自定义端点，并声明每个模型的容量与推理能力。',
      parameterReference: '参数文档',
      noProviders: '尚无自定义提供方。请在本页新增端点，然后获取并勾选至少一个模型。',
      provider: '提供方',
      inheritedModels: '正在编辑用户层模型列表',
      materializedModels: '编辑后会在用户层物化模型列表',
      restoreInheritance: '恢复继承',
      noModels: '该提供方没有可编辑的模型。请在本页获取模型，然后勾选至少一个。',
      discardReload: '放弃并重新加载',
      save: '保存',
      saving: '保存中…',
      draftReloading: '配置已更新，正在重新加载草稿。',
      saved: '已保存；下一次请求将使用新参数。',
      restored: '已恢复继承的模型列表。',
      addEndpoint: '新增端点',
      deleteEndpoint: '删除端点',
      deleteEndpointConfirm: '确定删除端点“{provider}”及其派生凭据吗？',
      deleteEndpointFailed: '删除端点失败：{message}',
      reasoning: '推理强度',
      offPlaceholder: '留空表示按协议关闭',
      wirePlaceholder: '服务端拼写',
      wireLabel: '{level} 服务端拼写',
      delete: '删除',
      addLevel: '添加级别',
      clearReasoning: '清除推理等级',
      add: '添加',
      modelIndex: '模型 {index}',
      modelId: '模型 ID',
      modelName: '显示名称',
      contextWindow: '上下文大小',
      maxTokens: '最大输出长度',
      input: '输入能力',
      inputText: '文本',
      inputImage: '图片',
      endpointTitle: '新增自定义端点',
      editEndpoint: '编辑端点',
      endpointDescription: '使用 OpenAI 兼容的模型列表接口获取候选模型。',
      endpointName: '名称',
      endpointNamePlaceholder: 'AcmeGateway',
      endpointUrl: '端点 URL',
      apiProtocol: 'API 协议',
      endpointAdvanced: '端点高级参数',
      endpointAdvancedDescription: '可选的默认值和传输设置；留空表示使用默认行为。',
      defaultContextWindow: '默认上下文大小',
      defaultMaxTokens: '默认最大输出长度',
      defaultInput: '默认输入能力',
      defaultReasoning: '默认推理强度',
      thinkingBudgets: '推理预算',
      budgetMinimal: 'Minimal 预算',
      budgetLow: 'Low 预算',
      budgetMedium: 'Medium 预算',
      budgetHigh: 'High 预算',
      compat: '推理兼容设置',
      modelCompatDescription: '仅适用于 openai-completions 模型。',
      thinkingFormat: '推理格式',
      supportsReasoningEffort: '支持 reasoning_effort',
      cacheRetention: '提示缓存保留',
      transport: '传输方式',
      timeoutMs: '请求超时（毫秒）',
      websocketConnectTimeoutMs: 'WebSocket 连接超时（毫秒）',
      streamIdleTimeoutMs: '流空闲超时（毫秒）',
      retryPolicy: '重试策略',
      retryMode: '重试模式',
      retryableCodes: '可重试错误码',
      maxRetries: '最大重试次数',
      backoff: '退避设置',
      initialDelayMs: '初始延迟（毫秒）',
      maxDelayMs: '最大延迟（毫秒）',
      jitterRatio: '抖动比例',
      resetEndpointAdvanced: '重置端点高级参数',
      inheritDefault: '默认值',
      headers: '自定义 Header',
      headersDescription: '这些 Header 会在调用模型时发送，但获取模型列表时不会发送。API Key 等敏感信息请保存在密钥设置中。',
      inheritedHeaders: '继承的 Header',
      inheritedHeadersDescription: '这些 Header 来自默认配置。若要修改，请在下方添加同名 Header；若要删除，请修改默认配置。',
      headerName: 'Header 名称',
      headerValue: 'Header 内容',
      headerNamePlaceholder: 'X-Custom-Header',
      headerValuePlaceholder: '值',
      addHeader: '添加 Header',
      headerNameRequired: '请填写 Header 名称。',
      headerNameInvalid: 'Header 名称格式不正确，请只使用字母、数字和常用符号。',
      headerNameDuplicate: 'Header 名称重复：{name}',
      headerValueInvalid: 'Header 内容包含不支持的字符，请移除表情、空字符和换行符。',
      endpointKey: 'API Key',
      endpointKeyPlaceholder: '仅用于获取模型和保存凭据',
      endpointKeyExistingPlaceholder: '留空表示继续使用已有凭据',
      endpointNameRequired: '请填写端点名称。',
      endpointNameInvalid: '名称必须以英文字母开头，只能包含英文字母和数字。',
      endpointUrlRequired: '请填写端点 URL。',
      endpointUrlInvalid: '请输入有效的 http:// 或 https:// URL。',
      endpointUrlProtocol: 'URL 必须以 http:// 或 https:// 开头。',
      endpointKeyRequired: '请填写 API Key。',
      endpointKeyInvalid: 'API Key 必须是未加引号的可打印 ASCII 字符，不能粘贴 NAME=value 环境变量行。',
      routeTaken: '路由 {route} 已存在。',
      routePreview: '将使用路由 {route} 和凭据引用 {ref}。',
      fetchModels: '获取可用模型',
      refreshModels: '重新拉取模型',
      fetching: '获取中…',
      refreshingModels: '重新拉取中…',
      discoveryEmpty: '端点没有返回可添加的模型。',
      chooseModels: '选择要添加的模型',
      selectAll: '全选',
      invertSelection: '反选',
      selectNone: '全不选',
      selectedModelParameters: '已选模型参数',
      configPreview: '配置预览',
      keyPreviewNotice: 'API Key 会单独保存，不会显示在这里。Header 内容会写入配置，但获取模型列表时不会发送。',
      cancel: '取消',
      confirmSave: '确认并保存',
      saveChanges: '保存修改',
      retryKey: '重试保存 API Key',
      metadataApplied: '已为 {matched} 个模型补全参数；官方 provider {official} 个，默认 provider {ambiguous} 个，没有元数据记录 {unmatched} 个。',
      metadataUnavailable: '无法加载 models.dev 元数据；端点返回的模型仍可编辑。',
      metadataSource: '元数据来源',
      metadataSourceDescription: '每个选项都是一个完整的 provider 元数据记录；切换后会整体替换该模型的元数据参数。',
      metadataDefault: '默认 provider：{provider}（{context}/{output}）',
      metadataOfficial: '官方 provider：{provider}（{context}/{output}）',
      metadataProvider: '{provider}（{context}/{output}）',
      reasoningInvalid: '推理强度必须是 false 或级别列表。',
      reasoningEmpty: '已声明推理强度时至少选择一个级别。',
      reasoningOffOnly: '仅声明关闭级别没有可用的推理强度。',
      reasoningUnknown: '未知推理级别：{level}',
      reasoningWire: '{level} 需要一个发送给服务端的拼写。',
      reasoningOffWire: '关闭级别只能留空或填写服务端拼写。',
      modelIdRequired: '每个模型都需要模型 ID。',
      modelIdDuplicate: '模型 ID 重复：{id}',
      modelCapacityInvalid: '{id} 的{field}必须是正整数。',
    }
    const sectionStyle = {
      display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '720px',
      color: 'var(--dsw-alias-label-primary)',
    }
    const cardStyle = {
      display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px',
      border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '12px',
      background: 'var(--dsw-alias-bg-module-platform)',
    }
    const inputStyle = {
      boxSizing: 'border-box', width: '100%', height: '32px', padding: '0 10px',
      border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '6px',
      background: 'transparent', color: 'inherit', font: 'inherit',
    }
    const buttonStyle = {
      boxSizing: 'border-box', minHeight: '30px', padding: '4px 10px',
      border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '15px',
      background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit',
    }
    const dangerButtonStyle = {
      ...buttonStyle,
      background: 'var(--dsw-alias-state-error-primary)',
      color: 'var(--dsw-alias-label-primary-foreground)',
      borderColor: 'transparent',
    }

    function loadModelsDevMetadata() {
      if (modelsDevMetadataPromise === undefined) {
        modelsDevMetadataPromise = fetch(MODELS_DEV_METADATA_URL, { cache: 'force-cache' }).then(async response => {
          if (!response.ok) throw new Error(`models.dev returned HTTP ${response.status}`)
          return response.json()
        }).catch(error => {
          modelsDevMetadataPromise = undefined
          throw error
        })
      }
      return modelsDevMetadataPromise
    }

    function positiveMetadataLimit(value) {
      return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined
    }

    function metadataRecordCandidates(metadata, id) {
      if (metadata === null || typeof metadata !== 'object') return []
      const matches = []
      for (const [providerKey, provider] of Object.entries(metadata)) {
        if (provider === null || typeof provider !== 'object') continue
        const models = provider.models
        const model = models !== null && typeof models === 'object' ? models[id] : undefined
        if (model !== null && typeof model === 'object') {
          matches.push({
            providerId: typeof provider.id === 'string' && provider.id !== '' ? provider.id : providerKey,
            model,
          })
        }
      }
      return matches
    }

    const OFFICIAL_PROVIDER_RULES = [
      ['deepseek', /^deepseek(?:[-/.]|$)/],
      ['openai', /^(?:gpt(?:[-/.]|$)|o[134](?:[-/.]|$)|codex(?:[-/.]|$))/],
      ['xai', /^(?:grok|x-ai\/grok|xai\/grok)(?:[-/.]|$)/],
      ['anthropic', /^claude(?:[-/.]|$)/],
      ['google', /^gemini(?:[-/.]|$)/],
      ['mistral', /^mistral(?:[-/.]|$)/],
      ['cohere', /^command(?:[-/.]|$)/],
      ['nvidia', /^nemotron(?:[-/.]|$)/],
      ['meta', /^llama(?:[-/.]|$)/],
      ['xiaomi', /^mimo(?:[-/.]|$)/],
      ['alibaba', /^qwen(?:[-/.]|$)/],
    ]

    function officialMetadataProviderForModel(id) {
      const normalized = id.toLowerCase()
      const bare = normalized.includes('/') ? normalized.slice(normalized.lastIndexOf('/') + 1) : normalized
      return OFFICIAL_PROVIDER_RULES.find(([, rule]) => rule.test(normalized) || rule.test(bare))?.[0]
    }

    function metadataModelIdVariants(id) {
      const variants = [id]
      if (id.includes('/')) variants.push(id.slice(id.lastIndexOf('/') + 1))
      return [...new Set(variants)]
    }

    function metadataProviderModel(metadata, providerId, id) {
      if (metadata === null || typeof metadata !== 'object') return undefined
      for (const [providerKey, provider] of Object.entries(metadata)) {
        if (provider === null || typeof provider !== 'object') continue
        const currentProviderId = typeof provider.id === 'string' && provider.id !== '' ? provider.id : providerKey
        if (currentProviderId !== providerId) continue
        const models = provider.models
        if (models === null || typeof models !== 'object') return undefined
        for (const variant of metadataModelIdVariants(id)) {
          const key = Object.keys(models).find(modelId => modelId === variant || modelId.toLowerCase() === variant.toLowerCase())
          const model = key === undefined ? undefined : models[key]
          if (model !== null && typeof model === 'object') return { providerId, modelId: key, model }
        }
        return undefined
      }
      return undefined
    }

    function metadataLimit(model, field) {
      const limit = model !== null && typeof model === 'object'
        && model.limit !== null && typeof model.limit === 'object' ? model.limit : {}
      return positiveMetadataLimit(limit[field])
    }

    function metadataLimitText(model, field) {
      const value = metadataLimit(model, field)
      return value === undefined ? '?' : String(value)
    }

    function compareMetadataLimits(left, right, field) {
      const leftValue = metadataLimit(left, field)
      const rightValue = metadataLimit(right, field)
      if (leftValue === undefined && rightValue === undefined) return 0
      if (leftValue === undefined) return 1
      if (rightValue === undefined) return -1
      return leftValue - rightValue
    }

    function providerSelection(providerId) {
      return `provider:${providerId}`
    }

    // Rank complete provider records; never combine fields from different providers.
    function defaultMetadataCandidate(candidates) {
      return [...candidates].sort((left, right) => {
        const context = compareMetadataLimits(left.model, right.model, 'context')
        if (context !== 0) return context
        const output = compareMetadataLimits(left.model, right.model, 'output')
        if (output !== 0) return output
        return left.providerId.localeCompare(right.providerId)
      })[0]
    }

    function metadataMatchForEndpoint(metadata, id) {
      const exactCandidates = metadataRecordCandidates(metadata, id)
      const officialProvider = officialMetadataProviderForModel(id)
      const official = officialProvider === undefined ? undefined : metadataProviderModel(metadata, officialProvider, id)
      const exactOfficial = officialProvider === undefined
        ? undefined
        : exactCandidates.find(candidate => candidate.providerId === officialProvider)
      const officialCandidate = exactOfficial ?? official
      const candidates = official !== undefined && exactOfficial === undefined
        ? [...exactCandidates, official]
        : exactCandidates
      if (officialCandidate !== undefined) {
        return {
          candidates,
          selection: providerSelection(officialCandidate.providerId),
          reason: 'official',
          officialProvider,
        }
      }
      if (candidates.length === 0) return { candidates, selection: undefined, reason: 'none' }
      if (candidates.length === 1) {
        return { candidates, selection: providerSelection(candidates[0].providerId), reason: 'unique' }
      }
      const defaultCandidate = defaultMetadataCandidate(candidates)
      return {
        candidates,
        selection: defaultCandidate === undefined ? undefined : providerSelection(defaultCandidate.providerId),
        reason: 'default',
      }
    }

    function metadataRecordForSelection(match, selection) {
      if (match === undefined) return undefined
      const selected = selection === undefined ? match.selection : selection
      const candidate = match.candidates.find(item => providerSelection(item.providerId) === selected)
      return candidate === undefined ? match.candidates[0]?.model : candidate.model
    }

    function retainedMetadataSelection(match, previousSelection) {
      return previousSelection !== undefined
        && match.candidates.some(candidate => providerSelection(candidate.providerId) === previousSelection)
        ? previousSelection
        : match.selection
    }

    function reasoningEffortsFromMetadata(model) {
      if (model.reasoning === false) return false
      const options = Array.isArray(model.reasoning_options) ? model.reasoning_options : []
      const effort = options.find(option => option !== null && typeof option === 'object' && option.type === 'effort')
      if (effort === undefined || !Array.isArray(effort.values)) return undefined
      const result = {}
      for (const value of effort.values) {
        if (value === 'none' || value === 'off') result.off = null
        else if (typeof value === 'string' && EFFORTS.includes(value)) result[value] = value
      }
      return Object.keys(result).some(level => level !== 'off') ? result : undefined
    }

    function enrichDiscoveredModel(candidate, match, selection, replaceMetadata = false) {
      const record = metadataRecordForSelection(match, selection)
      if (record === undefined) return { ...candidate }
      const limit = record.limit !== null && typeof record.limit === 'object' ? record.limit : {}
      const modalities = record.modalities !== null && typeof record.modalities === 'object' ? record.modalities : {}
      const input = Array.isArray(modalities.input) ? modalities.input.filter(value => value === 'text' || value === 'image') : []
      const reasoningEfforts = reasoningEffortsFromMetadata(record)
      return {
        ...candidate,
        ...(replaceMetadata || candidate.name === undefined) && typeof record.name === 'string' ? { name: record.name } : {},
        ...(replaceMetadata || candidate.contextWindow === undefined) && positiveMetadataLimit(limit.context) !== undefined
          ? { contextWindow: positiveMetadataLimit(limit.context) }
          : {},
        ...(replaceMetadata || candidate.maxTokens === undefined) && positiveMetadataLimit(limit.output) !== undefined
          ? { maxTokens: positiveMetadataLimit(limit.output) }
          : {},
        ...input.length > 0 ? { input } : {},
        ...reasoningEfforts === undefined ? {} : { reasoningEfforts },
      }
    }

    function messageOf(error) {
      return error instanceof Error ? error.message : String(error)
    }

    function objectAt(value, path) {
      let current = value
      for (const key of path) {
        if (current === null || typeof current !== 'object') return undefined
        current = current[key]
      }
      return current
    }

    function headerRows(value) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return []
      return Object.entries(value)
        .filter(([, headerValue]) => typeof headerValue === 'string')
        .map(([name, headerValue]) => ({ name, value: headerValue }))
    }

    function headersObject(rows, inherited = []) {
      const canonical = new Map(inherited.map(row => [row.name.toLowerCase(), row.name]))
      return Object.fromEntries(rows
        .map(row => [
          typeof row.name === 'string' ? row.name.trim() : '',
          typeof row.value === 'string' ? row.value : '',
        ])
        .map(([name, value]) => [canonical.get(name.toLowerCase()) ?? name, value])
        .filter(([name]) => name !== ''))
    }

    function headersEqual(left, right) {
      const leftNames = Object.keys(left).sort()
      const rightNames = Object.keys(right).sort()
      if (leftNames.length !== rightNames.length) return false
      return leftNames.every(name => left[name] === right[name])
        && rightNames.every(name => left[name] === right[name])
    }

    function headersError(rows, t) {
      const names = new Set()
      for (const row of rows) {
        const name = typeof row.name === 'string' ? row.name.trim() : ''
        if (name === '') return t('headerNameRequired')
        if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) return t('headerNameInvalid')
        const normalized = name.toLowerCase()
        if (names.has(normalized)) return t('headerNameDuplicate', { name })
        names.add(normalized)
        if (typeof row.value !== 'string') return t('headerValueInvalid')
        try {
          new Headers([[name, row.value]])
        } catch {
          return t('headerValueInvalid')
        }
      }
      return undefined
    }

    function jsonEqual(left, right) {
      return JSON.stringify(left) === JSON.stringify(right)
    }

    function presentAdvancedValue(value) {
      if (value === undefined) return false
      if (Array.isArray(value)) return value.length > 0
      if (value !== null && typeof value === 'object') return Object.keys(value).length > 0
      return true
    }

    function normalizeAdvanced(value) {
      const source = value !== null && typeof value === 'object' ? value : {}
      return Object.fromEntries(PROVIDER_ADVANCED_FIELDS
        .filter(field => presentAdvancedValue(source[field]))
        .map(field => [field, source[field]]))
    }

    function copyModel(model) {
      return model !== null && typeof model === 'object' && !Array.isArray(model) ? { ...model } : { id: '' }
    }

    function positiveNumber(value) {
      const number = Number(value)
      return Number.isInteger(number) && number > 0 ? number : undefined
    }

    function apiKeyError(value, t) {
      const trimmed = value.trim()
      if (trimmed.length === 0) return t('endpointKeyRequired')
      if (/^[A-Z][A-Z0-9_]*=[^=]/.test(trimmed) || /^["'`].*["'`]$/.test(trimmed) || !/^[\x21-\x7E]+$/.test(trimmed)) {
        return t('endpointKeyInvalid')
      }
      return undefined
    }

    function endpointUrlError(value, t) {
      try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:' ? undefined : t('endpointUrlProtocol')
      } catch {
        return t('endpointUrlInvalid')
      }
    }

    function reasoningError(value, t) {
      if (value === undefined || value === false) return undefined
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return t('reasoningInvalid')
      const entries = Object.entries(value)
      if (entries.length === 0) return t('reasoningEmpty')
      if (entries.length === 1 && entries[0][0] === 'off') return t('reasoningOffOnly')
      for (const [level, wire] of entries) {
        if (!EFFORTS.includes(level)) return t('reasoningUnknown', { level })
        if (level !== 'off' && (typeof wire !== 'string' || wire.length === 0)) {
          return t('reasoningWire', { level })
        }
        if (level === 'off' && wire !== null && typeof wire !== 'string') {
          return t('reasoningOffWire')
        }
      }
      return undefined
    }

    function modelsError(models, t) {
      const ids = new Set()
      for (const model of models) {
        if (typeof model.id !== 'string' || model.id.trim().length === 0) return t('modelIdRequired')
        if (ids.has(model.id)) return t('modelIdDuplicate', { id: model.id })
        ids.add(model.id)
        for (const field of ['contextWindow', 'maxTokens']) {
          if (model[field] !== undefined && (!Number.isInteger(model[field]) || model[field] <= 0)) {
            return t('modelCapacityInvalid', { id: model.id, field: t(field) })
          }
        }
        const error = reasoningError(model.reasoningEfforts, t)
        if (error !== undefined) return `${model.id}: ${error}`
      }
      return undefined
    }

    function createController() {
      let revision = 0
      const listeners = new Set()
      return {
        getSnapshot: () => revision,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        refresh() {
          revision += 1
          for (const listener of listeners) listener()
        },
      }
    }

    function Field({ label, children }) {
      return h('label', { style: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 } },
        h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, label),
        children,
      )
    }

    function HeaderEditor({
      value, onChange, disabled, error, t,
      title = 'headers', description = 'headersDescription', addable = true, removable = true,
    }) {
      const patch = (index, changes) => onChange(value.map((row, at) => at === index ? { ...row, ...changes } : row))
      const remove = index => onChange(value.filter((_, at) => at !== index))
      const add = () => onChange([...value, { name: '', value: '' }])
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } },
          h('strong', { style: { fontSize: '13px' } }, t(title)),
          addable ? h('button', { type: 'button', style: buttonStyle, disabled, onClick: add }, t('addHeader')) : null,
        ),
        h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t(description)),
        value.map((row, index) => h('div', { key: index, style: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr) auto', gap: '6px', alignItems: 'center' } },
          h('input', {
            style: inputStyle, value: row.name, disabled,
            'aria-label': t('headerName'), placeholder: t('headerNamePlaceholder'),
            onChange: event => patch(index, { name: event.target.value }),
          }),
          h('input', {
            style: inputStyle, value: row.value, disabled,
            'aria-label': t('headerValue'), placeholder: t('headerValuePlaceholder'),
            onChange: event => patch(index, { value: event.target.value }),
          }),
          removable ? h('button', { type: 'button', style: buttonStyle, disabled, onClick: () => remove(index) }, t('delete')) : h('span'),
        )),
        error === undefined ? null : h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, error),
      )
    }

    function ReasoningEditor({ value, onChange, disabled, t }) {
      const [newLevel, setNewLevel] = useState('')
      const declaredMode = value !== null && typeof value === 'object' && !Array.isArray(value)
      const efforts = declaredMode ? value : {}
      const declared = Object.keys(efforts)
      const changeWire = (level, wire) => {
        const next = { ...efforts }
        if (level === 'off') next.off = wire === '' ? null : wire
        else if (wire === '') delete next[level]
        else next[level] = wire
        onChange(next)
      }
      const add = () => {
        if (newLevel === '') return
        onChange({ ...efforts, [newLevel]: newLevel === 'off' ? null : newLevel })
        setNewLevel('')
      }
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px' } },
        h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('reasoning')),
        declaredMode ? declared.map(level => h('div', { key: level, style: { display: 'grid', gridTemplateColumns: '90px minmax(0, 1fr) auto', gap: '6px', alignItems: 'center' } },
            h('span', { style: { fontSize: '13px' } }, level),
            h('input', {
              style: inputStyle,
              value: efforts[level] === null ? '' : efforts[level],
              disabled,
              placeholder: level === 'off' ? t('offPlaceholder') : t('wirePlaceholder'),
              'aria-label': t('wireLabel', { level }),
              onChange: event => changeWire(level, event.target.value),
            }),
            h('button', {
              type: 'button', style: buttonStyle, disabled,
              onClick: () => {
                const next = { ...efforts }
                delete next[level]
                onChange(next)
              },
            }, t('delete')),
          )) : null,
        declared.length < EFFORTS.length ? h('div', { style: { display: 'flex', gap: '6px' } },
          h('select', { style: inputStyle, value: newLevel, disabled, onChange: event => setNewLevel(event.target.value) },
            h('option', { value: '' }, t('addLevel')),
            EFFORTS.filter(level => !declared.includes(level)).map(level => h('option', { key: level, value: level }, level)),
          ),
          h('button', { type: 'button', style: buttonStyle, disabled: disabled || newLevel === '', onClick: add }, t('add')),
        ) : null,
        declaredMode ? h('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
          h('button', { type: 'button', style: buttonStyle, disabled, onClick: () => onChange(undefined) }, t('clearReasoning')),
        ) : null,
      )
    }

    function nonNegativeNumber(value) {
      const number = Number(value)
      return Number.isInteger(number) && number >= 0 ? number : undefined
    }

    function ratioNumber(value) {
      const number = Number(value)
      return Number.isFinite(number) && number >= 0 && number <= 1 ? number : undefined
    }

    function EndpointAdvancedEditor({
      value, onChange, disabled, headers, inheritedHeaders, headersError, onHeadersChange, t,
    }) {
      const patch = (field, next) => {
        const result = { ...value }
        if (next === undefined) delete result[field]
        else result[field] = next
        onChange(result)
      }
      const input = Array.isArray(value.defaultInput) ? value.defaultInput : []
      const toggleInput = modality => {
        const next = new Set(input)
        if (next.has(modality)) next.delete(modality)
        else next.add(modality)
        patch('defaultInput', next.size === 0 ? undefined : [...next])
      }
      const budgets = value.thinkingBudgets !== null && typeof value.thinkingBudgets === 'object' ? value.thinkingBudgets : {}
      const patchBudget = (level, raw) => {
        const next = { ...budgets }
        const value = raw === '' ? undefined : nonNegativeNumber(raw)
        if (value === undefined) delete next[level]
        else next[level] = value
        patch('thinkingBudgets', Object.keys(next).length === 0 ? undefined : next)
      }
      const compat = value.compat !== null && typeof value.compat === 'object' ? value.compat : {}
      const patchCompat = (field, nextValue) => {
        const next = { ...compat }
        if (nextValue === undefined) delete next[field]
        else next[field] = nextValue
        patch('compat', Object.keys(next).length === 0 ? undefined : next)
      }
      const retry = value.retryPolicy !== null && typeof value.retryPolicy === 'object' ? value.retryPolicy : {}
      const retryMode = retry.mode ?? ''
      const patchRetry = (field, nextValue) => {
        const next = { ...retry }
        if (nextValue === undefined) delete next[field]
        else next[field] = nextValue
        patch('retryPolicy', Object.keys(next).length === 0 ? undefined : next)
      }
      const patchBackoff = (field, raw, parser) => {
        const backoff = retry.backoff !== null && typeof retry.backoff === 'object' ? retry.backoff : {}
        const next = { ...backoff }
        const nextValue = raw === '' ? undefined : parser(raw)
        if (nextValue === undefined) delete next[field]
        else next[field] = nextValue
        patchRetry('backoff', Object.keys(next).length === 0 ? undefined : next)
      }
      const retryableCodes = Array.isArray(retry.retryableCodes) ? retry.retryableCodes.join(', ') : ''
      return h('details', { style: cardStyle },
        h('summary', { style: { cursor: 'pointer', fontSize: '14px' } }, t('endpointAdvanced')),
        h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('endpointAdvancedDescription')),
        h(HeaderEditor, {
          value: headers,
          onChange: onHeadersChange,
          disabled,
          error: headersError,
          t,
        }),
        inheritedHeaders.length === 0 ? null : h(HeaderEditor, {
          value: inheritedHeaders,
          onChange: () => {},
          disabled: true,
          error: undefined,
          t,
          title: 'inheritedHeaders',
          description: 'inheritedHeadersDescription',
          addable: false,
          removable: false,
        }),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' } },
          h(Field, { label: t('defaultContextWindow') }, h('input', {
            style: inputStyle, type: 'number', min: '1', inputMode: 'numeric', disabled,
            placeholder: '262144', value: value.defaultContextWindow ?? '',
            onChange: event => patch('defaultContextWindow', event.target.value === '' ? undefined : positiveNumber(event.target.value)),
          })),
          h(Field, { label: t('defaultMaxTokens') }, h('input', {
            style: inputStyle, type: 'number', min: '1', inputMode: 'numeric', disabled,
            placeholder: '32768', value: value.defaultMaxTokens ?? '',
            onChange: event => patch('defaultMaxTokens', event.target.value === '' ? undefined : positiveNumber(event.target.value)),
          })),
          h(Field, { label: t('defaultReasoning') }, h('select', {
            style: inputStyle, value: value.reasoning ?? '', disabled,
            onChange: event => patch('reasoning', event.target.value === '' ? undefined : event.target.value),
          },
          h('option', { value: '' }, t('inheritDefault')),
          EFFORTS.map(level => h('option', { key: level, value: level }, level)),
          )),
          h(Field, { label: t('cacheRetention') }, h('select', {
            style: inputStyle, value: value.cacheRetention ?? '', disabled,
            onChange: event => patch('cacheRetention', event.target.value === '' ? undefined : event.target.value),
          },
          h('option', { value: '' }, t('inheritDefault')),
          ['none', 'short', 'long'].map(mode => h('option', { key: mode, value: mode }, mode)),
          )),
          h(Field, { label: t('transport') }, h('select', {
            style: inputStyle, value: value.transport ?? '', disabled,
            onChange: event => patch('transport', event.target.value === '' ? undefined : event.target.value),
          },
          h('option', { value: '' }, t('inheritDefault')),
          ['sse', 'websocket', 'websocket-cached', 'auto'].map(mode => h('option', { key: mode, value: mode }, mode)),
          )),
          h(Field, { label: t('timeoutMs') }, h('input', {
            style: inputStyle, type: 'number', min: '0', inputMode: 'numeric', disabled,
            value: value.timeoutMs ?? '', onChange: event => patch('timeoutMs', event.target.value === '' ? undefined : nonNegativeNumber(event.target.value)),
          })),
          h(Field, { label: t('websocketConnectTimeoutMs') }, h('input', {
            style: inputStyle, type: 'number', min: '0', inputMode: 'numeric', disabled,
            value: value.websocketConnectTimeoutMs ?? '', onChange: event => patch('websocketConnectTimeoutMs', event.target.value === '' ? undefined : nonNegativeNumber(event.target.value)),
          })),
          h(Field, { label: t('streamIdleTimeoutMs') }, h('input', {
            style: inputStyle, type: 'number', min: '1', inputMode: 'numeric', disabled,
            placeholder: '300000', value: value.streamIdleTimeoutMs ?? '',
            onChange: event => patch('streamIdleTimeoutMs', event.target.value === '' ? undefined : positiveNumber(event.target.value)),
          })),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '8px' } },
          h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('defaultInput')),
          h('div', { style: { display: 'flex', gap: '14px' } }, ['text', 'image'].map(modality => h('label', { key: modality, style: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' } },
            h('input', { type: 'checkbox', checked: input.includes(modality), disabled, onChange: () => toggleInput(modality) }),
            modality === 'text' ? t('inputText') : t('inputImage'),
          ))),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' } },
          h('strong', { style: { fontSize: '13px' } }, t('thinkingBudgets')),
          ['minimal', 'low', 'medium', 'high'].map(level => h(Field, {
            key: level,
            label: t(`budget${level.charAt(0).toUpperCase()}${level.slice(1)}`),
          }, h('input', {
            style: inputStyle, type: 'number', min: '0', inputMode: 'numeric', disabled,
            value: budgets[level] ?? '', onChange: event => patchBudget(level, event.target.value),
          }))),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' } },
          h('strong', { style: { fontSize: '13px' } }, t('compat')),
          h(Field, { label: t('thinkingFormat') }, h('select', {
            style: inputStyle, value: compat.thinkingFormat ?? '', disabled,
            onChange: event => patchCompat('thinkingFormat', event.target.value === '' ? undefined : event.target.value),
          },
          h('option', { value: '' }, t('inheritDefault')),
          THINKING_FORMATS.map(format => h('option', { key: format, value: format }, format)),
          )),
          h(Field, { label: t('supportsReasoningEffort') }, h('select', {
            style: inputStyle, value: compat.supportsReasoningEffort === undefined ? '' : String(compat.supportsReasoningEffort), disabled,
            onChange: event => patchCompat('supportsReasoningEffort', event.target.value === '' ? undefined : event.target.value === 'true'),
          },
          h('option', { value: '' }, t('inheritDefault')),
          h('option', { value: 'true' }, 'true'),
          h('option', { value: 'false' }, 'false'),
          )),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' } },
          h('strong', { style: { fontSize: '13px' } }, t('retryPolicy')),
          h(Field, { label: t('retryMode') }, h('select', {
            style: inputStyle, value: retryMode, disabled,
            onChange: event => {
              const mode = event.target.value
              if (mode === '') patch('retryPolicy', undefined)
              else patch('retryPolicy', {
                mode,
                ...retry.backoff === undefined ? {} : { backoff: retry.backoff },
              })
            },
          },
          h('option', { value: '' }, t('inheritDefault')),
          h('option', { value: 'normal' }, 'normal'),
          h('option', { value: 'always' }, 'always'),
          )),
          retryMode === 'normal' ? h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' } },
            h(Field, { label: t('maxRetries') }, h('input', {
              style: inputStyle, type: 'number', min: '0', inputMode: 'numeric', disabled,
              value: retry.maxRetries ?? '', onChange: event => patchRetry('maxRetries', event.target.value === '' ? undefined : nonNegativeNumber(event.target.value)),
            })),
            h(Field, { label: t('retryableCodes') }, h('input', {
              style: inputStyle, disabled, value: retryableCodes,
              onChange: event => {
                const codes = event.target.value.split(',').map(code => code.trim()).filter(Boolean)
                patchRetry('retryableCodes', codes.length === 0 ? undefined : codes)
              },
            })),
          ) : null,
          retryMode === 'normal' || retryMode === 'always' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('backoff')),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' } },
              h(Field, { label: t('initialDelayMs') }, h('input', {
                style: inputStyle, type: 'number', min: '1', inputMode: 'numeric', disabled,
                value: retry.backoff?.initialDelayMs ?? '', onChange: event => patchBackoff('initialDelayMs', event.target.value, positiveNumber),
              })),
              h(Field, { label: t('maxDelayMs') }, h('input', {
                style: inputStyle, type: 'number', min: '1', inputMode: 'numeric', disabled,
                value: retry.backoff?.maxDelayMs ?? '', onChange: event => patchBackoff('maxDelayMs', event.target.value, positiveNumber),
              })),
              h(Field, { label: t('jitterRatio') }, h('input', {
                style: inputStyle, type: 'number', min: '0', max: '1', step: '0.01', inputMode: 'decimal', disabled,
                value: retry.backoff?.jitterRatio ?? '', onChange: event => patchBackoff('jitterRatio', event.target.value, ratioNumber),
              })),
            ),
          ) : null,
        ),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' } },
          h('button', { type: 'button', style: buttonStyle, disabled, onClick: () => onChange({}) }, t('resetEndpointAdvanced')),
        ),
      )
    }

    function ModelCompatEditor({ value, onChange, disabled, api, t }) {
      const compat = value !== null && typeof value === 'object' ? value : {}
      const patch = (field, nextValue) => {
        const next = { ...compat }
        if (nextValue === undefined) delete next[field]
        else next[field] = nextValue
        onChange(Object.keys(next).length === 0 ? undefined : next)
      }
      const enabled = !disabled && (api === undefined || api === 'openai-completions')
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' } },
        h('strong', { style: { fontSize: '13px' } }, t('compat')),
        h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('modelCompatDescription')),
        h(Field, { label: t('thinkingFormat') }, h('select', {
          style: inputStyle, value: compat.thinkingFormat ?? '', disabled: !enabled,
          onChange: event => patch('thinkingFormat', event.target.value === '' ? undefined : event.target.value),
        },
        h('option', { value: '' }, t('inheritDefault')),
        THINKING_FORMATS.map(format => h('option', { key: format, value: format }, format)),
        )),
        h(Field, { label: t('supportsReasoningEffort') }, h('select', {
          style: inputStyle,
          value: compat.supportsReasoningEffort === undefined ? '' : String(compat.supportsReasoningEffort),
          disabled: !enabled,
          onChange: event => patch('supportsReasoningEffort', event.target.value === '' ? undefined : event.target.value === 'true'),
        },
        h('option', { value: '' }, t('inheritDefault')),
        h('option', { value: 'true' }, 'true'),
        h('option', { value: 'false' }, 'false'),
        )),
      )
    }

    function ModelRow({
      model, index, onChange, disabled, lockId = false,
      api, metadataChoice, metadataCandidates = [], metadataDefaultProvider, metadataOfficialProvider, onMetadataChoice, t,
    }) {
      const patch = changes => {
        const next = { ...model, ...changes }
        for (const [key, value] of Object.entries(next)) if (value === undefined) delete next[key]
        onChange(next)
      }
      const inputs = Array.isArray(model.input) ? model.input.filter(value => value === 'text' || value === 'image') : []
      const toggleInput = modality => {
        const next = new Set(inputs)
        if (next.has(modality)) next.delete(modality)
        else next.add(modality)
        patch({ input: next.size === 0 ? undefined : [...next] })
      }
      return h('details', { style: { border: '1px solid var(--dsw-alias-border-l2)', borderRadius: '8px', padding: '8px' } },
        h('summary', { style: { cursor: 'pointer', fontSize: '14px' } }, typeof model.id === 'string' && model.id !== '' ? model.id : t('modelIndex', { index: index + 1 })),
        metadataCandidates.length > 1 ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '10px' } },
          h(Field, { label: t('metadataSource') }, h('select', {
            style: inputStyle,
            value: metadataChoice ?? '',
            disabled,
            onChange: event => onMetadataChoice?.(event.target.value),
          }, metadataCandidates.map(candidate => h('option', {
            key: candidate.providerId,
            value: providerSelection(candidate.providerId),
          }, candidate.providerId === metadataDefaultProvider
            ? t('metadataDefault', {
              provider: candidate.providerId,
              context: metadataLimitText(candidate.model, 'context'),
              output: metadataLimitText(candidate.model, 'output'),
            })
            : candidate.providerId === metadataOfficialProvider
              ? t('metadataOfficial', {
                provider: candidate.providerId,
                context: metadataLimitText(candidate.model, 'context'),
                output: metadataLimitText(candidate.model, 'output'),
              })
            : t('metadataProvider', {
              provider: candidate.providerId,
              context: metadataLimitText(candidate.model, 'context'),
              output: metadataLimitText(candidate.model, 'output'),
            }))))),
          h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('metadataSourceDescription')),
        ) : null,
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', paddingTop: '10px' } },
          h(Field, { label: t('modelId') }, h('input', {
            style: inputStyle, value: typeof model.id === 'string' ? model.id : '', disabled: disabled || lockId,
            onChange: event => patch({ id: event.target.value }),
          })),
          h(Field, { label: t('modelName') }, h('input', {
            style: inputStyle, value: typeof model.name === 'string' ? model.name : '', disabled,
            onChange: event => patch({ name: event.target.value === '' ? undefined : event.target.value }),
          })),
          h(Field, { label: t('contextWindow') }, h('input', {
            style: inputStyle, type: 'number', min: '1', inputMode: 'numeric',
            value: model.contextWindow === undefined ? '' : model.contextWindow, disabled,
            onChange: event => patch({ contextWindow: event.target.value === '' ? undefined : positiveNumber(event.target.value) }),
          })),
          h(Field, { label: t('maxTokens') }, h('input', {
            style: inputStyle, type: 'number', min: '1', inputMode: 'numeric',
            value: model.maxTokens === undefined ? '' : model.maxTokens, disabled,
            onChange: event => patch({ maxTokens: event.target.value === '' ? undefined : positiveNumber(event.target.value) }),
          })),
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '8px' } },
          h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('input')),
          h('div', { style: { display: 'flex', gap: '14px' } }, ['text', 'image'].map(modality => h('label', { key: modality, style: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' } },
            h('input', { type: 'checkbox', checked: inputs.includes(modality), disabled, onChange: () => toggleInput(modality) }),
            modality === 'text' ? t('inputText') : t('inputImage'),
          ))),
        ),
        h(ReasoningEditor, {
          value: model.reasoningEfforts,
          onChange: reasoningEfforts => patch({ reasoningEfforts }),
          disabled,
          t,
        }),
        h(ModelCompatEditor, {
          value: model.compat,
          onChange: compat => patch({ compat }),
          disabled,
          api,
          t,
        }),
      )
    }

    function EndpointEditor({
      api, namespace, provider, initial, taken, writable, canRestoreInheritance, onCancel, onSaved, t,
    }) {
      const editing = provider !== undefined
      const initialModels = Array.isArray(initial.models) ? initial.models.map(copyModel) : []
      const inheritedHeaders = Array.isArray(initial.inheritedHeaders) ? initial.inheritedHeaders : []
      const initialHeaders = Array.isArray(initial.headers) ? initial.headers : []
      const initialAdvanced = initial.advanced !== null && typeof initial.advanced === 'object' ? initial.advanced : {}
      const [endpoint, setEndpoint] = useState({
        name: initial.name ?? '',
        baseURL: initial.baseURL ?? '',
        api: initial.api ?? 'openai-completions',
        apiKey: '',
        headers: initialHeaders.map(row => ({ ...row })),
      })
      const [candidates, setCandidates] = useState(editing ? initialModels : undefined)
      const [selected, setSelected] = useState(editing ? new Set(initialModels.map(model => model.id)) : new Set())
      const [modelDrafts, setModelDrafts] = useState(editing
        ? Object.fromEntries(initialModels.map(model => [model.id, { ...model }]))
        : {})
      const [metadataMatches, setMetadataMatches] = useState({})
      const [metadataSelections, setMetadataSelections] = useState({})
      const [busy, setBusy] = useState(false)
      const [failure, setFailure] = useState(undefined)
      const [metadataNotice, setMetadataNotice] = useState(undefined)
      const [settingsSaved, setSettingsSaved] = useState(false)
      const [advanced, setAdvanced] = useState({ ...initialAdvanced })
      const route = editing ? provider : endpoint.name.toLowerCase()
      const keyRef = editing
        ? (initial.apiKeyEnv ?? `${route.toUpperCase()}_API_KEY`)
        : route === '' ? '' : `${route.toUpperCase()}_API_KEY`
      const nameError = endpoint.name.length === 0
        ? t('endpointNameRequired')
        : /^[A-Za-z][A-Za-z0-9]*$/.test(endpoint.name) ? undefined : t('endpointNameInvalid')
      const urlError = endpoint.baseURL.length === 0 ? t('endpointUrlRequired') : endpointUrlError(endpoint.baseURL, t)
      const keyError = editing && endpoint.apiKey.trim() === '' ? undefined : apiKeyError(endpoint.apiKey, t)
      const requestHeadersError = headersError(endpoint.headers, t)
      const routeTaken = !editing && taken.includes(route)
      const readyToFetch = nameError === undefined && urlError === undefined && keyError === undefined
        && requestHeadersError === undefined && !routeTaken
      const readyToSave = nameError === undefined && keyError === undefined && requestHeadersError === undefined
        && !routeTaken && (urlError === undefined || (editing && endpoint.baseURL.trim() === '' && (initial.baseURL ?? '') === ''))
      const selectedModels = candidates === undefined ? [] : candidates
        .filter(model => selected.has(model.id))
        .map(model => modelDrafts[model.id] ?? { ...model })
      const effectiveHeaders = headersObject(endpoint.headers, inheritedHeaders)
      const initialEffectiveHeaders = headersObject(initialHeaders, inheritedHeaders)
      const modelsChanged = !jsonEqual(selectedModels, initialModels)
      const headersChanged = !headersEqual(effectiveHeaders, initialEffectiveHeaders)
      const endpointChanged = !editing || endpoint.name !== (initial.name ?? '')
        || endpoint.baseURL.trim() !== (initial.baseURL ?? '')
        || endpoint.api !== (initial.api ?? '') || modelsChanged || headersChanged
        || !jsonEqual(normalizeAdvanced(advanced), normalizeAdvanced(initialAdvanced))
      const keyChanged = endpoint.apiKey.trim() !== ''
      const advancedProfile = normalizeAdvanced(advanced)
      const profile = {
        displayName: endpoint.name,
        apiKeyEnv: keyRef,
        api: endpoint.api,
        baseURL: endpoint.baseURL.trim(),
        models: selectedModels.map(copyModel),
        ...advancedProfile,
        ...Object.keys(effectiveHeaders).length === 0 ? {} : { headers: effectiveHeaders },
      }
      const preview = {
        'llm-pi-ai': { providers: { [route]: profile } },
        credentials: { [keyRef]: keyChanged ? '[write-only]' : '[unchanged]' },
      }
      const update = (field, value) => {
        setEndpoint(current => ({ ...current, [field]: value }))
        setMetadataMatches({})
        setMetadataSelections({})
        if (!editing) {
          setCandidates(undefined)
          setSelected(new Set())
          setModelDrafts({})
        }
        setFailure(undefined)
        setMetadataNotice(undefined)
      }
      const fetchModels = async () => {
        setBusy(true)
        setFailure(undefined)
        setMetadataNotice(undefined)
        try {
          const selectedBeforeFetch = new Set(selected)
          const draftsBeforeFetch = modelDrafts
          const metadataSelectionsBeforeFetch = metadataSelections
          const [response, metadata] = await Promise.all([
            api.llm.discoverModels({
               settingsNs: 'llm-pi-ai',
               ...editing ? { provider } : {},
               baseURL: endpoint.baseURL.trim(),
              // Model listings commonly remain OpenAI-shaped even when the
              // generation endpoint speaks Anthropic Messages.
              api: endpoint.api === 'anthropic-messages' ? 'openai-completions' : endpoint.api,
               ...endpoint.apiKey.trim() === '' ? {} : { apiKey: endpoint.apiKey.trim() },
             }),
            loadModelsDevMetadata().catch(() => undefined),
          ])
          if (!response.result.ok) {
            setFailure(response.result.error.message)
            return
          }
          const models = response.result.value.models
          if (models.length === 0) {
            setFailure(t('discoveryEmpty'))
            return
          }
          const prepared = metadata === undefined
            ? models.map(candidate => ({ candidate, match: undefined }))
            : models.map(candidate => {
              const match = {
                ...metadataMatchForEndpoint(metadata, candidate.id),
                candidate,
              }
              const selection = retainedMetadataSelection(match, metadataSelectionsBeforeFetch[candidate.id])
              return {
                candidate: enrichDiscoveredModel(candidate, match, selection),
                match: { ...match, selection },
              }
            })
          const enriched = prepared.map(item => item.candidate)
          const fetchedIds = new Set(enriched.map(model => model.id))
          const preserved = editing
            ? (candidates ?? [])
              .filter(model => selectedBeforeFetch.has(model.id) && !fetchedIds.has(model.id))
              .map(model => draftsBeforeFetch[model.id] ?? { ...model })
            : []
          const nextCandidates = [...enriched, ...preserved]
          setCandidates(nextCandidates)
          setSelected(new Set(nextCandidates
            .filter(model => selectedBeforeFetch.has(model.id))
            .map(model => model.id)))
          setModelDrafts(Object.fromEntries(nextCandidates.map(model => [model.id, draftsBeforeFetch[model.id] ?? { ...model }])))
          setMetadataMatches(Object.fromEntries(prepared
            .filter(item => item.match !== undefined)
            .map(item => [item.candidate.id, item.match])))
          setMetadataSelections(Object.fromEntries(prepared
            .filter(item => item.match !== undefined)
            .map(item => [item.candidate.id, item.match.selection])))
          if (metadata === undefined) {
            setMetadataNotice(t('metadataUnavailable'))
          } else {
            const matched = prepared.filter(item => item.match.reason !== 'none').length
            const official = prepared.filter(item => item.match.reason === 'official').length
            const ambiguous = prepared.filter(item => item.match.reason === 'default').length
            const unmatched = prepared.length - matched
            setMetadataNotice(t('metadataApplied', { matched, official, ambiguous, unmatched }))
          }
        } catch (error) {
          setFailure(messageOf(error))
        } finally {
          setBusy(false)
        }
      }
      const toggle = id => setSelected(current => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      const selectAll = () => setSelected(new Set((candidates ?? []).map(model => model.id)))
      const selectNone = () => setSelected(new Set())
      const invertSelection = () => setSelected(current => new Set((candidates ?? [])
        .filter(model => !current.has(model.id))
        .map(model => model.id)))
      const updateSelectedModel = (id, next) => setModelDrafts(current => ({ ...current, [id]: next }))
      const chooseMetadataSelection = (id, selection) => {
        const match = metadataMatches[id]
        if (match === undefined || match.candidate === undefined) return
        const previousSelection = metadataSelections[id] ?? match.selection
        const previous = enrichDiscoveredModel(match.candidate, match, previousSelection, true)
        const nextModel = enrichDiscoveredModel(match.candidate, match, selection, true)
        const current = modelDrafts[id] ?? previous
        const next = { ...current }
        for (const field of ['name', 'contextWindow', 'maxTokens', 'input', 'reasoningEfforts']) {
          if (nextModel[field] === undefined) delete next[field]
          else next[field] = nextModel[field]
        }
        setMetadataSelections(currentSelections => ({ ...currentSelections, [id]: selection }))
        setModelDrafts(currentDrafts => ({ ...currentDrafts, [id]: next }))
      }
      const settingsOps = () => {
        if (!editing) return [{ op: 'set', path: ['providers', route], value: profile }]
        const ops = []
        if (endpoint.name !== (initial.name ?? '')) {
          ops.push({ op: 'set', path: ['providers', route, 'displayName'], value: endpoint.name })
        }
        if (endpoint.api !== (initial.api ?? '')) {
          ops.push({ op: 'set', path: ['providers', route, 'api'], value: endpoint.api })
        }
        if (endpoint.baseURL.trim() !== (initial.baseURL ?? '')) {
          ops.push({ op: 'set', path: ['providers', route, 'baseURL'], value: endpoint.baseURL.trim() })
        }
        if (modelsChanged) {
          ops.push({ op: 'set', path: ['providers', route, 'models'], value: profile.models })
        }
        if (headersChanged) {
          ops.push(Object.keys(effectiveHeaders).length === 0
            ? { op: 'unset', path: ['providers', route, 'headers'] }
              : { op: 'set', path: ['providers', route, 'headers'], value: effectiveHeaders })
        }
        for (const field of PROVIDER_ADVANCED_FIELDS) {
          const next = presentAdvancedValue(advanced[field]) ? advanced[field] : undefined
          const previous = presentAdvancedValue(initialAdvanced[field]) ? initialAdvanced[field] : undefined
          if (jsonEqual(next, previous)) continue
          ops.push(next === undefined
            ? { op: 'unset', path: ['providers', route, field] }
            : { op: 'set', path: ['providers', route, field], value: next })
        }
        if (initial.apiKeyEnv === undefined && keyChanged) {
          ops.push({ op: 'set', path: ['providers', route, 'apiKeyEnv'], value: keyRef })
        }
        return ops
      }
      const save = async () => {
        setBusy(true)
        setFailure(undefined)
        try {
          if (!settingsSaved) {
            const ops = settingsOps()
            if (ops.length > 0) {
              const created = await api.settings.mutate({
                ns: 'llm-pi-ai',
                ops,
                expectedRevision: namespace.revision,
              })
              if (!created.result.ok) {
                setFailure(created.result.error.message)
                return
              }
            }
            setSettingsSaved(true)
          }
          if (!editing || keyChanged) {
            const stored = await api.credentials.set({ ref: keyRef, value: endpoint.apiKey.trim() })
            if (!stored.result.ok) {
              setFailure(stored.result.error.message)
              return
            }
          }
          onSaved()
        } catch (error) {
          setFailure(messageOf(error))
        } finally {
          setBusy(false)
        }
      }
      const restore = async () => {
        setBusy(true)
        setFailure(undefined)
        try {
          const response = await api.settings.mutate({
            ns: 'llm-pi-ai',
            ops: [{ op: 'unset', path: ['providers', route, 'models'] }],
            expectedRevision: namespace.revision,
          })
          if (!response.result.ok) {
            setFailure(response.result.error.message)
            return
          }
          onSaved()
        } catch (error) {
          setFailure(messageOf(error))
        } finally {
          setBusy(false)
        }
      }
      return h('div', { style: cardStyle },
        h('div', null,
          h('h3', { style: { margin: 0, fontSize: '14px' } }, t(editing ? 'editEndpoint' : 'endpointTitle')),
          h('p', { style: { margin: '4px 0 0', color: 'var(--dsw-alias-label-tertiary)', fontSize: '13px' } }, t('endpointDescription')),
        ),
        h(Field, { label: t('endpointName') }, h('input', {
          style: inputStyle, value: endpoint.name, disabled: busy || settingsSaved,
          placeholder: t('endpointNamePlaceholder'), onChange: event => update('name', event.target.value),
        })),
        nameError !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, nameError) : null,
        nameError === undefined ? h('p', { style: { margin: 0, color: routeTaken ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, routeTaken ? t('routeTaken', { route }) : t('routePreview', { route, ref: keyRef })) : null,
        h(Field, { label: t('endpointUrl') }, h('input', {
          style: inputStyle, type: 'url', value: endpoint.baseURL, disabled: busy || settingsSaved,
          placeholder: 'https://gateway.example/v1', onChange: event => update('baseURL', event.target.value),
        })),
        urlError !== undefined && endpoint.baseURL.length > 0 ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, urlError) : null,
        h(Field, { label: t('apiProtocol') }, h('select', {
          style: inputStyle, value: endpoint.api, disabled: busy || settingsSaved,
          onChange: event => update('api', event.target.value),
        },
        h('option', { value: 'openai-completions' }, 'openai-completions'),
        h('option', { value: 'openai-responses' }, 'openai-responses'),
        h('option', { value: 'anthropic-messages' }, 'anthropic-messages'),
        )),
        h(Field, { label: t('endpointKey') }, h('input', {
          style: inputStyle, type: 'password', autoComplete: 'off', value: endpoint.apiKey, disabled: busy,
          placeholder: t(editing ? 'endpointKeyExistingPlaceholder' : 'endpointKeyPlaceholder'),
          onChange: event => update('apiKey', event.target.value),
        })),
        keyError !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, keyError) : null,
        h(EndpointAdvancedEditor, {
          value: advanced,
          onChange: setAdvanced,
          disabled: busy || settingsSaved,
          headers: endpoint.headers,
          inheritedHeaders,
          headersError: requestHeadersError,
          onHeadersChange: headers => update('headers', headers),
          t,
        }),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
          h('button', {
            type: 'button', style: buttonStyle, disabled: busy || !readyToFetch || settingsSaved,
            onClick: () => { void fetchModels() },
          }, busy ? t(editing ? 'refreshingModels' : 'fetching') : t(editing ? 'refreshModels' : 'fetchModels')),
        ),
        candidates === undefined ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } },
            h('strong', { style: { fontSize: '13px' } }, t('chooseModels')),
            h('div', { style: { display: 'flex', gap: '6px' } },
              h('button', { type: 'button', style: buttonStyle, disabled: busy || settingsSaved, onClick: selectAll }, t('selectAll')),
              h('button', { type: 'button', style: buttonStyle, disabled: busy || settingsSaved, onClick: invertSelection }, t('invertSelection')),
              h('button', { type: 'button', style: buttonStyle, disabled: busy || settingsSaved, onClick: selectNone }, t('selectNone')),
              canRestoreInheritance ? h('button', { type: 'button', style: buttonStyle, disabled: busy || settingsSaved, onClick: () => { void restore() } }, t('restoreInheritance')) : null,
            ),
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflow: 'auto' } }, candidates.map(model => h('label', { key: model.id, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' } },
            h('input', { type: 'checkbox', checked: selected.has(model.id), disabled: busy || settingsSaved, onChange: () => toggle(model.id) }),
            h('span', null, model.id),
          ))),
          selectedModels.length === 0 ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            h('strong', { style: { fontSize: '13px' } }, t('selectedModelParameters')),
            selectedModels.map((model, index) => {
              const match = metadataMatches[model.id]
              const defaultProvider = match?.reason === 'default'
                ? match.candidates.find(candidate => providerSelection(candidate.providerId) === match.selection)?.providerId
                : undefined
              const officialProvider = match?.reason === 'official' ? match.officialProvider : undefined
              return h(ModelRow, {
                key: model.id,
                model,
                index,
                api: endpoint.api,
                onChange: next => updateSelectedModel(model.id, next),
                disabled: busy || settingsSaved,
                lockId: true,
                metadataChoice: metadataSelections[model.id] ?? match?.selection,
                metadataCandidates: match?.candidates,
                metadataDefaultProvider: defaultProvider,
                metadataOfficialProvider: officialProvider,
                onMetadataChoice: next => chooseMetadataSelection(model.id, next),
                t,
              })
            }),
          ),
        ),
        candidates === undefined ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h('strong', { style: { fontSize: '13px' } }, t('configPreview')),
          h('pre', { style: { boxSizing: 'border-box', height: '280px', margin: 0, padding: '10px', overflow: 'auto', borderRadius: '8px', background: 'var(--dsw-alias-bg-module-platform)', border: '1px solid var(--dsw-alias-border-l2)', fontSize: '12px', lineHeight: '18px' } }, JSON.stringify(preview, null, 2)),
          h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('keyPreviewNotice')),
        ),
        failure !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px' } }, failure) : null,
          metadataNotice === undefined ? null : h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, metadataNotice),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
          h('button', { type: 'button', style: buttonStyle, disabled: busy, onClick: onCancel }, t('cancel')),
          h('button', {
            type: 'button',
            style: { ...buttonStyle, background: 'var(--dsw-alias-button-primary-fill)', color: 'var(--dsw-alias-label-primary-foreground)', borderColor: 'transparent' },
            disabled: busy || !writable || !readyToSave || selectedModels.length === 0
              || (editing && !endpointChanged && !keyChanged),
            onClick: () => { void save() },
          }, busy ? t('saving') : settingsSaved ? t('retryKey') : editing ? t('saveChanges') : t('confirmSave')),
        ),
      )
    }

    function ModelsConfigSection({ api, controller, t }) {
      const refresh = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
      const [state, setState] = useState({ status: 'loading' })
      const [provider, setProvider] = useState('')
      const [showCreate, setShowCreate] = useState(false)
      const [deleteError, setDeleteError] = useState(undefined)

      useEffect(() => {
        let alive = true
        setState({ status: 'loading' })
        void api.settings.describe({}).then(response => {
          if (!alive) return
          if (!response.result.ok) {
            setState({ status: 'error', message: response.result.error.message })
            return
          }
          const namespace = response.result.value.namespaces.find(item => item.ns === 'llm-pi-ai')
          setState({ status: 'ready', writable: response.result.value.writable, namespace })
        }).catch(error => {
          if (alive) setState({ status: 'error', message: messageOf(error) })
        })
        return () => { alive = false }
      }, [api, refresh])

      if (state.status === 'loading') return h('p', null, t('loading'))
      if (state.status === 'error') return h('p', { style: { color: 'var(--dsw-alias-state-error-primary)' } }, state.message)

      const namespace = state.namespace
      if (namespace === undefined) {
        return h('section', { style: sectionStyle },
          h('h2', { style: { margin: 0, fontSize: '16px' } }, t('title')),
          h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)' } }, t('adapterMissing')),
        )
      }

      const profiles = objectAt(namespace.value, ['providers'])
      const providers = profiles !== null && typeof profiles === 'object' && !Array.isArray(profiles) ? Object.keys(profiles) : []
      const activeProvider = providers.includes(provider) ? provider : providers[0]
      const profile = activeProvider === undefined ? undefined : profiles[activeProvider]
      const userProfile = activeProvider === undefined ? undefined : objectAt(namespace.user, ['providers', activeProvider])
      const baseProfile = activeProvider === undefined ? undefined : objectAt(namespace.base, ['providers', activeProvider])
      const canRestoreInheritance = activeProvider !== undefined
        && userProfile !== null && typeof userProfile === 'object' && Array.isArray(userProfile.models)
        && baseProfile !== null && typeof baseProfile === 'object'
      const userAdvanced = userProfile !== null && typeof userProfile === 'object' ? userProfile : {}
      const initial = activeProvider === undefined || profile === null || typeof profile !== 'object' ? undefined : {
        name: typeof profile.displayName === 'string' ? profile.displayName : activeProvider,
        baseURL: typeof profile.baseURL === 'string' ? profile.baseURL : '',
        api: typeof profile.api === 'string' ? profile.api : 'openai-completions',
        apiKeyEnv: typeof profile.apiKeyEnv === 'string' ? profile.apiKeyEnv : undefined,
        models: Array.isArray(profile.models) ? profile.models : [],
        headers: userProfile !== null && typeof userProfile === 'object' ? headerRows(userProfile.headers) : [],
        inheritedHeaders: baseProfile !== null && typeof baseProfile === 'object' ? headerRows(baseProfile.headers) : [],
        advanced: {
          defaultContextWindow: userAdvanced.defaultContextWindow,
          defaultMaxTokens: userAdvanced.defaultMaxTokens,
          defaultInput: Array.isArray(userAdvanced.defaultInput) ? [...userAdvanced.defaultInput] : undefined,
          reasoning: userAdvanced.reasoning,
          thinkingBudgets: userAdvanced.thinkingBudgets !== null && typeof userAdvanced.thinkingBudgets === 'object'
            ? { ...userAdvanced.thinkingBudgets }
            : undefined,
          compat: userAdvanced.compat !== null && typeof userAdvanced.compat === 'object' ? { ...userAdvanced.compat } : undefined,
          cacheRetention: userAdvanced.cacheRetention,
          transport: userAdvanced.transport,
          timeoutMs: userAdvanced.timeoutMs,
          websocketConnectTimeoutMs: userAdvanced.websocketConnectTimeoutMs,
          streamIdleTimeoutMs: userAdvanced.streamIdleTimeoutMs,
          retryPolicy: userAdvanced.retryPolicy !== null && typeof userAdvanced.retryPolicy === 'object'
            ? {
              ...userAdvanced.retryPolicy,
              ...userAdvanced.retryPolicy.backoff !== null && typeof userAdvanced.retryPolicy.backoff === 'object'
                ? { backoff: { ...userAdvanced.retryPolicy.backoff } }
                : {},
            }
            : undefined,
        },
      }
      const emptyInitial = { name: '', baseURL: '', api: 'openai-completions', models: [], headers: [], inheritedHeaders: [] }
      const selectProvider = next => {
        setProvider(next)
        setShowCreate(false)
        setDeleteError(undefined)
      }
      const openCreate = () => {
        setShowCreate(true)
        setProvider('')
        setDeleteError(undefined)
      }
      const deleteProvider = async () => {
        if (activeProvider === undefined || profile === null || typeof profile !== 'object') return
        if (!window.confirm(t('deleteEndpointConfirm', { provider: activeProvider }))) return
        setDeleteError(undefined)
        try {
          const response = await api.settings.mutate({
            ns: 'llm-pi-ai',
            ops: [{ op: 'unset', path: ['providers', activeProvider] }],
            expectedRevision: namespace.revision,
          })
          if (!response.result.ok) {
            setDeleteError(t('deleteEndpointFailed', { message: response.result.error.message }))
            return
          }
          const keyRef = typeof profile.apiKeyEnv === 'string' ? profile.apiKeyEnv : undefined
          const generatedKeyRef = `${activeProvider.toUpperCase()}_API_KEY`
          if (keyRef === generatedKeyRef) {
            const credential = await api.credentials.unset({ ref: keyRef })
            if (!credential.result.ok) {
              setDeleteError(t('deleteEndpointFailed', { message: credential.result.error.message }))
            }
          }
          setProvider('')
          setShowCreate(false)
          controller.refresh()
        } catch (error) {
          setDeleteError(t('deleteEndpointFailed', { message: messageOf(error) }))
        }
      }

      return h('section', { style: sectionStyle },
        h('div', null,
          h('h2', { style: { margin: 0, fontSize: '16px', lineHeight: '24px' } }, t('title')),
          h('p', { style: { margin: '4px 0 0', color: 'var(--dsw-alias-label-tertiary)', fontSize: '14px', lineHeight: '22px' } }, t('intro')),
          h('a', {
            href: PARAMETERS_DOC_URL,
            target: '_blank',
            rel: 'noreferrer',
            onClick: event => {
              event.preventDefault()
              window.open(PARAMETERS_DOC_URL, '_blank', 'noopener,noreferrer')
            },
            style: { display: 'inline-block', marginTop: '6px', color: 'var(--dsw-alias-text-link)', fontSize: '13px' },
          }, t('parameterReference')),
        ),
        h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '8px' } },
          providers.length === 0 ? null : h(Field, { label: t('provider') }, h('select', {
            style: inputStyle, value: activeProvider, disabled: showCreate,
            onChange: event => selectProvider(event.target.value),
          }, providers.map(id => h('option', { key: id, value: id }, id)))),
          h('button', { type: 'button', style: buttonStyle, disabled: !state.writable || showCreate, onClick: openCreate }, t('addEndpoint')),
          activeProvider === undefined || showCreate ? null : h('button', {
            type: 'button', style: dangerButtonStyle, disabled: !state.writable, onClick: () => { void deleteProvider() },
          }, t('deleteEndpoint')),
        ),
        deleteError === undefined ? null : h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px' } }, deleteError),
        showCreate ? h(EndpointEditor, {
          key: 'new-endpoint',
          api,
          namespace,
          initial: emptyInitial,
          taken: providers,
          writable: state.writable,
          canRestoreInheritance: false,
          t,
          onCancel: () => setShowCreate(false),
          onSaved: () => {
            setShowCreate(false)
            controller.refresh()
          },
        }) : activeProvider === undefined ? h('p', { style: cardStyle }, t('noProviders')) : h(EndpointEditor, {
          key: `${activeProvider}-${namespace.revision}`,
          api,
          namespace,
          provider: activeProvider,
          initial,
          taken: providers,
          writable: state.writable,
          canRestoreInheritance,
          t,
          onCancel: () => controller.refresh(),
          onSaved: () => controller.refresh(),
        }),
      )
    }

    const inject = ['slots', 'locale', 'connection', 'remote']
    function apply(ctx) {
      const connection = ctx.get('connection')
      const controller = createController()
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'models-config-plugin: dictionaries')
      const t = ctx.locale.bind(NS)
      ctx.effect(() => {
        const refresh = () => controller.refresh()
        const disposers = [
          ctx.remote.$on('settings/document-updated', refresh),
          ctx.remote.$on('llm/adapters-updated', refresh),
          ctx.on('connection/reset', refresh),
        ]
        return () => { for (const dispose of disposers) dispose() }
      }, 'models-config-plugin: invalidate advanced settings')
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'model-config',
        order: 11,
        label: () => t('nav'),
        inject: () => ({ api: connection.api, controller, t }),
      }, ModelsConfigSection))
    }

    return { inject, apply }
  },
})
