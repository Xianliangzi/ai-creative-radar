import React from 'react'
import SignalImage from './SignalImage.jsx'

function TodaysSignal({ signal }) {
  return (
    <section className="todays-signal" aria-labelledby="todays-signal-title">
      <div className="section-title">
        <span>
          <strong>今日推荐情报</strong>
          <small>Today&apos;s Signal</small>
        </span>
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
          <span>编辑：@creative_radar</span>
          <span>状态：在线更新</span>
          <span>适合：{signal.target_reader}</span>
        </div>
      </div>
    </section>
  )
}

export default TodaysSignal
