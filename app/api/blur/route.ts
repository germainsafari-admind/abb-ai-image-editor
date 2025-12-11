import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import fetch from 'node-fetch'
import { BlobServiceClient } from '@azure/storage-blob'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName = process.env.AZURE_BLOB_CONTAINER || 'images'

async function uploadToBlob(buffer: Buffer, fileName: string): Promise<string> {
  if (!connectionString) throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING')
  
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(fileName)

  await blockBlobClient.upload(buffer, buffer.length)
  return blockBlobClient.url
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, radius = 10 } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing image URL' },
        { status: 400 }
      )
    }

    // Fetch image from URL
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Failed to fetch image')

    const imageBuffer = await response.buffer()

    // Apply blur using sharp
    const blurredBuffer = await sharp(imageBuffer)
      .blur(radius)
      .toBuffer()

    // Upload blurred image to Blob
    const fileName = `blurred-${Date.now()}.png`
    const blurredImageUrl = await uploadToBlob(blurredBuffer, fileName)

    return NextResponse.json({
      blurredImageUrl,
    })
  } catch (error) {
    console.error('Blur error:', error)
    return NextResponse.json(
      { error: 'Blur failed' },
      { status: 500 }
    )
  }
}
