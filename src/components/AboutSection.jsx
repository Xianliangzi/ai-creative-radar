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
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-header">
        <span>关于项目 / about.txt</span>
        <span>个人档案 / personal archive</span>
      </div>

      <div className="about-grid">
        <article className="profile-card" aria-label="Author profile">
          <div className="profile-window-bar">
            <span>作者档案 / author_file.sys</span>
            <span>在线 / online</span>
          </div>
          <div className="profile-body">
            <div className="profile-avatar" aria-hidden="true">贤</div>
            <dl>
              <div>
                <dt>姓名</dt>
                <dd>贤</dd>
              </div>
              <div>
                <dt>身份</dt>
                <dd>学生 / AI 视觉学习者</dd>
              </div>
              <div>
                <dt>项目</dt>
                <dd>AI Creative Radar</dd>
              </div>
              <div>
                <dt>状态</dt>
                <dd>非商业个人实验</dd>
              </div>
              <div>
                <dt>联系</dt>
                <dd>
                  <a href="mailto:2728172670@qq.com">2728172670@qq.com</a>
                </dd>
              </div>
            </dl>
          </div>
        </article>

        <article className="about-card about-card-large">
          <p className="about-label">ABOUT THIS RADAR</p>
          <h2 id="about-title">关于这个网站</h2>
          <p>
            AI Creative Radar 是一个面向视觉创作者、学生和 AI 创意初学者的 AI
            视觉情报站。
          </p>
          <p>
            它不只是整理 AI 新闻，而是希望把分散在网络里的 AI 工具、视觉案例、创意趋势和小商业玩法，转译成更容易理解、也更容易行动的内容。
          </p>
          <p>我希望用户在这里看到一条信息时，不只是知道“发生了什么”，而是能进一步想到：</p>
          <ul>
            <li>这个工具可以用来做什么？</li>
            <li>这个案例能不能启发我的作品集？</li>
            <li>这个趋势能不能变成一个视觉项目？</li>
            <li>这个玩法能不能变成内容选题、接单服务或小小的个人尝试？</li>
          </ul>
        </article>

        <article className="about-card">
          <p className="about-label">WHY I BUILT IT</p>
          <h2>为什么做这个网站</h2>
          <p>
            我自己在学习和使用 AI 的过程中，经常会遇到一个问题：AI 信息很多，但真正和视觉创作、学生作品集、个人项目落地有关的内容并不好找。
          </p>
          <p>
            很多资讯偏技术，很多工具更新看起来很厉害，但对于刚开始尝试的人来说，常常不知道它到底可以怎么用、适合做什么、能不能变成一个具体作品。
          </p>
          <p>
            所以我想做一个更偏“创作者视角”的小网站，把我在收集 AI 信息、整理 AI 工具、观察视觉趋势时遇到的内容，重新整理成更适合学生和视觉创作者阅读的形式。
          </p>
          <p>这个网站也会记录我自己在 AI 学习、项目实践和网页制作过程中的小尝试。</p>
        </article>

        <article className="about-card">
          <p className="about-label">WHO IS IT FOR</p>
          <h2>适合谁看</h2>
          <ul>
            <li>正在学习 AI 工具的学生</li>
            <li>数字媒体艺术、视觉设计、影像、时尚、内容方向的同学</li>
            <li>想用 AI 做作品集的人</li>
            <li>想尝试 AI 视觉创作的人</li>
            <li>想找 Prompt 灵感、项目方向或小商业玩法的人</li>
            <li>和我一样，正在一边学习、一边实践、一边摸索方向的人</li>
          </ul>
        </article>

        <article className="about-card">
          <p className="about-label">WHAT YOU CAN FIND HERE</p>
          <h2>你可以在这里获得什么</h2>
          <ul>
            <li>AI 视觉工具和新功能整理</li>
            <li>AI 影像、设计、时尚、潮流相关案例</li>
            <li>适合学生或个人创作者尝试的项目灵感</li>
            <li>Prompt 方向和视觉风格参考</li>
            <li>一些可能适合做内容账号、接单、副业或小产品的想法</li>
            <li>用更容易理解的方式解释 AI 资讯和趋势</li>
          </ul>
        </article>

        <article className="about-card">
          <p className="about-label">PROJECT STATUS</p>
          <h2>项目状态</h2>
          <p>当前版本：MVP 0.1</p>
          <h3>目前已经完成</h3>
          <ul>
            <li>首页展示</li>
            <li>AI 创意情报卡片</li>
            <li>分类筛选</li>
            <li>Today’s Signal</li>
            <li>Signal Detail 详情弹窗</li>
            <li>示例数据展示</li>
          </ul>
          <h3>后续可能会继续更新</h3>
          <ul>
            <li>更真实的 AI 创意资讯</li>
            <li>Prompt 灵感库</li>
            <li>AI 视觉工具库</li>
            <li>创作者案例整理</li>
            <li>更完整的视觉档案布局</li>
            <li>部署上线后的持续更新</li>
          </ul>
        </article>

        <article className="about-card author-note">
          <div className="about-visual" aria-hidden="true">
            <span>AUTHOR ARCHIVE</span>
            <strong>贤</strong>
            <small>learning log / visual radar / tiny web project</small>
          </div>
          <p className="about-label">AUTHOR NOTE</p>
          <h2>作者说明</h2>
          <p>你好，我是贤，贤惠的贤。</p>
          <p>
            这个网站是我在学习 AI、做视觉创意项目和尝试网页开发过程中的一个小项目。它目前不是商业产品，也不盈利，只是一个个人学习和实践的尝试。
          </p>
          <p>
            我自己也还在持续学习 AI、整理信息、尝试把想法变成真正可以打开、可以使用的网页。所以如果你也正在学习 AI，或者正在为作品集、视觉项目、内容创作找方向，希望这里能给你一点点帮助。
          </p>
          <p>如果你在浏览网站时遇到问题，或者有想法、建议、反馈，都可以通过邮箱联系我：</p>
          <a className="mail-button" href="mailto:2728172670@qq.com">
            2728172670@qq.com
          </a>
          <div className="feedback-box" id="feedback">
            <p className="about-label">FEEDBACK</p>
            <p>
              如果你发现链接打不开、内容不准确，或者希望增加某个 AI 工具，可以通过邮箱反馈。
            </p>
            <p className="feedback-email">反馈邮箱：2728172670@qq.com</p>
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
          </div>
          <p>如果这个网站刚好对你有一点帮助，我会很开心。</p>
        </article>
      </div>
    </section>
  )
}

export default AboutSection
