# AI 一键总结 / AI 生成 Signal 功能评估

这份文档用于评估 AI Creative Radar 未来是否适合加入“AI 一键总结 / AI 生成 Signal”功能。

当前结论：这个功能适合放进后续 MVP 0.6 规划，但当前阶段先不开发。

## 1. 功能目标

未来可以增加一个轻量功能：

用户输入一个 AI 工具链接、文章链接或关键词，系统自动生成一条适合 AI Creative Radar 的 Signal。

它的目标不是简单总结网页，而是把信息转译成创作者能用的内容。

例如输入：

- AI 工具官网
- 官方 Blog
- 产品更新文章
- 创意案例链接
- 趋势文章
- 一个关键词，如 `AI fashion`、`Runway video`、`Prompt workflow`

系统输出一条结构化 Signal，方便作者检查后加入 `news-sample.json` 或未来的内容数据库。

## 2. 用户使用流程

一个可能的使用流程：

1. 用户打开内容更新页面。
2. 粘贴一个 AI 工具链接、文章链接或输入关键词。
3. 点击 `Generate Signal`。
4. 系统调用 AI，总结并转译内容。
5. 页面展示生成结果。
6. 作者人工检查和修改。
7. 确认后再加入网站内容。

当前阶段可以先不做“自动保存”，只做“生成草稿”。

## 3. 可以输出哪些内容

AI 可以根据来源内容输出：

- `summary`：发生了什么。
- `creator_value`：对视觉创作者有什么用。
- `project_ideas`：可以做成什么项目。
- `business_potential`：有没有接单、副业、内容账号、小产品或作品集价值。
- `prompt_hint`：可以延伸出的 Prompt 方向。
- `tools`：相关工具。
- `category`：内容分类。

未来也可以继续补充：

- `title`
- `signal`
- `target_reader`
- `visual_tag`
- `image_alt`

## 4. 是否可以接入 DeepSeek API

可以。

DeepSeek API 可以用于生成结构化内容，例如把文章内容整理成 Signal JSON。

但需要注意：DeepSeek API 不应该直接写在前端 React 代码里调用，而是应该通过后端或 Serverless Function 做中转。

## 5. 为什么不能把 API Key 写在前端

不能把 API Key 写在前端 React 代码里，原因很简单：

- 前端代码会被打包到浏览器里。
- 用户可以通过浏览器 DevTools 查看请求和代码。
- 如果 API Key 写在前端，就可能被别人复制走。
- API Key 泄露后，别人可能使用你的额度，造成费用风险。

所以：

```text
不要在 React 里直接写 DeepSeek API Key
```

## 6. 推荐实现方式：Vercel Serverless Function

如果后续要实现，推荐使用 Vercel Serverless Function 做中转。

大致结构：

```text
React 前端
  -> 请求 /api/generate-signal
  -> Vercel Serverless Function
  -> DeepSeek API
  -> 返回 Signal 草稿
  -> 前端展示给作者检查
```

这样 API Key 可以放在 Vercel 的环境变量里，而不是暴露在浏览器中。

## 7. 前端、Serverless、DeepSeek API 的关系

可以简单理解为：

### 前端 React

负责：

- 显示输入框。
- 接收用户输入的链接或关键词。
- 展示 AI 生成结果。
- 让作者复制或检查内容。

### Vercel Serverless Function

负责：

- 接收前端请求。
- 读取环境变量中的 DeepSeek API Key。
- 调用 DeepSeek API。
- 把 AI 返回内容整理后传回前端。

### DeepSeek API

负责：

- 根据 Prompt 和输入内容生成 Signal 草稿。

## 8. 当前阶段为什么先不开发

当前 AI Creative Radar 还处在 MVP 0.5 左右的阶段，核心目标是：

- 页面可以访问。
- 内容结构稳定。
- 分类筛选和搜索可用。
- Signal Detail 体验完整。
- 手动内容更新流程跑通。

现在直接加入 AI 生成 Signal，会引入更多复杂度：

- API Key 管理。
- 请求失败处理。
- 生成内容质量控制。
- 成本控制。
- 人工审核流程。

所以更适合先作为 MVP 0.6 规划，而不是当前马上开发。

## 9. 风险

如果未来开发这个功能，需要注意这些风险：

### 成本

每次调用 API 都可能产生费用。如果使用频率高，需要控制调用次数。

### 接口失败

API 可能因为网络、额度、服务波动而失败，需要有错误提示和重试策略。

### 内容幻觉

AI 可能生成看起来合理但实际不准确的内容。

### 来源不准确

AI 可能误解文章内容，或者把来源里没有的信息补出来。

### API Key 泄露

如果密钥暴露在前端，会有安全和费用风险。

## 10. 人工审核必须保留

即使未来加入 AI 一键总结，也不能完全自动发布。

作者仍然需要检查：

- 链接是否真实。
- 内容是否准确。
- 有没有夸大。
- 分类是否正确。
- 项目灵感是否具体。
- 商业化判断是否务实。
- Prompt 是否可执行。
- source 是否可信。

比较适合这个项目的方式是：

```text
AI 生成草稿 -> 作者审核修改 -> 再发布
```

这样既能提高效率，也能保留个人项目的判断、审美和真实感。

## 结论

AI Creative Radar 适合在未来加入“AI 一键总结 / AI 生成 Signal”功能。

但当前阶段先不开发，建议先继续完善内容、搜索、移动端体验和手动更新流程。

等内容结构更稳定后，再把它作为 MVP 0.6 的重点功能进行设计和实现。
