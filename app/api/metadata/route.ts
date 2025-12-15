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

  // Build context from source information
  const sourceContext = sourceInfo
    ? `Context: This image is for ${sourceInfo.business} business, related to "${sourceInfo.productCampaign}" campaign/product, and is a ${sourceInfo.assetType} asset.`
    : ""

  const prompt = `Analyze this image and provide metadata for a corporate media bank.

${sourceContext}

Please provide:
1. A concise title (max 200 characters) that describes the image content.
2. A concise description (max 400 characters) that describes what's in the image and how it relates to the business context. Be specific and professional.
3. 5-8 relevant tags for searchability (single words or short phrases).

Return as JSON with this exact format:
{
  "title": "your title here",
  "description": "your description here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Only return the JSON, no other text.`

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
        max_tokens: 500,
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
        return {
          title: parsed.title || parsed.description?.split(".")[0] || "Image",
          description: parsed.description || "Professional image asset.",
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError)
    }

    // Fallback response
    return {
      title: "Professional image asset",
      description: "Professional image asset for corporate use.",
      tags: sourceInfo
        ? [sourceInfo.business.toLowerCase(), sourceInfo.assetType.toLowerCase(), "corporate", "professional"]
        : ["professional", "corporate", "business"],
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
