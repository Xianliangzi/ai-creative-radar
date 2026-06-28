const SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的创意方案顾问，面向视觉创作者、学生、内容运营和 AI 创意初学者。',
  '你的任务是根据用户输入的创意目标，以及系统匹配到的 AI 工具、案例和资讯，整理一份可执行的初步创意方案。',
  '你输出的是给视觉创作者的初步执行方案，不是概念介绍。',
  '请尽量具体到工具组合、内容形式、制作步骤、视觉风格、适合发布的平台和作品集呈现方式。',
  '不要空泛鸡汤，不要只写概念，不要夸大效果。',
  '必须用中文输出。',
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

function normalizePlan(plan) {
  return {
    overview: typeof plan.overview === 'string' ? plan.overview : '',
    recommended_tools: normalizeList(plan.recommended_tools, 6),
    related_cases: normalizeList(plan.related_cases, 4),
    directions: normalizeList(plan.directions, 4),
    prompt_ideas: normalizeList(plan.prompt_ideas, 4),
    business_ideas: normalizeList(plan.business_ideas, 3),
    next_steps: normalizeList(plan.next_steps, 5),
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

function getPlanTypeInstruction(planType = '自由脑暴') {
  const instructions = {
    作品集项目: '方案类型是“作品集项目”。请重点输出项目概念、视觉系统、工具链、制作流程、最终展示方式和作品集包装价值。',
    小红书账号: '方案类型是“小红书账号”。请重点输出账号定位、人设 / 内容风格、内容栏目、封面与标题方向、发布频率、涨粉与互动建议。',
    'AI 视频短片': '方案类型是“AI 视频短片”。请重点输出故事概念、分镜结构、视觉风格、工具链、音乐 / 节奏建议和制作流程。',
    'AI 海报实验': '方案类型是“AI 海报实验”。请重点输出视觉主题、系列结构、风格关键词、Prompt 灵感、输出规格和展示方式。',
    数字人项目: '方案类型是“数字人项目”。请重点输出角色设定、人设定位、内容栏目、视觉一致性、工具链和平台发布建议。',
    商业提案: '方案类型是“商业提案”。请重点输出目标人群、商业价值、使用场景、执行方案、成本 / 周期和交付物。',
    课程作业: '方案类型是“课程作业”。请重点输出主题表达、作业结构、技术流程、展示材料、可交付内容和老师能看懂的项目说明。',
    自由脑暴: '方案类型是“自由脑暴”。保持开放式结构，但仍然要给出具体、可执行的工具、方向和下一步建议。',
  }

  return instructions[planType] || instructions.自由脑暴
}

function buildUserPrompt(query, matchedSignals, referenceResources = [], planType = '自由脑暴') {
  const signalsForPrompt = Array.isArray(matchedSignals)
    ? matchedSignals.slice(0, 5).map((signal) => ({
        title: signal.title,
        summary: signal.summary,
        creator_value: signal.creator_value,
        project_ideas: signal.project_ideas,
        business_potential: signal.business_potential,
        tools: signal.tools,
        prompt_hint: signal.prompt_hint,
        source: signal.source,
        url: signal.url,
      }))
    : []
  const referencesForPrompt = buildReferenceResources(referenceResources)

  return [
    `用户输入的创意目标：${query}`,
    `用户选择的方案类型：${planType || '自由脑暴'}`,
    getPlanTypeInstruction(planType),
    '',
    '说明：用户输入的是创意目标，不一定是关键词。请理解用户真正想做的项目方向。',
    '匹配到的资讯只是参考材料，不要求逐字照搬。',
    '如果资讯不足，也要根据用户目标生成谨慎、合理、可执行的方案。',
    '方案要适合学生个人项目、小型作品集项目或内容账号实验。',
    '尽量给出可以马上开始做的下一步。',
    '',
    signalsForPrompt.length
      ? '系统匹配到的 AI 工具、案例和资讯如下，最多 5 条：'
      : '当前匹配资讯较少，请基于用户目标给出一个谨慎、可执行的初步方案。',
    JSON.stringify(signalsForPrompt, null, 2),
    '',
    referencesForPrompt.length
      ? '用户添加的参考资料如下，可能未经过真实性核验，请优先作为创意参考、工具参考、视觉风格参考或 workflow 参考，避免将未核验内容写成确定事实：'
      : '用户本次没有额外添加参考资料。',
    JSON.stringify(referencesForPrompt, null, 2),
    '',
    '字段长度要求：',
    '- overview：1-2 句话',
    '- recommended_tools：2-6 个',
    '- related_cases：2-4 条',
    '- directions：2-4 条',
    '- prompt_ideas：2-4 条',
    '- business_ideas：2-3 条',
    '- next_steps：3-5 条',
    '- 每条内容不要太长，适合前端卡片展示',
    '',
    '请严格返回以下 JSON 结构，不要输出 Markdown，不要输出解释文字：',
    JSON.stringify(
      {
        overview: '一句话概括这个创意方向可以怎么做',
        recommended_tools: ['工具1', '工具2'],
        related_cases: ['相关案例1', '相关案例2'],
        directions: ['可落地方向1', '可落地方向2'],
        prompt_ideas: ['Prompt 灵感1', 'Prompt 灵感2'],
        business_ideas: ['商业玩法1', '商业玩法2'],
        next_steps: ['第一步', '第二步', '第三步'],
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
    const { query, planType = '自由脑暴', matchedSignals = [], referenceResources = [], accessCode } = request.body || {}

    if (!query || !String(query).trim()) {
      return response.status(400).json({
        success: false,
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
            content: buildUserPrompt(String(query).trim(), matchedSignals, referenceResources, planType),
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
    const content = aiData?.choices?.[0]?.message?.content

    if (!content) {
      return response.status(502).json({
        success: false,
        source: 'ai',
        error: 'AI 返回内容为空',
      })
    }

    try {
      const parsedPlan = JSON.parse(cleanJsonContent(content))

      return response.status(200).json({
        success: true,
        source: 'ai',
        plan: normalizePlan(parsedPlan),
      })
    } catch (error) {
      return response.status(200).json({
        success: true,
        source: 'ai-text',
        plan: {
          overview: 'AI 返回了文本方案，但未能解析成结构化 JSON。',
          recommended_tools: [],
          related_cases: [],
          directions: [content],
          prompt_ideas: [],
          business_ideas: [],
          next_steps: ['请稍后重试，或查看本地匹配结果。'],
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
