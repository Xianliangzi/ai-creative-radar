import React from 'react'

function Header({ activeMode, onModeChange, searchQuery, onSearchChange, onSearchSubmit }) {
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

      <form className="address-bar" role="search" aria-label="Global search" onSubmit={onSearchSubmit}>
        <span className="address-caret">Search</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="输入关键词，搜索 AI 资讯或我的方案..."
        />
        <button type="submit">搜索</button>
      </form>

      <div className="window-controls" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </header>
  )
}

export default Header
