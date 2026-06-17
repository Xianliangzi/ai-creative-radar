import React from 'react'
import SignalImage from './SignalImage.jsx'

function TodaysSignal({ signal }) {
  return (
    <section className="todays-signal" aria-labelledby="todays-signal-title">
      <div className="section-title">
        <span>Today's Signal</span>
        <span>{signal.id}</span>
      </div>
      <div className="todays-content">
        <SignalImage signal={signal} variant="feature" label="TODAY PREVIEW" />
        <div className="todays-copy">
          <span className="category-tag">{signal.category}</span>
          <h2 id="todays-signal-title">{signal.title}</h2>
          <p>{signal.signal}</p>
        </div>
        <div className="todays-side">
          <span>user: @creative_radar</span>
          <span>status: online now</span>
          <span>for: {signal.target_reader}</span>
        </div>
      </div>
    </section>
  )
}

export default TodaysSignal
