import React from 'react'

function Header() {
  return (
    <header className="browser-topbar">
      <div className="date-tab" aria-label="Session date">
        <span>Oct 19</span>
      </div>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="#home" className="nav-link active">
          Home
        </a>
        <a href="#signals" className="nav-link">
          Signals
        </a>
        <a href="#about" className="nav-link">
          About
        </a>
      </nav>

      <div className="address-bar" aria-label="Current address">
        <span className="address-caret">search</span>
        type a signal here...
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
