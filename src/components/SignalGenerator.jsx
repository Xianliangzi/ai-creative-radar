import { useMemo, useState } from 'react'

const templateOptions = [
  { id: 'tool', label: 'AI Tool', category: 'AI视觉工具' },
  { id: 'case', label: 'Creative Case', category: '创意案例' },
  { id: 'trend', label: 'Trend', category: '潮流趋势' },
  { id: 'business', label: 'Business', category: '商业玩法' },
]

const templateCopy = {
  tool: {
    title: (keyword) => `${keyword} 可以成为视觉作品集的实验入口`,
    signal: (keyword) => `${keyword} 的价值不只在工具更新，而在于帮助创作者更快验证视觉风格和动态概念。`,
    summary: (keyword) =>
      `这是一条基于「${keyword}」生成的 mock Signal，用来模拟 AI 工具链接或关键词被转译成创意情报后的样子。`,
    creator_value:
      '适合用来整理工具能力、拆解适合练习的视觉方向，并快速判断它能不能放进作品集或日常创作流程。',
    project_ideas: [
      '做一组同主题海报或视觉实验，测试不同 Prompt 风格的控制力。',
      '制作 15-30 秒 AI 视觉短片，把工具能力转成动态作品集素材。',
      '整理一篇工具体验笔记，记录输入、输出和可复用工作流。',
    ],
    business_potential:
      '适合先作为作品集实验和内容账号选题；如果流程稳定，可以延展成视觉模板、短片预演或品牌 moodboard 服务。',
    target_reader: '视觉设计师 / 数字媒体学生 / AI 视觉创作者',
    tools: (keyword) => [keyword, 'Runway', 'Midjourney', 'Krea'],
    prompt_hint: (keyword) =>
      `${keyword}, retro cyber visual archive, dark sage green interface, portfolio experiment, clear composition`,
    visual_tag: ['tool', 'workflow', 'portfolio'],
  },
  case: {
    title: (keyword) => `${keyword} 可以被拆成一个 AI 创意案例档案`,
    signal: (keyword) => `创意案例的重点不是复刻 ${keyword}，而是提取它的视觉策略、叙事结构和可迁移方法。`,
    summary: (keyword) =>
      `这是一条围绕「${keyword}」生成的 mock 案例 Signal，用来展示 AI 广告、AI MV、AI fashion 或艺术案例如何被转译。`,
    creator_value:
      '帮助创作者从案例中提取构图、节奏、媒介组合和视觉语言，而不是只停留在“这个案例很酷”。',
    project_ideas: [
      '做一页案例拆解板，分析画面、工具、节奏和受众。',
      '选择其中一种视觉语言，改造成个人主题的短片或海报系列。',
      '把案例方法转成作品集项目说明，强调创作过程和设计判断。',
    ],
    business_potential:
      '适合做内容账号案例分析、作品集研究页，也可以发展成品牌视觉参考库或创意提案服务。',
    target_reader: '内容运营 / 视觉创作者 / 数字媒体艺术学生',
    tools: (keyword) => [keyword, 'Runway', 'Midjourney', 'Photoshop'],
    prompt_hint: (keyword) =>
      `case study inspired by ${keyword}, editorial collage, AI fashion film mood, visual breakdown board`,
    visual_tag: ['case', 'collage', 'editorial'],
  },
  trend: {
    title: (keyword) => `${keyword} 正在变成可以持续观察的视觉趋势`,
    signal: (keyword) => `${keyword} 适合被整理成趋势板：它可能影响内容选题、作品集方向和视觉风格实验。`,
    summary: (keyword) =>
      `这是一条围绕「${keyword}」生成的 mock 趋势 Signal，用来模拟 AI fashion、Y2K、虚拟人或数字身份趋势观察。`,
    creator_value:
      '帮助创作者把零散的风格信息整理成趋势语言，形成自己的参考库、选题库和视觉实验方向。',
    project_ideas: [
      '制作一组趋势 moodboard，标注色彩、材质、构图和关键词。',
      '把趋势改造成小红书/视频号内容选题，持续更新观察笔记。',
      '以趋势为主题做一个虚拟品牌、虚拟人物或视觉档案页。',
    ],
    business_potential:
      '适合做内容账号、趋势报告、品牌视觉参考，也适合发展成面向同学或小团队的灵感库产品。',
    target_reader: '时尚潮流创作者 / 内容运营 / 视觉设计学生',
    tools: (keyword) => [keyword, 'Pinterest', 'Midjourney', 'Figma'],
    prompt_hint: (keyword) =>
      `${keyword}, Y2K cyber zine, digital fashion archive, old web visual board, trend research layout`,
    visual_tag: ['trend', 'style', 'archive'],
  },
  business: {
    title: (keyword) => `${keyword} 可以被包装成一个轻量 AI 创意服务`,
    signal: (keyword) => `${keyword} 的重点是把能力产品化：从一次练习变成模板、服务、账号或小项目。`,
    summary: (keyword) =>
      `这是一条围绕「${keyword}」生成的 mock 商业玩法 Signal，用来测试 AI 接单、副业、模板售卖或内容服务的表达方式。`,
    creator_value:
      '帮助创作者从“我会用一个工具”转向“我能提供一个清楚的小服务”，更容易整理报价、案例和交付方式。',
    project_ideas: [
      '设计一个 AI 视觉模板包，例如封面、海报、头像或品牌 moodboard。',
      '做一个内容账号栏目，持续输出工具玩法、案例拆解和接单流程。',
      '把作品集中的某类视觉能力包装成小型服务页面。',
    ],
    business_potential:
      '适合尝试模板售卖、接单服务、内容账号和作品集服务化，但需要人工审核质量和版权边界。',
    target_reader: '个人创作者 / 内容运营 / 想尝试 AI 副业的人',
    tools: (keyword) => [keyword, 'Canva', 'Figma', 'Notion'],
    prompt_hint: (keyword) =>
      `${keyword}, tiny creative business, service package, retro web catalog, creator portfolio offer`,
    visual_tag: ['business', 'template', 'service'],
  },
}

function normalizeInput(value) {
  const trimmed = value.trim()
  return trimmed || 'AI creative signal'
}

function isHttpsUrl(value) {
  return /^https:\/\//i.test(value.trim())
}

function SignalGenerator({ onAddSignal }) {
  const [inputValue, setInputValue] = useState('')
  const [activeTemplate, setActiveTemplate] = useState('tool')
  const [draftSignal, setDraftSignal] = useState(null)
  const [addStatus, setAddStatus] = useState('idle')

  const activeOption = useMemo(
    () => templateOptions.find((option) => option.id === activeTemplate) || templateOptions[0],
    [activeTemplate],
  )

  const generateSignal = () => {
    const keyword = normalizeInput(inputValue)
    const template = templateCopy[activeTemplate]
    const hasUrl = isHttpsUrl(inputValue)
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const id = `draft-${now.getTime()}`

    setDraftSignal({
      id,
      title: template.title(keyword),
      signal: template.signal(keyword),
      summary: template.summary(keyword),
      creator_value: template.creator_value,
      project_ideas: template.project_ideas,
      business_potential: template.business_potential,
      target_reader: template.target_reader,
      category: activeOption.category,
      tools: template.tools(keyword),
      prompt_hint: template.prompt_hint(keyword),
      source: hasUrl ? 'User submitted source' : 'Manual keyword draft',
      url: hasUrl ? inputValue.trim() : '',
      date,
      visual_tag: template.visual_tag,
      image: '',
      image_alt: `${activeOption.label} mock signal preview`,
      image_mode: 'cover',
    })
    setAddStatus('idle')
  }

  const addToLibrary = () => {
    if (!draftSignal) return
    console.log('Generated mock signal:', draftSignal)
    onAddSignal?.(draftSignal)
    setAddStatus('added')
    window.setTimeout(() => setAddStatus('idle'), 1500)
  }

  return (
    <section className="generator-panel" aria-label="Signal Generator">
      <div className="section-title">
        <span>SIGNAL GENERATOR / 生成一条创意情报</span>
        <span>MVP 0.6 mock only</span>
      </div>

      <div className="generator-body">
        <div className="generator-machine">
          <label className="generator-input">
            <span>source / keyword</span>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="输入 AI 工具链接 / 文章链接 / 关键词..."
            />
          </label>

          <div className="template-switcher" aria-label="Signal template">
            {templateOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={option.id === activeTemplate ? 'is-active' : ''}
                onClick={() => setActiveTemplate(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button className="generate-button" type="button" onClick={generateSignal}>
            GENERATE SIGNAL
          </button>
        </div>

        <div className="draft-preview" aria-live="polite">
          <div className="draft-titlebar">
            <span>DRAFT SIGNAL PREVIEW</span>
            <span>{draftSignal ? draftSignal.category : 'waiting'}</span>
          </div>

          {draftSignal ? (
            <div className="draft-content">
              <h2>{draftSignal.title}</h2>
              <p className="draft-signal">{draftSignal.signal}</p>

              <div className="draft-grid">
                <div>
                  <span className="draft-label">summary</span>
                  <p>{draftSignal.summary}</p>
                </div>
                <div>
                  <span className="draft-label">creator value</span>
                  <p>{draftSignal.creator_value}</p>
                </div>
                <div>
                  <span className="draft-label">business potential</span>
                  <p>{draftSignal.business_potential}</p>
                </div>
                <div>
                  <span className="draft-label">target reader</span>
                  <p>{draftSignal.target_reader}</p>
                </div>
              </div>

              <div className="draft-list-block">
                <span className="draft-label">project ideas</span>
                <ol>
                  {draftSignal.project_ideas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ol>
              </div>

              <div className="draft-list-block">
                <span className="draft-label">prompt hint</span>
                <p>{draftSignal.prompt_hint}</p>
              </div>

              <div className="draft-chip-row">
                {draftSignal.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
              <div className="draft-chip-row muted">
                {draftSignal.visual_tag.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="draft-source-line">
                <span>source: {draftSignal.source}</span>
                <span>url: {draftSignal.url || 'Not available'}</span>
              </div>

              <button className="add-library-button" type="button" onClick={addToLibrary}>
                {addStatus === 'added' ? 'ADDED TEMPORARILY' : 'ADD TO LIBRARY'}
              </button>
            </div>
          ) : (
            <div className="draft-empty">
              <strong>NO DRAFT YET</strong>
              <p>输入一个工具名、文章链接或创意关键词，再生成一条 mock Signal 草稿。</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SignalGenerator
