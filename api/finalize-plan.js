const SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的创意方案顾问。',
  '用户已经有初步方案、多轮追问和资料库匹配内容，现在需要你把这些内容整理成一份最终方案草稿。',
  '请面向视觉创作者、学生、内容运营和 AI 创意初学者输出。',
  '方案需要具体、可执行，适合做作品集项目、内容账号实验或课程项目。',
  '不要简单复制原文，要重新整理成一份结构化方案。',
  '用户提供的参考资料可能包含工具网址、文章内容、文本片段或未核验资料。请将其作为创作参考、工具参考或案例参考使用，不要把未核验内容写成确定事实。',
  '请基于完整讨论记录总结为一个可执行方案，而不是只回应最后一轮追问。',
  '方案要适合后续保存到“我的方案库”，也适合后续导出为文档、PPT 大纲或执行计划。',
  '请用中文输出严格 JSON，不要输出 Markdown，不要输出解释文字。',
].join('\n')

function cleanJsonContent(content) {
  return content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function normalizeFinalPlan(plan) {
  return {
    plan_type: plan.plan_type || '',
    title: plan.title || '',
    summary: plan.summary || '',
    target: plan.target || '',
    target_users: normalizeList(plan.target_users),
    concept: plan.concept || '',
    tools: normalizeList(plan.tools),
    content_structure: normalizeList(plan.content_structure),
    execution_steps: normalizeList(plan.execution_steps),
    visual_style: normalizeList(plan.visual_style),
    prompt_ideas: normalizeList(plan.prompt_ideas),
    platform_suggestions: normalizeList(plan.platform_suggestions),
    portfolio_value: plan.portfolio_value || '',
    next_actions: normalizeList(plan.next_actions),
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
    作品集项目: '最终方案类型是“作品集项目”。请重点整理项目概念、视觉系统、工具链、制作流程、最终展示方式和作品集包装价值。',
    小红书账号: '最终方案类型是“小红书账号”。请重点整理账号定位、人设 / 内容风格、内容栏目、封面与标题方向、发布频率、涨粉与互动建议。',
    'AI 视频短片': '最终方案类型是“AI 视频短片”。请重点整理故事概念、分镜结构、视觉风格、工具链、音乐 / 节奏建议和制作流程。',
    'AI 海报实验': '最终方案类型是“AI 海报实验”。请重点整理视觉主题、系列结构、风格关键词、Prompt 灵感、输出规格和展示方式。',
    数字人项目: '最终方案类型是“数字人项目”。请重点整理角色设定、人设定位、内容栏目、视觉一致性、工具链和平台发布建议。',
    商业提案: '最终方案类型是“商业提案”。请重点整理目标人群、商业价值、使用场景、执行方案、成本 / 周期和交付物。',
    课程作业: '最终方案类型是“课程作业”。请重点整理主题表达、作业结构、技术流程、展示材料、可交付内容和老师能看懂的项目说明。',
    自由脑暴: '最终方案类型是“自由脑暴”。保持开放式结构，但仍然要总结成清楚、可执行的最终方案。',
  }

  return instructions[planType] || instructions.自由脑暴
}

function buildUserPrompt(query, currentPlan, refineHistory, matchedResources = [], referenceResources = [], planType = '自由脑暴') {
  const referencesForPrompt = buildReferenceResources(referenceResources)
  return [
    `用户原始创意目标：${query}`,
    `用户选择的方案类型：${planType || '自由脑暴'}`,
    getPlanTypeInstruction(planType),
    '',
    '当前初步方案：',
    JSON.stringify(currentPlan || {}, null, 2),
    '',
    '用户追问记录和 AI 补充建议：',
    JSON.stringify(Array.isArray(refineHistory) ? refineHistory : [], null, 2),
    '',
    '资料库匹配内容（可作为参考，不需要逐字照搬）：',
    JSON.stringify(Array.isArray(matchedResources) ? matchedResources.slice(0, 5) : [], null, 2),
    '',
    referencesForPrompt.length
      ? '用户添加的参考资料如下，可能包含工具网址、文章内容、文本片段或未核验资料。请优先作为创意参考、工具参考、案例参考、视觉风格参考或 workflow 参考，避免将未核验内容写成确定事实：'
      : '用户本次没有额外添加参考资料。',
    JSON.stringify(referencesForPrompt, null, 2),
    '',
    '请基于完整讨论记录、初步方案、本地资料库匹配内容和用户参考资料，重新整理成一份最终方案草稿。',
    '要求：不要简单复制原文；要整合、归纳、补齐执行路径；适合后续保存、下载或导出。',
    '最终方案需要覆盖：项目标题、一句话概念、适合人群 / 使用场景、核心创意方向、推荐工具链、视觉风格建议、内容结构 / 栏目结构、执行步骤、Prompt 灵感、发布平台建议、作品集包装方式和下一步行动清单。',
    '',
    '请严格返回以下 JSON 结构，不要输出 Markdown，不要输出解释文字：',
    JSON.stringify(
      {
        title: '方案标题',
        plan_type: planType || '自由脑暴',
        summary: '一句话方案摘要',
        target: '项目目标',
        target_users: ['适合人群或使用场景1', '适合人群或使用场景2'],
        concept: '一句话核心概念',
        tools: ['工具1', '工具2'],
        content_structure: ['内容模块1', '内容模块2'],
        execution_steps: ['步骤1', '步骤2', '步骤3'],
        visual_style: ['视觉风格1', '视觉风格2'],
        prompt_ideas: ['Prompt 灵感1', 'Prompt 灵感2'],
        platform_suggestions: ['平台建议1', '平台建议2'],
        portfolio_value: '这个项目如何放进作品集',
        next_actions: ['下一步1', '下一步2', '下一步3'],
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
    const {
      query,
      currentPlan,
      refineHistory = [],
      matchedResources = [],
      referenceResources = [],
      planType = '自由脑暴',
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
              refineHistory,
              matchedResources,
              referenceResources,
              planType,
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
        finalPlan: normalizeFinalPlan(parsedPlan),
      })
    } catch (error) {
      return response.status(502).json({
        success: false,
        source: 'ai',
        error: 'AI 返回内容未能解析成完整方案 JSON',
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
