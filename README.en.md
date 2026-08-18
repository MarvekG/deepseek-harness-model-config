# DeepSeek Harness Model Configuration Plugin

English | [中文](README.md)

Adds an Advanced Model Configuration page to the [DeepSeek Harness](https://github.com/deepseek-harness/deepseek-harness) Web UI. Use it to create custom model endpoints and configure each model's capabilities.

## Features

- Create custom endpoints with a name, URL, API key, and protocol.
- Configure provider-level custom request headers for model requests.
- Supports `openai-completions`, `openai-responses`, and `anthropic-messages`.
- Fetch candidate models through a unified `GET /models` flow, with select all, invert selection, and select none actions.
- Completes missing context windows, maximum output, input modalities, and reasoning capabilities from `models.dev`.
- Edit each selected model's capacity, text/image input support, and `reasoningEfforts`; review a configuration preview before saving.
- Chinese and English UI copy follows the Harness language setting.
- API keys are written only through Harness credential storage, never to `settings.yaml` or the configuration preview.

Custom headers apply only to model requests. **Fetch available models** still uses the API key.

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
