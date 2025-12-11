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
    const { imageUrl, x, y, width, height } = await request.json()

    if (!imageUrl || width === undefined || height === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch image from URL
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Failed to fetch image')

    const imageBuffer = await response.buffer()

    // Crop using sharp
    const croppedBuffer = await sharp(imageBuffer)
      .extract({
        left: Math.round(x),
        top: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      })
      .toBuffer()

    // Upload cropped image to Blob
    const fileName = `cropped-${Date.now()}.png`
    const croppedImageUrl = await uploadToBlob(croppedBuffer, fileName)

    return NextResponse.json({
      croppedImageUrl,
      dimensions: { width, height },
    })
  } catch (error) {
    console.error('Crop error:', error)
    return NextResponse.json(
      { error: 'Crop failed' },
      { status: 500 }
    )
  }
}
