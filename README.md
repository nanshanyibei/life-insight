# Life Insight

Local-first AI insights for Obsidian daily notes.

Life Insight 是一个 Obsidian 插件，用于读取 Vault 内最近一段时间的 Daily Notes，并在用户手动触发时调用兼容 OpenAI Chat Completions 的 AI Provider，生成本周洞察、主题、人物、情绪趋势和高光片段。

## Features

- 读取 Vault 中配置目录下的 Daily Notes。
- 支持配置回看天数，默认最近 7 天。
- 支持 OpenAI 和 SiliconFlow 两种 Provider。
- 支持自定义 Base URL、模型名和 API Key。
- 在 Obsidian 右侧视图中展示 Life Insight Dashboard。
- 展示记录天数、缺失天数、AI 模型、本地保存路径等状态。
- 生成并保存周洞察报告。
- 展示高频主题、高频人物、情绪趋势和最近日记预览。
- 洞察结果和情绪数据保存在当前 Vault 内。
- 插件无独立后端服务。

## Project Structure

```text
.
├── manifest.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── esbuild.config.mjs
├── styles.css
├── main.js
└── src
    ├── main.ts
    ├── settings.ts
    ├── views
    ├── services
    ├── components
    ├── ui
    └── types
```

主要目录说明：

- `src/main.ts`：Obsidian 插件入口，负责初始化服务、注册视图、注册命令和设置页。
- `src/settings.ts`：插件设置页。
- `src/views`：Dashboard 自定义视图。
- `src/services`：日记读取、AI 调用、洞察生成、情绪数据、本地存储等业务逻辑。
- `src/components`：Dashboard 中各个面板的渲染函数。
- `src/ui`：通用 UI 状态渲染。
- `src/types`：设置、日记、洞察、情绪分数等类型定义。
- `styles.css`：Obsidian 插件视图样式。
- `main.js`：esbuild 生成的插件入口文件。

## Requirements

- Obsidian `1.5.0` 或更高版本。
- Node.js 环境用于本地开发和构建。
- npm 包管理器。

当前项目使用 `package-lock.json`，因此默认包管理器是 npm。

## Installation for Development

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

构建：

```bash
npm run build
```

构建脚本会先执行 TypeScript 检查，然后使用 esbuild 将 `src/main.ts` 打包到根目录 `main.js`。

## Usage

1. 在 Obsidian 中启用插件。
2. 打开插件设置页。
3. 配置 Daily Notes 文件夹、日期格式、AI Provider、Base URL、API Key 和模型。
4. 点击左侧 Ribbon 中的 Life Insight 图标，或执行命令打开 Dashboard。
5. 在 Dashboard 中点击“生成本周洞察”。
6. 插件读取最近 Daily Notes，并将内容发送给配置的 AI Provider。
7. AI 返回 JSON 后，插件保存结果并刷新 Dashboard。

## Settings

默认配置来自 `src/types/settings.ts`：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `dailyNotesFolder` | `Daily Notes` | Daily Notes 所在文件夹 |
| `dateFormat` | `YYYY-MM-DD.md` | 日记文件日期格式 |
| `provider` | `openai` | AI Provider |
| `apiKey` | 空字符串 | AI API Key |
| `baseUrl` | `https://api.openai.com/v1` | API Base URL |
| `model` | `gpt-4o-mini` | 模型名称 |
| `lookbackDays` | `7` | 回看天数 |

支持的 Provider：

- OpenAI
  - Base URL: `https://api.openai.com/v1`
  - Model: `gpt-4o-mini`
- SiliconFlow
  - Base URL: `https://api.siliconflow.cn/v1`
  - Model: `deepseek-ai/DeepSeek-V4-Flash`

## Commands

插件注册了以下 Obsidian 命令：

| Command ID | 名称 | 功能 |
| --- | --- | --- |
| `open-life-insight-dashboard` | Open Life Insight Dashboard | 打开或聚焦 Dashboard |
| `read-recent-daily-notes` | Read Recent 7 Daily Notes | 读取最近 Daily Notes 并显示找到数量 |
| `generate-weekly-insight` | Generate Weekly Insight | 打开 Dashboard 并重新渲染视图 |

注意：`read-recent-daily-notes` 的命令名称中写的是 `7`，但实际读取天数来自 `settings.lookbackDays`。

## Data Storage

插件会在 Vault 内创建并使用以下目录：

```text
.insight-plugin/
```

当前使用的文件：

```text
.insight-plugin/weekly-insights.json
.insight-plugin/emotion-data.json
```

数据行为：

- 周洞察保存到 `weekly-insights.json`。
- 情绪分数保存到 `emotion-data.json`。
- 相同日期范围的周洞察会按 `id` 覆盖旧记录。
- 情绪分数按日期合并，并按日期升序保存。
- JSON 读取失败时会回退为空数据，不会抛出错误。

## AI API

AI 调用位于 `src/services/aiService.ts`。

请求地址：

```text
{baseUrl}/chat/completions
```

请求方式：

```text
POST
```

请求头：

```text
Content-Type: application/json
Authorization: Bearer <apiKey>
```

请求体包含：

- `model`
- `temperature: 0.4`
- `messages`

插件要求 AI 返回严格 JSON，结构包含：

- `overallState`
- `topics`
- `people`
- `emotionChanges`
- `insight`
- `highlight`
- `emotionScores`

如果 API Key 为空，插件会抛出：

```text
AI API Key is not configured.
```

如果 AI 返回内容为空，插件会抛出：

```text
AI provider returned an empty response.
```

## Public API

项目没有暴露独立 npm 包 API。主要对外入口是 Obsidian 插件类：

```ts
export default class LifeInsightPlugin extends Plugin
```

主要内部类和函数包括：

- `LifeInsightPlugin`
- `LifeInsightSettingTab`
- `DashboardView`
- `AiService`
- `InsightService`
- `NoteService`
- `DataStore`
- `EmotionService`
- `DateService`
- `renderEmotionTrendPanel`
- `renderPeoplePanel`
- `renderTopicPanel`
- `renderWeeklyInsightPanel`
- `renderDailyNotesPreview`

## Key Data Structures

### `LifeInsightSettings`

插件设置结构，包含 Daily Notes 路径、日期格式、Provider、API Key、Base URL、模型和回看天数。

### `DailyNote`

单篇 Daily Note 的读取结果：

- `date`
- `path`
- `content`
- `exists`

### `DailyNotesReadResult`

一组 Daily Notes 的读取结果：

- `startDate`
- `endDate`
- `foundCount`
- `missingCount`
- `notes`

### `WeeklyInsight`

AI 生成的周洞察数据：

- `id`
- `startDate`
- `endDate`
- `overallState`
- `topics`
- `people`
- `emotionChanges`
- `insight`
- `highlight`
- `createdAt`
- `emotionScores`

### `EmotionScore`

单日情绪分数：

- `date`
- `happy`
- `anxiety`
- `stress`
- `tiredness`
- `calm`

情绪分数会被限制在 `0` 到 `100` 之间。

## Workflow

### 插件启动

1. Obsidian 加载插件。
2. 插件读取保存的配置。
3. 插件合并默认配置。
4. 插件初始化 DataStore、EmotionService、InsightService、NoteService 和 AiService。
5. 插件注册 Dashboard 视图、Ribbon 图标、命令和设置页。

### 读取 Daily Notes

1. 根据 `lookbackDays` 生成最近日期列表。
2. 根据 `dailyNotesFolder` 和 `dateFormat` 生成文件路径。
3. 从 Obsidian Vault 中读取匹配的文件。
4. 返回找到数量、缺失数量和日记内容。

### 生成周洞察

1. Dashboard 中点击“生成本周洞察”。
2. 插件读取最近 Daily Notes。
3. 插件构造中文 Prompt。
4. 插件调用配置的 AI Provider。
5. 插件解析 AI 返回的 JSON。
6. 插件保存周洞察。
7. 插件保存并归一化情绪分数。
8. Dashboard 重新渲染。

## Dependencies

开发依赖：

- `typescript`
- `esbuild`
- `obsidian`
- `@types/node`
- `builtin-modules`

构建工具：

- TypeScript
- esbuild

运行环境：

- Obsidian 插件运行时

## Notes

- 插件只在用户点击“生成本周洞察”时发送日记内容给配置的 AI Provider。
- API Key 保存在本地 Obsidian 插件配置中。
- 插件没有独立后端。
- 当前代码没有数据库操作。
- 当前代码没有 Electron IPC 通信。
- 当前代码没有 Vue 组件。
- 当前代码没有 Vite 配置。
- 当前代码没有 ESLint 或 Prettier 配置。
- `main.js` 是构建产物，由 `esbuild.config.mjs` 从 `src/main.ts` 打包生成。
- `loadSettings()` 兼容旧字段 `openaiApiKey` 和 `openaiModel`，但不会立即写回新字段。
- AI 返回内容必须能被解析为 JSON，否则生成流程会失败。
