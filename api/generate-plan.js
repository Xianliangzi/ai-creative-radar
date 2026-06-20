function cleanJsonContent(content) {
  return content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function normalizePlan(plan) {
  return {
    overview: plan.overview || '',
    recommended_tools: Array.isArray(plan.recommended_tools) ? plan.recommended_tools : [],
    related_cases: Array.isArray(plan.related_cases) ? plan.related_cases : [],
    directions: Array.isArray(plan.directions) ? plan.directions : [],
    prompt_ideas: Array.isArray(plan.prompt_ideas) ? plan.prompt_ideas : [],
    business_ideas: Array.isArray(plan.business_ideas) ? plan.business_ideas : [],
    next_steps: Array.isArray(plan.next_steps) ? plan.next_steps : [],
  }
}

function buildUserPrompt(query, matchedSignals) {
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

  return [
    `用户输入的创意方向：${query}`,
    '',
    signalsForPrompt.length
      ? '系统匹配到的 AI 工具、案例和资讯如下：'
      : '当前匹配资讯较少，请基于用户输入给出一个谨慎、可执行的初步方案。',
    JSON.stringify(signalsForPrompt, null, 2),
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
    const { query, matchedSignals = [] } = request.body || {}

    if (!query || !String(query).trim()) {
      return response.status(400).json({
        success: false,
        error: 'Missing query',
      })
    }

    const apiKey = process.env.AI_API_KEY
    const baseUrl = process.env.AI_API_BASE_URL
    const model = process.env.AI_MODEL

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
            content:
              '你是 AI Creative Radar 的创意方案顾问，面向视觉创作者、学生、内容运营和 AI 创意初学者。你的任务是根据用户输入的创意方向，以及系统匹配到的 AI 工具、案例和资讯，整理一份可执行的初步创意方案。请用中文输出，结构清晰，避免空泛鸡汤，尽量给出具体工具、案例方向、Prompt 灵感、商业玩法和下一步行动。你必须返回严格 JSON，不要输出 Markdown，不要输出解释文字。',
          },
          {
            role: 'user',
            content: buildUserPrompt(String(query).trim(), matchedSignals),
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
        error: errorText || `AI API request failed with status ${aiResponse.status}`,
      })
    }

    const aiData = await aiResponse.json()
    const content = aiData?.choices?.[0]?.message?.content

    if (!content) {
      return response.status(502).json({
        success: false,
        source: 'ai',
        error: 'Empty AI response',
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
