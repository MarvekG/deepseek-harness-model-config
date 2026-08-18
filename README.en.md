# DeepSeek Harness Model Configuration Plugin

English | [中文](README.md)

Adds an Advanced Model Configuration page to the [DeepSeek Harness](https://github.com/deepseek-harness/deepseek-harness) Web UI. Use it to create custom model endpoints and configure each model's capabilities.

## Features

- Create custom endpoints with a name, URL, API key, and protocol.
- Configure provider-level custom request headers for model requests.
- Supports `openai-completions`, `openai-responses`, and `anthropic-messages`.
- Fetch candidate models through a unified `GET /models` flow, with select all, invert selection, and select none actions.
- Use the same editor for new and saved endpoints; saved endpoints can refresh models, new models start unchecked, and checked models remain selected after a refresh.
- Endpoint advanced parameters cover default capacities, input modalities, reasoning compatibility, caching, transport, timeouts, and retry policies.
- Completes missing context windows, maximum output, input modalities, and reasoning capabilities from `models.dev`; it first selects the official provider implied by the model ID, then falls back to the default provider record, with whole-record switching available before saving.
- Edit each selected model's capacity, text/image input support, and `reasoningEfforts`; review a configuration preview before saving.
- Chinese and English UI copy follows the Harness language setting.
- API keys are written only through Harness credential storage, never to `settings.yaml` or the configuration preview.

See the [llm-pi-ai parameter reference](docs/llm-pi-ai-parameters.md) for the complete configuration table.

**Open settings**
<img width="1666" height="810" alt="image" src="https://github.com/user-attachments/assets/945e6566-dca2-45ca-bcc3-4609ea47f079" />

**Add an endpoint**
Enter the endpoint name, BASE_URL, and API key, then fetch models and check the ones you want:
<img width="1746" height="1580" alt="image" src="https://github.com/user-attachments/assets/828f36ea-8a7d-4021-9dbb-253d60a1e949" />

**Fill in remaining parameters**
1. Endpoint advanced parameters: the defaults are usually fine. Custom headers apply only to model requests; **Fetch available models** still uses the API key.

<img width="1712" height="1613" alt="image" src="https://github.com/user-attachments/assets/e185563c-4b89-468f-8463-49463c5b6e41" />

2. Model parameters: mainly check the context window and maximum output length.
<img width="1744" height="1628" alt="image" src="https://github.com/user-attachments/assets/a9a1e123-1e78-4435-addc-02ded574ba83" />

Model parameters are usually filled in automatically, as long as [https://models.dev](https://models.dev) is reachable.

## Install

Install and run `dsh`, then install from GitHub by default:

```sh
dsh plugin --profile web add github:MarvekG/deepseek-harness-model-config
dsh web
```

Open **Settings → Advanced model config** in the Web UI to create endpoints or edit existing `llm-pi-ai` model configuration.

For a reproducible version, append a commit SHA to the repository address, such as `github:MarvekG/deepseek-harness-model-config#<sha>`.

## Local Debugging

After cloning this repository, install the local `link:` dependency from its root:

```sh
dsh plugin --profile web add .
dsh web
```

## Uninstall

Remove the plugin from the Web profile:

```sh
dsh plugin --profile web remove dsh-models-config-plugin
```

## Update

Update by removing the old version and adding the new one:

```sh
dsh plugin --profile web remove dsh-models-config-plugin
dsh plugin --profile web add github:MarvekG/deepseek-harness-model-config
dsh web
```

For local debugging, replace the second command with `dsh plugin --profile web add .`.

## License

[MIT](LICENSE)

## Links

- [Linux DO](https://linux.do)
