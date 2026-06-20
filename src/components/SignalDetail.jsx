import React, { useState } from 'react'
import SignalImage from './SignalImage.jsx'

function renderValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value : ['暂无内容']
  }

  return value || '暂无内容'
}

function SignalDetail({ signal, onClose }) {
  const [copyStatus, setCopyStatus] = useState('idle')
  const [jsonCopyStatus, setJsonCopyStatus] = useState('idle')
  const projectIdeas = renderValue(signal.project_ideas)
  const tools = renderValue(signal.tools)
  const visualTags = renderValue(signal.visual_tag)
  const sourceUrl = typeof signal.url === 'string' && signal.url.startsWith('https://') ? signal.url : ''

  const copySourceUrl = async () => {
    if (!sourceUrl) return

    try {
      await navigator.clipboard.writeText(sourceUrl)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }

    window.setTimeout(() => {
      setCopyStatus('idle')
    }, 1500)
  }

  const copySignalJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(signal, null, 2))
      setJsonCopyStatus('copied')
    } catch {
      setJsonCopyStatus('failed')
    }

    window.setTimeout(() => {
      setJsonCopyStatus('idle')
    }, 1500)
  }

  return (
    <div className="detail-overlay" role="presentation">
      <section className="detail-window" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header className="detail-titlebar">
          <span>
            <strong>情报详情</strong>
            <small>Signal Detail</small>
          </span>
          <button type="button" onClick={onClose} aria-label="Close signal detail">
            关闭 / X
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
              <h3>内容摘要</h3>
              <p>{renderValue(signal.summary)}</p>
            </section>

            <section className="detail-section">
              <h3>创作者价值</h3>
              <p>{renderValue(signal.creator_value)}</p>
            </section>

            <section className="detail-section detail-section-wide">
              <h3>项目灵感</h3>
              <ol>
                {projectIdeas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ol>
            </section>

            <section className="detail-section">
              <h3>商业可能</h3>
              <p>{renderValue(signal.business_potential)}</p>
            </section>

            <section className="detail-section">
              <h3>Prompt 灵感</h3>
              <p>{renderValue(signal.prompt_hint)}</p>
            </section>

            <section className="detail-section">
              <h3>相关工具</h3>
              <div className="detail-chip-row">
                {tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h3>适合人群</h3>
              <p>{renderValue(signal.target_reader)}</p>
            </section>

            <section className="detail-section detail-section-wide">
              <h3>来源</h3>
              <p>{renderValue(signal.source)}</p>
              {sourceUrl ? (
                <>
                  <p className="source-url">来源链接 / Source URL: {sourceUrl}</p>
                  <div className="source-actions">
                    <a
                      className="source-button"
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      打开来源
                    </a>
                    <button className="source-button" type="button" onClick={copySourceUrl}>
                      {copyStatus === 'copied'
                        ? '已复制链接'
                        : copyStatus === 'failed'
                          ? '复制失败'
                          : '复制链接'}
                    </button>
                    <button
                      className="source-button signal-json-button"
                      type="button"
                      onClick={copySignalJson}
                    >
                      {jsonCopyStatus === 'copied'
                        ? '已复制 Signal'
                        : jsonCopyStatus === 'failed'
                          ? '复制失败'
                          : '复制 Signal JSON'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="source-actions">
                  <span className="source-button is-disabled">暂无来源链接</span>
                  <button
                    className="source-button signal-json-button"
                    type="button"
                    onClick={copySignalJson}
                  >
                    {jsonCopyStatus === 'copied'
                      ? '已复制 Signal'
                      : jsonCopyStatus === 'failed'
                        ? '复制失败'
                        : '复制 Signal JSON'}
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SignalDetail
