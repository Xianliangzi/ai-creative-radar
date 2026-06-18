# MVP 0.6 Signal Generator 原型

## 1. 阶段目标 / Goal

MVP 0.6 的目标是做一个轻量级的 **Signal Generator 前端原型**。

用户可以手动输入一个 AI 工具链接、文章链接、工具名称或创意关键词，然后选择一个模板，生成一条结构化的 mock Signal 草稿。

这一版重点验证的是流程，而不是真正调用 AI：

```text
手动输入链接/关键词
→ 选择模板
→ 生成 mock Signal 草稿
→ 预览字段结构
→ 临时加入当前页面
```

## 2. 为什么现在只做 mock generator

AI Creative Radar 目前还是一个学生个人项目和内容产品 MVP。直接接入 DeepSeek、后端、自动抓取和数据库，会让项目复杂度突然变得很高。

所以 MVP 0.6 先只做 mock generator，用来验证：

- 输入区是否容易理解
- 模板选择是否清楚
- Signal 字段结构是否完整
- 预览区是否适合人工审核
- 用户是否能理解“生成一条创意情报”的操作
- 未来接入 AI API 之前，前端流程是否成立

当前生成的 Signal 只是前端临时草稿，不会写入真实 `news-sample.json` 文件，刷新页面后会消失。

## 3. 当前支持的模板 / Templates

当前原型提供 4 个模板：

- AI Tool：适合 Runway、Midjourney、Krea、Pika、Figma 等工具
- Creative Case：适合 AI 广告、AI MV、AI fashion、AI 艺术案例
- Trend：适合 AI fashion、Y2K、虚拟人、数字时尚、AI video trend
- Business：适合 AI 接单、副业、模板售卖、内容账号、AI 视觉服务

每个模板都会生成符合当前数据结构的 Signal，包括：

- `id`
- `title`
- `signal`
- `summary`
- `creator_value`
- `project_ideas`
- `business_potential`
- `target_reader`
- `category`
- `tools`
- `prompt_hint`
- `source`
- `url`
- `date`
- `visual_tag`
- `image`
- `image_alt`
- `image_mode`

## 4. MVP 0.7：接入 DeepSeek / AI 生成 Signal

MVP 0.7 可以在 0.6 的流程基础上接入真实 AI API。

未来流程可以是：

```text
用户输入链接或正文
→ 前端提交给 Serverless Function
→ Serverless Function 调用 DeepSeek API
→ DeepSeek 生成 Signal 草稿
→ 前端展示预览
→ 作者人工审核
→ 再决定是否加入内容库
```

DeepSeek API 不应该直接写在前端 React 代码里，因为前端代码会被浏览器加载，API Key 很容易暴露。更推荐用 Vercel Serverless Function 做中转，把 API Key 放在服务端环境变量里。

## 5. MVP 0.8：自动内容管线 / Auto Content Pipeline

“AI 自动去各个网站检索、挖取信息、更新网页”属于 MVP 0.8，不是 MVP 0.6。

未来自动内容更新可以这样设计：

```text
指定 AI 信息源
→ 定时抓取工具官网 / 官方 blog / 创意案例页 / AI 新闻源
→ 提取标题、正文、图片
→ AI 判断是否和视觉创作者相关
→ AI 生成 Signal
→ 人工审核
→ 写入数据库或内容文件
→ 网站更新
```

这个阶段会涉及：

- 后端服务
- 定时任务
- 抓取源管理
- AI API
- 数据库或内容文件更新机制
- 图片来源和版权处理
- 人工审核后台或审核流程

所以它应该在网站基本体验稳定之后再做。

## 6. 当前阶段暂时不做的内容

MVP 0.6 暂时不做：

- 不接入 DeepSeek
- 不接入任何 AI API
- 不开发后端
- 不自动抓取网页
- 不自动写入 JSON 文件
- 不做数据库
- 不做登录、收藏或审核后台

当前只验证“生成器流程”本身。

## 7. 人工审核仍然必须保留

即使未来接入 AI 自动生成 Signal，也不能直接让内容自动上线。

作者仍然需要检查：

- 来源是否真实可靠
- 链接是否可以访问
- 内容是否夸大
- 分类是否正确
- `project_ideas` 是否具体
- `prompt_hint` 是否可执行
- 是否适合视觉创作者和学生阅读
- 是否存在版权或误导风险

AI Creative Radar 的核心不是“自动生成大量内容”，而是把 AI 信息转译成对创作者真正有用的情报。
