const RESOURCE_SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的资源情报分析助手。',
  '请把用户提供的网页内容或文本整理成结构化 resource-intelligence JSON。',
  'resource intelligence 必须包含 Creative Mapping Layer：category、creative_potential、usage_scenarios、workflow_hint 和 recombination_ideas。',
  'Creative Mapping Layer 需要说明资源可以如何转化成项目、适用场景、所处创作环节以及可组合的 AI 工具。',
  '只允许把 type 设置为 tool、article 或 github。',
  '不要编造来源中没有明确提供的事实。',
  '请用中文输出严格 JSON，不要输出 Markdown 或解释文字。',
].join('\n')

const PLAN_SYSTEM_PROMPT = [
  '你是 AI Creative Radar 的创意方案顾问。',
  '请严格根据 resource intelligence 中的 Creative Mapping Layer 生成一份可执行的初步创意方案。',
  'Creative Mapping Layer 包括 creative_potential、usage_scenarios、workflow_hint、recombination_ideas 和 category，这些字段是方案生成的主要依据。',
  '不要只根据 summary 生成方案，也不要忽略 Creative Mapping Layer。',
  'plan 必须体现 resource → Creative Mapping → 创意方案的转化路径。',
  '必须输出 resource_influence_log，逐项说明哪些 resource 字段影响了 plan 的哪些部分。',
  '方案面向 AIGC 初学者、视觉创作者、学生和内容运营者。',
  '建议应具体到项目概念、工具、工作流、执行步骤和 Prompt 灵感。',
  '请用中文输出严格 JSON，不要输出 Markdown 或解释文字。',
].join('\n')

function cleanJsonContent(content) {
  return String(content || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function isLikelyUrl(input) {
  const value = String(input || '').trim()
  if (/^https?:\/\//i.test(value)) return true
  return /^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(value)
}

function normalizeUrl(input) {
  const value = String(input || '').trim()
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function normalizeList(value, maxLength = 8) {
  return Array.isArray(value) ? value.filter(Boolean).slice(0, maxLength) : []
}

function getFallbackCreativeMapping(category) {
  const mappings = {
    tool: {
      creative_potential: '把这个工具用于一个小型 AIGC 视觉实验，验证它在内容生产或作品集表达中的价值。',
      usage_scenarios: ['AI 视觉内容制作', '作品集项目', '商业提案'],
      workflow_hint: 'production',
      recombination_ideas: ['结合 ChatGPT 生成脚本与 Prompt，再用该工具完成视觉制作。', '与图像或视频生成工具组合，形成完整生产链路。'],
    },
    github: {
      creative_potential: '把这个开源项目改造成一套可复用的 AIGC 工作流，并记录技术过程和视觉结果。',
      usage_scenarios: ['本地工作流搭建', '课程技术实验', '作品集过程展示'],
      workflow_hint: 'production',
      recombination_ideas: ['与 ComfyUI 或 Stable Diffusion 组合搭建生成流程。', '结合 ChatGPT 整理配置、参数和项目文档。'],
    },
    case: {
      creative_potential: '拆解案例中的视觉语言和制作方式，再转译成自己的系列化创意实验。',
      usage_scenarios: ['视觉风格分析', '作品集案例研究', '商业提案参考'],
      workflow_hint: 'reference',
      recombination_ideas: ['用 Midjourney 或即梦复现视觉语言并加入个人主题。', '用 Runway、Pika 或可灵延展成动态内容。'],
    },
    content: {
      creative_potential: '把资源中的关键观点转化成视觉选题、内容栏目或可执行的 AIGC 项目。',
      usage_scenarios: ['小红书内容', 'AI 视频或海报', '作品集研究'],
      workflow_hint: 'idea',
      recombination_ideas: ['结合 ChatGPT 整理脚本、分镜和 Prompt。', '使用 Midjourney、即梦或 Canva 转译成视觉内容。'],
    },
    unknown: {
      creative_potential: '先把资源作为灵感线索，通过低成本概念验证判断它是否值得发展成项目。',
      usage_scenarios: ['灵感收集', '项目研究', '概念验证'],
      workflow_hint: 'reference',
      recombination_ideas: ['结合 ChatGPT 提炼关键词和创意方向。', '选择一个视觉生成工具制作第一版测试。'],
    },
  }

  return mappings[category] || mappings.unknown
}

function normalizeResource(resource) {
  const allowedTypes = ['tool', 'article', 'github']
  const allowedCategories = ['tool', 'content', 'github', 'case', 'unknown']
  const allowedWorkflowHints = ['idea', 'production', 'post', 'reference']
  const type = allowedTypes.includes(resource?.type) ? resource.type : 'article'
  const category = allowedCategories.includes(resource?.category)
    ? resource.category
    : type === 'github'
      ? 'github'
      : type === 'tool'
        ? 'tool'
        : 'content'
  const workflowHint = allowedWorkflowHints.includes(resource?.workflow_hint)
    ? resource.workflow_hint
    : category === 'tool' || category === 'github'
      ? 'production'
      : 'reference'
  const fallbackMapping = getFallbackCreativeMapping(category)
  const usageScenarios = normalizeList(resource?.usage_scenarios, 6)
  const recombinationIdeas = normalizeList(resource?.recombination_ideas, 3)

  return {
    type,
    category,
    summary: typeof resource?.summary === 'string' ? resource.summary : '',
    key_points: normalizeList(resource?.key_points),
    creative_value: typeof resource?.creative_value === 'string' ? resource.creative_value : '',
    tags: normalizeList(resource?.tags),
    creative_potential:
      typeof resource?.creative_potential === 'string'
        ? resource.creative_potential
        : fallbackMapping.creative_potential,
    usage_scenarios: usageScenarios.length >= 3 ? usageScenarios : fallbackMapping.usage_scenarios,
    workflow_hint: allowedWorkflowHints.includes(resource?.workflow_hint)
      ? workflowHint
      : fallbackMapping.workflow_hint,
    recombination_ideas: recombinationIdeas.length >= 2 ? recombinationIdeas : fallbackMapping.recombination_ideas,
  }
}

function getFallbackInfluenceLog(resource) {
  return [
    {
      resource_field: 'category',
      influenced_plan_fields: ['project_concept', 'workflow'],
      explanation: `资源分类 ${resource.category} 决定了项目定位和方案组织方式。`,
    },
    {
      resource_field: 'creative_potential',
      influenced_plan_fields: ['project_concept'],
      explanation: 'creative_potential 被转化为方案的核心项目概念。',
    },
    {
      resource_field: 'usage_scenarios',
      influenced_plan_fields: ['steps', 'prompt_ideas'],
      explanation: 'usage_scenarios 决定了落地场景、执行动作和 Prompt 的使用方向。',
    },
    {
      resource_field: 'workflow_hint',
      influenced_plan_fields: ['workflow', 'steps'],
      explanation: `workflow_hint=${resource.workflow_hint} 决定了方案是灵感型、执行型、分析型还是内容发布型。`,
    },
    {
      resource_field: 'recombination_ideas',
      influenced_plan_fields: ['tools', 'workflow'],
      explanation: 'recombination_ideas 被转化为工具组合和工作流衔接方式。',
    },
  ]
}

function normalizeInfluenceLog(value, resource) {
  if (!Array.isArray(value) || value.length === 0) return getFallbackInfluenceLog(resource)

  const normalized = value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          resource_field: 'creative_mapping',
          influenced_plan_fields: [],
          explanation: item,
        }
      }

      return {
        resource_field: typeof item?.resource_field === 'string' ? item.resource_field : 'creative_mapping',
        influenced_plan_fields: normalizeList(item?.influenced_plan_fields, 5),
        explanation: typeof item?.explanation === 'string' ? item.explanation : '',
      }
    })
    .filter((item) => item.explanation)
    .slice(0, 8)

  return normalized.length ? normalized : getFallbackInfluenceLog(resource)
}

function normalizePlan(plan, resource) {
  return {
    project_concept: typeof plan?.project_concept === 'string' ? plan.project_concept : '',
    tools: normalizeList(plan?.tools, 6),
    workflow: normalizeList(plan?.workflow, 6),
    steps: normalizeList(plan?.steps, 8),
    prompt_ideas: normalizeList(plan?.prompt_ideas, 6),
    resource_influence_log: normalizeInfluenceLog(plan?.resource_influence_log, resource),
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

async function callAi({ apiKey, baseUrl, model, systemPrompt, userPrompt }) {
  const aiResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
    }),
  })

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text()
    throw new Error(getAiErrorMessage(aiResponse.status, errorText))
  }

  const aiData = await aiResponse.json()
  const content = aiData?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')

  try {
    return JSON.parse(cleanJsonContent(content))
  } catch (error) {
    throw new Error('AI 返回内容不是合法 JSON')
  }
}

function getCrawlMarkdown(crawlData) {
  const firstResult = crawlData?.results?.[0]
  if (!crawlData?.success || !firstResult?.success) {
    throw new Error(firstResult?.error_message || 'Crawl4AI 未能读取该网页')
  }

  if (typeof firstResult.markdown === 'string') return firstResult.markdown
  if (typeof firstResult.markdown?.fit_markdown === 'string') return firstResult.markdown.fit_markdown
  if (typeof firstResult.markdown?.raw_markdown === 'string') return firstResult.markdown.raw_markdown
  if (typeof firstResult.cleaned_html === 'string') return firstResult.cleaned_html

  throw new Error('Crawl4AI 返回的网页内容为空')
}

async function crawlUrl(url) {
  const crawl4aiBaseUrl = process.env.CRAWL4AI_API_URL || 'http://localhost:11235'
  const crawl4aiToken = process.env.CRAWL4AI_API_TOKEN
  const headers = { 'Content-Type': 'application/json' }

  if (crawl4aiToken) headers.Authorization = `Bearer ${crawl4aiToken}`

  const crawlResponse = await fetch(`${crawl4aiBaseUrl.replace(/\/$/, '')}/crawl`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      urls: [url],
      browser_config: {
        type: 'BrowserConfig',
        params: {
          headless: true,
        },
      },
      crawler_config: {
        type: 'CrawlerRunConfig',
        params: {
          stream: false,
          cache_mode: 'bypass',
          remove_overlay_elements: true,
          wait_for: 'css:body',
          page_timeout: 45000,
        },
      },
    }),
  })

  if (!crawlResponse.ok) {
    const errorText = await crawlResponse.text()
    throw new Error(`Crawl4AI 请求失败：${errorText.slice(0, 240)}`)
  }

  const crawlData = await crawlResponse.json()
  return getCrawlMarkdown(crawlData).slice(0, 14000)
}

function buildResourcePrompt({ input, inputType, content }) {
  return [
    `输入类型：${inputType}`,
    inputType === 'url' ? `来源 URL：${input}` : '来源：用户直接粘贴的文本',
    '',
    '需要分析的内容：',
    content,
    '',
    '请返回以下 JSON 结构：',
    JSON.stringify(
      {
        type: 'tool | article | github',
        summary: '用 1-2 句话概括资源',
        key_points: ['重点 1', '重点 2'],
        creative_value: '这条资源对 AI / AIGC 创作有什么价值',
        tags: ['标签 1', '标签 2'],
        category: 'tool | content | github | case | unknown',
        creative_potential: '用 1-2 句话说明这个资源可以做什么创意项目',
        usage_scenarios: ['应用场景 1', '应用场景 2', '应用场景 3'],
        workflow_hint: 'idea | production | post | reference',
        recombination_ideas: ['与其他 AI 工具的组合思路 1', '组合思路 2'],
      },
      null,
      2,
    ),
  ].join('\n')
}

function getWorkflowInstruction(workflowHint) {
  const instructions = {
    idea: 'workflow_hint = idea：输出灵感探索型方案。project_concept 和 prompt_ideas 是重点；workflow 应体现发散、筛选和快速验证；steps 应从灵感探索走向概念原型。',
    production: 'workflow_hint = production：输出执行步骤型方案。tools、workflow 和 steps 是重点；必须写清工具衔接、制作顺序、产出物和执行检查点。',
    reference: 'workflow_hint = reference：输出分析 / 拆解型方案。project_concept 应说明转译目标；workflow 和 steps 应覆盖资源拆解、可借鉴元素、重组方式和避免照搬。',
    post: 'workflow_hint = post：输出内容发布型方案。workflow 和 steps 应覆盖内容结构、平台形式、标题封面、发布节奏和互动复盘。',
  }

  return instructions[workflowHint] || instructions.reference
}

function buildPlanPrompt(resource) {
  return [
    '请基于下面的 resource intelligence 生成一份初步创意方案。',
    '必须优先使用 Creative Mapping Layer，而不是只概括 summary。',
    `当前 category：${resource.category}`,
    `当前 creative_potential：${resource.creative_potential}`,
    `当前 usage_scenarios：${resource.usage_scenarios.join(' / ') || '暂无明确场景'}`,
    `当前 workflow_hint：${resource.workflow_hint}`,
    `当前 recombination_ideas：${resource.recombination_ideas.join(' / ') || '暂无明确组合思路'}`,
    getWorkflowInstruction(resource.workflow_hint),
    '',
    '完整 resource intelligence：',
    JSON.stringify(resource, null, 2),
    '',
    '生成要求：',
    '- project_concept 必须承接 creative_potential 和 category',
    '- tools 必须参考 recombination_ideas',
    '- workflow 和 steps 必须符合 workflow_hint 对应的方案类型',
    '- prompt_ideas 必须适合 usage_scenarios',
    '- 不允许只复述或总结 resource；必须从 Creative Mapping Layer 推导新的项目概念、工具组合和执行路径',
    '- resource_influence_log 必须覆盖 category、creative_potential、usage_scenarios、workflow_hint、recombination_ideas',
    '',
    '请返回以下 JSON 结构：',
    JSON.stringify(
      {
        project_concept: '项目概念',
        tools: ['工具 1', '工具 2'],
        workflow: ['工作流阶段 1', '工作流阶段 2'],
        steps: ['执行步骤 1', '执行步骤 2'],
        prompt_ideas: ['Prompt 灵感 1', 'Prompt 灵感 2'],
        resource_influence_log: [
          {
            resource_field: 'creative_potential',
            influenced_plan_fields: ['project_concept'],
            explanation: '该字段如何影响方案内容',
          },
        ],
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
    const input = String(request.body?.input || '').trim()
    if (!input) {
      return response.status(400).json({
        success: false,
        error: 'Missing input',
      })
    }

    const apiKey = process.env.AI_API_KEY
    const baseUrl = process.env.AI_API_BASE_URL
    const model = process.env.AI_MODEL

    if (!apiKey || !baseUrl || !model) {
      return response.status(500).json({
        success: false,
        error: 'Missing AI environment variables',
      })
    }

    const inputType = isLikelyUrl(input) ? 'url' : 'text'
    const sourceInput = inputType === 'url' ? normalizeUrl(input) : input
    const content = inputType === 'url' ? await crawlUrl(sourceInput) : input.slice(0, 14000)

    const resourceResult = await callAi({
      apiKey,
      baseUrl,
      model,
      systemPrompt: RESOURCE_SYSTEM_PROMPT,
      userPrompt: buildResourcePrompt({
        input: sourceInput,
        inputType,
        content,
      }),
    })
    const resource = normalizeResource(resourceResult)

    const planResult = await callAi({
      apiKey,
      baseUrl,
      model,
      systemPrompt: PLAN_SYSTEM_PROMPT,
      userPrompt: buildPlanPrompt(resource),
    })
    const plan = normalizePlan(planResult, resource)

    return response.status(200).json({ resource, plan })
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected server error',
    })
  }
}
