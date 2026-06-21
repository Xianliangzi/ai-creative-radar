const SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的 AI 智能搜索与灵感推荐助手。',
  '你的用户是 AIGC 初学者、AI 视觉创作者、数字媒体学生和内容运营者。',
  '你的任务不是闲聊，而是根据用户输入的完整创作需求和资料库相关内容，推荐可参考的资料、工具链、创意方向和下一步行动。',
  '请只基于传入的资料库内容做推荐，不要编造具体不存在的资料来源。',
  '如果资料库匹配较少，可以给出一般建议，但要说明“资料库匹配较少”。',
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

function normalizeList(value, maxLength) {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, maxLength) : []
}

function normalizeRecommendation(result) {
  return {
    understanding: typeof result.understanding === 'string' ? result.understanding : '',
    recommended_resources: normalizeList(result.recommended_resources, 5).map((item) => ({
      title: item?.title || '',
      type: item?.type || '',
      category: item?.category || '',
      reason: item?.reason || '',
      usage: item?.usage || '',
    })),
    toolchain: normalizeList(result.toolchain, 6),
    creative_directions: normalizeList(result.creative_directions, 3).map((item) => ({
      title: item?.title || '',
      suitable_for: item?.suitable_for || '',
      how_to_make: item?.how_to_make || '',
      output: item?.output || '',
    })),
    next_steps: normalizeList(result.next_steps, 5),
  }
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

function buildUserPrompt(query, resources) {
  const resourcesForPrompt = Array.isArray(resources)
    ? resources.slice(0, 12).map((resource) => ({
        id: resource.id,
        title: resource.title,
        type: resource.type,
        category: resource.category,
        summary: resource.summary,
        tools: resource.tools,
        related_concepts: resource.related_concepts,
        creator_value: resource.creator_value,
        project_ideas: resource.project_ideas,
        prompt_hint: resource.prompt_hint,
        workflow_hint: resource.workflow_hint,
        platform_suggestions: resource.platform_suggestions,
        difficulty: resource.difficulty,
        scores: resource.scores,
      }))
    : []

  return [
    `用户输入的搜索词 / 创作需求：${query}`,
    '',
    resourcesForPrompt.length
      ? '前端从资料库中筛出的相关资料如下，最多 12 条：'
      : '当前资料库匹配较少，请基于用户需求给出谨慎的一般建议，并说明资料库匹配较少。',
    JSON.stringify(resourcesForPrompt, null, 2),
    '',
    '请返回结构化推荐，包含：',
    '1. 需求理解：简要复述用户想做什么',
    '2. 推荐资料：3-5 条，包含标题、类型 / 分类、推荐理由、可以怎么用到项目里',
    '3. 推荐工具链：基于资料库出现的工具和可选工具方向',
    '4. 可执行创意方向：3 个方向，每个说明适合什么人、怎么做、可输出什么结果',
    '5. 下一步建议：3-5 条行动建议',
    '',
    '请严格返回以下 JSON 结构，不要输出 Markdown，不要输出解释文字：',
    JSON.stringify(
      {
        understanding: '我理解你的需求是……',
        recommended_resources: [
          {
            title: '资料标题',
            type: '资料类型',
            category: '资料分类',
            reason: '推荐理由',
            usage: '可以怎么用到项目里',
          },
        ],
        toolchain: ['工具或工具方向 1', '工具或工具方向 2'],
        creative_directions: [
          {
            title: '方向 A：AI 海报系列',
            suitable_for: '适合人群',
            how_to_make: '可以怎么做',
            output: '可输出什么结果',
          },
        ],
        next_steps: ['下一步 1', '下一步 2', '下一步 3'],
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
    const { query, resources = [], accessCode } = request.body || {}

    if (!query || !String(query).trim()) {
      return response.status(400).json({
        success: false,
        source: 'ai',
        error: 'Missing query',
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
            content: buildUserPrompt(String(query).trim(), resources),
          },
        ],
        temperature: 0.65,
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
      const parsedResult = JSON.parse(cleanJsonContent(content))

      return response.status(200).json({
        success: true,
        source: 'ai',
        result: normalizeRecommendation(parsedResult),
      })
    } catch (error) {
      return response.status(200).json({
        success: true,
        source: 'ai-text',
        result: {
          understanding: 'AI 返回了文本推荐，但未能解析成结构化结果。',
          recommended_resources: [],
          toolchain: [],
          creative_directions: [
            {
              title: 'AI 文本推荐',
              suitable_for: '需要人工阅读整理的需求',
              how_to_make: content,
              output: '可复制文本后继续整理成创意方案',
            },
          ],
          next_steps: ['可以换一个更具体的关键词重试', '也可以进入创意方案模块生成方案'],
        },
      })
    }
  } catch (error) {
    return response.status(500).json({
      success: false,
      source: 'ai',
      error: error instanceof Error ? error.message : 'Unexpected server error',
    })
  }
}
