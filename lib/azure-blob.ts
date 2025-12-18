import { BlobServiceClient } from '@azure/storage-blob'

const containerName = process.env.AZURE_BLOB_CONTAINER || 'images'

function getBlobServiceClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set')
  }

  return BlobServiceClient.fromConnectionString(connectionString)
}

export const getContainerClient = () => {
  const blobServiceClient = getBlobServiceClient()
  return blobServiceClient.getContainerClient(containerName)
}

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
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
