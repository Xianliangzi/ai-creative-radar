import React, { useState } from 'react'

function AboutSection() {
  const [emailCopyStatus, setEmailCopyStatus] = useState('idle')

  const copyFeedbackEmail = async () => {
    try {
      await navigator.clipboard.writeText('2728172670@qq.com')
      setEmailCopyStatus('copied')
    } catch {
      setEmailCopyStatus('failed')
    }

    window.setTimeout(() => {
      setEmailCopyStatus('idle')
    }, 1500)
  }

  return (
    <footer className="about-section about-footer" id="about" aria-labelledby="about-title">
      <div className="about-header">
        <span>页脚说明 / about.txt</span>
        <span>product notes</span>
      </div>

      <div className="about-footer-grid">
        <article className="about-card about-summary">
          <p className="about-label">About This Radar</p>
          <h2 id="about-title">关于这个网站</h2>
          <p>
            AI Creative Radar 是一个面向视觉创作者、学生和 AI 创意初学者的 AI
            视觉情报站。
          </p>
          <p>
            它整理 AI 工具、创意案例、趋势观察和商业玩法，并把信息转译成更容易行动的内容。
          </p>
          <p>
            你可以在这里浏览情报、搜索创意方案、获取工具链接和 Prompt 灵感。
          </p>
        </article>

        <article className="about-card feedback-box footer-feedback" id="feedback">
          <p className="about-label">Feedback</p>
          <h2>反馈与联系</h2>
          <p>如果你发现链接打不开、内容不准确，或者希望增加某个 AI 工具，可以通过邮箱反馈。</p>
          <p className="feedback-email">2728172670@qq.com</p>
          <div className="feedback-actions">
            <button className="mail-button feedback-button" type="button" onClick={copyFeedbackEmail}>
              {emailCopyStatus === 'copied'
                ? '邮箱已复制'
                : emailCopyStatus === 'failed'
                  ? '复制失败'
                  : '复制邮箱'}
            </button>
            <a
              className="mail-button feedback-button"
              href="mailto:2728172670@qq.com?subject=AI%20Creative%20Radar%20Feedback"
            >
              打开邮件客户端
              <small>Send Feedback</small>
            </a>
          </div>
        </article>
      </div>

      <p className="author-line">作者：贤｜学生 / AI 视觉学习者｜非商业个人实验</p>
    </footer>
  )
}

export default AboutSection
