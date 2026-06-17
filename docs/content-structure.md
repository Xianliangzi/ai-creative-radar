# Content Structure

## 1. 内容数据结构

第一版内容数据使用 JSON 文件维护。推荐文件位置：

```text
data/news-sample.json
```

虽然文件名仍保留 `news-sample.json`，但内容语义已经从普通新闻更新为 AI 创意情报 Signal。

## 2. 单条 Signal 字段

```json
{
  "id": "signal-001",
  "title": "标题",
  "signal": "一句话趋势判断",
  "summary": "发生了什么",
  "creator_value": "对视觉创作者有什么用",
  "project_ideas": ["项目方向 1", "项目方向 2", "项目方向 3"],
  "business_potential": "商业化可能",
  "target_reader": "适合谁关注",
  "category": "分类",
  "tools": ["工具 1", "工具 2"],
  "prompt_hint": "可参考的提示词方向",
  "source": "来源名称",
  "url": "原文链接",
  "date": "YYYY-MM-DD",
  "image": "图片地址",
  "image_alt": "图片描述",
  "image_mode": "cover",
  "visual_tag": ["cyber", "video"]
}
```

## 3. 字段说明

### id

唯一编号。建议使用 `signal-001`、`signal-002` 这类稳定格式。

### title

标题。要清楚说明工具、案例、趋势或商业玩法，不做夸张标题党。

### signal

一句话趋势判断。它不是普通摘要，而是告诉创作者“这条内容说明了什么机会”。

建议长度：30 到 70 个中文字符。

### summary

发生了什么。用新手能理解的语言说明资讯、工具更新、案例或项目背景。

### creator_value

对视觉创作者有什么用。重点说明它可以启发什么工作流、作品方向、内容形式或视觉实验。

### project_ideas

可以做成什么项目。数组格式，至少 3 个方向。

可包含：

- 作品集项目
- 短视频选题
- 视觉实验
- 海报或品牌视觉
- AI Lookbook
- 互动装置
- 模板产品
- 接单服务

### business_potential

商业化可能。判断是否适合接单、副业、内容账号、模板售卖、视觉服务、个人 IP 或小产品。

要求务实，不承诺收益。

### target_reader

适合谁关注。可以是一个或多个目标用户。

示例：

```text
视觉设计师、数字媒体艺术学生、AI 视觉创作者
```

### category

分类。只能使用以下 6 个值：

- AI视觉工具
- 创意案例
- 潮流趋势
- 商业玩法
- 灵感Prompt
- 前沿观察

### tools

相关工具数组。可以填写具体工具、模型、平台，也可以填写工作流相关软件。

示例：

```json
["Runway", "Midjourney", "After Effects"]
```

### prompt_hint

可参考的提示词方向。不是必须完整可复制，但要能给创作者明确创作方向。

### source

来源名称。

### url

原文链接。应使用完整 URL。

### date

日期。推荐使用 `YYYY-MM-DD` 格式。

### image

图片地址。当前可以为空，也可以使用本地路径或远程图片地址。

本地图片推荐放在：

```text
public/images/
```

示例：

```json
"/images/signal-001.jpg"
```

如果 `image` 为空，或图片加载失败，前端使用分类化 CSS placeholder 作为 fallback。

### image_alt

图片描述。用于无障碍文本和图片说明。

示例：

```text
AI 视频工具角色一致性视觉预览
```

### image_mode

图片展示方式。当前建议使用：

- `cover`：填满图片区域，适合封面图。
- `contain`：完整显示图片，适合截图、界面图或比例特殊的图。

### visual_tag

视觉风格标签数组，用于前端展示和后续筛选。

示例：

```json
["cyber", "fashion", "video", "3D", "design", "prompt", "business"]
```

## 4. 内容分类说明

### AI视觉工具

生图、视频、3D、设计、剪辑、视觉生成相关工具更新。

### 创意案例

AI 短片、AI 广告、AI MV、AI 时尚大片、艺术展览、品牌视觉案例。

### 潮流趋势

AI 艺术、数字时尚、虚拟人、Y2K、赛博视觉、数字身份、视觉风格趋势。

### 商业玩法

AI 接单、副业、内容账号、模板售卖、视觉服务、个人 IP、小商业模式。

### 灵感Prompt

可直接复用或改造的视觉提示词、创作方法、工作流。

### 前沿观察

新模型、新技术、YC / 前沿创业项目、AI 视觉艺术实验、未来趋势。

## 5. 内容风格要求

- 不要只总结新闻，要转译成创作者能用的灵感。
- 语言清楚、具体、可落地。
- 对 AI 初学者、视觉设计师、数字媒体学生友好。
- 不夸大、不标题党、不制造焦虑。
- 每条内容都回答：它能做什么、适合谁试、能不能变成项目或机会。

## 6. 图片策略

AI Creative Radar 未来会承载大量 AI 视觉创意资讯，因此不适合每条内容都手动配图。

当前 MVP 阶段先不做自动抓图和自动生图，只保留：

- `image` 字段
- `image_alt` 字段
- `image_mode` 字段
- CSS placeholder fallback

当前目标：

- 页面视觉结构完整。
- 没有图片也不会空白。
- 后续可以平滑升级到自动抓图或 AI 生图。

## 7. 未来图片来源优先级

### 1. 原文图片 article image

如果资讯来源网页中有 `og:image`、封面图或文章首图，优先自动抓取原文图片。

适用场景：

- 工具更新文章。
- 案例报道。
- 官方博客。
- 项目介绍页。

### 2. AI 生成图片 generated image

如果原文没有合适图片，可以根据 `title`、`category`、`visual_tag`、`summary` 自动生成一张符合网站视觉风格的配图。

生成时可以记录：

- `image_prompt`：生成提示词。
- `image_source_type`：`generated`。
- `image_credit`：生成模型或说明。

### 3. 分类占位图 category placeholder

如果没有原图，也暂时不生成图片，则使用当前的分类化 CSS placeholder，保证页面不会空白。

当前 placeholder 会根据分类产生不同视觉方向：

- AI视觉工具：工具面板、网格、屏幕。
- 创意案例：海报拼贴、画框、editorial layout。
- 潮流趋势：Y2K、波纹、人像轮廓、风格扫描。
- 商业玩法：票据、订单、小窗口、mini market。
- 灵感Prompt：文本框、prompt input、纸条。
- 前沿观察：雷达、实验图、future signal。

### 4. 人工精选图片 manual curated image

对于首页 Hero、Today's Signal、重点专题或特别重要的内容，可以由作者手动选择图片，以增强视觉表现。

## 8. 未来可扩展图片字段

未来每条 Signal 可以扩展以下字段：

- `image_source_type`：图片来源类型，例如 `article` / `generated` / `placeholder` / `manual`。
- `image_prompt`：如果是 AI 生成图片，记录生成提示词。
- `image_credit`：图片来源或版权说明。

扩展后的示例：

```json
{
  "image": "/images/signal-001.jpg",
  "image_alt": "AI 视频工具角色一致性视觉预览",
  "image_mode": "cover",
  "image_source_type": "manual",
  "image_prompt": "",
  "image_credit": "Curated by Xian"
}
```
