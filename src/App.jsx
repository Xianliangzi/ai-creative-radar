import React, { useMemo, useState } from 'react'
import AboutSection from './components/AboutSection.jsx'
import Header from './components/Header.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import SignalDetail from './components/SignalDetail.jsx'
import SignalImage from './components/SignalImage.jsx'
import SignalCard from './components/SignalCard.jsx'
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

function App() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSignal, setSelectedSignal] = useState(null)
  const todaysSignal = signals[0]

  const filteredSignals = useMemo(() => {
    if (activeCategory === 'All') {
      return signals
    }

    return signals.filter((signal) => signal.category === activeCategory)
  }, [activeCategory])

  return (
    <main className="app-shell">
      <div className="noise-layer" aria-hidden="true" />
      <section className="browser-frame" id="home" aria-label="AI Creative Radar Home">
        <Header />

        <div className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">daily creative signals</p>
            <h1>AI Creative Radar</h1>
            <p className="subtitle">Visual AI signals for creators</p>
            <p className="intro-copy">
              A retro signal board for AI visual tools, creative cases and tiny business ideas.
            </p>
            <div className="quick-links" aria-label="Quick links">
              <button type="button">Tools</button>
              <button type="button">Cases</button>
              <button type="button">Prompts</button>
              <button type="button">Business</button>
            </div>
            <div className="hero-status-grid" aria-label="Radar status">
              <span>Online now</span>
              <span>Archive 008</span>
              <span>Last scan {todaysSignal.date}</span>
            </div>
            <div className="personal-file-strip" aria-label="Personal project notes">
              <span>curated by Xian</span>
              <span>personal AI visual archive</span>
              <span>student-built / non-profit</span>
              <span>notes for creators learning AI</span>
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

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

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
