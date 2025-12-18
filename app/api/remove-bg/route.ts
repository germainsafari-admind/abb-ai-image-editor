import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json()

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      console.error("REMOVE_BG_API_KEY is not configured")
      return NextResponse.json(
        { error: "Background removal is not configured. Please contact the administrator." },
        { status: 500 },
      )
    }

    // Expect a data URL, extract the base64 content
    const base64Data = imageDataUrl.includes(",") ? imageDataUrl.split(",")[1] : imageDataUrl
    const imageBuffer = Buffer.from(base64Data, "base64")

    const formData = new FormData()
    formData.append("image_file", new Blob([imageBuffer]), "image.png")
    formData.append("size", "auto")
    formData.append("format", "png")

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error from remove.bg")
      console.error("remove.bg error:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to remove background. Please try again later." },
        { status: 500 },
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const resultBuffer = Buffer.from(arrayBuffer)

    return new NextResponse(resultBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("remove-bg route error:", error)
    return NextResponse.json(
      { error: "Background removal failed. Please try again." },
      { status: 500 },
    )
  }
}


