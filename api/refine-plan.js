const SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的创意方案顾问。',
  '用户已经获得了一份初步创意方案，现在希望继续完善。',
  '请基于用户原始目标、当前方案、历史讨论、资料库匹配内容、用户参考资料和本轮追问，给出具体、可执行的补充建议。',
  '这是连续方案讨论，不是一次性问答。你需要承接前文，不要忽略已经讨论过的方向。',
  '请用中文输出，避免空泛鸡汤，尽量给出工具、内容形式、执行步骤、视觉风格、发布平台和作品集呈现方式。',
  '不要输出过长内容。',
  '请输出 3-6 个要点，每点 1-2 句话，适合直接展示在页面里。',
].join('\n')

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

function buildReferenceResources(referenceResources) {
  return Array.isArray(referenceResources)
    ? referenceResources.slice(0, 8).map((resource) => ({
        title: resource.title,
        summary: resource.summary,
        type: resource.type,
        category: resource.category,
        tools: resource.tools,
        creator_value: resource.creator_value,
        project_ideas: resource.project_ideas,
        prompt_hint: resource.prompt_hint,
        workflow_hint: resource.workflow_hint,
        resource_intent: resource.resource_intent,
        use_in_plan_hint: resource.use_in_plan_hint,
        source_status: resource.source_status,
        verification_status: resource.verification_status,
      }))
    : []
}

function buildUserPrompt(
  query,
  currentPlan,
  followUpQuestion,
  referenceResources = [],
  refineHistory = [],
  matchedResources = [],
) {
  const referencesForPrompt = buildReferenceResources(referenceResources)
  return [
    `用户原始创意目标：${query}`,
    '',
    '当前初步方案：',
    JSON.stringify(currentPlan || {}, null, 2),
    '',
    '历史讨论记录（按时间顺序）：',
    JSON.stringify(Array.isArray(refineHistory) ? refineHistory : [], null, 2),
    '',
    '本地资料库匹配内容（可作为背景参考，不需要逐字照搬）：',
    JSON.stringify(Array.isArray(matchedResources) ? matchedResources.slice(0, 5) : [], null, 2),
    '',
    referencesForPrompt.length
      ? '用户添加的参考资料如下，可能未经过真实性核验，请优先作为创意参考、工具参考、视觉风格参考或 workflow 参考，避免将未核验内容写成确定事实：'
      : '用户本次没有额外添加参考资料。',
    JSON.stringify(referencesForPrompt, null, 2),
    '',
    `用户追问：${followUpQuestion}`,
    '',
    '请像连续聊天一样承接前面的讨论，围绕这个追问继续完善方案。回答要具体、可执行，不要重新生成整份方案。',
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
    const {
      query,
      currentPlan,
      followUpQuestion,
      referenceResources = [],
      refineHistory = [],
      matchedResources = [],
      accessCode,
    } = request.body || {}

    if (!query || !String(query).trim()) {
      return response.status(400).json({
        success: false,
        source: 'ai',
        error: 'Missing query',
      })
    }

    if (!currentPlan || typeof currentPlan !== 'object') {
      return response.status(400).json({
        success: false,
        source: 'ai',
        error: 'Missing current plan',
      })
    }

    if (!followUpQuestion || !String(followUpQuestion).trim()) {
      return response.status(400).json({
        success: false,
        source: 'ai',
        error: 'Missing follow-up question',
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
            content: buildUserPrompt(
              String(query).trim(),
              currentPlan,
              String(followUpQuestion).trim(),
              referenceResources,
              refineHistory,
              matchedResources,
            ),
          },
        ],
        temperature: 0.7,
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
    const reply = aiData?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return response.status(502).json({
        success: false,
        source: 'ai',
        error: 'AI 返回内容为空',
      })
    }

    return response.status(200).json({
      success: true,
      source: 'ai',
      reply,
    })
  } catch (error) {
    return response.status(500).json({
      success: false,
      source: 'ai',
      error: error instanceof Error ? error.message : 'Unexpected server error',
    })
  }
}
