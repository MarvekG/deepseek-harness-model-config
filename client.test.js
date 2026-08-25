import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

async function loadMetadataHelpers() {
  const clientPath = new URL('./src/client.js', import.meta.url)
  const source = await readFile(clientPath, 'utf8')
  const instrumented = source.replace(
    '    return { inject, apply }',
    '    return { inject, apply, __test: { enrichDiscoveredModel, metadataCandidateForDiscovery, metadataMatchForModel, modelDisplayName, modelMatchesSearch, selectedModelsMissingFromDiscovery, sortCandidatesForDisplay } }',
  )
  let definition
  vm.runInNewContext(instrumented, {
    Headers,
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
