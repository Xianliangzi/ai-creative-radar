import React from 'react'

function Header() {
  return (
    <header className="browser-topbar">
      <div className="date-tab" aria-label="Session date">
        <span>Oct 19</span>
      </div>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#home" className="nav-link active">
          首页
        </a>
        <a href="#signals" className="nav-link">
          情报
        </a>
        <a href="#about" className="nav-link">
          关于
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
