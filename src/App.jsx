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

const postPlanActions = ['生成完整方案文档', '保存到我的方案库', '下载为文档', '导出 PPT 大纲', '生成思维导图']

const libraryFeatures = [
  '查询历史方案',
  '继续编辑方案',
  '下载方案文档',
  '导出 PPT 大纲',
  '生成思维导图',
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
    relatedSignals: results.slice(0, 4),
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

function formatList(items, fallback = '暂无明确内容') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${fallback}`
}

function buildInitialPlanText(query, summary) {
  const nextStep =
    '你可以先选择一个工具和一个落地方向，做一个小型视觉实验或作品集项目。未来这里会支持继续和 AI 对话，帮助你把想法整理成完整方案。'

  return [
    'AI Creative Radar｜初步方案',
    '',
    `创意方向：${query}`,
    '',
    '推荐工具：',
    formatList(summary.tools, '暂无明确工具'),
    '',
    '相关案例 / 情报：',
    formatList(summary.relatedSignals.map((signal) => signal.title)),
    '',
    '可落地方向：',
    formatList(summary.ideas),
    '',
    'Prompt 灵感：',
    formatList(summary.prompts),
    '',
    '商业玩法：',
    formatList(summary.business),
    '',
    '下一步建议：',
    nextStep,
  ].join('\n')
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [planQuery, setPlanQuery] = useState('')
  const [submittedPlanQuery, setSubmittedPlanQuery] = useState('')
  const [planCopyStatus, setPlanCopyStatus] = useState('idle')
  const todaysSignal = signals[0]

  const feedSignals = useMemo(
    () =>
      signals.filter((signal) => activeCategory === 'All' || signal.category === activeCategory),
    [activeCategory],
  )

  const planResults = useMemo(() => {
    const normalizedQuery = submittedPlanQuery.trim().toLowerCase()
    if (!normalizedQuery) return []

    return signals.filter((signal) => getSearchText(signal).includes(normalizedQuery))
  }, [submittedPlanQuery])

  const hasPlanQuery = submittedPlanQuery.trim().length > 0
  const planSummary = useMemo(
    () => (hasPlanQuery && planResults.length > 0 ? buildPlanSummary(planResults) : null),
    [hasPlanQuery, planResults],
  )

  const generateInitialPlan = () => {
    const nextQuery = planQuery.trim()
    if (!nextQuery) return
    setSubmittedPlanQuery(nextQuery)
    setPlanCopyStatus('idle')
  }

  const choosePlanKeyword = (keyword) => {
    setPlanQuery(keyword)
    setSubmittedPlanQuery(keyword)
    setPlanCopyStatus('idle')
  }

  const copyInitialPlan = async () => {
    if (!planSummary) return

    try {
      await navigator.clipboard.writeText(buildInitialPlanText(submittedPlanQuery, planSummary))
      setPlanCopyStatus('copied')
    } catch (error) {
      setPlanCopyStatus('failed')
    }

    window.setTimeout(() => {
      setPlanCopyStatus('idle')
    }, 1500)
  }

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
          <div className="consult-entry-grid">
            <div className="consult-input-card">
              <h3>你想做什么？</h3>
              <p>
                当前会基于已有 AI 资讯进行本地匹配，整理工具、案例、Prompt 灵感和商业玩法。
              </p>
              <label className="search-field">
                <span>
                  创意方向
                  <small>Idea Keyword</small>
                </span>
                <input
                  type="search"
                  value={planQuery}
                  onChange={(event) => {
                    setPlanQuery(event.target.value)
                    setSubmittedPlanQuery('')
                    setPlanCopyStatus('idle')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      generateInitialPlan()
                    }
                  }}
                  placeholder="例如：我想做一个数字人作品集项目 / AI 视频短片 / 小红书 AI 账号..."
                />
              </label>
              <button
                className="plan-generate-button"
                type="button"
                onClick={generateInitialPlan}
                disabled={!planQuery.trim()}
              >
                生成初步方案
              </button>
              <div className="quick-keywords" aria-label="Creative plan quick keywords">
                {planKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className={submittedPlanQuery === keyword ? 'is-active' : ''}
                    onClick={() => choosePlanKeyword(keyword)}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            <aside className="history-entry-card" aria-label="History plan placeholder">
              <small>Plan History</small>
              <h3>查看历史方案</h3>
              <p>未来登录后可以查看你保存过的完整方案。</p>
              <button type="button" disabled>
                即将开放
              </button>
            </aside>
          </div>

          {hasPlanQuery && planResults.length > 0 && planSummary && (
            <section className="initial-plan" aria-label="Initial plan summary">
              <div className="section-title">
                <span>
                  <strong>初步方案结果</strong>
                  <small>Initial Plan Result</small>
                </span>
                <span>{planResults.length} 条参考情报</span>
              </div>
              <div className="initial-plan-body">
                <p>这是根据现有 AI 资讯整理出的初步方向，不是最终完整方案。</p>
                <p>根据当前情报库，以下内容可以作为你这个方向的初步参考。</p>
                <div className="plan-summary-grid">
                  <div>
                    <strong>推荐工具</strong>
                    <p>{planSummary.tools.length ? planSummary.tools.join(' / ') : '暂无明确工具'}</p>
                  </div>
                  <div>
                    <strong>相关案例 / 情报</strong>
                    <ul className="plan-related-list">
                      {planSummary.relatedSignals.map((signal) => (
                        <li key={signal.id}>
                          <button
                            className="plan-signal-button"
                            type="button"
                            onClick={() => setSelectedSignal(signal)}
                          >
                            {signal.title}
                          </button>
                        </li>
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
                <div className="plan-copy-row">
                  <button className="plan-copy-button" type="button" onClick={copyInitialPlan}>
                    {planCopyStatus === 'copied'
                      ? '已复制方案'
                      : planCopyStatus === 'failed'
                        ? '复制失败'
                        : '复制初步方案'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {hasPlanQuery && planResults.length === 0 && (
            <div className="search-result-status is-empty in-panel">
              <span>暂时没有匹配到相关方案，可以换一个关键词试试。</span>
              <small>例如 AI 视频、作品集、海报、虚拟人、Runway、Midjourney。</small>
            </div>
          )}

          {hasPlanQuery && planResults.length > 0 && (
          <section className="coming-next next-refine-panel" aria-label="Next refine with AI">
            <div className="section-title">
              <span>
                <strong>下一步：继续完善方案</strong>
                <small>Next: Refine with AI</small>
              </span>
              <span>即将开放</span>
            </div>
            <div className="next-refine-body">
              <p>
                未来你可以围绕当前初步方案继续和 AI 对话，让 AI 帮你细化主题、工具链、执行步骤、内容方向和输出形式。
              </p>
              <button type="button" disabled>
                继续和 AI 完善方案
              </button>
              <span>即将开放</span>
              <div className="post-plan-actions">
                <strong>完善后可以做什么？</strong>
                <p>这些能力将在后续版本开放。</p>
                <div>
                  {postPlanActions.map((action) => (
                    <small key={action}>{action}</small>
                  ))}
                </div>
              </div>
            </div>
          </section>
          )}
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
              <h3>历史方案查询即将开放</h3>
              <p>这里未来会保存你通过 AI 咨询整理出的完整方案。你可以在这里查询历史方案、继续编辑、下载或导出。</p>
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
