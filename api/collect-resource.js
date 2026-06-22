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
  let normalizedUrl = String(url || '').trim()
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`
  }

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

  if (!text || text.length < 80) {
    throw new Error('Link content too short')
  }

  return {
    url: normalizedUrl,
    title,
    text: text.slice(0, 9000),
    sourceName: getDomainName(normalizedUrl),
  }
}

function normalizeResource(resource, inputType, sourceUrl, sourceName) {
  const sourceStatus = inputType === 'link' ? '链接导入' : '文本导入'

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
    source_status: resource.source_status || sourceStatus,
    verification_status: '待核验',
    verification_note: '第一版仅做内容整理，真实性核验将在后续版本增强。',
    local_only: true,
  }
}

function buildUserPrompt({ inputType, input, pageTitle, pageText, sourceName, sourceUrl }) {
  const sourceStatus = inputType === 'link' ? '链接导入' : '文本导入'

  return [
    `输入类型：${inputType}`,
    `来源状态：${sourceStatus}`,
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

    if (inputType === 'link') {
      try {
        pageData = await readLinkContent(input)
      } catch (error) {
        return response.status(422).json({
          success: false,
          source: 'link',
          error: '暂时无法读取这个链接内容，可以复制文章正文后用文本方式导入。',
        })
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
        resource: normalizeResource(parsedResource, inputType, pageData.url, pageData.sourceName),
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
