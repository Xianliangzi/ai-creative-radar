import React from 'react'

function Header({ activeMode, onModeChange }) {
  return (
    <header className="browser-topbar">
      <div className="date-tab" aria-label="Session date">
        <span>Oct 19</span>
      </div>
      <nav className="nav-links" aria-label="Primary navigation">
        <button
          type="button"
          className={activeMode === 'news' ? 'nav-link active' : 'nav-link'}
          onClick={() => onModeChange('news')}
        >
          AI 资讯
        </button>
        <button
          type="button"
          className={activeMode === 'plan' ? 'nav-link active' : 'nav-link'}
          onClick={() => onModeChange('plan')}
        >
          创意方案
        </button>
        <button
          type="button"
          className={activeMode === 'library' ? 'nav-link active' : 'nav-link'}
          onClick={() => onModeChange('library')}
        >
          我的方案
        </button>
        <a href="#feedback" className="nav-link nav-feedback" title="Feedback">
          反馈
        </a>
      </nav>

      <div className="address-bar" aria-label="Current address">
        <span className="address-caret">Search</span>
        输入关键词，搜索 AI 创意情报...
      </div>

      <div className="window-controls" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </header>
  )
}

export default Header
