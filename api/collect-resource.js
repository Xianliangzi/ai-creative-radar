const SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的资料库整理助手。',
  '你的任务是把用户提供的链接正文或文本内容整理成一条 AIGC / AI 视觉创作者资料库卡片。',
  '请面向 AIGC 初学者、AI 视觉创作者、数字媒体学生和内容运营者。',
  '不要编造具体发布时间、官方来源或不存在的事实。',
  '如果无法判断工具、来源或发布时间，请留空。',
  '请用中文输出，具体、克制、可执行。',
  '必须返回严格 JSON，不要输出 Markdown，不要输出解释文字。',
].join('\n')

function cleanJsonContent(content) {
  return content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function normalizeList(value, maxLength = 8) {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, maxLength) : []
}

function getAiErrorMessage(status, errorText) {
  const normalizedError = String(errorText || '').toLowerCase()

  if (status === 401) return 'AI API Key 无效或未授权'
  if (status === 402 || normalizedError.includes('insufficient balance')) return 'AI API 余额不足'
  if (status === 404 || normalizedError.includes('model')) return 'AI 模型名称可能不正确'
  if (status === 429) return 'AI 请求过于频繁，请稍后再试'
  if (status >= 500) return 'AI 服务暂时不可用'

  return `AI API 请求失败，状态码 ${status}`
}

function hasValidAccessCode(requiredAccessCode, providedAccessCode) {
  if (!requiredAccessCode) return true
  return String(providedAccessCode || '') === requiredAccessCode
}

function getDomainName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch (error) {
    return ''
  }
}

function normalizeUrlInput(url) {
  const trimmedUrl = String(url || '').trim()
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
}

function detectResourceIntentFromUrl(url, title = '') {
  const normalizedUrl = normalizeUrlInput(url)
  const domain = getDomainName(normalizedUrl).toLowerCase()
  const text = `${normalizedUrl} ${domain} ${title}`.toLowerCase()

  const toolSignals = [
    'chatgpt',
    'openai.com',
    'runway',
    'midjourney',
    'pika',
    'kling',
    'kuaishou',
    'jimeng',
    'doubao',
    'comfyui',
    'heygen',
    'd-id',
    'canva',
    'krea',
    'figma',
    'spline',
    'firefly',
    'adobe',
    'stable-diffusion',
  ]

  if (domain.includes('github.com')) return 'github_project'
  if (domain.includes('huggingface.co')) return 'github_project'
  if (/(x\.com|twitter\.com|xiaohongshu\.com|instagram\.com|tiktok\.com|youtube\.com|bilibili\.com|douyin\.com)/i.test(domain)) {
    return 'social_post'
  }
  if (toolSignals.some((signal) => text.includes(signal))) return 'tool_site'
  if (/(case|gallery|showcase|portfolio|作品|案例)/i.test(text)) return 'case_page'
  if (/(blog|news|article|post|medium\.com|substack\.com|notion\.site)/i.test(text)) return 'article'

  return 'content_page'
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTitle(html) {
  const titleMatch = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return titleMatch ? stripHtml(titleMatch[1]).slice(0, 120) : ''
}

async function readLinkContent(url) {
  const normalizedUrl = normalizeUrlInput(url)

  const pageResponse = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': 'AI-Creative-Radar-Beta/1.0',
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
    },
  })

  if (!pageResponse.ok) {
    throw new Error('Link read failed')
  }

  const contentType = pageResponse.headers.get('content-type') || ''
  const rawContent = await pageResponse.text()
  const title = contentType.includes('html') ? extractTitle(rawContent) : ''
  const text = contentType.includes('html') ? stripHtml(rawContent) : rawContent.replace(/\s+/g, ' ').trim()

  return {
    url: normalizedUrl,
    title,
    text: text.slice(0, 9000),
    sourceName: getDomainName(normalizedUrl),
  }
}

function normalizeResource(resource, inputType, sourceUrl, sourceName, fallbackIntent = 'unknown') {
  const sourceStatus = inputType === 'link' ? '链接导入' : '文本导入'
  const allowedIntents = ['tool_site', 'content_page', 'github_project', 'case_page', 'social_post', 'article', 'unknown']
  const resourceIntent = allowedIntents.includes(resource.resource_intent) ? resource.resource_intent : fallbackIntent

  return {
    id: '',
    title: resource.title || '',
    type: resource.type || 'news',
    category: resource.category || 'AIGC 趋势',
    summary: resource.summary || '',
    source_name: resource.source_name || sourceName || '',
    source_url: inputType === 'link' ? resource.source_url || sourceUrl || '' : '',
    published_at: '',
    collected_at: new Date().toISOString(),
    tools: normalizeList(resource.tools),
    related_concepts: normalizeList(resource.related_concepts),
    target_users: normalizeList(resource.target_users),
    creator_value: resource.creator_value || '',
    project_ideas: normalizeList(resource.project_ideas, 6),
    prompt_hint: resource.prompt_hint || '',
    workflow_hint: resource.workflow_hint || '',
    platform_suggestions: normalizeList(resource.platform_suggestions),
    difficulty: ['入门', '中级', '进阶'].includes(resource.difficulty) ? resource.difficulty : '入门',
    freshness_score: Number(resource.freshness_score) || 3,
    credibility_score: Number(resource.credibility_score) || (inputType === 'link' ? 3 : 2),
    relevance_score: Number(resource.relevance_score) || 4,
    creator_value_score: Number(resource.creator_value_score) || 4,
    actionability_score: Number(resource.actionability_score) || 4,
    trend_score: Number(resource.trend_score) || 3,
    status: '已入库',
    resource_intent: allowedIntents.includes(resourceIntent) ? resourceIntent : 'unknown',
    use_in_plan_hint: resource.use_in_plan_hint || '',
    source_status: resource.source_status || sourceStatus,
    verification_status: '待核验',
    verification_note: '第一版仅做内容整理，真实性核验将在后续版本增强。',
    local_only: true,
  }
}

function buildUserPrompt({ inputType, input, pageTitle, pageText, sourceName, sourceUrl, detectedIntent }) {
  const sourceStatus = inputType === 'link' ? '链接导入' : '文本导入'
  const isToolLike = ['tool_site', 'github_project'].includes(detectedIntent)

  return [
    `输入类型：${inputType}`,
    `来源状态：${sourceStatus}`,
    `系统初步判断的资料类型：${detectedIntent || 'unknown'}`,
    `来源名称候选：${sourceName || ''}`,
    `来源链接：${sourceUrl || ''}`,
    `页面标题候选：${pageTitle || ''}`,
    '',
    '需要整理的内容：',
    inputType === 'link' ? pageText : String(input || '').slice(0, 9000),
    '',
    '请整理成当前资料库结构。注意：',
    '- 不要编造发布时间，没有就留空',
    '- 不要编造官方来源，无法判断就留空或使用域名',
    '- 文本导入 source_url 留空',
    '- 如果无法判断工具，就 tools 使用空数组',
    '- 评分使用 1-5 分',
    '- status 固定为“已入库”',
    '- source_status 使用“链接导入”或“文本导入”',
    '- verification_status 固定为“待核验”',
    '- resource_intent 必须是 tool_site、content_page、github_project、case_page、social_post、article、unknown 之一',
    '- 如果是工具官网、SaaS 产品页、GitHub 项目或 Hugging Face 项目，不要强行写成“文章讲了什么”，请整理它是什么工具 / 项目、适合 AIGC 流程哪个环节、可以具体做什么、适合哪些创作者、如何用于当前方案',
    '- 如果是新闻文章、博客、教程、案例页、社媒内容或趋势分析，请总结内容重点，提炼和 AIGC / 创作相关的信息',
    '- use_in_plan_hint 必须明确说明这条资料在生成方案时应该怎么用，例如工具链参考、AI 视频生成工具参考、数字人内容生产工具参考、视觉风格案例参考、趋势背景参考、Prompt / workflow 参考、平台运营玩法参考',
    '- 网页内容较少时，可以基于链接域名、页面标题和内容做保守整理，但必须保持 verification_status 为“待核验”，不要编造具体新闻事实',
    isToolLike
      ? '- 当前链接初步判断为工具 / 项目类，请优先输出工具用途、创作流程位置和可用于方案的方式，不要写成文章摘要。'
      : '- 当前链接初步判断为内容类或未知，请优先提炼内容重点和创作参考价值。',
    '',
    '请严格返回以下 JSON 结构，不要输出 Markdown，不要输出解释文字：',
    JSON.stringify(
      {
        id: '',
        title: '',
        type: 'news | tool | case | concept | prompt | workflow | platform | business',
        category: '',
        summary: '',
        source_name: '',
        source_url: '',
        published_at: '',
        collected_at: '',
        tools: [],
        related_concepts: [],
        target_users: [],
        creator_value: '',
        project_ideas: [],
        prompt_hint: '',
        workflow_hint: '',
        platform_suggestions: [],
        difficulty: '入门 | 中级 | 进阶',
        freshness_score: 3,
        credibility_score: 3,
        relevance_score: 4,
        creator_value_score: 4,
        actionability_score: 4,
        trend_score: 3,
        status: '已入库',
        resource_intent: 'tool_site | content_page | github_project | case_page | social_post | article | unknown',
        use_in_plan_hint: '这条资料可以如何用于方案生成',
        source_status: sourceStatus,
        verification_status: '待核验',
        verification_note: '第一版仅做内容整理，真实性核验将在后续版本增强。',
        local_only: true,
      },
      null,
      2,
    ),
  ].join('\n')
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  try {
    const { input_type: inputType, input, accessCode } = request.body || {}

    if (!input || !String(input).trim()) {
      return response.status(400).json({
        success: false,
        source: 'server',
        error: 'Missing input',
      })
    }

    if (!['link', 'text'].includes(inputType)) {
      return response.status(400).json({
        success: false,
        source: 'server',
        error: 'Invalid input type',
      })
    }

    const apiKey = process.env.AI_API_KEY
    const baseUrl = process.env.AI_API_BASE_URL
    const model = process.env.AI_MODEL
    const requiredAccessCode = process.env.AI_ACCESS_CODE

    if (!hasValidAccessCode(requiredAccessCode, accessCode)) {
      return response.status(401).json({
        success: false,
        source: 'server',
        error: 'Invalid access code',
      })
    }

    if (!apiKey || !baseUrl || !model) {
      return response.status(500).json({
        success: false,
        source: 'server',
        error: 'Missing AI environment variables',
      })
    }

    let pageData = {
      url: '',
      title: '',
      text: String(input).slice(0, 9000),
      sourceName: '',
    }
    let detectedIntent = inputType === 'link' ? detectResourceIntentFromUrl(input) : 'content_page'

    if (inputType === 'link') {
      try {
        pageData = await readLinkContent(input)
        detectedIntent = detectResourceIntentFromUrl(pageData.url, pageData.title)
      } catch (error) {
        const normalizedUrl = normalizeUrlInput(input)
        const fallbackIntent = detectResourceIntentFromUrl(normalizedUrl)
        if (['tool_site', 'github_project'].includes(fallbackIntent)) {
          const sourceName = getDomainName(normalizedUrl)
          pageData = {
            url: normalizedUrl,
            title: sourceName,
            text: `这是一个可能的工具型网址或项目页。URL：${normalizedUrl}。域名：${sourceName}。页面正文暂时无法稳定读取，请根据链接、域名、标题和常见 AIGC 工具知识做保守整理。不要编造具体新闻事实、发布时间或已验证功能。`,
            sourceName,
          }
          detectedIntent = fallbackIntent
        } else {
        return response.status(422).json({
          success: false,
          source: 'link',
          error: '暂时无法读取这个链接内容，可以复制文章正文后用文本方式导入。',
        })
        }
      }
    }

    const aiResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: buildUserPrompt({
              inputType,
              input,
              pageTitle: pageData.title,
              pageText: pageData.text,
              sourceName: pageData.sourceName,
              sourceUrl: pageData.url,
              detectedIntent,
            }),
          },
        ],
        temperature: 0.55,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      return response.status(aiResponse.status).json({
        success: false,
        source: 'ai',
        error: getAiErrorMessage(aiResponse.status, errorText),
      })
    }

    const aiData = await aiResponse.json()
    const content = aiData?.choices?.[0]?.message?.content

    if (!content) {
      return response.status(502).json({
        success: false,
        source: 'ai',
        error: 'AI 返回内容为空',
      })
    }

    try {
      const parsedResource = JSON.parse(cleanJsonContent(content))

      return response.status(200).json({
        success: true,
        source: 'ai',
        resource: normalizeResource(parsedResource, inputType, pageData.url, pageData.sourceName, detectedIntent),
      })
    } catch (error) {
      return response.status(502).json({
        success: false,
        source: 'ai',
        error: 'AI 返回内容不是合法资料卡片 JSON',
      })
    }
  } catch (error) {
    return response.status(500).json({
      success: false,
      source: 'server',
      error: error instanceof Error ? error.message : 'Unexpected server error',
    })
  }
}
