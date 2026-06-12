# Life Insight

Life Insight 是一个本地优先的 Obsidian Daily Notes 洞察插件。

它不是简单总结“最近写了什么”，而是基于一段时间内的日记，帮助用户发现人生变化、重复模式、潜在风险、成长迹象、情绪趋势、高频主题和高频人物。

当前插件版本以 `manifest.json` 为准：`0.2.0`。`package.json` 当前仍为 `0.1.0`，主要用于本地开发与构建，不作为 Obsidian 插件展示版本。

## 功能特性

- 读取 Obsidian Vault 中配置目录下的 Daily Notes。
- 支持多个分析时间范围：最近 7 天、15 天、30 天、60 天、90 天、180 天、365 天、全部记录。
- 默认分析范围为最近 30 天。
- 支持 OpenAI 与 SiliconFlow 两种 AI Provider。
- 支持自定义 Base URL、模型名称和 API Key。
- 在 Obsidian 右侧视图中展示 Life Insight Dashboard。
- 展示基础统计：记录天数、缺失天数、覆盖率、AI 模型、分析范围。
- 展示情绪趋势、高频主题、高频人物、人生变化、AI 发现、本周期洞察和日记预览。
- 生成结果和情绪数据保存在当前 Vault 内。
- 无独立后端服务。

## 安装与开发

要求：

- Obsidian `1.5.0` 或更高版本。
- Node.js。
- npm。

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

构建脚本会先运行 TypeScript 检查，然后使用 esbuild 将 `src/main.ts` 打包为根目录下的 `main.js`。

## 使用方式

1. 在 Obsidian 中启用 Life Insight 插件。
2. 打开插件设置页。
3. 配置 Daily Notes 文件夹、日期格式、默认分析范围、AI Provider、Base URL、API Key 和模型。
4. 点击左侧 Ribbon 中的 Life Insight 图标，或执行命令打开 Dashboard。
5. 在 Dashboard 顶部选择分析范围。
6. 点击“生成洞察”。
7. 插件读取对应范围的日记，将内容发送给配置的 AI Provider，并解析返回的 JSON。
8. Dashboard 刷新后展示本周期洞察、人生变化、AI 发现等内容。

## 设置项

默认设置来自 `src/types/settings.ts`。

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `dailyNotesFolder` | `Daily Notes` | Daily Notes 所在文件夹 |
| `dateFormat` | `YYYY-MM-DD.md` | 日记文件名日期格式 |
| `provider` | `openai` | AI Provider |
| `apiKey` | 空字符串 | AI API Key |
| `baseUrl` | `https://api.openai.com/v1` | API Base URL |
| `model` | `gpt-4o-mini` | 模型名称 |
| `lookbackDays` | `30` | 旧字段，兼容最近 N 天读取 |
| `analysisRange` | `30` | 默认分析范围 |

支持的 Provider：

| Provider | 默认 Base URL | 默认模型 |
| --- | --- | --- |
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| SiliconFlow | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V4-Flash` |

## 时间范围

Dashboard 支持以下分析范围：

- 最近 7 天
- 最近 15 天
- 最近 30 天
- 最近 60 天
- 最近 90 天
- 最近 180 天
- 最近 365 天
- 全部记录

对于固定天数范围，插件会根据当前日期生成连续日期列表，再按 `dailyNotesFolder` 和 `dateFormat` 查找对应 Daily Notes。

对于 `全部记录`，插件会扫描 Daily Notes 文件夹，读取符合 `dateFormat` 的文件。当前实现会递归扫描该文件夹，并按从文件路径中解析出的日期排序。

## 数据存储

插件会在当前 Vault 内创建并使用以下目录：

```text
.insight-plugin/
```

当前使用的文件：

```text
.insight-plugin/period-insights.json
.insight-plugin/weekly-insights.json
.insight-plugin/emotion-data.json
```

说明：

- `period-insights.json` 保存 V2 周期洞察。
- `weekly-insights.json` 是旧版本周洞察数据文件，当前仍保留兼容读取。
- `emotion-data.json` 保存按日期归并后的情绪分数。
- 相同 `id` 的周期洞察会覆盖旧记录。
- JSON 读取失败时会回退为空数据，不会直接抛出读取错误。

## AI Provider 与请求行为

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

插件要求 AI 返回严格 JSON，不要 Markdown 代码块。返回内容会被解析为周期洞察，主要字段包括：

- `overallState`
- `topics`
- `people`
- `emotionChanges`
- `lifeChanges`
- `aiFindings`
- `cycleInsight`
- `insight`
- `highlight`
- `confidence`
- `emotionScores`

如果 API Key 为空，插件会抛出：

```text
AI API Key is not configured.
```

如果 AI 返回内容为空，插件会抛出：

```text
AI provider returned an empty response.
```

## 命令列表

插件注册了以下 Obsidian 命令：

| Command ID | 名称 | 功能 |
| --- | --- | --- |
| `open-life-insight-dashboard` | Open Life Insight Dashboard | 打开或聚焦 Dashboard |
| `read-recent-daily-notes` | Read Daily Notes In Current Life Insight Range | 读取当前默认分析范围内的 Daily Notes，并显示找到数量 |
| `generate-weekly-insight` | Generate Life Insight | 打开 Dashboard 并刷新视图 |

注意：`generate-weekly-insight` 是旧命令 ID，当前命令名称已经改为 `Generate Life Insight`，保留旧 ID 是为了兼容。

## 项目结构

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

主要目录：

- `src/main.ts`：Obsidian 插件入口，负责初始化服务、注册视图、命令、Ribbon 图标和设置页。
- `src/settings.ts`：插件设置页。
- `src/views`：Dashboard 自定义视图。
- `src/services`：日记读取、AI 调用、洞察生成、情绪数据、本地存储等业务逻辑。
- `src/components`：Dashboard 各面板渲染函数。
- `src/ui`：通用 UI 渲染函数。
- `src/types`：设置、日记、洞察、情绪分数等类型定义。
- `styles.css`：Obsidian 插件视图样式。
- `main.js`：esbuild 生成的插件入口文件。

## 核心数据结构

### `LifeInsightSettings`

插件设置结构，包含 Daily Notes 路径、日期格式、AI Provider、API Key、Base URL、模型、旧回看天数字段和默认分析范围。

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
- `totalDays`
- `coverageRate`
- `notes`

### `PeriodInsight`

V2 周期洞察数据：

- `id`
- `periodType`
- `rangeLabel`
- `startDate`
- `endDate`
- `overallState`
- `topics`
- `people`
- `emotionChanges`
- `lifeChanges`
- `aiFindings`
- `cycleInsight`
- `insight`
- `highlight`
- `confidence`
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

## 隐私与边界

Life Insight 是本地优先插件：

- 插件没有独立后端。
- API Key 保存在本地 Obsidian 插件配置中。
- 插件只在用户点击生成洞察时调用配置的 AI Provider。
- 被分析的日记内容会发送给用户配置的 AI Provider。
- 生成结果保存在当前 Vault 的 `.insight-plugin/` 目录中。

产品边界：

- 不是 AI 聊天机器人。
- 不是心理咨询师。
- 不是医生。
- 不是命理工具。
- 不是职业规划师。

AI 输出应避免：

- 医学诊断，例如“你患有抑郁症”。
- 人格诊断，例如“你有人格障碍”。
- 命运预测，例如“你未来会失败”。
- 关系确定性判断，例如“你一定会离婚”。

允许的表达包括：

- “存在焦虑倾向”
- “出现压力增加迹象”
- “建议关注情绪变化”
- “建议关注执行力下降”

## 开发说明

当前项目没有独立数据库、后端服务、Electron IPC、Vue、React、Vite、ESLint 或 Prettier 配置。

主要开发依赖：

- TypeScript
- esbuild
- Obsidian API
- builtin-modules
- `@types/node`

常用命令：

```bash
npm install
npm run dev
npm run build
```

`npm run dev` 会进入 esbuild watch 模式。`npm run build` 会执行 TypeScript 检查并输出生产版 `main.js`。
