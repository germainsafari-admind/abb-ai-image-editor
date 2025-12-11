import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import fetch from 'node-fetch'
import piexifjs from 'piexifjs'

async function exportImage(
  imageUrl: string,
  format: 'JPG' | 'PNG',
  transparentBg: boolean,
  metadata?: any
): Promise<Buffer> {
  // Fetch image from URL
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error('Failed to fetch image')

  let imageBuffer = await response.buffer()

  // Convert format
  let sharpPipeline = sharp(imageBuffer)

  if (format === 'JPG') {
    sharpPipeline = sharpPipeline.jpeg({ quality: 90 })
  } else if (format === 'PNG') {
    sharpPipeline = sharpPipeline.png({ 
      compressionLevel: 9,
      transparent: transparentBg,
    })
  }

  imageBuffer = await sharpPipeline.toBuffer()

  // Embed metadata if provided
  if (metadata && format === 'JPG') {
    try {
      const exifObj = {
        '0th': {
          [piexifjs.ImageIFD.Make]: metadata.title || 'ABB AI Image Editor',
          [piexifjs.ImageIFD.ImageDescription]: metadata.description || '',
        },
        'Exif': {},
        '1st': {},
      }
      const exifBytes = piexifjs.dump(exifObj)
      // In production, use proper EXIF embedding library
    } catch (e) {
      console.warn('Failed to embed metadata')
    }
  }

  return imageBuffer
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, format, transparentBg, metadata } = await request.json()

    if (!imageUrl || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const imageBuffer = await exportImage(imageUrl, format, transparentBg, metadata)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': format === 'JPG' ? 'image/jpeg' : 'image/png',
        'Content-Disposition': `attachment; filename="image.${format.toLowerCase()}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
