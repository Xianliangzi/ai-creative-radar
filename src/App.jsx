import React, { useMemo, useRef, useState } from 'react'
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

const savedPlanStorageKey = 'ai-creative-radar-plans'

const postPlanActions = ['登录云端同步', '导出 PPT 大纲', '生成思维导图']

const libraryFeatures = [
  '登录云端同步',
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
    description: '查看本地保存的方案',
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

function buildCurrentPlanPayload(summary) {
  return {
    overview: summary.overview,
    recommended_tools: summary.tools,
    related_cases: summary.relatedCases.map((item) => item.title),
    directions: summary.ideas,
    prompt_ideas: summary.prompts,
    business_ideas: summary.business,
    next_steps: summary.nextSteps,
  }
}

function formatFinalPlanList(items, fallback = '暂无明确内容') {
  return items?.length ? items.map((item) => `- ${item}`).join('\n') : `- ${fallback}`
}

function sanitizeFilename(filename) {
  return filename.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()
}

function formatSavedPlanDate(createdAt, options = {}) {
  const date = createdAt ? new Date(createdAt) : new Date()
  if (Number.isNaN(date.getTime())) return '未知时间'

  return date.toLocaleString('zh-CN', options)
}

function buildFinalPlanText(finalPlan, query = '', createdAt = new Date().toISOString()) {
  const displayDate = formatSavedPlanDate(createdAt, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return [
    `# ${finalPlan.title || '完整方案草稿'}`,
    '',
    `> 原始创意目标：${query || '未填写'}`,
    `> 生成时间：${displayDate}`,
    '',
    '## 方案摘要',
    finalPlan.summary || '暂无摘要',
    '',
    '## 项目目标',
    finalPlan.target || '暂无项目目标',
    '',
    '## 核心概念',
    finalPlan.concept || '暂无核心概念',
    '',
    '## 推荐工具',
    formatFinalPlanList(finalPlan.tools),
    '',
    '## 内容结构',
    formatFinalPlanList(finalPlan.content_structure),
    '',
    '## 执行步骤',
    formatFinalPlanList(finalPlan.execution_steps),
    '',
    '## 视觉风格',
    formatFinalPlanList(finalPlan.visual_style),
    '',
    '## 平台建议',
    formatFinalPlanList(finalPlan.platform_suggestions),
    '',
    '## 作品集价值',
    finalPlan.portfolio_value || '暂无说明',
    '',
    '## 下一步行动',
    formatFinalPlanList(finalPlan.next_actions),
  ].join('\n')
}

function getFinalPlanFilename(finalPlan) {
  const safeTitle = sanitizeFilename(finalPlan?.title || 'AI-Creative-Radar-方案草稿')
  return `${safeTitle || 'AI-Creative-Radar-方案草稿'}.md`
}

function downloadMarkdownPlan(finalPlan, query = '', createdAt) {
  const markdownContent = buildFinalPlanText(finalPlan, query, createdAt)
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = getFinalPlanFilename(finalPlan)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function loadSavedPlans() {
  if (typeof window === 'undefined') return []

  try {
    const rawPlans = window.localStorage.getItem(savedPlanStorageKey)
    const parsedPlans = rawPlans ? JSON.parse(rawPlans) : []
    return Array.isArray(parsedPlans) ? parsedPlans : []
  } catch (error) {
    return []
  }
}

function persistSavedPlans(plans) {
  window.localStorage.setItem(savedPlanStorageKey, JSON.stringify(plans))
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
  const finalPlanRef = useRef(null)
  const [activeMode, setActiveMode] = useState('news')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [planQuery, setPlanQuery] = useState('')
  const [submittedPlanQuery, setSubmittedPlanQuery] = useState('')
  const [planCopyStatus, setPlanCopyStatus] = useState('idle')
  const [apiPlanSummary, setApiPlanSummary] = useState(null)
  const [planSource, setPlanSource] = useState('local')
  const [isPlanLoading, setIsPlanLoading] = useState(false)
  const [planApiError, setPlanApiError] = useState('')
  const [refineQuestion, setRefineQuestion] = useState('')
  const [refineRecords, setRefineRecords] = useState([])
  const [isRefineLoading, setIsRefineLoading] = useState(false)
  const [refineError, setRefineError] = useState('')
  const [finalPlan, setFinalPlan] = useState(null)
  const [isFinalizingPlan, setIsFinalizingPlan] = useState(false)
  const [finalPlanError, setFinalPlanError] = useState('')
  const [finalPlanCopyStatus, setFinalPlanCopyStatus] = useState('idle')
  const [finalPlanDownloadStatus, setFinalPlanDownloadStatus] = useState('idle')
  const [savePlanStatus, setSavePlanStatus] = useState('idle')
  const [savedPlans, setSavedPlans] = useState(loadSavedPlans)
  const [selectedSavedPlanId, setSelectedSavedPlanId] = useState('')
  const [savedPlanCopyStatus, setSavedPlanCopyStatus] = useState('')
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
    setPlanApiError('')
    setPlanCopyStatus('idle')
    setRefineQuestion('')
    setRefineRecords([])
    setRefineError('')
    setFinalPlan(null)
    setFinalPlanError('')
    setFinalPlanCopyStatus('idle')
    setFinalPlanDownloadStatus('idle')
    setSavePlanStatus('idle')

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
      setPlanApiError(
        matchedSignalsForPlan.length > 0
          ? error instanceof Error
            ? error.message
            : 'AI 接口暂时不可用'
          : '',
      )
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
    }, 3500)
  }

  const refineCurrentPlan = async () => {
    const question = refineQuestion.trim()

    if (!planSummary) {
      setRefineError('请先生成初步方案。')
      return
    }

    if (!question) {
      setRefineError('请输入你想继续追问的问题。')
      return
    }

    setIsRefineLoading(true)
    setRefineError('')

    try {
      const response = await fetch('/api/refine-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: submittedPlanQuery || planQuery,
          currentPlan: buildCurrentPlanPayload(planSummary),
          followUpQuestion: question,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data.error || 'AI 暂时无法继续完善方案')
      }

      setRefineRecords((records) => [
        ...records,
        {
          id: `${Date.now()}`,
          question,
          reply: data.reply,
        },
      ])
      setRefineQuestion('')
      setFinalPlan(null)
      setFinalPlanError('')
      setFinalPlanCopyStatus('idle')
      setFinalPlanDownloadStatus('idle')
      setSavePlanStatus('idle')
    } catch (error) {
      setRefineError(
        error instanceof Error ? error.message : 'AI 暂时无法继续完善方案，请稍后再试。',
      )
    } finally {
      setIsRefineLoading(false)
    }
  }

  const finalizeCurrentPlan = async () => {
    if (!planSummary) {
      setFinalPlanError('请先生成初步方案。')
      return
    }

    setIsFinalizingPlan(true)
    setFinalPlanError('')
    setFinalPlanCopyStatus('idle')
    setFinalPlanDownloadStatus('idle')
    setSavePlanStatus('idle')

    try {
      const response = await fetch('/api/finalize-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: submittedPlanQuery || planQuery,
          currentPlan: buildCurrentPlanPayload(planSummary),
          refineHistory: refineRecords.map((record) => ({
            question: record.question,
            answer: record.reply,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success || !data.finalPlan) {
        throw new Error(data.error || 'AI 暂时无法生成完整方案草稿')
      }

      setFinalPlan(data.finalPlan)
      window.setTimeout(() => {
        finalPlanRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 0)
    } catch (error) {
      setFinalPlanError(
        error instanceof Error ? error.message : 'AI 暂时无法生成完整方案草稿，请稍后再试。',
      )
    } finally {
      setIsFinalizingPlan(false)
    }
  }

  const copyFinalPlan = async () => {
    if (!finalPlan) return

    try {
      await navigator.clipboard.writeText(buildFinalPlanText(finalPlan, submittedPlanQuery || planQuery))
      setFinalPlanCopyStatus('copied')
    } catch (error) {
      setFinalPlanCopyStatus('failed')
    }

    window.setTimeout(() => {
      setFinalPlanCopyStatus('idle')
    }, 1500)
  }

  const downloadFinalPlan = () => {
    if (!finalPlan) return

    downloadMarkdownPlan(finalPlan, submittedPlanQuery || planQuery)

    setFinalPlanDownloadStatus('downloaded')
    window.setTimeout(() => {
      setFinalPlanDownloadStatus('idle')
    }, 1500)
  }

  const saveFinalPlanToLibrary = () => {
    if (!finalPlan) return

    const savedPlan = {
      id: `plan-${Date.now()}`,
      title: finalPlan.title || '完整方案草稿',
      query: submittedPlanQuery || planQuery,
      createdAt: new Date().toISOString(),
      finalPlan,
    }

    setSavedPlans((plans) => {
      const nextPlans = [savedPlan, ...plans]
      persistSavedPlans(nextPlans)
      return nextPlans
    })
    setSelectedSavedPlanId(savedPlan.id)
    setSavePlanStatus('saved')
    window.setTimeout(() => {
      setSavePlanStatus('idle')
    }, 1500)
  }

  const toggleSavedPlanDetail = (planId) => {
    setSelectedSavedPlanId((currentId) => (currentId === planId ? '' : planId))
  }

  const copySavedPlan = async (savedPlan) => {
    try {
      await navigator.clipboard.writeText(
        buildFinalPlanText(savedPlan.finalPlan, savedPlan.query, savedPlan.createdAt),
      )
      setSavedPlanCopyStatus(savedPlan.id)
    } catch (error) {
      setSavedPlanCopyStatus(`failed-${savedPlan.id}`)
    }

    window.setTimeout(() => {
      setSavedPlanCopyStatus('')
    }, 1500)
  }

  const downloadSavedPlan = (savedPlan) => {
    downloadMarkdownPlan(savedPlan.finalPlan, savedPlan.query, savedPlan.createdAt)
  }

  const deleteSavedPlan = (planId) => {
    if (!window.confirm('确定要删除这个方案吗？')) return

    setSavedPlans((plans) => {
      const nextPlans = plans.filter((plan) => plan.id !== planId)
      persistSavedPlans(nextPlans)
      return nextPlans
    })

    if (selectedSavedPlanId === planId) {
      setSelectedSavedPlanId('')
    }
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
            <p className="eyebrow">AIGC 灵感雷达与方案脑暴工具 / creative radar</p>
            <h1>AI Creative Radar</h1>
            <p className="subtitle">面向 AIGC / AI 视觉创作者的灵感雷达与方案脑暴工具</p>
            <p className="intro-copy">
              它帮助你扫描 AI 创意资讯、寻找工具与案例，并把模糊的创意方向整理成可执行的视觉项目方案。它不会直接替你生成最终图片或海报，而是帮你决定做什么、怎么做、用什么工具、发到哪里，以及如何整理成作品集项目。
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
                <span>查看本地保存的完整方案，云端同步和导出能力后续开放。</span>
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
              <span>我的方案库 / 本地保存</span>
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
            <span>AI + 本地资讯</span>
          </div>
          <div className="consult-entry-grid">
            <div className="consult-input-card">
              <h3>把一个模糊想法整理成可执行方案</h3>
              <p>
                输入你的创意方向，AI 会帮你整理工具组合、内容结构、Prompt 灵感、平台建议、作品集价值和下一步行动。这里生成的是创作方案，不是直接生成图片或海报。
              </p>
              <div className="idea-examples" aria-label="Example creative directions">
                <span>我想做一个数字人作品集项目</span>
                <span>我想做一个小红书 AI 账号</span>
                <span>我想做一套 AI 海报视觉实验</span>
                <span>我想做一个 AI 视频短片</span>
              </div>
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
                    setPlanApiError('')
                    setPlanCopyStatus('idle')
                    setRefineQuestion('')
                    setRefineRecords([])
                    setRefineError('')
                    setFinalPlan(null)
                    setFinalPlanError('')
                    setFinalPlanCopyStatus('idle')
                    setFinalPlanDownloadStatus('idle')
                    setSavePlanStatus('idle')
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
              <p>当前可以查看保存在本浏览器里的方案，未来会支持登录后云端同步。</p>
              <button type="button" onClick={() => selectMode('library')}>
                打开我的方案库
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
                  <p className="plan-api-warning">AI 暂时不可用：{planApiError}，已展示本地匹配结果。</p>
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
              <span>{planApiError || '暂时没有生成方案，可以换一个关键词试试。'}</span>
              <small>例如 AI 视频、作品集、海报、虚拟人、Runway、Midjourney。</small>
            </div>
          )}

          {hasPlanQuery && planSummary && (
          <section className="coming-next next-refine-panel" aria-label="Next refine with AI">
            <div className="section-title">
              <span>
                <strong>继续完善方案</strong>
                <small>Refine with AI</small>
              </span>
              <span>AI follow-up</span>
            </div>
            <div className="next-refine-body">
              <p>
                你可以继续追问，让 AI 帮你细化执行步骤、视觉风格、发布平台或作品集呈现方式。
              </p>
              <label className="refine-field">
                <span>继续追问</span>
                <textarea
                  value={refineQuestion}
                  onChange={(event) => {
                    setRefineQuestion(event.target.value)
                    setRefineError('')
                  }}
                  placeholder="例如：我想把它做成小红书账号，怎么规划？"
                  rows="3"
                />
              </label>
              <button
                className="refine-submit-button"
                type="button"
                onClick={refineCurrentPlan}
                disabled={!refineQuestion.trim() || isRefineLoading}
              >
                {isRefineLoading ? 'AI 正在继续完善方案...' : '继续完善'}
              </button>
              {isRefineLoading && <p className="refine-status">AI 正在继续完善方案...</p>}
              {refineError && <p className="plan-api-warning">{refineError}</p>}
              {refineRecords.length > 0 && (
                <div className="refine-records" aria-label="Refine history">
                  {refineRecords.map((record) => (
                    <article className="refine-record" key={record.id}>
                      <strong>你问：</strong>
                      <p>{record.question}</p>
                      <strong>AI 补充：</strong>
                      <p>{record.reply}</p>
                    </article>
                  ))}
                </div>
              )}
              <div className="finalize-panel" aria-label="Finalize plan draft">
                <div className="finalize-header">
                  <span>
                    <strong>生成完整方案草稿</strong>
                    <small>Finalize Plan Draft</small>
                  </span>
                </div>
                <p>
                  AI 会把初步方案和追问记录整理成一份更完整的方案草稿，方便后续保存、下载或导出。
                </p>
                <button
                  className="finalize-button"
                  type="button"
                  onClick={finalizeCurrentPlan}
                  disabled={isFinalizingPlan}
                >
                  {isFinalizingPlan ? 'AI 正在整理完整方案草稿...' : '生成完整方案草稿'}
                </button>
                {isFinalizingPlan && (
                  <p className="refine-status">AI 正在整理完整方案草稿...</p>
                )}
                {finalPlanError && <p className="plan-api-warning">{finalPlanError}</p>}
                {finalPlan && (
                  <article className="final-plan-card" ref={finalPlanRef}>
                    <div className="final-plan-card-head">
                      <span className="final-plan-badge">
                        完整方案草稿
                        <small>Final Plan Draft</small>
                      </span>
                      <p>这份方案由初步方案和你的追问记录整理生成，当前可以复制、下载 Markdown，也可以保存到我的方案库。</p>
                    </div>
                    <h3>{finalPlan.title || '完整方案草稿'}</h3>
                    <div className="final-plan-grid">
                      <section>
                        <strong>方案摘要</strong>
                        <p>{finalPlan.summary || '暂无摘要'}</p>
                      </section>
                      <section>
                        <strong>项目目标</strong>
                        <p>{finalPlan.target || '暂无项目目标'}</p>
                      </section>
                      <section>
                        <strong>核心概念</strong>
                        <p>{finalPlan.concept || '暂无核心概念'}</p>
                      </section>
                      <section>
                        <strong>推荐工具</strong>
                        <ul>
                          {(finalPlan.tools || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <strong>内容结构</strong>
                        <ul>
                          {(finalPlan.content_structure || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <strong>执行步骤</strong>
                        <ul>
                          {(finalPlan.execution_steps || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <strong>视觉风格</strong>
                        <ul>
                          {(finalPlan.visual_style || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <strong>平台建议</strong>
                        <ul>
                          {(finalPlan.platform_suggestions || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <strong>作品集价值</strong>
                        <p>{finalPlan.portfolio_value || '暂无说明'}</p>
                      </section>
                      <section>
                        <strong>下一步行动</strong>
                        <ul>
                          {(finalPlan.next_actions || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                    <div className="final-plan-actions" aria-label="Final plan next actions">
                      <strong>下一步你可以做什么？</strong>
                      <div>
                        <button className="finalize-button" type="button" onClick={copyFinalPlan}>
                          {finalPlanCopyStatus === 'copied'
                            ? '已复制完整方案'
                            : finalPlanCopyStatus === 'failed'
                              ? '复制失败'
                              : '复制完整方案草稿'}
                        </button>
                        <button className="finalize-button" type="button" onClick={saveFinalPlanToLibrary}>
                          {savePlanStatus === 'saved' ? '已保存到方案库' : '保存到我的方案库'}
                        </button>
                        <button className="finalize-button" type="button" onClick={downloadFinalPlan}>
                          {finalPlanDownloadStatus === 'downloaded' ? '已生成下载' : '下载为 Markdown 文档'}
                        </button>
                        <button type="button" disabled>
                          导出 PPT 大纲
                          <small>即将开放</small>
                        </button>
                        <button type="button" disabled>
                          生成思维导图
                          <small>即将开放</small>
                        </button>
                      </div>
                      {savePlanStatus === 'saved' && (
                        <div className="save-path-note">
                          <span>已保存到我的方案库。你可以去查看、复制、下载或删除这份方案。</span>
                          <button type="button" onClick={() => selectMode('library')}>
                            查看我的方案
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )}
              </div>
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
            <span>{savedPlans.length} 个本地方案</span>
          </div>
          <div className="library-body">
            <article className="library-note-card">
              <h3>本地保存原型</h3>
              <p>当前为本地保存原型，方案只保存在当前浏览器中。未来版本将支持登录后云端保存。</p>
            </article>
            {savedPlans.length > 0 ? (
              <div className="saved-plan-list" aria-label="Saved plans">
                {savedPlans.map((savedPlan) => (
                  <article className="saved-plan-card" key={savedPlan.id}>
                    <div className="saved-plan-card-head">
                      <span>
                        <small>Saved Plan</small>
                        <strong>{savedPlan.title || '完整方案草稿'}</strong>
                      </span>
                      <time dateTime={savedPlan.createdAt}>
                        {formatSavedPlanDate(savedPlan.createdAt)}
                      </time>
                    </div>
                    <p className="saved-plan-query">原始创意目标：{savedPlan.query || '未填写'}</p>
                    <p className="saved-plan-summary">{savedPlan.finalPlan?.summary || '暂无方案摘要'}</p>
                    <div className="saved-plan-tools">
                      {(savedPlan.finalPlan?.tools?.length ? savedPlan.finalPlan.tools : ['暂无明确工具']).map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </div>
                    <div className="saved-plan-actions">
                      <button type="button" onClick={() => toggleSavedPlanDetail(savedPlan.id)}>
                        {selectedSavedPlanId === savedPlan.id ? '收起方案' : '查看方案'}
                      </button>
                      <button type="button" onClick={() => copySavedPlan(savedPlan)}>
                        {savedPlanCopyStatus === savedPlan.id
                          ? '已复制方案'
                          : savedPlanCopyStatus === `failed-${savedPlan.id}`
                            ? '复制失败'
                            : '复制方案'}
                      </button>
                      <button type="button" onClick={() => downloadSavedPlan(savedPlan)}>
                        下载 Markdown
                      </button>
                      <button type="button" className="danger-button" onClick={() => deleteSavedPlan(savedPlan.id)}>
                        删除
                      </button>
                    </div>
                    {selectedSavedPlanId === savedPlan.id && (
                      <div className="saved-plan-detail">
                        <h3>{savedPlan.finalPlan?.title || '完整方案草稿'}</h3>
                        <div className="final-plan-grid">
                          <section>
                            <strong>方案摘要</strong>
                            <p>{savedPlan.finalPlan?.summary || '暂无摘要'}</p>
                          </section>
                          <section>
                            <strong>项目目标</strong>
                            <p>{savedPlan.finalPlan?.target || '暂无项目目标'}</p>
                          </section>
                          <section>
                            <strong>核心概念</strong>
                            <p>{savedPlan.finalPlan?.concept || '暂无核心概念'}</p>
                          </section>
                          <section>
                            <strong>推荐工具</strong>
                            <ul>
                              {(savedPlan.finalPlan?.tools || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                          <section>
                            <strong>内容结构</strong>
                            <ul>
                              {(savedPlan.finalPlan?.content_structure || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                          <section>
                            <strong>执行步骤</strong>
                            <ul>
                              {(savedPlan.finalPlan?.execution_steps || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                          <section>
                            <strong>视觉风格</strong>
                            <ul>
                              {(savedPlan.finalPlan?.visual_style || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                          <section>
                            <strong>平台建议</strong>
                            <ul>
                              {(savedPlan.finalPlan?.platform_suggestions || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                          <section>
                            <strong>作品集价值</strong>
                            <p>{savedPlan.finalPlan?.portfolio_value || '暂无说明'}</p>
                          </section>
                          <section>
                            <strong>下一步行动</strong>
                            <ul>
                              {(savedPlan.finalPlan?.next_actions || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <article className="library-status-card">
                <h3>你还没有保存方案</h3>
                <p>在创意方案中生成完整方案草稿后，点击“保存到我的方案库”，就可以在这里查看、复制、下载或删除。</p>
                <button type="button" onClick={() => selectMode('plan')}>
                  去生成一个方案
                </button>
              </article>
            )}
            <div className="library-feature-list">
              {libraryFeatures.map((feature) => (
                <span key={feature}>{feature} / 即将开放</span>
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
