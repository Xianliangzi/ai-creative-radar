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
          <span>文件：{signal.id}</span>
          <span>类型：{signal.category}</span>
          <span>状态：创作者可用</span>
          <span>扫描日期：{signal.date}</span>
        </div>
        <h3>{signal.title}</h3>
        <p className="signal-text">{signal.signal}</p>

        <div className="card-block">
          <span className="block-label">适合人群 / For</span>
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
          打开情报
        </button>
      </div>
    </article>
  )
}

export default SignalCard
