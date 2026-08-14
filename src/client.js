window.__ModuleLoader__.load({
  id: 'dsh-models-config-plugin',
  factory: (require) => {
    const React = require('react')
    const { createElement: h, useEffect, useState, useSyncExternalStore } = React

    const NS = 'settings.modelConfig'
    const EFFORTS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']
    const MODELS_DEV_CATALOG_URL = 'https://models.dev/api.json'
    let modelsDevCatalogPromise
    const en = {
      nav: 'Advanced model config',
      title: 'Advanced model config',
      loading: 'Loading model configuration…',
      adapterMissing: 'llm-pi-ai is not loaded. Add a custom provider from the Models page first.',
      intro: 'Declare capacities and reasoning support for custom models. Endpoints, keys, and model discovery remain on the Models page.',
      noProviders: 'No custom provider yet. Add a provider and at least one model from the Models page.',
      provider: 'Provider',
      inheritedModels: 'Editing the user-layer model list',
      materializedModels: 'Editing materializes the model list in the user layer',
      restoreInheritance: 'Restore inheritance',
      noModels: 'This provider has no editable models. Add or fetch models from the Models page.',
      discardReload: 'Discard and reload',
      save: 'Save',
      saving: 'Saving…',
      draftReloading: 'Configuration changed. Reloading the draft.',
      saved: 'Saved. New parameters apply to the next request.',
      restored: 'Restored the inherited model list.',
      addEndpoint: 'Add endpoint',
      reasoning: 'Reasoning effort',
      inheritCatalog: 'Inherit the model catalog',
      disableReasoning: 'Disable reasoning',
      declareEfforts: 'Declare supported efforts',
      offPlaceholder: 'Blank disables per protocol',
      wirePlaceholder: 'Wire spelling',
      wireLabel: '{level} wire spelling',
      delete: 'Delete',
      addLevel: 'Add effort',
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
      endpointDescription: 'Fetch candidates through the OpenAI-compatible model-list endpoint.',
      endpointName: 'Name',
      endpointNamePlaceholder: 'AcmeGateway',
      endpointUrl: 'Endpoint URL',
      apiProtocol: 'API protocol',
      endpointKey: 'API key',
      endpointKeyPlaceholder: 'Used only to fetch models and store the credential',
      endpointNameRequired: 'Enter an endpoint name.',
      endpointNameInvalid: 'The name may contain only English letters.',
      endpointUrlRequired: 'Enter an endpoint URL.',
      endpointUrlInvalid: 'Enter a valid http:// or https:// URL.',
      endpointUrlProtocol: 'The URL must start with http:// or https://.',
      endpointKeyRequired: 'Enter an API key.',
      endpointKeyInvalid: 'The API key must be unquoted printable ASCII, not a NAME=value environment line.',
      routeTaken: 'Route {route} already exists.',
      routePreview: 'Uses route {route} and credential reference {ref}.',
      fetchModels: 'Fetch available models',
      fetching: 'Fetching…',
      discoveryEmpty: 'The endpoint returned no models to add.',
      chooseModels: 'Choose models to add',
      selectAll: 'Select all',
      invertSelection: 'Invert selection',
      selectNone: 'Select none',
      selectedModelParameters: 'Selected model parameters',
      configPreview: 'Configuration preview',
      keyPreviewNotice: 'The API key never appears in this preview or settings configuration. Confirmation writes it only to credential storage.',
      cancel: 'Cancel',
      confirmSave: 'Confirm and save',
      retryKey: 'Retry saving API key',
      catalogApplied: 'Completed missing model metadata from models.dev.',
      catalogUnavailable: 'Could not load models.dev metadata. The endpoint results remain editable.',
      reasoningInvalid: 'Reasoning efforts must inherit, be disabled, or be an effort list.',
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
      adapterMissing: '未装载 llm-pi-ai。请先在“模型”页添加一个自定义提供方。',
      intro: '在此声明自定义模型的容量与推理能力。端点、密钥和获取可用模型仍在“模型”页管理。',
      noProviders: '尚无自定义提供方。请先在“模型”页添加一个提供方和至少一个模型。',
      provider: '提供方',
      inheritedModels: '正在编辑用户层模型列表',
      materializedModels: '编辑后会在用户层物化模型列表',
      restoreInheritance: '恢复继承',
      noModels: '该提供方没有可编辑的模型。请在“模型”页添加或获取模型。',
      discardReload: '放弃并重新加载',
      save: '保存',
      saving: '保存中…',
      draftReloading: '配置已更新，正在重新加载草稿。',
      saved: '已保存；下一次请求将使用新参数。',
      restored: '已恢复继承的模型列表。',
      addEndpoint: '新增端点',
      reasoning: '推理强度',
      inheritCatalog: '继承模型目录',
      disableReasoning: '禁用推理',
      declareEfforts: '声明支持的级别',
      offPlaceholder: '留空表示按协议关闭',
      wirePlaceholder: '服务端拼写',
      wireLabel: '{level} 服务端拼写',
      delete: '删除',
      addLevel: '添加级别',
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
      endpointDescription: '使用 OpenAI 兼容的模型列表接口获取候选模型。',
      endpointName: '名称',
      endpointNamePlaceholder: 'AcmeGateway',
      endpointUrl: '端点 URL',
      apiProtocol: 'API 协议',
      endpointKey: 'API Key',
      endpointKeyPlaceholder: '仅用于获取模型和保存凭据',
      endpointNameRequired: '请填写端点名称。',
      endpointNameInvalid: '名称只能包含英文大小写字母。',
      endpointUrlRequired: '请填写端点 URL。',
      endpointUrlInvalid: '请输入有效的 http:// 或 https:// URL。',
      endpointUrlProtocol: 'URL 必须以 http:// 或 https:// 开头。',
      endpointKeyRequired: '请填写 API Key。',
      endpointKeyInvalid: 'API Key 必须是未加引号的可打印 ASCII 字符，不能粘贴 NAME=value 环境变量行。',
      routeTaken: '路由 {route} 已存在。',
      routePreview: '将使用路由 {route} 和凭据引用 {ref}。',
      fetchModels: '获取可用模型',
      fetching: '获取中…',
      discoveryEmpty: '端点没有返回可添加的模型。',
      chooseModels: '选择要添加的模型',
      selectAll: '全选',
      invertSelection: '反选',
      selectNone: '全不选',
      selectedModelParameters: '已选模型参数',
      configPreview: '配置预览',
      keyPreviewNotice: 'API Key 不会出现在预览或 settings 配置中；确认后仅写入凭据存储。',
      cancel: '取消',
      confirmSave: '确认并保存',
      retryKey: '重试保存 API Key',
      catalogApplied: '已从 models.dev 补全缺失的模型参数。',
      catalogUnavailable: '无法加载 models.dev 元数据；端点返回的模型仍可编辑。',
      reasoningInvalid: '推理强度必须是“继承”、禁用或级别列表。',
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

    function loadModelsDevCatalog() {
      if (modelsDevCatalogPromise === undefined) {
        modelsDevCatalogPromise = fetch(MODELS_DEV_CATALOG_URL, { cache: 'force-cache' }).then(async response => {
          if (!response.ok) throw new Error(`models.dev returned HTTP ${response.status}`)
          return response.json()
        }).catch(error => {
          modelsDevCatalogPromise = undefined
          throw error
        })
      }
      return modelsDevCatalogPromise
    }

    function positiveCatalogLimit(value) {
      return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined
    }

    function modelRecordCandidates(catalog, id) {
      if (catalog === null || typeof catalog !== 'object') return []
      const matches = []
      for (const provider of Object.values(catalog)) {
        if (provider === null || typeof provider !== 'object') continue
        const models = provider.models
        const model = models !== null && typeof models === 'object' ? models[id] : undefined
        if (model !== null && typeof model === 'object') matches.push({ provider, model })
      }
      return matches
    }

    function modelMetadataFingerprint(model) {
      const limit = model.limit !== null && typeof model.limit === 'object' ? model.limit : {}
      const modalities = model.modalities !== null && typeof model.modalities === 'object' ? model.modalities : {}
      return JSON.stringify({
        context: positiveCatalogLimit(limit.context),
        output: positiveCatalogLimit(limit.output),
        input: Array.isArray(modalities.input) ? modalities.input.filter(value => value === 'text' || value === 'image') : [],
        reasoning: model.reasoning === false ? false : model.reasoning_options,
      })
    }

    function catalogModelForEndpoint(catalog, id, baseURL, api) {
      const candidates = modelRecordCandidates(catalog, id)
      if (candidates.length === 0) return undefined
      let hostname = ''
      try { hostname = new URL(baseURL).hostname.toLowerCase() } catch {}
      const hostMatch = candidates.find(({ provider }) => typeof provider.id === 'string' && hostname.includes(provider.id.toLowerCase()))
      if (hostMatch !== undefined) return hostMatch.model
      const canonicalProvider = api === 'openai-responses'
        ? 'openai'
        : api === 'anthropic-messages'
          ? 'anthropic'
          : undefined
      if (canonicalProvider !== undefined) {
        const canonical = candidates.find(({ provider }) => provider.id === canonicalProvider)
        if (canonical !== undefined) return canonical.model
      }
      const fingerprints = new Set(candidates.map(({ model }) => modelMetadataFingerprint(model)))
      return fingerprints.size === 1 ? candidates[0].model : undefined
    }

    function reasoningEffortsFromCatalog(model) {
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

    function enrichDiscoveredModel(candidate, catalog, baseURL, api) {
      const record = catalogModelForEndpoint(catalog, candidate.id, baseURL, api)
      if (record === undefined) return { ...candidate }
      const limit = record.limit !== null && typeof record.limit === 'object' ? record.limit : {}
      const modalities = record.modalities !== null && typeof record.modalities === 'object' ? record.modalities : {}
      const input = Array.isArray(modalities.input) ? modalities.input.filter(value => value === 'text' || value === 'image') : []
      const reasoningEfforts = reasoningEffortsFromCatalog(record)
      return {
        ...candidate,
        ...candidate.name === undefined && typeof record.name === 'string' ? { name: record.name } : {},
        ...candidate.contextWindow === undefined && positiveCatalogLimit(limit.context) !== undefined
          ? { contextWindow: positiveCatalogLimit(limit.context) }
          : {},
        ...candidate.maxTokens === undefined && positiveCatalogLimit(limit.output) !== undefined
          ? { maxTokens: positiveCatalogLimit(limit.output) }
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

    function ReasoningEditor({ value, onChange, disabled, t }) {
      const [newLevel, setNewLevel] = useState('')
      const mode = value === undefined ? 'inherit' : value === false ? 'disabled' : 'declared'
      const efforts = mode === 'declared' ? value : {}
      const declared = Object.keys(efforts)
      const changeMode = (next) => {
        if (next === 'inherit') onChange(undefined)
        else if (next === 'disabled') onChange(false)
        else onChange({ low: 'low' })
      }
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
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' } },
        h(Field, { label: t('reasoning') }, h('select', {
          style: inputStyle, value: mode, disabled, onChange: event => changeMode(event.target.value),
        },
        h('option', { value: 'inherit' }, t('inheritCatalog')),
        h('option', { value: 'disabled' }, t('disableReasoning')),
        h('option', { value: 'declared' }, t('declareEfforts')),
        )),
        mode === 'declared' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          declared.map(level => h('div', { key: level, style: { display: 'grid', gridTemplateColumns: '90px minmax(0, 1fr) auto', gap: '6px', alignItems: 'center' } },
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
          )),
          declared.length < EFFORTS.length ? h('div', { style: { display: 'flex', gap: '6px' } },
            h('select', { style: inputStyle, value: newLevel, disabled, onChange: event => setNewLevel(event.target.value) },
              h('option', { value: '' }, t('addLevel')),
              EFFORTS.filter(level => !declared.includes(level)).map(level => h('option', { key: level, value: level }, level)),
            ),
            h('button', { type: 'button', style: buttonStyle, disabled: disabled || newLevel === '', onClick: add }, t('add')),
          ) : null,
        ) : null,
      )
    }

    function ModelRow({ model, index, onChange, disabled, lockId = false, t }) {
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
      )
    }

    function NewEndpointCard({ api, namespace, taken, writable, onCancel, onSaved, t }) {
      const [endpoint, setEndpoint] = useState({ name: '', baseURL: '', api: 'openai-completions', apiKey: '' })
      const [candidates, setCandidates] = useState(undefined)
      const [selected, setSelected] = useState(new Set())
      const [modelDrafts, setModelDrafts] = useState({})
      const [busy, setBusy] = useState(false)
      const [failure, setFailure] = useState(undefined)
      const [catalogNotice, setCatalogNotice] = useState(undefined)
      const [profileCreated, setProfileCreated] = useState(false)
      const route = endpoint.name.toLowerCase()
      const keyRef = route === '' ? '' : `${route.toUpperCase()}_API_KEY`
      const nameError = endpoint.name.length === 0
        ? t('endpointNameRequired')
        : /^[A-Za-z]+$/.test(endpoint.name) ? undefined : t('endpointNameInvalid')
      const urlError = endpoint.baseURL.length === 0 ? t('endpointUrlRequired') : endpointUrlError(endpoint.baseURL, t)
      const keyError = apiKeyError(endpoint.apiKey, t)
      const routeTaken = taken.includes(route)
      const readyToFetch = nameError === undefined && urlError === undefined && keyError === undefined && !routeTaken
      const selectedModels = candidates === undefined ? [] : candidates
        .filter(model => selected.has(model.id))
        .map(model => modelDrafts[model.id] ?? { ...model })
      const profile = {
        displayName: endpoint.name,
        apiKeyEnv: keyRef,
        api: endpoint.api,
        baseURL: endpoint.baseURL.trim(),
        models: selectedModels.map(copyModel),
      }
      const preview = {
        'llm-pi-ai': { providers: { [route]: profile } },
        credentials: { [keyRef]: '[write-only]' },
      }
      const update = (field, value) => {
        setEndpoint(current => ({ ...current, [field]: value }))
        setCandidates(undefined)
        setSelected(new Set())
        setModelDrafts({})
        setFailure(undefined)
        setCatalogNotice(undefined)
      }
      const fetchModels = async () => {
        setBusy(true)
        setFailure(undefined)
        setCatalogNotice(undefined)
        try {
          const [response, catalog] = await Promise.all([
            api.llm.discoverModels({
              settingsNs: 'llm-pi-ai',
              baseURL: endpoint.baseURL.trim(),
              // Model listings commonly remain OpenAI-shaped even when the
              // generation endpoint speaks Anthropic Messages.
              api: endpoint.api === 'anthropic-messages' ? 'openai-completions' : endpoint.api,
              apiKey: endpoint.apiKey.trim(),
            }),
            loadModelsDevCatalog().catch(() => undefined),
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
          const enriched = catalog === undefined
            ? models
            : models.map(model => enrichDiscoveredModel(model, catalog, endpoint.baseURL.trim(), endpoint.api))
          setCandidates(enriched)
          setSelected(new Set(enriched.map(model => model.id)))
          setModelDrafts(Object.fromEntries(enriched.map(model => [model.id, { ...model }])))
          setCatalogNotice(t(catalog === undefined ? 'catalogUnavailable' : 'catalogApplied'))
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
      const save = async () => {
        setBusy(true)
        setFailure(undefined)
        try {
          if (!profileCreated) {
            const created = await api.settings.mutate({
              ns: 'llm-pi-ai',
              ops: [{ op: 'set', path: ['providers', route], value: profile }],
              expectedRevision: namespace.revision,
            })
            if (!created.result.ok) {
              setFailure(created.result.error.message)
              return
            }
            setProfileCreated(true)
          }
          const stored = await api.credentials.set({ ref: keyRef, value: endpoint.apiKey.trim() })
          if (!stored.result.ok) {
            setFailure(stored.result.error.message)
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
          h('h3', { style: { margin: 0, fontSize: '14px' } }, t('endpointTitle')),
          h('p', { style: { margin: '4px 0 0', color: 'var(--dsw-alias-label-tertiary)', fontSize: '13px' } }, t('endpointDescription')),
        ),
        h(Field, { label: t('endpointName') }, h('input', {
          style: inputStyle, value: endpoint.name, disabled: busy || profileCreated,
          placeholder: t('endpointNamePlaceholder'), onChange: event => update('name', event.target.value),
        })),
        nameError !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, nameError) : null,
        nameError === undefined ? h('p', { style: { margin: 0, color: routeTaken ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, routeTaken ? t('routeTaken', { route }) : t('routePreview', { route, ref: keyRef })) : null,
        h(Field, { label: t('endpointUrl') }, h('input', {
          style: inputStyle, type: 'url', value: endpoint.baseURL, disabled: busy || profileCreated,
          placeholder: 'https://gateway.example/v1', onChange: event => update('baseURL', event.target.value),
        })),
        urlError !== undefined && endpoint.baseURL.length > 0 ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, urlError) : null,
        h(Field, { label: t('apiProtocol') }, h('select', {
          style: inputStyle, value: endpoint.api, disabled: busy || profileCreated,
          onChange: event => update('api', event.target.value),
        },
        h('option', { value: 'openai-completions' }, 'openai-completions'),
        h('option', { value: 'openai-responses' }, 'openai-responses'),
        h('option', { value: 'anthropic-messages' }, 'anthropic-messages'),
        )),
        h(Field, { label: t('endpointKey') }, h('input', {
          style: inputStyle, type: 'password', autoComplete: 'off', value: endpoint.apiKey, disabled: busy,
          placeholder: t('endpointKeyPlaceholder'), onChange: event => {
            if (profileCreated) setEndpoint(current => ({ ...current, apiKey: event.target.value }))
            else update('apiKey', event.target.value)
          },
        })),
        keyError !== undefined && endpoint.apiKey.length > 0 ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '12px' } }, keyError) : null,
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
          h('button', { type: 'button', style: buttonStyle, disabled: busy || !readyToFetch || profileCreated, onClick: () => { void fetchModels() } }, busy ? t('fetching') : t('fetchModels')),
        ),
        candidates === undefined ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' } },
            h('strong', { style: { fontSize: '13px' } }, t('chooseModels')),
            h('div', { style: { display: 'flex', gap: '6px' } },
              h('button', { type: 'button', style: buttonStyle, disabled: busy || profileCreated, onClick: selectAll }, t('selectAll')),
              h('button', { type: 'button', style: buttonStyle, disabled: busy || profileCreated, onClick: invertSelection }, t('invertSelection')),
              h('button', { type: 'button', style: buttonStyle, disabled: busy || profileCreated, onClick: selectNone }, t('selectNone')),
            ),
          ),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflow: 'auto' } }, candidates.map(model => h('label', { key: model.id, style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' } },
            h('input', { type: 'checkbox', checked: selected.has(model.id), disabled: busy || profileCreated, onChange: () => toggle(model.id) }),
            h('span', null, model.id),
          ))),
          selectedModels.length === 0 ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            h('strong', { style: { fontSize: '13px' } }, t('selectedModelParameters')),
            selectedModels.map((model, index) => h(ModelRow, {
              key: model.id,
              model,
              index,
              onChange: next => updateSelectedModel(model.id, next),
              disabled: busy || profileCreated,
              lockId: true,
              t,
            })),
          ),
        ),
        selectedModels.length === 0 ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          h('strong', { style: { fontSize: '13px' } }, t('configPreview')),
          h('pre', { style: { boxSizing: 'border-box', height: '280px', margin: 0, padding: '10px', overflow: 'auto', borderRadius: '8px', background: 'var(--dsw-alias-bg-module-platform)', border: '1px solid var(--dsw-alias-border-l2)', fontSize: '12px', lineHeight: '18px' } }, JSON.stringify(preview, null, 2)),
          h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, t('keyPreviewNotice')),
        ),
        failure !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px' } }, failure) : null,
        catalogNotice === undefined ? null : h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '12px' } }, catalogNotice),
        h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
          h('button', { type: 'button', style: buttonStyle, disabled: busy || profileCreated, onClick: onCancel }, t('cancel')),
          h('button', {
            type: 'button',
            style: { ...buttonStyle, background: 'var(--dsw-alias-button-primary-fill)', color: 'var(--dsw-alias-label-primary-foreground)', borderColor: 'transparent' },
            disabled: busy || !writable || !readyToFetch || selectedModels.length === 0,
            onClick: () => { void save() },
          }, busy ? t('saving') : profileCreated ? t('retryKey') : t('confirmSave')),
        ),
      )
    }

    function ModelsConfigSection({ api, controller, t }) {
      const refresh = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
      const [state, setState] = useState({ status: 'loading' })
      const [provider, setProvider] = useState('')
      const [draft, setDraft] = useState([])
      const [draftRevision, setDraftRevision] = useState(-1)
      const [saving, setSaving] = useState(false)
      const [notice, setNotice] = useState(undefined)
      const [showCreate, setShowCreate] = useState(false)

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

      const namespace = state.status === 'ready' ? state.namespace : undefined
      const profiles = namespace === undefined ? undefined : objectAt(namespace.value, ['providers'])
      const providers = profiles !== null && typeof profiles === 'object' && !Array.isArray(profiles) ? Object.keys(profiles) : []
      const activeProvider = providers.includes(provider) ? provider : providers[0]
      const profile = activeProvider === undefined ? undefined : profiles[activeProvider]
      const effectiveModels = profile !== null && typeof profile === 'object' && Array.isArray(profile.models) ? profile.models.map(copyModel) : []
      const namespaceRevision = namespace?.revision

      useEffect(() => {
        if (activeProvider === undefined || namespaceRevision === undefined) return
        if (provider === activeProvider && draftRevision === namespaceRevision) return
        setProvider(activeProvider)
        setDraft(effectiveModels)
        setDraftRevision(namespaceRevision)
        setNotice(undefined)
      }, [activeProvider, draftRevision, effectiveModels, namespaceRevision, provider])

      if (state.status === 'loading') return h('p', null, t('loading'))
      if (state.status === 'error') return h('p', { style: { color: 'var(--dsw-alias-state-error-primary)' } }, state.message)
      if (namespace === undefined) {
        return h('section', { style: sectionStyle },
          h('h2', { style: { margin: 0, fontSize: '16px' } }, t('title')),
          h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)' } }, t('adapterMissing')),
        )
      }

      const userModels = activeProvider === undefined ? undefined : objectAt(namespace.user, ['providers', activeProvider, 'models'])
      const overridden = Array.isArray(userModels)
      const baseProfile = activeProvider === undefined ? undefined : objectAt(namespace.base, ['providers', activeProvider])
      const canRestoreInheritance = overridden && baseProfile !== null && typeof baseProfile === 'object'
      const models = provider === activeProvider && draftRevision === namespace.revision ? draft : effectiveModels

      const selectProvider = next => {
        const nextProfile = profiles[next]
        setProvider(next)
        setDraft(nextProfile !== null && typeof nextProfile === 'object' && Array.isArray(nextProfile.models)
          ? nextProfile.models.map(copyModel)
          : [])
        setDraftRevision(namespace.revision)
        setNotice(undefined)
      }

      const updateModel = (index, next) => setDraft(current => current.map((model, at) => at === index ? next : model))
      const save = async () => {
        if (draftRevision !== namespace.revision) {
          setNotice({ error: t('draftReloading') })
          return
        }
        const error = modelsError(draft, t)
        if (error !== undefined) {
          setNotice({ error })
          return
        }
        setSaving(true)
        setNotice(undefined)
        try {
          const response = await api.settings.mutate({
            ns: 'llm-pi-ai',
            ops: [{ op: 'set', path: ['providers', activeProvider, 'models'], value: draft }],
            expectedRevision: namespace.revision,
          })
          if (!response.result.ok) {
            setNotice({ error: response.result.error.message })
            if (response.result.error.code === 'settings-conflict') controller.refresh()
            return
          }
          setNotice({ success: t('saved') })
          controller.refresh()
        } catch (error) {
          setNotice({ error: messageOf(error) })
        } finally {
          setSaving(false)
        }
      }
      const reset = async () => {
        setSaving(true)
        setNotice(undefined)
        try {
          const response = await api.settings.mutate({
            ns: 'llm-pi-ai',
            ops: [{ op: 'unset', path: ['providers', activeProvider, 'models'] }],
            expectedRevision: namespace.revision,
          })
          if (!response.result.ok) {
            setNotice({ error: response.result.error.message })
            return
          }
          setNotice({ success: t('restored') })
          controller.refresh()
        } catch (error) {
          setNotice({ error: messageOf(error) })
        } finally {
          setSaving(false)
        }
      }

      return h('section', { style: sectionStyle },
        h('div', null,
          h('h2', { style: { margin: 0, fontSize: '16px', lineHeight: '24px' } }, t('title')),
          h('p', { style: { margin: '4px 0 0', color: 'var(--dsw-alias-label-tertiary)', fontSize: '14px', lineHeight: '22px' } },
            t('intro'),
          ),
        ),
        providers.length === 0 ? h('p', { style: cardStyle }, t('noProviders')) : h('div', { style: cardStyle },
          h(Field, { label: t('provider') }, h('select', {
            style: inputStyle, value: activeProvider, disabled: saving,
            onChange: event => selectProvider(event.target.value),
          }, providers.map(id => h('option', { key: id, value: id }, id)))),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } },
            h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, overridden ? t('inheritedModels') : t('materializedModels')),
            canRestoreInheritance ? h('button', { type: 'button', style: buttonStyle, disabled: saving || !state.writable, onClick: reset }, t('restoreInheritance')) : null,
          ),
          models.length === 0 ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-tertiary)', fontSize: '13px' } }, t('noModels')) : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            models.map((model, index) => h(ModelRow, {
              key: `${model.id || 'model'}-${index}`, model, index,
              onChange: next => updateModel(index, next), disabled: saving || !state.writable, t,
            })),
          ),
          notice?.error !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px' } }, notice.error) : null,
          notice?.success !== undefined ? h('p', { style: { margin: 0, color: 'var(--dsw-alias-state-success-primary)', fontSize: '13px' } }, notice.success) : null,
          h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } },
            h('button', { type: 'button', style: buttonStyle, disabled: saving, onClick: () => controller.refresh() }, t('discardReload')),
            h('button', {
              type: 'button',
              style: { ...buttonStyle, background: 'var(--dsw-alias-button-primary-fill)', color: 'var(--dsw-alias-label-primary-foreground)', borderColor: 'transparent' },
              disabled: saving || !state.writable || models.length === 0,
              onClick: () => { void save() },
            }, saving ? t('saving') : t('save')),
          ),
        ),
        showCreate ? h(NewEndpointCard, {
          api,
          namespace,
          taken: providers,
          writable: state.writable,
          t,
          onCancel: () => setShowCreate(false),
          onSaved: () => {
            setShowCreate(false)
            controller.refresh()
          },
        }) : h('button', { type: 'button', style: buttonStyle, disabled: saving || !state.writable, onClick: () => setShowCreate(true) }, t('addEndpoint')),
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
