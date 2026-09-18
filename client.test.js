// Loose assert: objects returned from the vm realm carry a different
// Object.prototype, which strict deepEqual would reject.
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

async function loadMetadataHelpers() {
  const clientPath = new URL('./src/client.js', import.meta.url)
  const source = await readFile(clientPath, 'utf8')
  const instrumented = source.replace(
    '    return { inject, apply }',
    '    return { inject, apply, __test: { enrichDiscoveredModel, metadataCandidateForDiscovery, metadataMatchForModel, modelDisplayName, modelMatchesSearch, selectedModelsMissingFromDiscovery, sortCandidatesForDisplay, isAliyunEndpoint, effectiveCompat, credentialKeyRef, PROVIDER_ID_PATTERN } }',
  )
  let definition
  vm.runInNewContext(instrumented, {
    Headers,
    URL,
    window: {
      __ModuleLoader__: {
        load(value) {
          definition = value
        },
      },
    },
  })
  const react = {
    createElement() {},
    useEffect() {},
    useState() {},
    useSyncExternalStore() {},
  }
  return definition.factory(id => id === 'react' ? react : undefined).__test
}

test('metadata enrichment preserves a discovered display name exactly', async () => {
  const { enrichDiscoveredModel, metadataMatchForModel } = await loadMetadataHelpers()
  const metadata = {
    openai: {
      id: 'openai',
      models: {
        'GPT-5': {
          name: 'Metadata-normalized-name',
          limit: { context: 400000, output: 128000 },
          modalities: { input: ['text', 'image'] },
        },
      },
    },
  }
  const model = { id: 'gateway-model', name: 'GPT-5' }
  const match = metadataMatchForModel(metadata, model)
  const enriched = enrichDiscoveredModel(model, match, match.selection)

  assert.equal(match.officialProvider, 'openai')
  assert.equal(enriched.name, 'GPT-5')
  assert.equal(enriched.contextWindow, 400000)
  assert.equal(enriched.maxTokens, 128000)
})

test('an edited display name selects its official metadata provider', async () => {
  const { metadataMatchForModel } = await loadMetadataHelpers()
  const metadata = {
    deepseek: { id: 'deepseek', models: { 'DeepSeek-V3': { limit: { context: 1, output: 1 } } } },
    openai: { id: 'openai', models: { 'GPT-5': { limit: { context: 1, output: 1 } } } },
  }
  const match = metadataMatchForModel(metadata, { id: 'DeepSeek-V3', name: 'GPT-5' })

  assert.equal(match.officialProvider, 'openai')
  assert.equal(match.selection, 'provider:openai')
})

test('model search is case-insensitive without changing the displayed spelling', async () => {
  const { modelDisplayName, modelMatchesSearch } = await loadMetadataHelpers()
  const model = { id: 'Wire-Model', name: 'MiXeD Display Name' }

  assert.equal(modelDisplayName(model), 'MiXeD Display Name')
  assert.equal(modelMatchesSearch(model, 'mixed display'), true)
  assert.equal(modelMatchesSearch(model, 'wire-model'), true)
  assert.equal(modelMatchesSearch(model, 'missing'), false)
})

test('refresh matches metadata with the edited display name rather than the returned name', async () => {
  const { metadataCandidateForDiscovery, metadataMatchForModel } = await loadMetadataHelpers()
  const metadata = {
    deepseek: { id: 'deepseek', models: { 'DeepSeek-V3': { limit: { context: 1, output: 1 } } } },
    openai: { id: 'openai', models: { 'GPT-5': { limit: { context: 1, output: 1 } } } },
  }
  const returned = { id: 'DeepSeek-V3', name: 'DeepSeek-V3' }
  const editedDraft = { id: 'DeepSeek-V3', name: 'GPT-5' }
  const candidate = metadataCandidateForDiscovery(returned, editedDraft)
  const match = metadataMatchForModel(metadata, candidate)

  assert.equal(candidate.name, 'GPT-5')
  assert.equal(match.selection, 'provider:openai')
})

test('refresh retains selected manual models absent from the endpoint response', async () => {
  const { selectedModelsMissingFromDiscovery } = await loadMetadataHelpers()
  const manual = { id: 'Manual-Model', name: 'Manual Display Name' }
  const discovered = { id: 'Discovered-Model', name: 'Discovered Model' }
  const retained = selectedModelsMissingFromDiscovery(
    [manual, discovered],
    new Set([manual.id]),
    new Set([discovered.id]),
    { [manual.id]: manual },
  )

  assert.deepEqual(retained, [manual])
})

test('the choose-models list sorts candidates by id without mutating the source order', async () => {
  const { sortCandidatesForDisplay } = await loadMetadataHelpers()
  const unsorted = [
    { id: 'zeta-model' },
    { id: 'Alpha-Model' },
    { id: 'model-v10' },
    { id: 'model-v9' },
  ]

  const sortedIds = Array.from(sortCandidatesForDisplay(unsorted), model => model.id)

  assert.deepEqual(sortedIds, ['Alpha-Model', 'model-v9', 'model-v10', 'zeta-model'])
  assert.deepEqual(unsorted.map(model => model.id), ['zeta-model', 'Alpha-Model', 'model-v10', 'model-v9'])
})

test('aliyun endpoints are recognized by hostname, not by url substring', async () => {
  const { isAliyunEndpoint } = await loadMetadataHelpers()

  assert.equal(isAliyunEndpoint('https://dashscope.aliyuncs.com/compatible-mode/v1'), true)
  assert.equal(isAliyunEndpoint('https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'), true)
  assert.equal(isAliyunEndpoint('https://dashscope-intl.aliyuncs.com/compatible-mode/v1'), true)
  assert.equal(isAliyunEndpoint('https://api.deepseek.com'), false)
  assert.equal(isAliyunEndpoint('https://gateway.example/aliyuncs.com'), false)
  assert.equal(isAliyunEndpoint('https://aliyuncs.com.evil.example/v1'), false)
  assert.equal(isAliyunEndpoint('not a url'), false)
})

test('effectiveCompat pins developer role off for aliyun unless configured explicitly', async () => {
  const { effectiveCompat, isAliyunEndpoint } = await loadMetadataHelpers()
  const aliyun = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

  assert.equal(effectiveCompat({}, 'https://api.deepseek.com'), undefined)
  assert.deepEqual(effectiveCompat({}, aliyun), { supportsDeveloperRole: false })
  assert.deepEqual(
    effectiveCompat({ compat: { thinkingFormat: 'qwen' } }, aliyun),
    { thinkingFormat: 'qwen', supportsDeveloperRole: false },
  )
  assert.deepEqual(
    effectiveCompat({ compat: { supportsDeveloperRole: true } }, aliyun),
    { supportsDeveloperRole: true },
  )
  assert.deepEqual(
    effectiveCompat({ compat: { thinkingFormat: 'deepseek' } }, 'https://gateway.example/v1'),
    { thinkingFormat: 'deepseek' },
  )
  assert.equal(isAliyunEndpoint(''), false)
})

test('credential refs follow the official dash-to-underscore derivation', async () => {
  const { credentialKeyRef } = await loadMetadataHelpers()

  assert.equal(credentialKeyRef('acme-gateway'), 'ACME_GATEWAY_API_KEY')
  assert.equal(credentialKeyRef('qwen'), 'QWEN_API_KEY')
  assert.equal(credentialKeyRef(''), '')
})

test('provider IDs accept exactly the official lowercase-hyphenated grammar', async () => {
  const { PROVIDER_ID_PATTERN } = await loadMetadataHelpers()

  assert.equal(PROVIDER_ID_PATTERN.test('acme-gateway'), true)
  assert.equal(PROVIDER_ID_PATTERN.test('acme'), true)
  assert.equal(PROVIDER_ID_PATTERN.test('acme-gateway-2'), true)
  assert.equal(PROVIDER_ID_PATTERN.test('Acme'), false)
  assert.equal(PROVIDER_ID_PATTERN.test('1acme'), false)
  assert.equal(PROVIDER_ID_PATTERN.test('acme--gateway'), false)
  assert.equal(PROVIDER_ID_PATTERN.test('acme-'), false)
  assert.equal(PROVIDER_ID_PATTERN.test('acme_gateway'), false)
})
