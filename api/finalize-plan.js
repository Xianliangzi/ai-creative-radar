const SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的创意方案顾问。',
  '用户已经有初步方案和多轮追问，现在需要你把这些内容整理成一份完整方案草稿。',
  '请面向视觉创作者、学生、内容运营和 AI 创意初学者输出。',
  '方案需要具体、可执行，适合做作品集项目、内容账号实验或课程项目。',
  '不要简单复制原文，要重新整理成一份结构化方案。',
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
    title: plan.title || '',
    summary: plan.summary || '',
    target: plan.target || '',
    concept: plan.concept || '',
    tools: normalizeList(plan.tools),
    content_structure: normalizeList(plan.content_structure),
    execution_steps: normalizeList(plan.execution_steps),
    visual_style: normalizeList(plan.visual_style),
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

function buildUserPrompt(query, currentPlan, refineHistory) {
  return [
    `用户原始创意目标：${query}`,
    '',
    '当前初步方案：',
    JSON.stringify(currentPlan || {}, null, 2),
    '',
    '用户追问记录和 AI 补充建议：',
    JSON.stringify(Array.isArray(refineHistory) ? refineHistory : [], null, 2),
    '',
    '请把以上内容重新整理成一份完整方案草稿。',
    '要求：不要简单复制原文；要整合、归纳、补齐执行路径；适合后续保存、下载或导出。',
    '',
    '请严格返回以下 JSON 结构，不要输出 Markdown，不要输出解释文字：',
    JSON.stringify(
      {
        title: '方案标题',
        summary: '方案摘要',
        target: '项目目标',
        concept: '核心概念',
        tools: ['工具1', '工具2'],
        content_structure: ['内容模块1', '内容模块2'],
        execution_steps: ['步骤1', '步骤2', '步骤3'],
        visual_style: ['视觉风格1', '视觉风格2'],
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
    const { query, currentPlan, refineHistory = [], accessCode } = request.body || {}

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
            content: buildUserPrompt(String(query).trim(), currentPlan, refineHistory),
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
