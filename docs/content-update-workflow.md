# AI Creative Radar 半自动内容更新流程

这份文档用于记录 AI Creative Radar 后续如何半自动更新一条新的 Signal。

当前项目还是个人 MVP，不需要复杂后台。每次更新可以先用“人工找来源 + AI 辅助整理 + 人工检查 + 手动更新 JSON”的方式完成。

## 1. 收集来源

先找到一个值得整理的 AI 创意相关来源。

可以来自：

- AI 工具官网
- 官方 Blog
- 产品更新页
- 创意案例文章
- 视觉趋势文章
- 创作者案例
- 商业玩法分析
- AI 设计、影像、时尚、3D、Prompt 相关内容

优先选择：

- 官方来源
- 工具发布页
- 可信媒体报道
- 有明确案例或作品展示的页面
- 对学生、视觉创作者、内容运营有启发的内容

## 2. 提取信息

把链接或文章内容交给 AI 阅读，提取以下信息：

- 发生了什么
- 对视觉创作者有什么价值
- 可以变成什么项目
- 是否有商业化可能
- 适合哪些人
- 可以用哪些工具
- 可以延伸出什么 Prompt

重点不是简单总结新闻，而是把信息转译成创作者可以使用的灵感。

## 3. 生成 Signal JSON

让 AI 按照现有 `src/data/news-sample.json` 的字段结构，生成一条新的 Signal。

每条 Signal 必须包含：

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

当前 `image` 可以先留空，页面会使用 CSS placeholder fallback。

## 4. 人工检查

AI 生成后，不要直接发布。作者需要人工检查：

- 链接是否真实可访问。
- 内容是否夸大。
- 分类是否正确。
- `prompt_hint` 是否可执行。
- `project_ideas` 是否具体。
- `source` 是否可信。
- `summary` 是否讲清楚发生了什么。
- `creator_value` 是否真的对视觉创作者有用。
- `business_potential` 是否务实，没有承诺收益。

如果内容太像营销号，需要改得更克制、更具体。

## 5. 更新数据

把检查后的新 Signal 粘贴进：

```text
src/data/news-sample.json
```

注意：

- 保持 JSON 合法。
- 注意逗号。
- 不要改字段名。
- 新 `id` 不要和已有 Signal 重复。

## 6. 本地检查

运行本地开发环境：

```powershell
npm.cmd run dev
```

检查：

- 首页是否正常打开。
- 新 Signal 是否出现在列表里。
- 分类筛选是否正常。
- Signal Detail 是否能打开。
- `OPEN SOURCE` 和 `COPY LINK` 是否正常。
- 没有图片时 placeholder 是否正常显示。

## 7. 提交上线

确认本地无问题后提交代码：

```powershell
git add .
git commit -m "Add new creative signal"
git push
```

## 8. Vercel 自动部署

推送到 GitHub 后，Vercel 会自动部署。

部署完成后检查线上页面：

```text
https://ai-creative-radar.vercel.app/
```

重点检查：

- 新内容是否显示。
- 手机端是否正常。
- 详情弹窗是否正常。
- 外部来源链接是否可以打开或复制。

## AI 生成 Signal 的 Prompt 模板

以后可以直接复制下面这段 Prompt 使用。

```text
你是 AI Creative Radar 的创意情报编辑。

AI Creative Radar 是一个面向视觉创作者、数字媒体艺术学生、设计师、内容运营和 AI 创意初学者的 AI 视觉创意情报站。

请阅读下面的 AI 工具官网、官方 Blog、创意案例、趋势文章或商业玩法内容，把它转译成一条适合放进 AI Creative Radar 的 Signal JSON。

不要只总结新闻，要回答：
1. 发生了什么？
2. 这对视觉创作者有什么用？
3. 可以变成什么作品集项目、内容选题或视觉实验？
4. 有没有接单、副业、模板售卖、小产品或内容账号的可能？
5. 适合哪些人关注？
6. 可以使用哪些工具？
7. 可以延伸出什么 Prompt 方向？

写作要求：
- 中文为主。
- 适合学生和视觉创作者阅读。
- 不要夸大，不要标题党。
- 不要写成商业新闻稿。
- project_ideas 至少给 2 到 3 个具体方向。
- business_potential 要务实，不要承诺收益。
- prompt_hint 要具体、可执行。
- category 只能从以下 6 个分类中选择一个：
  AI视觉工具、创意案例、潮流趋势、商业玩法、灵感Prompt、前沿观察
- image 当前可以留空。
- image_mode 使用 cover。
- 输出必须是合法 JSON，不要添加 Markdown 代码块，不要添加额外解释。

请使用以下字段结构：

{
  "id": "",
  "title": "",
  "signal": "",
  "summary": "",
  "creator_value": "",
  "project_ideas": [],
  "business_potential": "",
  "target_reader": "",
  "category": "",
  "tools": [],
  "prompt_hint": "",
  "source": "",
  "url": "",
  "date": "",
  "image": "",
  "image_alt": "",
  "image_mode": "cover",
  "visual_tag": []
}

待整理来源：
标题：
链接：
来源名称：
发布日期：
正文或摘录：
```

## 小提醒

这个流程的重点不是追求完全自动化，而是先让内容可以稳定更新。

对个人项目来说，比较现实的方式是：

```text
人工选题 -> AI 初稿 -> 人工判断 -> 手动更新 -> 自动部署
```

这样既能提高效率，也能保留作者自己的判断和审美。
