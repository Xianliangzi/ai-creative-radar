import React from 'react'

const guideSteps = [
  {
    number: '01',
    title: '看情报',
    label: 'Browse',
    description: '了解最新 AI 工具、案例、趋势和商业玩法。',
  },
  {
    number: '02',
    title: '搜方案',
    label: 'Search',
    description: '输入你想做的方向，例如 AI 视频、作品集、海报，查看相关工具和灵感。',
  },
  {
    number: '03',
    title: '复制与反馈',
    label: 'Copy & Feedback',
    description: '复制链接或情报数据，也可以反馈错误和想看的工具。',
  },
]

function QuickGuide() {
  return (
    <section className="quick-guide" aria-labelledby="quick-guide-title">
      <div className="section-title">
        <span>
          <strong id="quick-guide-title">快速使用</strong>
          <small>Quick Guide</small>
        </span>
        <span>3 steps</span>
      </div>

      <div className="guide-body compact">
        <div className="guide-steps compact" aria-label="Quick guide steps">
          {guideSteps.map((step) => (
            <article className="guide-card" key={step.number}>
              <div className="guide-card-top">
                <span>{step.number}</span>
                <small>{step.label}</small>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <p className="confidence-strip">
          <strong>可信度：</strong>
          HIGH：官方来源｜MEDIUM：整理转译｜LOW：实验草稿
        </p>
      </div>
    </section>
  )
}

export default QuickGuide
