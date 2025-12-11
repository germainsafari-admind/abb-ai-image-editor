import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const format = formData.get("format") as string

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Get image buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // For JPEG: Add EXIF metadata
    // For PNG: Add tEXt chunks
    // Using a simple approach with piexifjs for JPEG metadata

    if (format === "JPG" || format === "JPEG") {
      // For JPEG, we'll create EXIF data
      // Note: In production, you'd use a library like piexifjs or sharp
      // For now, we'll create XMP metadata which is more universal

      const xmpData = createXMPMetadata(title, description, tags)
      const modifiedBuffer = embedXMPInJPEG(buffer, xmpData)

      return new NextResponse(modifiedBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="${title || "image"}.jpg"`,
        },
      })
    } else {
      // For PNG, add tEXt chunks
      const modifiedBuffer = embedMetadataInPNG(buffer, { title, description, tags })

      return new NextResponse(modifiedBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${title || "image"}.png"`,
        },
      })
    }
  } catch (error) {
    console.error("Embed metadata error:", error)
    return NextResponse.json({ error: "Failed to embed metadata" }, { status: 500 })
  }
}

function createXMPMetadata(title: string, description: string, tags: string): string {
  const tagList = tags.split(", ").filter(Boolean)
  const tagXML = tagList.map((tag) => `<rdf:li>${escapeXML(tag)}</rdf:li>`).join("")

  return `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXML(title)}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:description>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${escapeXML(description)}</rdf:li>
        </rdf:Alt>
      </dc:description>
      <dc:subject>
        <rdf:Bag>
          ${tagXML}
        </rdf:Bag>
      </dc:subject>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function embedXMPInJPEG(buffer: Buffer, xmpData: string): Buffer {
  // Find the position after SOI marker (0xFFD8)
  // Insert APP1 marker with XMP data

  const xmpHeader = "http://ns.adobe.com/xap/1.0/\0"
  const xmpBuffer = Buffer.from(xmpHeader + xmpData, "utf8")

  // APP1 marker structure: 0xFF 0xE1 [2-byte length] [data]
  const app1Marker = Buffer.alloc(4)
  app1Marker[0] = 0xff
  app1Marker[1] = 0xe1
  const length = xmpBuffer.length + 2
  app1Marker[2] = (length >> 8) & 0xff
  app1Marker[3] = length & 0xff

  // Find position after SOI
  let insertPos = 2 // After 0xFFD8

  // Skip existing APP0/APP1 markers if present
  while (insertPos < buffer.length - 1) {
    if (buffer[insertPos] === 0xff) {
      const marker = buffer[insertPos + 1]
      if (marker >= 0xe0 && marker <= 0xef) {
        // Skip this APP marker
        const markerLength = (buffer[insertPos + 2] << 8) | buffer[insertPos + 3]
        insertPos += 2 + markerLength
        continue
      }
    }
    break
  }

  // Construct new buffer
  const result = Buffer.concat([buffer.slice(0, insertPos), app1Marker, xmpBuffer, buffer.slice(insertPos)])

  return result
}

function embedMetadataInPNG(buffer: Buffer, metadata: { title: string; description: string; tags: string }): Buffer {
  // PNG tEXt chunk format:
  // Length (4 bytes) + Type (4 bytes: "tEXt") + Keyword + Null + Text + CRC (4 bytes)

  const createTextChunk = (keyword: string, text: string): Buffer => {
    const keywordBuf = Buffer.from(keyword, "latin1")
    const textBuf = Buffer.from(text, "latin1")
    const data = Buffer.concat([keywordBuf, Buffer.from([0]), textBuf])

    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length, 0)

    const type = Buffer.from("tEXt", "ascii")
    const crc = calculateCRC32(Buffer.concat([type, data]))
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc, 0)

    return Buffer.concat([length, type, data, crcBuf])
  }

  // Create chunks for each metadata field
  const chunks: Buffer[] = []
  if (metadata.title) chunks.push(createTextChunk("Title", metadata.title))
  if (metadata.description) chunks.push(createTextChunk("Description", metadata.description))
  if (metadata.tags) chunks.push(createTextChunk("Keywords", metadata.tags))

  // Find IEND chunk position
  const iendPos = buffer.indexOf(Buffer.from("IEND", "ascii")) - 4

  // Insert chunks before IEND
  return Buffer.concat([buffer.slice(0, iendPos), ...chunks, buffer.slice(iendPos)])
}

// CRC32 calculation for PNG chunks
function calculateCRC32(data: Buffer): number {
  let crc = 0xffffffff
  const table = getCRCTable()

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

let crcTable: number[] | null = null
function getCRCTable(): number[] {
  if (crcTable) return crcTable

  crcTable = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    crcTable[n] = c
  }
  return crcTable
}
