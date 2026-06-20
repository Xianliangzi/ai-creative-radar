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

const quickKeywords = ['AI 视频', '作品集', '海报', '虚拟人', 'Midjourney', 'Runway', 'Prompt', '商业玩法']

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

function truncateText(text, maxLength = 32) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function buildMatchedPlanSummary(results) {
  const relatedTools = uniqueItems(results.flatMap((signal) => signal.tools || [])).slice(0, 6)
  const relatedDirections = uniqueItems(
    results.flatMap((signal) => [signal.category, ...(signal.visual_tag || [])]),
  ).slice(0, 8)
  const projectIdeas = results
    .flatMap((signal) => signal.project_ideas || [])
    .map((idea) => truncateText(idea, 28))
    .slice(0, 3)
  const promptHints = results
    .map((signal) => signal.prompt_hint)
    .filter(Boolean)
    .map((hint) => truncateText(hint, 54))
    .slice(0, 2)

  return {
    relatedTools,
    relatedDirections,
    projectIdeas,
    promptHints,
  }
}

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const todaysSignal = signals[0]

  const filteredSignals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return signals.filter((signal) => {
      const matchesCategory = activeCategory === 'All' || signal.category === activeCategory
      const matchesSearch = !normalizedQuery || getSearchText(signal).includes(normalizedQuery)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const hasSearchQuery = searchQuery.trim().length > 0
  const matchedPlanSummary = useMemo(
    () => (hasSearchQuery ? buildMatchedPlanSummary(filteredSignals) : null),
    [filteredSignals, hasSearchQuery],
  )

  return (
    <main className="app-shell">
      <div className="noise-layer" aria-hidden="true" />
      <section className="browser-frame" id="home" aria-label="AI Creative Radar Home">
        <Header />

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">每日 AI 创意情报 / daily creative signals</p>
            <h1>AI Creative Radar</h1>
            <p className="subtitle">给视觉创作者看的 AI 灵感雷达</p>
            <p className="intro-copy">
              收集 AI 视觉工具、创意案例和小商业玩法，把信息转译成可以动手尝试的 creative signals。
            </p>
            <div className="primary-actions" aria-label="Primary actions">
              <a href="#signals" className="primary-action-card">
                <small>Browse AI Signals</small>
                <strong>看最新 AI 情报</strong>
                <span>浏览 AI 工具、创意案例、趋势观察和商业玩法。</span>
              </a>
              <a href="#search" className="primary-action-card">
                <small>Search Creative Ideas</small>
                <strong>搜索创意方案</strong>
                <span>输入 AI 视频、作品集、海报、虚拟人等关键词，找到相关工具、案例和 Prompt 灵感。</span>
              </a>
            </div>
            <div className="quick-links" aria-label="Quick links">
              <button type="button">工具 / Tools</button>
              <button type="button">案例 / Cases</button>
              <button type="button">Prompt</button>
              <button type="button">商业 / Business</button>
            </div>
            <div className="hero-status-grid" aria-label="Radar status">
              <span>在线更新 / Online</span>
              <span>Archive 008</span>
              <span>最近扫描 {todaysSignal.date}</span>
            </div>
            <div className="personal-file-strip" aria-label="Personal project notes">
              <span>贤整理 / curated by Xian</span>
              <span>个人 AI 视觉档案</span>
              <span>学生项目 / 非商业实验</span>
              <span>给正在学习 AI 的创作者</span>
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
                <span>ARch</span>
                <span>Acrid</span>
                <span>RETRO</span>
              </div>
              <strong>VISUAL ARCHIVE</strong>
              <small>SIGNAL IMAGE / {todaysSignal.date}</small>
            </div>
          </div>
        </div>

        <TodaysSignal signal={todaysSignal} />

        <QuickGuide />

        <section className="search-panel" id="search" aria-label="Search creative signals">
          <div className="section-title">
            <span>
              <strong>搜索创意方案</strong>
              <small>Search Creative Ideas</small>
            </span>
            <span>{searchQuery ? '正在搜索' : '等待输入'}</span>
          </div>
          <p className="search-description">
            输入你想做的方向，系统会从现有 AI 情报中匹配相关工具、案例、Prompt 灵感和商业玩法。
          </p>
          <label className="search-field">
            <span>
              关键词
              <small>Keyword</small>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="输入 AI 视频 / 作品集 / 海报 / 虚拟人 / 工具名..."
            />
          </label>
          <div className="quick-keywords" aria-label="Quick search keywords">
            {quickKeywords.map((keyword) => (
              <button key={keyword} type="button" onClick={() => setSearchQuery(keyword)}>
                {keyword}
              </button>
            ))}
          </div>
        </section>

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        {hasSearchQuery && filteredSignals.length > 0 && matchedPlanSummary && (
          <section className="matched-plan" aria-label="Matched creative plan summary">
            <div className="section-title">
              <span>
                <strong>方案匹配结果</strong>
                <small>Matched Creative Plan</small>
              </span>
              <span>{filteredSignals.length} 条情报</span>
            </div>
            <div className="matched-plan-body">
              <p>
                <strong>相关工具：</strong>
                {matchedPlanSummary.relatedTools.length > 0
                  ? matchedPlanSummary.relatedTools.join(' / ')
                  : '暂无明确工具，可查看下方情报。'}
              </p>
              <p>
                <strong>相关方向：</strong>
                {matchedPlanSummary.relatedDirections.length > 0
                  ? matchedPlanSummary.relatedDirections.join(' / ')
                  : '暂无明确方向，可查看下方情报。'}
              </p>
              <p>
                <strong>可以尝试：</strong>
                {matchedPlanSummary.projectIdeas.length > 0
                  ? matchedPlanSummary.projectIdeas.join(' / ')
                  : '可以先查看下方情报里的项目灵感。'}
              </p>
              <p>
                <strong>Prompt 灵感：</strong>
                {matchedPlanSummary.promptHints.length > 0
                  ? matchedPlanSummary.promptHints.join(' / ')
                  : '暂无明确 Prompt，可查看下方情报。'}
              </p>
            </div>
          </section>
        )}

        <div className={`search-result-status ${filteredSignals.length === 0 ? 'is-empty' : ''}`}>
          {filteredSignals.length > 0 ? (
            <span>
              {hasSearchQuery
                ? `搜索结果 / 找到 ${filteredSignals.length} 条相关情报`
                : `当前显示 ${filteredSignals.length} 条情报`}
            </span>
          ) : (
            <>
              <span>暂时没有匹配到方案</span>
              <small>
                可以换一个关键词试试，例如 AI 视频、海报、作品集、虚拟人、Runway、Midjourney。
              </small>
            </>
          )}
        </div>

        <section className="signal-grid" id="signals" aria-label="Signal Card list">
          {filteredSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} onOpen={() => setSelectedSignal(signal)} />
          ))}
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
