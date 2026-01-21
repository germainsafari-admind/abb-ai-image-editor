import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/azure-blob"

// Map aspect ratio to closest supported Flux API ratio
function getClosestAspectRatio(width: number, height: number): string {
  const ratio = width / height
  
  // Flux API supported aspect ratios
  const supportedRatios: { [key: string]: number } = {
    "21:9": 21 / 9,   // 2.33
    "16:9": 16 / 9,   // 1.78
    "3:2": 3 / 2,     // 1.5
    "4:3": 4 / 3,     // 1.33
    "1:1": 1,         // 1.0
    "3:4": 3 / 4,     // 0.75
    "2:3": 2 / 3,     // 0.67
    "9:16": 9 / 16,   // 0.56
    "9:21": 9 / 21,   // 0.43
  }
  
  let closestRatio = "1:1"
  let minDiff = Infinity
  
  for (const [ratioStr, ratioValue] of Object.entries(supportedRatios)) {
    const diff = Math.abs(ratio - ratioValue)
    if (diff < minDiff) {
      minDiff = diff
      closestRatio = ratioStr
    }
  }
  
  return closestRatio
}

// Download image from URL and return as Buffer
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function callFluxAPI(
  imageUrl: string,
  prompt: string,
  presets: string[],
  width?: number,
  height?: number,
): Promise<string> {
  const fluxApiKey = process.env.FLUX_KONTEXT_API_KEY
  if (!fluxApiKey) {
    throw new Error("FLUX_KONTEXT_API_KEY not configured. Please add your Flux API key.")
  }

  // Allow overriding the Flux endpoint via env, but default to the correct .ai host
  const fluxApiUrl =
    process.env.FLUX_KONTEXT_API_URL || "https://api.bfl.ai/v1/flux-kontext-pro"

  // Build the prompt with presets
  let fullPrompt = prompt
  if (presets.includes("remove-bg")) fullPrompt = "Remove the background completely, make it transparent"
  if (presets.includes("add-object")) fullPrompt += " Add complementary objects naturally"
  if (presets.includes("change-bg")) fullPrompt += " Change to a professional studio background"

  // Calculate aspect ratio from original image dimensions, default to 1:1 if not provided
  const aspectRatio = width && height ? getClosestAspectRatio(width, height) : "1:1"

  console.log(
    `Using aspect ratio: ${aspectRatio} for original dimensions ${width}x${height}. Flux URL: ${fluxApiUrl}`,
  )

  try {
    // Call BFL Flux Kontext API for image editing
    const response = await fetch(fluxApiUrl, {
      method: "POST",
      headers: {
        "X-Key": fluxApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        input_image: imageUrl,
        aspect_ratio: aspectRatio,
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
        throw new Error("Invalid API key. Please check your FLUX_KONTEXT_API_KEY.")
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

    // Make network / timeout errors clearer
    const code = error?.code ?? error?.cause?.code
    if (code === "UND_ERR_CONNECT_TIMEOUT") {
      throw new Error(
        "Could not reach the Flux AI service (network timeout). Please check your internet/VPN or firewall settings and try again.",
      )
    }

    throw error
  }
}

async function pollForResult(taskId: string, apiKey: string): Promise<string> {
  const maxAttempts = 60
  const pollInterval = 2000

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval))

    const response = await fetch(`https://api.bfl.ai/v1/get_result?id=${taskId}`, {
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

// Upload the result image to Azure to avoid CORS issues with BFL CDN
async function uploadToAzure(imageUrl: string): Promise<string> {
  try {
    // Download the image from BFL CDN
    const imageBuffer = await downloadImage(imageUrl)
    
    // Generate a unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `ai-edited/${timestamp}-${randomId}.png`
    
    // Upload to Azure Blob Storage
    const azureUrl = await uploadFile(imageBuffer, fileName)
    
    console.log(`Uploaded AI-edited image to Azure: ${azureUrl}`)
    return azureUrl
  } catch (error) {
    console.error("Failed to upload to Azure, returning original URL:", error)
    // If Azure upload fails, return the original URL as fallback
    return imageUrl
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, presets, width, height } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    if (!prompt && (!presets || presets.length === 0)) {
      return NextResponse.json({ error: "Please provide a prompt or select a preset" }, { status: 400 })
    }

    // Call Flux API with original image dimensions for proper aspect ratio
    const fluxResultUrl = await callFluxAPI(imageUrl, prompt || "", presets || [], width, height)
    
    // Upload the result to Azure to avoid CORS issues with BFL CDN
    const editedImageUrl = await uploadToAzure(fluxResultUrl)

    return NextResponse.json({
      editedImageUrl,
      timestamp: Date.now(),
    })
  } catch (error: any) {
    console.error("Edit error:", error)
    return NextResponse.json({ error: error.message || "Edit failed. Please try again." }, { status: 500 })
  }
}
