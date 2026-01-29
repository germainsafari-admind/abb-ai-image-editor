import { type NextRequest, NextResponse } from "next/server"

interface SourceInformation {
  business: string
  productCampaign: string
  assetType: string
}

async function analyzeImageWithOpenAI(
  imageUrl: string,
  sourceInfo?: SourceInformation,
): Promise<{ title: string; description: string; tags: string[] }> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY not configured. Please add your OpenAI API key.")
  }

  // Build context from source information (business, campaign/product, asset type)
  const sourceContext = sourceInfo
    ? `Context: This image is for ${sourceInfo.business} business, related to "${sourceInfo.productCampaign}" campaign/product, and is a ${sourceInfo.assetType} asset. Use this to inform campaign and product tags where relevant.`
    : ""

  const prompt = `Analyze this image and provide metadata for a corporate media bank. Follow the tagging bible: generate at least 10 tags, covering the categories below. Use lowercase single words or short phrases (2–3 words), similar to typical media bank tags.

${sourceContext}

Provide:

1. Title: A concise title (max 200 characters) that describes the image content.

2. Description: A concise description (max 300 characters) that describes what's in the image and how it relates to the business context. Be specific and professional.

3. Tags: At least 10 tags. Include tags from as many of these categories as apply (use only categories that fit the image and context):

   a) File/technical characteristics: resolution or aspect (e.g. horizontal, vertical, 4K, aerial view, drone), file/asset type (e.g. photo, 3D), color (e.g. blue, white), orientation, style (e.g. portrait, closeup, panorama).

   b) Marketing strategy: Choose from themes such as awareness, diversity, ecology, sustainability, innovation, or similar strategic themes if visible or implied.

   c) Campaign: Campaign or initiative name from context (e.g. "Employer Branding", "future of work", "women in tech", "Formula E", "smarter building")—use the provided campaign/product context when relevant.

   d) Product name: Any visible or context-relevant product, solution, or brand name (e.g. product families, business unit names).

   e) Location/setting: Geographical place (e.g. Switzerland, Berlin, New York) or physical setting (e.g. office, factory, forest, lab, outdoor, indoor, warehouse, harbor).

   f) Subject/content: Main subjects, objects, and activities (e.g. wind turbine, robot, teamwork, manufacturing, renewable energy).

Return valid JSON only, no other text:
{
  "title": "your title here",
  "description": "your description here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", ...]
}`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "low",
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY.")
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.")
      }
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    // Parse JSON from response
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const tags = Array.isArray(parsed.tags) ? parsed.tags : []
        // Ensure minimum 10 tags: use as-is if 10+, otherwise pad with context-based fallbacks
        const minTags = 10
        const fallbackPool = sourceInfo
          ? [sourceInfo.business.toLowerCase(), sourceInfo.assetType.toLowerCase(), "corporate", "professional", "media bank", "image", "content", "brand", "marketing"]
          : ["professional", "corporate", "business", "media bank", "asset", "image", "content", "brand", "marketing", "digital"]
        const paddedTags =
          tags.length >= minTags ? tags : [...tags, ...fallbackPool.filter((t) => !tags.includes(t)).slice(0, minTags - tags.length)]
        return {
          title: parsed.title || parsed.description?.split(".")[0] || "Image",
          description: parsed.description || "Professional image asset.",
          tags: paddedTags,
        }
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
    }

    // Fallback response (minimum 10 tags)
    const fallbackTags = sourceInfo
      ? [
          sourceInfo.business.toLowerCase(),
          sourceInfo.assetType.toLowerCase(),
          "corporate",
          "professional",
          "media bank",
          "image",
          sourceInfo.productCampaign ? sourceInfo.productCampaign.split(/[,\s]+/)[0]?.toLowerCase() : "asset",
          "content",
          "brand",
          "marketing",
        ].filter(Boolean)
      : ["professional", "corporate", "business", "media bank", "asset", "image", "content", "brand", "marketing", "digital"]
    return {
      title: "Professional image asset",
      description: "Professional image asset for corporate use.",
      tags: fallbackTags.slice(0, 10),
    }
  } catch (error: any) {
    console.error("OpenAI API error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, sourceInformation } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    const result = await analyzeImageWithOpenAI(imageUrl, sourceInformation)

    return NextResponse.json({
      title: result.title,
      description: result.description,
      tags: result.tags,
      timestamp: Date.now(),
    })
  } catch (error: any) {
    console.error("Metadata error:", error)
    return NextResponse.json({ error: error.message || "Metadata analysis failed. Please try again." }, { status: 500 })
  }
}
