import { type NextRequest, NextResponse } from "next/server"

async function callFluxAPI(imageUrl: string, prompt: string, presets: string[]): Promise<string> {
  const fluxApiKey = process.env.FLUX_API_KEY
  if (!fluxApiKey) {
    throw new Error("FLUX_API_KEY not configured. Please add your Flux API key.")
  }

  // Build the prompt with presets
  let fullPrompt = prompt
  if (presets.includes("remove-bg")) fullPrompt = "Remove the background completely, make it transparent"
  if (presets.includes("add-object")) fullPrompt += " Add complementary objects naturally"
  if (presets.includes("change-bg")) fullPrompt += " Change to a professional studio background"

  try {
    // Call BFL Flux Kontext API for image editing
    const response = await fetch("https://api.bfl.ml/v1/flux-kontext-pro", {
      method: "POST",
      headers: {
        "X-Key": fluxApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        input_image: imageUrl,
        aspect_ratio: "1:1",
        safety_tolerance: 2,
        output_format: "png",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 402) {
        throw new Error("Insufficient credits. Please add more credits to your Flux account.")
      }
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your FLUX_API_KEY.")
      }
      throw new Error(errorData.message || `Flux API error: ${response.status}`)
    }

    const data = await response.json()

    // Poll for result if async
    if (data.id) {
      const resultUrl = await pollForResult(data.id, fluxApiKey)
      return resultUrl
    }

    return data.sample || data.result?.sample || imageUrl
  } catch (error: any) {
    console.error("Flux API error:", error)
    throw error
  }
}

async function pollForResult(taskId: string, apiKey: string): Promise<string> {
  const maxAttempts = 60
  const pollInterval = 2000

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval))

    const response = await fetch(`https://api.bfl.ml/v1/get_result?id=${taskId}`, {
      headers: {
        "X-Key": apiKey,
      },
    })

    if (!response.ok) continue

    const data = await response.json()

    if (data.status === "Ready" && data.result?.sample) {
      return data.result.sample
    }

    if (data.status === "Error") {
      throw new Error(data.error || "Image generation failed")
    }
  }

  throw new Error("Generation timed out. Please try again.")
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, presets } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    if (!prompt && (!presets || presets.length === 0)) {
      return NextResponse.json({ error: "Please provide a prompt or select a preset" }, { status: 400 })
    }

    const editedImageUrl = await callFluxAPI(imageUrl, prompt || "", presets || [])

    return NextResponse.json({
      editedImageUrl,
      timestamp: Date.now(),
    })
  } catch (error: any) {
    console.error("Edit error:", error)
    return NextResponse.json({ error: error.message || "Edit failed. Please try again." }, { status: 500 })
  }
}
