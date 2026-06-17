import React from 'react'
import SignalImage from './SignalImage.jsx'

function renderValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : ['Not available']
  }

  return value || 'Not available'
}

function SignalDetail({ signal, onClose }) {
  const projectIdeas = renderValue(signal.project_ideas)
  const tools = renderValue(signal.tools)
  const visualTags = renderValue(signal.visual_tag)

  return (
    <div className="detail-overlay" role="presentation">
      <section className="detail-window" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header className="detail-titlebar">
          <span>SIGNAL DETAIL</span>
          <button type="button" onClick={onClose} aria-label="Close signal detail">
            CLOSE / X
          </button>
        </header>

        <div className="detail-body">
          <SignalImage signal={signal} variant="detail" label="AI CREATIVE PREVIEW" />

          <div className="detail-meta">
            <span>{renderValue(signal.category)}</span>
            <span>{renderValue(signal.date)}</span>
            {visualTags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>

          <div className="detail-hero">
            <p className="eyebrow">{renderValue(signal.id)}</p>
            <h2 id="detail-title">{renderValue(signal.title)}</h2>
            <p>{renderValue(signal.signal)}</p>
          </div>

          <div className="detail-grid">
            <section className="detail-section">
              <h3>WHAT HAPPENED</h3>
              <p>{renderValue(signal.summary)}</p>
            </section>

            <section className="detail-section">
              <h3>CREATOR VALUE</h3>
              <p>{renderValue(signal.creator_value)}</p>
            </section>

            <section className="detail-section detail-section-wide">
              <h3>PROJECT IDEAS</h3>
              <ol>
                {projectIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ol>
            </section>

            <section className="detail-section">
              <h3>BUSINESS POSSIBILITY</h3>
              <p>{renderValue(signal.business_potential)}</p>
            </section>

            <section className="detail-section">
              <h3>PROMPT HINT</h3>
              <p>{renderValue(signal.prompt_hint)}</p>
            </section>

            <section className="detail-section">
              <h3>TOOLS</h3>
              <div className="detail-chip-row">
                {tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h3>TARGET READER</h3>
              <p>{renderValue(signal.target_reader)}</p>
            </section>

            <section className="detail-section detail-section-wide">
              <h3>SOURCE</h3>
              <p>{renderValue(signal.source)}</p>
              {signal.url ? (
                <a className="source-button" href={signal.url} target="_blank" rel="noreferrer">
                  OPEN SOURCE
                </a>
              ) : (
                <span className="source-button is-disabled">Not available</span>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SignalDetail
