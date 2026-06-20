import React from 'react'

const guideSteps = [
  {
    number: '01',
    title: '看 AI 情报',
    label: 'Browse',
    description: '浏览 AI 工具、创意案例、趋势观察和商业玩法。',
  },
  {
    number: '02',
    title: '搜索创意方案',
    label: 'Search',
    description:
      '输入 AI 视频、作品集、海报、虚拟人等关键词，找到相关工具、案例、Prompt 灵感和商业玩法。',
  },
  {
    number: '03',
    title: '打开详情并复制',
    label: 'Open & Copy',
    description: '查看来源链接、项目灵感和 Prompt 方向，也可以复制链接或情报数据。',
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
        <span>front desk</span>
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
          HIGH：官方来源｜MEDIUM：整理转译｜LOW：未来实验内容
        </p>
      </div>
    </section>
  )
}

export default QuickGuide
