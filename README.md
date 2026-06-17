# AI Creative Radar

中文名暂定：AI 视觉创意情报站 / AI 创意雷达

AI Creative Radar 是一个为视觉创作者提供 AI 工具趋势、创意案例、商业玩法和可落地灵感的赛博风 AI 情报站。

它不再是普通的 AI 新闻总结网站，而是面向视觉创作者的创意情报 Web App。产品关注 AI 视觉工具、影像创作、设计工具、数字时尚、虚拟人、AI 艺术案例、个人创作者商业化和小产品机会。

## MVP 核心流程

```text
资讯输入 -> AI 总结 -> 创意转译 -> 结构化数据 -> 网页展示
```

第一版先做网页 Web App，不做手机 App、小程序、用户登录、收藏、评论、会员或复杂后台。内容可以先手动录入，不要求完全自动抓取。

## 目标用户

- 视觉设计师
- 数字媒体艺术学生
- AI 视觉创作者
- 内容运营 / 新媒体运营
- 时尚、潮流、影像方向创作者
- 想用 AI 做作品集、接单、副业、小产品的人
- 想了解 AI 视觉前沿但不知道怎么落地的人

## 第一版用户能完成什么

- 浏览今日 AI 创意情报。
- 查看 AI 视觉、创意案例、潮流趋势和商业玩法相关内容。
- 按分类筛选内容。
- 点击 Signal Card 查看详情。
- 看到一条资讯可以怎么用。
- 获得项目灵感、Prompt 灵感或商业化灵感。
- 跳转原文链接。

## 内容分类

第一版使用 6 个固定分类：

- AI视觉工具
- 创意案例
- 潮流趋势
- 商业玩法
- 灵感Prompt
- 前沿观察

## 图片策略

AI Creative Radar 未来会承载大量 AI 视觉创意资讯，因此不适合每条内容都手动配图。

当前 MVP 阶段使用 CSS placeholder 作为默认视觉占位，并在数据中保留 `image`、`image_alt`、`image_mode` 字段。这样即使没有真实图片，页面也不会空白；后续也可以平滑升级到自动抓图或 AI 生图。

未来图片来源优先级：

1. 原文图片 article image：优先自动抓取资讯来源网页中的 `og:image`、封面图或文章首图。
2. AI 生成图片 generated image：如果原文没有合适图片，可以根据 `title`、`category`、`visual_tag`、`summary` 自动生成符合网站视觉风格的配图。
3. 分类占位图 category placeholder：如果没有原图，也暂时不生成图片，则使用当前分类化 CSS placeholder。
4. 人工精选图片 manual curated image：对于首页 Hero、Today's Signal、重点专题或特别重要的内容，可以由作者手动选择图片。

## 项目目录

```text
AI daily news/
├── README.md
├── package.json
├── index.html
├── public/
│   └── images/
├── src/
│   ├── components/
│   ├── data/
│   │   └── news-sample.json
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docs/
│   ├── PRD.md
│   ├── user-flow.md
│   ├── feature-list.md
│   └── content-structure.md
├── prompts/
│   └── news-summary-prompt.md
├── data/
│   └── news-sample.json
└── design/
    ├── visual-style-guide.md
    └── wireframe-notes.md
```

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## Vercel 部署建议

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`
- Install Command：`npm install`

## 推荐下一步

1. 部署到 Vercel。
2. 为 `public/images/` 补充真实图片。
3. 用真实 AI 工具更新、案例文章和项目介绍测试 `prompts/news-summary-prompt.md`。
4. 后续再考虑自动抓图、AI 生图或内容更新流程。
