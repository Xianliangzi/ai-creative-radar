# AI 接口接入说明 / AI Integration Notes

## 当前状态 / Current Status

MVP 0.8.0 Step 3 已将 `/api/generate-plan` 从 mock API 改为真实 AI API 调用。

MVP 0.9.0 Step 1 新增了 `/api/refine-plan`，用于在当前页面中继续追问并完善已经生成的初步方案。

MVP 0.9.1 新增了 `/api/finalize-plan`，用于把用户原始目标、初步方案和追问记录整理成一份完整方案草稿。

MVP 0.9.5 增加了轻量试用口令保护。公开访问时，用户仍然可以浏览页面和 AI 资讯，但调用 AI 生成、继续完善、生成完整方案草稿前，需要输入试用口令。

当前能力仍然是轻量原型：不开发登录、云端保存或数据库功能。完整方案可以复制、下载 Markdown，也可以保存到当前浏览器的本地方案库。

## 接口工作方式 / How It Works

前端页面会把用户输入的创意方向 `query` 和本地匹配到的 `matchedSignals` 发送到：

```text
POST /api/generate-plan
```

服务端函数会读取环境变量，调用 OpenAI-compatible chat completions 接口：

```text
{AI_API_BASE_URL}/chat/completions
```

AI 返回后，服务端会尝试把结果解析成结构化 JSON，再返回给前端。

生成初步方案后，前端也可以把用户原始目标、当前方案和追问发送到：

```text
POST /api/refine-plan
```

`/api/refine-plan` 返回普通文本 reply，用于展示“AI 补充建议”。这个接口不要求 JSON 方案结构，因为它只负责继续细化当前方案。

当用户需要整理完整方案时，前端会把用户原始目标、当前方案和追问记录发送到：

```text
POST /api/finalize-plan
```

`/api/finalize-plan` 会返回结构化 `finalPlan`，用于当前页面展示和复制文本。它不会写入数据库，也不会生成真实下载文件。

## Vercel 环境变量 / Environment Variables

上线前需要在 Vercel 项目环境变量中配置：

```env
AI_API_KEY=your_real_api_key
AI_API_BASE_URL=https://your-ai-api-base-url
AI_MODEL=your-model-name
AI_ACCESS_CODE=your_test_access_code
```

`AI_ACCESS_CODE` 是可选的试用保护口令：

- 如果设置了 `AI_ACCESS_CODE`，所有 AI API 请求都需要携带正确口令。
- 如果没有设置 `AI_ACCESS_CODE`，默认不启用口令保护，方便本地开发和调试。
- 试用口令只用于早期控制 API 使用成本，不是正式账号系统，也不代表用户权限管理。

本地如果没有这些环境变量，API 会返回：

```json
{
  "success": false,
  "source": "server",
  "error": "Missing AI environment variables"
}
```

这属于正常保护，不代表前端页面坏了。

## API Key 安全 / API Key Safety

真实 API Key 不能写进前端 React 代码，也不能提交到 GitHub。

原因是前端代码会被打包并发送到用户浏览器，任何写在前端里的密钥都有被看到和滥用的风险。

正确流程是：

```text
前端页面
→ 用户输入试用口令
→ 调用 /api/generate-plan、/api/refine-plan 或 /api/finalize-plan
→ Vercel Serverless Function 校验 AI_ACCESS_CODE
→ 服务端调用真实 AI
→ 返回结构化方案给前端
```

这样用户不会直接接触真实 API Key。

试用口令也不能写死在前端代码中。前端只负责收集用户输入的口令，并随请求发送到服务端；真正的校验发生在 Serverless Function 中。

## 返回结构 / Response Shape

AI 成功返回并能解析 JSON 时，接口返回：

```json
{
  "success": true,
  "source": "ai",
  "plan": {
    "overview": "一句话概括",
    "recommended_tools": ["工具1", "工具2"],
    "related_cases": ["案例1", "案例2"],
    "directions": ["方向1", "方向2"],
    "prompt_ideas": ["Prompt 1", "Prompt 2"],
    "business_ideas": ["商业玩法1", "商业玩法2"],
    "next_steps": ["第一步", "第二步", "第三步"]
  }
}
```

如果 AI 返回了文本但没有严格 JSON，接口会返回 `source: "ai-text"`，并把原始文本放进 `directions` 中，避免前端白屏。

## 失败回退 / Fallback

前端已经有本地匹配兜底逻辑。

如果 AI 接口失败、环境变量缺失、请求超时或返回格式不稳定，前端会回退到本地匹配结果，并提示：

```text
AI 接口暂时不可用，已展示本地匹配结果。
```

## 后续步骤 / Next Steps

1. 继续优化追问质量
   根据真实使用情况调整 `/api/refine-plan` 的 prompt，让回答更适合学生项目、作品集和内容账号。

2. 保存与导出
   后续可以把完整方案草稿保存到“我的方案库”，或导出为文档、PPT 大纲、执行计划，但当前不开发真实保存、下载或导出。

3. 后续版本：自动抓取与后台审核
   自动内容管线仍属于更后面的功能，不在当前阶段开发。

## 当前不做什么 / Not Now

当前不做登录，不做正式账号系统，不做云端数据库，不做自动抓取，也不在代码中写真实 API Key 或真实试用口令。
