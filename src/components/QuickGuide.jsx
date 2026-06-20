import React from 'react'

const guideSteps = [
  {
    number: '01',
    title: '看资讯',
    label: 'News Feed',
    description: '浏览 AI 工具、案例、趋势和商业玩法。',
  },
  {
    number: '02',
    title: '做方案',
    label: 'Plan Assistant',
    description: '输入你的创意方向，先获得初步方案结果。',
  },
  {
    number: '03',
    title: '存方案',
    label: 'Plan Library',
    description: '未来可继续和 AI 聊，把方案完善后保存到方案库并导出。',
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
        <span>3 modules</span>
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
      </div>
    </section>
  )
}

export default QuickGuide
