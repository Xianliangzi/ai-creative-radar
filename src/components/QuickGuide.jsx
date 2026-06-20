import React from 'react'

const guideSteps = [
  {
    number: '01',
    title: '搜索情报',
    label: 'Search Signals',
    description:
      '你可以搜索工具名、Prompt、项目方向或商业玩法，例如 Midjourney、Runway、作品集、AI fashion。',
  },
  {
    number: '02',
    title: '查看详情',
    label: 'Open Signal',
    description:
      '打开情报后，可以查看内容摘要、创作者价值、项目灵感、商业可能、Prompt 灵感和来源链接。',
  },
  {
    number: '03',
    title: '生成草稿',
    label: 'Generate Draft',
    description: '输入工具链接、文章链接或关键词，生成一条草稿情报。发布前请先人工检查。',
  },
  {
    number: '04',
    title: '复制与审核',
    label: 'Copy & Review',
    description:
      '你可以复制来源链接或完整 Signal JSON，用于整理、编辑、人工审核和后续更新。',
  },
]

function QuickGuide() {
  return (
    <section className="quick-guide" aria-labelledby="quick-guide-title">
      <div className="section-title">
        <span>
          <strong id="quick-guide-title">如何使用这个情报站</strong>
          <small>Quick Guide</small>
        </span>
        <span>user manual</span>
      </div>

      <div className="guide-body">
        <div className="guide-steps" aria-label="Quick guide steps">
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

        <div className="guide-info-row">
          <article className="confidence-card">
            <p className="guide-label">
              <strong>可信度说明</strong>
              <small>Confidence Level</small>
            </p>
            <ul>
              <li>
                <strong>HIGH：</strong>官方来源或明确产品来源
              </li>
              <li>
                <strong>MEDIUM：</strong>工具应用、趋势转译或二次整理
              </li>
              <li>
                <strong>LOW：</strong>实验性生成或概念草稿
              </li>
            </ul>
          </article>

          <article className="prototype-note">
            <p className="guide-label">
              <strong>原型状态</strong>
              <small>Prototype Notice</small>
            </p>
            <p>当前生成器仍是原型，发布的草稿只会临时加入页面，刷新后会消失。</p>
            <small>Prototype only. Temporary drafts disappear after refresh.</small>
          </article>
        </div>
      </div>
    </section>
  )
}

export default QuickGuide
