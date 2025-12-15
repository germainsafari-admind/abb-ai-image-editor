# ABB AI Image Editor

A modern, AI-powered image editing application built with Next.js, featuring fast on-brand adjustments that match ABB's style. Quickly enhance, adapt, and prepare assets for any platform.

## Features

- 🎨 **AI-Powered Editing** - Leverage Flux Kontext Pro API for intelligent image transformations
- ✂️ **Crop Tool** - Precise image cropping with real-time preview
- 🌫️ **Blur Effects** - Apply blur effects to images
- 📝 **Metadata Management** - Embed and manage image metadata
- 💾 **Export Options** - Export edited images in various formats
- ↩️ **Undo/Redo** - Full edit history with undo/redo functionality
- ☁️ **Cloud Storage** - Azure Blob Storage integration for image hosting
- 🎯 **Preset Actions** - Quick presets for common edits (remove background, add objects, change background)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Image Processing**: Sharp
- **Storage**: Azure Blob Storage
- **AI API**: Flux Kontext Pro (BFL)
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Azure Storage Account (for image hosting)
- Flux API Key (for AI editing features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd abb-ai-image-editor
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
AZURE_BLOB_CONTAINER=images

# Flux API
FLUX_API_KEY=your_flux_api_key
```

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

Build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Project Structure

```
abb-ai-image-editor/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── blur/          # Blur image endpoint
│   │   ├── crop/           # Crop image endpoint
│   │   ├── edit/           # AI edit endpoint
│   │   ├── embed-metadata/ # Metadata embedding
│   │   ├── export/         # Export image endpoint
│   │   ├── metadata/       # Metadata retrieval
│   │   └── upload/         # Image upload endpoint
│   ├── editor/             # Editor page
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── editor/             # Editor-specific components
│   ├── upload/             # Upload components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility libraries
│   ├── azure-blob.ts       # Azure Blob Storage client
│   └── utils.ts            # General utilities
└── types/                  # TypeScript type definitions
```

## API Endpoints

### POST `/api/upload`
Upload an image to Azure Blob Storage.

### POST `/api/edit`
Apply AI-powered edits to an image using Flux API.

**Request Body:**
```json
{
  "imageUrl": "string",
  "prompt": "string",
  "presets": ["remove-bg" | "add-object" | "change-bg"]
}
```

### POST `/api/crop`
Crop an image with specified coordinates.

### POST `/api/blur`
Apply blur effect to an image.

### POST `/api/export`
Export edited image in specified format.

### POST `/api/embed-metadata`
Embed metadata into an image.

### GET `/api/metadata`
Retrieve metadata from an image.

## Usage

1. **Upload an Image**: Click "Start editing" on the home page and upload an image
2. **Edit**: Use the editor controls to:
   - Apply AI edits with custom prompts or presets
   - Crop the image
   - Apply blur effects
   - Manage metadata
3. **Export**: Download your edited image in your preferred format

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage connection string | Yes |
| `AZURE_BLOB_CONTAINER` | Azure Blob container name | No (defaults to 'images') |
| `FLUX_API_KEY` | Flux API key for AI editing | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please contact the development team.








