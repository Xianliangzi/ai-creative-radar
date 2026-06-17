import React from 'react'
import SignalImage from './SignalImage.jsx'

function SignalCard({ signal, onOpen }) {
  return (
    <article className="signal-card">
      <div className="card-titlebar">
        <span>{signal.category}</span>
        <span>{signal.id}</span>
      </div>

      <div className="card-body">
        <SignalImage signal={signal} variant="thumb" label="SIGNAL IMAGE" />
        <div className="card-file-meta" aria-label="Signal archive metadata">
          <span>file: {signal.id}</span>
          <span>type: {signal.category}</span>
          <span>status: creator-useful</span>
          <span>scan date: {signal.date}</span>
        </div>
        <h3>{signal.title}</h3>
        <p className="signal-text">{signal.signal}</p>

        <div className="card-block">
          <span className="block-label">For</span>
          <p>{signal.target_reader}</p>
        </div>

        <div className="chip-row" aria-label="Related tools">
          {signal.tools.map((tool) => (
            <span className="tool-chip" key={tool}>
              {tool}
            </span>
          ))}
        </div>

        <div className="tag-row" aria-label="Visual tags">
          {signal.visual_tag.map((tag) => (
            <span className="visual-tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>

        <button className="open-button" type="button" onClick={onOpen}>
          Open signal
        </button>
      </div>
    </article>
  )
}

export default SignalCard
