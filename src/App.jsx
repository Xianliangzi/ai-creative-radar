import React, { useMemo, useState } from 'react'
import AboutSection from './components/AboutSection.jsx'
import Header from './components/Header.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import SignalDetail from './components/SignalDetail.jsx'
import SignalImage from './components/SignalImage.jsx'
import SignalCard from './components/SignalCard.jsx'
import QuickGuide from './components/QuickGuide.jsx'
import TodaysSignal from './components/TodaysSignal.jsx'
import signals from './data/news-sample.json'

const categories = [
  'All',
  'AI视觉工具',
  '创意案例',
  '潮流趋势',
  '商业玩法',
  '灵感Prompt',
  '前沿观察',
]

const planKeywords = ['数字人', 'AI 视频', '作品集', '海报', '小红书 AI 账号', '虚拟人', 'Midjourney', 'Runway']

const futureAbilities = [
  {
    title: '继续和 AI 聊',
    label: 'Chat Next',
    description: '围绕当前方案继续追问，让 AI 帮你细化主题、工具、执行步骤和内容方向。',
    button: '继续完善方案',
  },
  {
    title: '生成完整方案文档',
    label: 'Plan Document',
    description: '把对话内容整理成完整方案，可包含文字方案、执行步骤、结构图、PPT 大纲或思维导图。',
    button: '生成方案文档',
  },
  {
    title: '保存到我的方案库',
    label: 'Save Plan',
    description: '登录后可以保存方案卡片，之后继续编辑、下载或导出。',
    button: '保存到方案库',
  },
]

const libraryFeatures = [
  '保存方案卡片',
  '继续编辑方案',
  '下载方案文档',
  '导出 PPT 大纲',
  '生成思维导图',
  '管理历史方案',
]

const searchableFields = [
  'title',
  'signal',
  'summary',
  'creator_value',
  'project_ideas',
  'business_potential',
  'target_reader',
  'category',
  'tools',
  'prompt_hint',
  'source',
  'visual_tag',
]

function getSearchText(signal) {
  return searchableFields
    .flatMap((field) => {
      const value = signal[field]
      return Array.isArray(value) ? value : [value]
    })
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))]
}

function truncateText(text, maxLength = 42) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function buildPlanSummary(results) {
  return {
    tools: uniqueItems(results.flatMap((signal) => signal.tools || [])).slice(0, 7),
    titles: results.map((signal) => signal.title).slice(0, 4),
    ideas: results
      .flatMap((signal) => signal.project_ideas || [])
      .map((idea) => truncateText(idea, 40))
      .slice(0, 3),
    prompts: results
      .map((signal) => signal.prompt_hint)
      .filter(Boolean)
      .map((hint) => truncateText(hint, 62))
      .slice(0, 2),
    business: results
      .map((signal) => signal.business_potential)
      .filter(Boolean)
      .map((item) => truncateText(item, 54))
      .slice(0, 2),
  }
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [planQuery, setPlanQuery] = useState('')
  const todaysSignal = signals[0]

  const feedSignals = useMemo(
    () =>
      signals.filter((signal) => activeCategory === 'All' || signal.category === activeCategory),
    [activeCategory],
  )

  const planResults = useMemo(() => {
    const normalizedQuery = planQuery.trim().toLowerCase()
    if (!normalizedQuery) return []

    return signals.filter((signal) => getSearchText(signal).includes(normalizedQuery))
  }, [planQuery])

  const hasPlanQuery = planQuery.trim().length > 0
  const planSummary = useMemo(
    () => (hasPlanQuery && planResults.length > 0 ? buildPlanSummary(planResults) : null),
    [hasPlanQuery, planResults],
  )

  return (
    <main className="app-shell">
      <div className="noise-layer" aria-hidden="true" />
      <section className="browser-frame" id="home" aria-label="AI Creative Radar Home">
        <Header />

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">AI 创意情报与方案工具 / creative radar</p>
            <h1>AI Creative Radar</h1>
            <p className="subtitle">一个面向视觉创作者的 AI 创意情报与方案工具</p>
            <p className="intro-copy">
              浏览最新 AI 工具、案例和趋势；输入你的创意方向，获得工具推荐、案例参考、Prompt 灵感和可落地方案。
            </p>
            <div className="primary-actions three-actions" aria-label="Primary actions">
              <a href="#news-feed" className="primary-action-card">
                <small>AI News Feed</small>
                <strong>看 AI 资讯</strong>
                <span>浏览最新 AI 工具、创意案例、趋势观察和商业玩法。</span>
              </a>
              <a href="#plan-consult" className="primary-action-card">
                <small>Creative Plan Assistant</small>
                <strong>做创意方案</strong>
                <span>输入方向，获得工具、案例、Prompt 灵感和下一步建议。</span>
              </a>
              <a href="#plan-library" className="primary-action-card secondary-action">
                <small>My Plan Library</small>
                <strong>我的方案库</strong>
                <span>即将开放：保存、继续编辑和导出完整方案。</span>
              </a>
            </div>
            <div className="hero-status-grid" aria-label="Radar status">
              <span>在线更新 / Online</span>
              <span>Archive 008</span>
              <span>最近扫描 {todaysSignal.date}</span>
            </div>
            <div className="personal-file-strip" aria-label="Personal project notes">
              <span>AI 资讯流</span>
              <span>AI 创意方案咨询</span>
              <span>我的方案库 / 即将开放</span>
            </div>
          </div>
          <div className="visual-panel" aria-label="Visual archive placeholder">
            <div className="visual-panel-inner">
              <div className="visual-panel-top">
                <span>AI EYE</span>
                <span>PRQ</span>
              </div>
              <SignalImage signal={todaysSignal} variant="hero" label="CREATIVE FEED" />
              <div className="archive-stamps" aria-hidden="true">
                <span>NEWS</span>
                <span>PLAN</span>
                <span>LIB</span>
              </div>
              <strong>VISUAL ARCHIVE</strong>
              <small>AI SIGNALS / CREATIVE PLANS</small>
            </div>
          </div>
        </div>

        <TodaysSignal signal={todaysSignal} />

        <QuickGuide />

        <section className="plan-consult" id="plan-consult" aria-labelledby="plan-consult-title">
          <div className="section-title">
            <span>
              <strong id="plan-consult-title">AI 创意方案咨询</strong>
              <small>Creative Plan Assistant</small>
            </span>
            <span>local match</span>
          </div>
          <p className="search-description">
            输入你想做的方向，系统会基于已有 AI 资讯，为你整理工具、案例、Prompt 灵感、商业玩法和下一步建议。
          </p>
          <label className="search-field">
            <span>
              创意方向
              <small>Idea Keyword</small>
            </span>
            <input
              type="search"
              value={planQuery}
              onChange={(event) => setPlanQuery(event.target.value)}
              placeholder="例如：我想做数字人 / AI 视频作品集 / 小红书 AI 账号 / 海报视觉实验..."
            />
          </label>
          <div className="quick-keywords" aria-label="Creative plan quick keywords">
            {planKeywords.map((keyword) => (
              <button key={keyword} type="button" onClick={() => setPlanQuery(keyword)}>
                {keyword}
              </button>
            ))}
          </div>

          {hasPlanQuery && planResults.length > 0 && planSummary && (
            <section className="initial-plan" aria-label="Initial plan summary">
              <div className="section-title">
                <span>
                  <strong>初步方案总结</strong>
                  <small>Initial Plan Summary</small>
                </span>
                <span>{planResults.length} 条参考情报</span>
              </div>
              <div className="initial-plan-body">
                <p>根据当前情报库，以下内容可以作为你这个方向的初步参考。</p>
                <div className="plan-summary-grid">
                  <div>
                    <strong>推荐工具</strong>
                    <p>{planSummary.tools.length ? planSummary.tools.join(' / ') : '暂无明确工具'}</p>
                  </div>
                  <div>
                    <strong>相关案例 / 情报</strong>
                    <ul>
                      {planSummary.titles.map((title) => (
                        <li key={title}>{title}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>可落地方向</strong>
                    <ul>
                      {planSummary.ideas.map((idea) => (
                        <li key={idea}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Prompt 灵感</strong>
                    <ul>
                      {planSummary.prompts.map((prompt) => (
                        <li key={prompt}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>商业玩法</strong>
                    <ul>
                      {planSummary.business.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>下一步建议</strong>
                    <p>
                      你可以先选择一个工具和一个落地方向，做一个小型视觉实验或作品集项目。未来这里会支持继续和 AI
                      对话，帮助你把想法整理成完整方案。
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {hasPlanQuery && planResults.length === 0 && (
            <div className="search-result-status is-empty in-panel">
              <span>暂时没有匹配到方案</span>
              <small>可以换一个关键词试试，例如 AI 视频、作品集、海报、虚拟人、Runway、Midjourney。</small>
            </div>
          )}

          <section className="coming-next" aria-label="Coming next abilities">
            <div className="section-title">
              <span>
                <strong>下一阶段能力</strong>
                <small>Coming Next</small>
              </span>
              <span>即将开放</span>
            </div>
            <div className="future-grid">
              {futureAbilities.map((ability) => (
                <article className="future-card" key={ability.title}>
                  <small>{ability.label}</small>
                  <h3>{ability.title}</h3>
                  <p>{ability.description}</p>
                  <button type="button" disabled>
                    {ability.button}
                  </button>
                  <span>即将开放</span>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="feed-section" id="news-feed" aria-labelledby="news-feed-title">
          <div className="section-title">
            <span>
              <strong id="news-feed-title">AI 资讯流</strong>
              <small>AI News Feed</small>
            </span>
            <span>{feedSignals.length} 条情报</span>
          </div>
          <p className="feed-description">
            浏览近期 AI 工具、创意案例、趋势观察和商业玩法。点击卡片可以查看摘要、来源链接和创作者可用信息。
          </p>

          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />

          <section className="signal-grid" id="signals" aria-label="Signal Card list">
            {feedSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} onOpen={() => setSelectedSignal(signal)} />
            ))}
          </section>
        </section>

        <section className="plan-library" id="plan-library" aria-labelledby="plan-library-title">
          <div className="section-title">
            <span>
              <strong id="plan-library-title">我的方案库</strong>
              <small>My Plan Library</small>
            </span>
            <span>即将开放</span>
          </div>
          <div className="library-body">
            <article className="library-status-card">
              <h3>方案库即将开放</h3>
              <p>未来你可以把 AI 帮你整理好的完整方案保存到个人账户，并导出为文档、PPT 大纲、思维导图或执行计划。</p>
            </article>
            <div className="library-feature-list">
              {libraryFeatures.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
          </div>
        </section>

        <AboutSection />
      </section>

      {selectedSignal && (
        <SignalDetail signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      )}
    </main>
  )
}

export default App
