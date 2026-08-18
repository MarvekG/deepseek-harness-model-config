# DeepSeek Harness 模型配置插件

[English](README.en.md) | 中文

为 [DeepSeek Harness](https://github.com/deepseek-harness/deepseek-harness) Web UI 添加“模型高级配置”页面，用于创建自定义模型端点并配置每个模型的能力参数。

## 功能

- 新增自定义端点：名称、URL、API Key 和协议。
- 支持在 provider 层配置自定义请求 Header，并应用于模型请求。
- 支持 `openai-completions`、`openai-responses`、`anthropic-messages`。
- 通过统一的 `GET /models` 流程获取候选模型，支持全选、反选和全不选。
- 新增端点和已保存端点共用编辑器；已保存端点可重新拉取模型，新增模型默认不勾选，已有勾选模型在刷新后保留。
- 端点高级参数支持默认容量、输入模态、推理兼容、缓存、传输、超时和重试策略。
- 从 `models.dev` 补全缺失的上下文窗口、最大输出、输入模态和推理能力；优先按模型名称选择官方 provider，找不到时选择默认 provider，并可在保存前切换完整 provider 记录。
- 在保存前编辑每个模型的容量、文本/图片输入和 `reasoningEfforts`，并查看不含密钥的配置预览。
- 所有界面文案支持中文和英文，跟随 Harness 语言设置。
- API Key 仅经 Harness 凭据存储写入，不会进入 `settings.yaml` 或配置预览。

完整参数说明：[`llm-pi-ai` 参数参考](docs/llm-pi-ai-parameters.md)。

**打开设置**
<img width="1666" height="810" alt="image" src="https://github.com/user-attachments/assets/945e6566-dca2-45ca-bcc3-4609ea47f079" />

**新增端点**
端点名称、BASE_URL、API-KEY，然后点击获取模型，把想要的模型勾选上：
<img width="1746" height="1580" alt="image" src="https://github.com/user-attachments/assets/828f36ea-8a7d-4021-9dbb-253d60a1e949" />

**参数补充**
1. 端点高级参数：一般保持默认即可。自定义 Header 仅用于模型请求；“获取可用模型”仍使用 API Key。

<img width="1712" height="1613" alt="image" src="https://github.com/user-attachments/assets/e185563c-4b89-468f-8463-49463c5b6e41" />

2. 模型参数：主要检查上下文大小和最大输出长度。
<img width="1744" height="1628" alt="image" src="https://github.com/user-attachments/assets/a9a1e123-1e78-4435-addc-02ded574ba83" />

模型参数一般能自动填写，前提是要能访问 [https://models.dev](https://models.dev)

## 安装

需要已安装并可运行的 `dsh`。默认从 GitHub 安装：

```sh
dsh plugin --profile web add github:MarvekG/deepseek-harness-model-config
dsh web
```

打开 Web UI 的“设置 → 模型高级配置”，即可新增端点或编辑现有 `llm-pi-ai` 模型配置。

如需固定版本，在仓库地址后附加 commit SHA，例如 `github:MarvekG/deepseek-harness-model-config#<sha>`。

## 本地调试

克隆本仓库后，在仓库根目录以本地 `link:` 依赖安装：

```sh
dsh plugin --profile web add .
dsh web
```

## 卸载

从 Web profile 移除插件：

```sh
dsh plugin --profile web remove dsh-models-config-plugin
```

## 更新

更新使用“卸载旧版本，再安装新版本”的方式：

```sh
dsh plugin --profile web remove dsh-models-config-plugin
dsh plugin --profile web add github:MarvekG/deepseek-harness-model-config
dsh web
```

本地调试时，将第二条命令替换为 `dsh plugin --profile web add .`。

## 许可证

[MIT](LICENSE)

## 友链

- [Linux DO](https://linux.do)
