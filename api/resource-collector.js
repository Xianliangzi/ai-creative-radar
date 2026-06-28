const allowedCategories = ['tool', 'content', 'github', 'case', 'unknown']
const allowedWorkflowHints = ['idea', 'production', 'post', 'reference']

function cleanJsonContent(content) {
  return String(content || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function getFallbackCategory(input, content = '') {
  const value = `${input || ''} ${content || ''}`.toLowerCase()

  if (value.includes('github.com')) return 'github'
  if (/(runway|midjourney|pika|kling|可灵|即梦|comfyui|chatgpt|openai|huggingface|canva|krea)/i.test(value)) {
    return 'tool'
  }
  if (/(case study|showcase|portfolio|案例|作品集)/i.test(value)) return 'case'
  if (content) return 'content'
  return 'unknown'
}

function getFallbackSummary(content) {
  const normalizedContent = String(content || '').replace(/\s+/g, ' ').trim()
  if (!normalizedContent) return 'placeholder'

  const sentences = normalizedContent
    .split(/(?<=[。！？.!?])\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 5)

  return sentences.length
    ? sentences.map((sentence, index) => `${index + 1}. ${sentence}`).join('\n')
    : normalizedContent.slice(0, 300)
}

function getFallbackCreativeMapping(category, tags = []) {
  const namedTools = tags.filter((tag) => typeof tag === 'string').slice(0, 2)
  const toolLabel = namedTools.length ? namedTools.join(' + ') : '图像生成工具 + 视频生成工具'
  const mappings = {
    tool: {
      creative_potential: '可以把这个工具用于一个小型 AIGC 视觉实验，验证它在概念设计、内容生产或作品集表达中的实际价值。',
      usage_scenarios: ['AI 视频或视觉内容制作', '作品集项目实验', '商业提案中的工具链验证'],
      workflow_hint: 'production',
      recombination_ideas: [
        `将它与 ${toolLabel} 组合，完成从概念图到动态内容的制作链路。`,
        '结合 ChatGPT 生成脚本与 Prompt，再用该工具完成视觉生产。',
      ],
    },
    github: {
      creative_potential: '可以把这个开源项目改造成一个可复用的 AIGC 工作流实验，并记录配置、测试结果和视觉输出。',
      usage_scenarios: ['ComfyUI 或本地工作流搭建', '课程技术实验', '作品集中的过程与系统展示'],
      workflow_hint: 'production',
      recombination_ideas: [
        '与 ComfyUI 或 Stable Diffusion 组合，搭建可复现的视觉生成流程。',
        '结合 ChatGPT 整理安装步骤、参数说明和项目文档。',
      ],
    },
    case: {
      creative_potential: '可以把这个案例拆解成视觉风格、制作路径和发布方式，再转译成自己的系列化创意实验。',
      usage_scenarios: ['视觉风格参考', '作品集案例拆解', '商业提案中的案例论证'],
      workflow_hint: 'reference',
      recombination_ideas: [
        '结合 Midjourney 或即梦复现核心视觉语言，再加入个人主题形成系列作品。',
        '使用 Runway、Pika 或可灵把静态参考延展成短片或动态海报。',
      ],
    },
    content: {
      creative_potential: '可以把内容中的关键观点转化成一个视觉选题、内容栏目或可执行的 AIGC 项目方向。',
      usage_scenarios: ['小红书内容选题', 'AI 视频或海报创意参考', '作品集与商业提案的背景研究'],
      workflow_hint: 'idea',
      recombination_ideas: [
        '结合 ChatGPT 把关键观点整理成脚本、分镜和 Prompt，再进入视觉生成环节。',
        '使用 Midjourney、即梦或 Canva 将内容观点转译成海报或图文系列。',
      ],
    },
    unknown: {
      creative_potential: '可以先把这条资料作为灵感线索，验证其来源和价值后，再决定是否转化成具体创意项目。',
      usage_scenarios: ['灵感收集', '项目背景研究', '后续资料核验与选题判断'],
      workflow_hint: 'reference',
      recombination_ideas: [
        '结合 ChatGPT 提炼关键词、受众和可执行方向。',
        '与现有 AI 视觉工具组合，先制作一版低成本概念验证。',
      ],
    },
  }

  return mappings[category] || mappings.unknown
}

function normalizeEnhancement(result, input, content) {
  const summaryPoints = Array.isArray(result?.summary)
    ? result.summary.filter(Boolean).slice(0, 5)
    : String(result?.summary || '')
        .split('\n')
        .map((item) => item.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5)
  const confidence = Number(result?.confidence)
  const category = allowedCategories.includes(result?.category)
    ? result.category
    : getFallbackCategory(input, content)
  const tags = Array.isArray(result?.tags) ? [...new Set(result.tags.filter(Boolean))].slice(0, 8) : []
  const fallbackMapping = getFallbackCreativeMapping(category, tags)
  const usageScenarios = Array.isArray(result?.usage_scenarios)
    ? result.usage_scenarios.filter(Boolean).slice(0, 6)
    : []
  const recombinationIdeas = Array.isArray(result?.recombination_ideas)
    ? result.recombination_ideas.filter(Boolean).slice(0, 3)
    : []

  return {
    category,
    tags,
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.5,
    summary: summaryPoints.length
      ? summaryPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')
      : getFallbackSummary(content),
    creative_potential:
      typeof result?.creative_potential === 'string' && result.creative_potential.trim()
        ? result.creative_potential.trim()
        : fallbackMapping.creative_potential,
    usage_scenarios:
      usageScenarios.length >= 3 ? usageScenarios : fallbackMapping.usage_scenarios,
    workflow_hint: allowedWorkflowHints.includes(result?.workflow_hint)
      ? result.workflow_hint
      : fallbackMapping.workflow_hint,
    recombination_ideas:
      recombinationIdeas.length >= 2 ? recombinationIdeas : fallbackMapping.recombination_ideas,
  }
}

async function enhanceContent(input, content, isUrl) {
  const apiKey = process.env.AI_API_KEY
  const baseUrl = process.env.AI_API_BASE_URL
  const model = process.env.AI_MODEL

  if (!apiKey || !baseUrl || !model) {
    return normalizeEnhancement({}, input, content)
  }

  try {
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
            content: [
              '你是 AI Creative Radar 的资料整理助手。',
              '请从输入内容中提炼 3-5 条关键要点，并生成标签、精细分类和置信度。',
              'category 只能是 tool、content、github、case、unknown。',
              'confidence 必须是 0 到 1 之间的数字，表示分类与总结的可靠程度。',
              'creative_potential 用 1-2 句话说明这个资源可以转化成什么创意项目。',
              'usage_scenarios 至少给出 3 个可应用场景。',
              'workflow_hint 只能是 idea、production、post、reference。',
              'recombination_ideas 给出 2-3 条与其他 AI 工具组合使用的思路。',
              '不要编造输入中没有的信息。',
              '必须返回严格 JSON，不要输出 Markdown 或解释文字。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: [
              `输入类型：${isUrl ? 'URL 内容' : '文本'}`,
              isUrl ? `来源 URL：${input}` : '',
              '',
              '需要分析的内容：',
              String(content || '').slice(0, 12000),
              '',
              '返回结构：',
              JSON.stringify(
                {
                  category: 'tool | content | github | case | unknown',
                  tags: ['标签1', '标签2'],
                  confidence: 0.8,
                  summary: ['关键点1', '关键点2', '关键点3'],
                  creative_potential: '这个资源可以转化成什么创意项目',
                  usage_scenarios: ['小红书', 'AI 视频', '作品集'],
                  workflow_hint: 'idea | production | post | reference',
                  recombination_ideas: ['组合思路1', '组合思路2'],
                },
                null,
                2,
              ),
            ].filter(Boolean).join('\n'),
          },
        ],
        temperature: 0.4,
      }),
    })

    if (!aiResponse.ok) return normalizeEnhancement({}, input, content)

    const aiData = await aiResponse.json()
    const result = JSON.parse(cleanJsonContent(aiData?.choices?.[0]?.message?.content))
    return normalizeEnhancement(result, input, content)
  } catch (error) {
    return normalizeEnhancement({}, input, content)
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed',
    })
  }

  const input = request.body?.input
  const isUrl = /^https?:\/\//i.test(String(input || '').trim())

  if (isUrl) {
    try {
      const crawlResponse = await fetch('http://localhost:11235/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: input,
        }),
      })

      if (!crawlResponse.ok) {
        throw new Error('Crawl4AI request failed')
      }

      const crawlData = await crawlResponse.json()
      const crawlResult = crawlData?.results?.[0] || crawlData?.result || crawlData
      const metadata = crawlResult?.metadata || {}
      const markdownValue = crawlResult?.markdown
      const markdown =
        typeof markdownValue === 'string'
          ? markdownValue
          : markdownValue?.fit_markdown || markdownValue?.raw_markdown || ''
      const title = crawlResult?.title || metadata?.title || 'test'

      if (!markdown) {
        throw new Error('Crawl4AI returned empty content')
      }

      const enhancement = await enhanceContent(input, markdown, true)

      return response.status(200).json({
        type: 'content_page',
        is_url: true,
        title,
        category: enhancement.category,
        tags: enhancement.tags,
        confidence: enhancement.confidence,
        summary: enhancement.summary,
        creative_potential: enhancement.creative_potential,
        usage_scenarios: enhancement.usage_scenarios,
        workflow_hint: enhancement.workflow_hint,
        recombination_ideas: enhancement.recombination_ideas,
        raw_content: markdown,
        source_url: input,
      })
    } catch (error) {
      const fallback = normalizeEnhancement({}, input, '')

      return response.status(200).json({
        type: 'url',
        is_url: true,
        input,
        title: 'test',
        summary: 'placeholder',
        category: fallback.category,
        tags: fallback.tags,
        confidence: 0,
        creative_potential: fallback.creative_potential,
        usage_scenarios: fallback.usage_scenarios,
        workflow_hint: fallback.workflow_hint,
        recombination_ideas: fallback.recombination_ideas,
        raw_input: input,
      })
    }
  }

  const enhancement = await enhanceContent(input, input, false)

  return response.status(200).json({
    type: 'text',
    is_url: false,
    input,
    title: 'test',
    category: enhancement.category,
    tags: enhancement.tags,
    confidence: enhancement.confidence,
    summary: enhancement.summary,
    creative_potential: enhancement.creative_potential,
    usage_scenarios: enhancement.usage_scenarios,
    workflow_hint: enhancement.workflow_hint,
    recombination_ideas: enhancement.recombination_ideas,
    raw_input: input,
  })
}
