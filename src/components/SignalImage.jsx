import React, { useState } from 'react'

const categoryConfig = {
  AI视觉工具: {
    className: 'placeholder-tool',
    eyebrow: 'AI TOOL',
    code: 'VIS',
    label: 'VISUAL TOOL',
  },
  创意案例: {
    className: 'placeholder-case',
    eyebrow: 'CASE FILE',
    code: 'EDT',
    label: 'CREATIVE CASE',
  },
  潮流趋势: {
    className: 'placeholder-trend',
    eyebrow: 'TREND SCAN',
    code: 'Y2K',
    label: 'STYLE SIGNAL',
  },
  商业玩法: {
    className: 'placeholder-business',
    eyebrow: 'BIZ IDEA',
    code: 'MRK',
    label: 'MINI MARKET',
  },
  灵感Prompt: {
    className: 'placeholder-prompt',
    eyebrow: 'PROMPT NOTE',
    code: 'TXT',
    label: 'TEXT SEED',
  },
  前沿观察: {
    className: 'placeholder-frontier',
    eyebrow: 'FUTURE SCAN',
    code: 'LAB',
    label: 'LAB SIGNAL',
  },
}

function SignalImage({ signal, variant = 'thumb', label = 'SIGNAL IMAGE' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasImage = Boolean(signal?.image) && !imageFailed
  const mode = signal?.image_mode || 'cover'
  const alt = signal?.image_alt || signal?.title || 'Signal image preview'
  const config = categoryConfig[signal?.category] || {
    className: 'placeholder-default',
    eyebrow: 'AI VISUAL',
    code: 'PRQ',
    label,
  }
  const displayLabel = label === 'SIGNAL IMAGE' ? config.label : label

  return (
    <div className={`signal-image signal-image-${variant} image-mode-${mode} ${config.className}`}>
      {hasImage ? (
        <img src={signal.image} alt={alt} onError={() => setImageFailed(true)} />
      ) : (
        <div className="signal-image-placeholder" aria-label={alt} role="img">
          <div className="placeholder-topline">
            <span>{config.eyebrow}</span>
            <span>{config.code}</span>
          </div>
          <div className="placeholder-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <strong>{displayLabel}</strong>
          <small>{signal?.category || 'VISUAL ARCHIVE'}</small>
        </div>
      )}
    </div>
  )
}

export default SignalImage
