import { BlobServiceClient } from '@azure/storage-blob'
import { NextRequest, NextResponse } from 'next/server'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName = process.env.AZURE_BLOB_CONTAINER || 'images'

async function uploadToBlob(file: Buffer, fileName: string, contentType: string): Promise<string> {
  if (!connectionString) {
    throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING')
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)
  
  // Ensure container exists
  await containerClient.createIfNotExists({
    access: 'blob', // Allow public read access to blobs
  })

  const blockBlobClient = containerClient.getBlockBlobClient(fileName)
  await blockBlobClient.upload(file, file.length, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  })
  
  return blockBlobClient.url
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/postscript']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const imageUrl = await uploadToBlob(Buffer.from(buffer), fileName, file.type)

    return NextResponse.json({
      imageUrl,
      fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
