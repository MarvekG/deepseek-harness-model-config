# DeepSeek Harness 模型配置插件

[English](README.en.md) | 中文

为 [DeepSeek Harness](https://github.com/deepseek-harness/deepseek-harness) Web UI 添加“模型高级配置”页面，用于创建自定义模型端点并配置每个模型的能力参数。

## 功能

- 新增自定义端点：名称、URL、API Key 和协议。
- 支持在 provider 层配置自定义请求 Header，并应用于模型请求。
- 支持 `openai-completions`、`openai-responses`、`anthropic-messages`。
- 通过统一的 `GET /models` 流程获取候选模型，支持全选、反选和全不选。
- 从 `models.dev` 补全缺失的上下文窗口、最大输出、输入模态和推理能力。
- 在保存前编辑每个模型的容量、文本/图片输入和 `reasoningEfforts`，并查看不含密钥的配置预览。
- 所有界面文案支持中文和英文，跟随 Harness 语言设置。
- API Key 仅经 Harness 凭据存储写入，不会进入 `settings.yaml` 或配置预览。

打开设置：
<img width="1613" height="1011" alt="image" src="https://github.com/user-attachments/assets/132b604b-b5ed-4986-87eb-c307d27cd8ba" />

新增端点：
<img width="1180" height="892" alt="image" src="https://github.com/user-attachments/assets/209bd3d6-ae39-489e-ae15-eb215c6c1126" />

获取模型，并自动获取推理强度、上下文大小、输出强度等参数：
<img width="1610" height="1439" alt="image" src="https://github.com/user-attachments/assets/4511b643-2d09-4a86-bb7f-5c4f7b6620a7" />

自定义 Header 仅用于模型请求；“获取可用模型”仍使用 API Key。

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
