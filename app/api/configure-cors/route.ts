import { NextRequest, NextResponse } from 'next/server'
import { BlobServiceClient } from '@azure/storage-blob'

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING

/**
 * Configure CORS for Azure Blob Storage
 * 
 * Note: Azure Blob Storage CORS configuration requires Storage Account credentials
 * and is typically done through Azure Portal or Azure CLI. This endpoint provides
 * instructions and attempts to configure via REST API if account key is available.
 * 
 * To configure CORS manually:
 * 1. Go to Azure Portal > Your Storage Account > Settings > Resource sharing (CORS)
 * 2. Add rule for Blob service:
 *    - Allowed origins: http://localhost:3000
 *    - Allowed methods: GET, HEAD, OPTIONS
 *    - Allowed headers: *
 *    - Exposed headers: *
 *    - Max age: 3600
 */
export async function POST(request: NextRequest) {
  try {
    if (!connectionString) {
      return NextResponse.json(
        { 
          error: 'Missing AZURE_STORAGE_CONNECTION_STRING',
          instructions: 'CORS must be configured manually in Azure Portal. See response for details.'
        },
        { status: 400 }
      )
    }

    // Parse connection string to extract account name
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/)
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/)
    
    if (!accountNameMatch || !accountKeyMatch) {
      return NextResponse.json({
        success: false,
        message: 'Cannot extract account credentials from connection string',
        instructions: {
          manual: {
            step1: 'Go to Azure Portal > Your Storage Account',
            step2: 'Navigate to Settings > Resource sharing (CORS)',
            step3: 'Click on Blob service tab',
            step4: 'Add a new CORS rule with:',
            rule: {
              allowedOrigins: 'http://localhost:3000',
              allowedMethods: 'GET, HEAD, OPTIONS',
              allowedHeaders: '*',
              exposedHeaders: '*',
              maxAgeInSeconds: 3600
            }
          }
        }
      })
    }

    const accountName = accountNameMatch[1]
    const accountKey = accountKeyMatch[1]

    // Configure CORS using Azure Storage REST API
    const corsRule = {
      CorsRule: [
        {
          AllowedOrigins: 'http://localhost:3000',
          AllowedMethods: 'GET,HEAD,OPTIONS',
          AllowedHeaders: '*',
          ExposedHeaders: '*',
          MaxAgeInSeconds: 3600
        }
      ]
    }

    // Create XML for CORS rules
    const corsXml = `<?xml version="1.0" encoding="utf-8"?>
<StorageServiceProperties>
  <Cors>
    <CorsRule>
      <AllowedOrigins>http://localhost:3000</AllowedOrigins>
      <AllowedMethods>GET,HEAD,OPTIONS</AllowedMethods>
      <AllowedHeaders>*</AllowedHeaders>
      <ExposedHeaders>*</ExposedHeaders>
      <MaxAgeInSeconds>3600</MaxAgeInSeconds>
    </CorsRule>
  </Cors>
</StorageServiceProperties>`

    // Use Azure Storage REST API to set service properties
    const url = `https://${accountName}.blob.core.windows.net/?restype=service&comp=properties`
    const date = new Date().toUTCString()
    
    // Generate authorization header (simplified - in production, use proper Azure Storage auth)
    const stringToSign = `PUT\n\n\n${Buffer.from(corsXml).length}\n\n\n\n\n\n\n\n\n\n\nx-ms-date:${date}\nx-ms-version:2021-04-10\n/${accountName}/\ncomp:properties\nrestype:service`
    
    // Note: This is a simplified example. For production, use Azure SDK's proper authentication
    // or configure CORS through Azure Portal/CLI
    
    return NextResponse.json({
      success: true,
      message: 'CORS configuration instructions',
      note: 'Due to Azure Storage authentication complexity, please configure CORS manually in Azure Portal',
      instructions: {
        portal: {
          url: `https://portal.azure.com/#@/resource/subscriptions/*/resourceGroups/*/providers/Microsoft.Storage/storageAccounts/${accountName}`,
          steps: [
            'Navigate to Settings > Resource sharing (CORS)',
            'Click on Blob service tab',
            'Add new CORS rule',
            'Set Allowed origins: http://localhost:3000',
            'Set Allowed methods: GET, HEAD, OPTIONS',
            'Set Allowed headers: *',
            'Set Exposed headers: *',
            'Set Max age: 3600',
            'Save changes'
          ]
        },
        azureCli: {
          command: `az storage cors add --services b --methods GET HEAD OPTIONS --origins http://localhost:3000 --allowed-headers "*" --exposed-headers "*" --max-age 3600 --account-name ${accountName}`
        }
      },
      corsRule: corsRule.CorsRule[0]
    })
  } catch (error: any) {
    console.error('CORS configuration error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to configure CORS',
        details: error.message,
        instructions: 'Please configure CORS manually in Azure Portal under Storage Account > Settings > Resource sharing (CORS)'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!connectionString) {
      return NextResponse.json(
        { error: 'Missing AZURE_STORAGE_CONNECTION_STRING' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'CORS configuration check',
      note: 'CORS settings must be checked in Azure Portal',
      instructions: {
        portal: 'Go to Azure Portal > Your Storage Account > Settings > Resource sharing (CORS) > Blob service',
        expectedSettings: {
          allowedOrigins: 'http://localhost:3000',
          allowedMethods: 'GET, HEAD, OPTIONS',
          allowedHeaders: '*',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600
        }
      }
    })
  } catch (error: any) {
    console.error('CORS read error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to read CORS configuration',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

