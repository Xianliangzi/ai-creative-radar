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

const modeTabs = [
  {
    id: 'news',
    title: 'AI 资讯',
    label: 'AI News',
    description: '浏览工具、案例和趋势',
  },
  {
    id: 'plan',
    title: '创意方案',
    label: 'Creative Plan',
    description: '输入想法，生成初步方案',
  },
  {
    id: 'library',
    title: '我的方案',
    label: 'My Plans',
    description: '查询历史方案，即将开放',
  },
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

const planKeywordBank = [
  '数字人',
  '虚拟人',
  'AI 视频',
  'AI短片',
  '短片',
  '作品集',
  '海报',
  '小红书',
  'AI 账号',
  '商业玩法',
  '模板',
  'Prompt',
  'Midjourney',
  'Runway',
  'Pika',
  'HeyGen',
  'D-ID',
  'Canva',
  'Krea',
  'Figma',
  'Spline',
  'MV',
  '音乐视觉',
  'lookbook',
  '3D',
  '互动作品集',
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

function extractPlanKeywords(query) {
  const normalizedQuery = query.trim().toLowerCase()
  const compactQuery = normalizedQuery.replace(/\s+/g, '')
  if (!normalizedQuery) return []

  const presetKeywords = planKeywordBank.filter((keyword) => {
    const normalizedKeyword = keyword.toLowerCase()
    const compactKeyword = normalizedKeyword.replace(/\s+/g, '')

    return normalizedQuery.includes(normalizedKeyword) || compactQuery.includes(compactKeyword)
  })

  const fallbackKeywords = normalizedQuery
      .split(/[\s,，.。;；:：、/|｜!?！？'"“”‘’（）()【】\[\]{}<>《》]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 1)

  return uniqueItems([
    ...presetKeywords.map((keyword) => keyword.toLowerCase()),
    ...fallbackKeywords,
  ])
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
    overview: '根据当前情报库，以下内容可以作为你这个方向的初步参考。',
    tools: uniqueItems(results.flatMap((signal) => signal.tools || [])).slice(0, 7),
    relatedCases: results.slice(0, 4).map((signal) => ({
      title: signal.title,
      signal,
    })),
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
    nextSteps: [
      '你可以先选择一个工具和一个落地方向，做一个小型视觉实验或作品集项目。',
      '未来这里会支持继续和 AI 对话，帮助你把想法整理成完整方案。',
    ],
  }
}

function buildApiPlanSummary(plan, matchedSignals) {
  const relatedCases = Array.isArray(plan.related_cases) ? plan.related_cases : []

  return {
    overview: plan.overview || '这是 AI 接口测试返回的初步方案概括。',
    tools: Array.isArray(plan.recommended_tools) ? plan.recommended_tools : [],
    relatedCases: relatedCases.map((title) => {
      const matchedSignal = matchedSignals.find((signal) => signal.title === title)

      return {
        title,
        signal: matchedSignal || null,
      }
    }),
    ideas: Array.isArray(plan.directions) ? plan.directions : [],
    prompts: Array.isArray(plan.prompt_ideas) ? plan.prompt_ideas : [],
    business: Array.isArray(plan.business_ideas) ? plan.business_ideas : [],
    nextSteps: Array.isArray(plan.next_steps) ? plan.next_steps : [],
  }
}

function formatList(items, fallback = '暂无明确内容') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${fallback}`
}

function buildInitialPlanText(query, summary, sourceLabel) {
  return [
    'AI Creative Radar｜初步方案',
    '',
    `创意方向：${query}`,
    `方案来源：${sourceLabel}`,
    '',
    '方案概括：',
    summary.overview || '暂无明确概括',
    '',
    '推荐工具：',
    formatList(summary.tools, '暂无明确工具'),
    '',
    '相关案例 / 情报：',
    formatList(summary.relatedCases.map((item) => item.title)),
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
    formatList(summary.nextSteps),
  ].join('\n')
}

function getPlanSourceLabel(source) {
  if (source === 'ai') return 'AI 生成'
  if (source === 'ai-text') return 'AI 文本结果'
  return '本地匹配'
}

function findPlanMatches(query) {
  const keywords = extractPlanKeywords(query)
  if (keywords.length === 0) return []

  return signals.filter((signal) => {
    const searchText = getSearchText(signal)
    return keywords.some((keyword) => searchText.includes(keyword))
  })
}

function App() {
  const [activeMode, setActiveMode] = useState('news')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [planQuery, setPlanQuery] = useState('')
  const [submittedPlanQuery, setSubmittedPlanQuery] = useState('')
  const [planCopyStatus, setPlanCopyStatus] = useState('idle')
  const [apiPlanSummary, setApiPlanSummary] = useState(null)
  const [planSource, setPlanSource] = useState('local')
  const [isPlanLoading, setIsPlanLoading] = useState(false)
  const [planApiError, setPlanApiError] = useState(false)
  const todaysSignal = signals[0]

  const feedSignals = useMemo(
    () =>
      signals.filter((signal) => activeCategory === 'All' || signal.category === activeCategory),
    [activeCategory],
  )

  const planResults = useMemo(() => {
    return findPlanMatches(submittedPlanQuery)
  }, [submittedPlanQuery])

  const hasPlanQuery = submittedPlanQuery.trim().length > 0
  const localPlanSummary = useMemo(
    () => (hasPlanQuery && planResults.length > 0 ? buildPlanSummary(planResults) : null),
    [hasPlanQuery, planResults],
  )
  const planSummary = apiPlanSummary || localPlanSummary
  const planSourceLabel = getPlanSourceLabel(planSource)

  const generatePlanForQuery = async (query) => {
    if (isPlanLoading) return

    const nextQuery = query.trim()
    if (!nextQuery) return

    const matchedSignalsForPlan = findPlanMatches(nextQuery)

    setSubmittedPlanQuery(nextQuery)
    setApiPlanSummary(null)
    setPlanSource('local')
    setPlanApiError(false)
    setPlanCopyStatus('idle')

    setIsPlanLoading(true)

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: nextQuery,
          matchedSignals: matchedSignalsForPlan,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success || !data.plan) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setApiPlanSummary(buildApiPlanSummary(data.plan, matchedSignalsForPlan))
      setPlanSource(data.source === 'ai-text' ? 'ai-text' : 'ai')
    } catch (error) {
      setApiPlanSummary(null)
      setPlanSource('local')
      setPlanApiError(matchedSignalsForPlan.length > 0)
    } finally {
      setIsPlanLoading(false)
    }
  }

  const generateInitialPlan = () => {
    generatePlanForQuery(planQuery)
  }

  const choosePlanKeyword = (keyword) => {
    setPlanQuery(keyword)
    generatePlanForQuery(keyword)
  }

  const copyInitialPlan = async () => {
    if (!planSummary) return

    try {
      await navigator.clipboard.writeText(
        buildInitialPlanText(submittedPlanQuery, planSummary, planSourceLabel),
      )
      setPlanCopyStatus('copied')
    } catch (error) {
      setPlanCopyStatus('failed')
    }

    window.setTimeout(() => {
      setPlanCopyStatus('idle')
    }, 1500)
  }

  const selectMode = (mode) => {
    setActiveMode(mode)

    window.setTimeout(() => {
      document.getElementById('main-functions')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  return (
    <main className="app-shell">
      <div className="noise-layer" aria-hidden="true" />
      <section className="browser-frame" id="home" aria-label="AI Creative Radar Home">
        <Header activeMode={activeMode} onModeChange={selectMode} />

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">AI 创意情报与方案工具 / creative radar</p>
            <h1>AI Creative Radar</h1>
            <p className="subtitle">一个面向视觉创作者的 AI 创意情报与方案工具</p>
            <p className="intro-copy">
              浏览最新 AI 工具、案例和趋势；输入你的创意方向，获得工具推荐、案例参考、Prompt 灵感和可落地方案。
            </p>
            <div className="primary-actions three-actions" aria-label="Primary actions">
              <button
                type="button"
                className="primary-action-card"
                onClick={() => selectMode('news')}
              >
                <small>AI News Feed</small>
                <strong>看 AI 资讯</strong>
                <span>浏览最新 AI 工具、创意案例、趋势观察和商业玩法。</span>
              </button>
              <button
                type="button"
                className="primary-action-card"
                onClick={() => selectMode('plan')}
              >
                <small>Creative Plan Assistant</small>
                <strong>做创意方案</strong>
                <span>输入方向，获得工具、案例、Prompt 灵感和下一步建议。</span>
              </button>
              <button
                type="button"
                className="primary-action-card secondary-action"
                onClick={() => selectMode('library')}
              >
                <small>My Plan Library</small>
                <strong>我的方案库</strong>
                <span>即将开放：保存、继续编辑和导出完整方案。</span>
              </button>
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

        <section className="mode-switcher" id="main-functions" aria-labelledby="mode-switcher-title">
          <div className="section-title">
            <span>
              <strong id="mode-switcher-title">选择你现在要做什么</strong>
              <small>Choose a Mode</small>
            </span>
            <span>{modeTabs.find((tab) => tab.id === activeMode)?.title}</span>
          </div>
          <div className="mode-tabs" role="tablist" aria-label="Main function tabs">
            {modeTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeMode === tab.id}
                className={activeMode === tab.id ? 'mode-tab is-active' : 'mode-tab'}
                onClick={() => selectMode(tab.id)}
              >
                <small>{tab.label}</small>
                <strong>{tab.title}</strong>
                <span>{tab.description}</span>
              </button>
            ))}
          </div>
        </section>

        {activeMode === 'plan' && (
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
                    setApiPlanSummary(null)
                    setPlanSource('local')
                    setPlanApiError(false)
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
                disabled={!planQuery.trim() || isPlanLoading}
              >
                {isPlanLoading ? 'AI 正在整理初步方案...' : '生成初步方案'}
              </button>
              {isPlanLoading && (
                <p className="plan-loading-note">AI 正在整理初步方案...</p>
              )}
              <div className="quick-keywords" aria-label="Creative plan quick keywords">
                {planKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    className={submittedPlanQuery === keyword ? 'is-active' : ''}
                    onClick={() => choosePlanKeyword(keyword)}
                    disabled={isPlanLoading}
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

          {hasPlanQuery && planSummary && (
            <section className="initial-plan" aria-label="Initial plan summary">
              <div className="section-title">
                <span>
                  <strong>初步方案结果</strong>
                  <small>Initial Plan Result</small>
                </span>
                <span className="plan-source-tag">{planSourceLabel}</span>
              </div>
              <div className="initial-plan-body">
                <p>这是根据现有 AI 资讯整理出的初步方向，不是最终完整方案。</p>
                {planApiError && (
                  <p className="plan-api-warning">AI 接口暂时不可用，已展示本地匹配结果。</p>
                )}
                <p>{planSummary.overview}</p>
                <div className="plan-summary-grid">
                  <div>
                    <strong>推荐工具</strong>
                    <p>{planSummary.tools.length ? planSummary.tools.join(' / ') : '暂无明确工具'}</p>
                  </div>
                  <div>
                    <strong>相关案例 / 情报</strong>
                    <ul className="plan-related-list">
                      {planSummary.relatedCases.map((item) => (
                        <li key={item.title}>
                          {item.signal ? (
                            <button
                              className="plan-signal-button"
                              type="button"
                              onClick={() => setSelectedSignal(item.signal)}
                            >
                              {item.title}
                            </button>
                          ) : (
                            <span className="plan-case-text">{item.title}</span>
                          )}
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
                    <ul>
                      {planSummary.nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
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

          {hasPlanQuery && !isPlanLoading && !planSummary && (
            <div className="search-result-status is-empty in-panel">
              <span>暂时没有生成方案，可以换一个关键词试试。</span>
              <small>例如 AI 视频、作品集、海报、虚拟人、Runway、Midjourney。</small>
            </div>
          )}

          {hasPlanQuery && planSummary && (
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
        )}

        {activeMode === 'news' && (
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
        )}

        {activeMode === 'library' && (
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
        )}

        <AboutSection />
      </section>

      {selectedSignal && (
        <SignalDetail signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      )}
    </main>
  )
}

export default App
