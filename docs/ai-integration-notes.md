# AI 接口接入说明 / AI Integration Notes

## 当前状态 / Current Status

MVP 0.8.0 Step 3 已将 `/api/generate-plan` 从 mock API 改为真实 AI API 调用。

当前接口仍然只服务于“生成初步方案”这个动作，不开发 AI 聊天、登录、保存方案、下载方案或数据库功能。

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

## Vercel 环境变量 / Environment Variables

上线前需要在 Vercel 项目环境变量中配置：

```env
AI_API_KEY=your_real_api_key
AI_API_BASE_URL=https://your-ai-api-base-url
AI_MODEL=your-model-name
```

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
→ 调用 /api/generate-plan
→ Vercel Serverless Function 读取环境变量
→ 服务端调用真实 AI
→ 返回结构化方案给前端
```

这样用户不会直接接触真实 API Key。

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

1. Step 4：优化 AI 失败时的本地回退体验
   继续检查错误提示、loading 状态和弱网体验。

2. Step 5：再考虑继续和 AI 聊
   等“一次生成初步方案”稳定后，再考虑多轮对话、继续完善方案和保存方案库。

3. 后续版本：自动抓取与后台审核
   自动内容管线仍属于更后面的功能，不在当前阶段开发。

## 当前不做什么 / Not Now

当前不做 AI 聊天，不做登录，不做方案保存，不做下载，不写数据库，不做自动抓取，也不在代码中写真实 API Key。
