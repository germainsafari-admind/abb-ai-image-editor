import { BlobServiceClient } from '@azure/storage-blob'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const containerName = process.env.AZURE_BLOB_CONTAINER || 'images'

if (!connectionString) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set')
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)

export const getContainerClient = () => {
  return blobServiceClient.getContainerClient(containerName)
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(fileName)
  
  await blockBlobClient.upload(buffer, buffer.length)
  return blockBlobClient.url
}

export async function deleteFile(fileName: string): Promise<void> {
  const containerClient = getContainerClient()
  const blockBlobClient = containerClient.getBlockBlobClient(fileName)
  
  await blockBlobClient.delete()
}
