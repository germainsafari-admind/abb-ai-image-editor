# ABB AI Image Editor

A modern, AI-powered image editing application built with Next.js, featuring fast on-brand adjustments that match ABB's style. Quickly enhance, adapt, and prepare assets for any platform.

## Overview

The ABB AI Image Editor is a comprehensive web-based image editing tool designed for ABB's internal use. It provides a streamlined workflow for uploading, editing, and exporting images with AI-powered enhancements, traditional editing tools, and metadata management. The application integrates with Azure Blob Storage for cloud-based image hosting and uses the Flux Kontext Pro API for advanced AI-driven image transformations.

### Key Workflow

1. **Upload**: Users start by uploading images (JPG, PNG, or EPS formats) through an intuitive drag-and-drop interface. The system validates image dimensions and warns if images don't meet Media Bank requirements (minimum 1440px width).

2. **Automatic Processing**: Upon upload, images are automatically color-corrected to match ABB's brand standards and uploaded to Azure Blob Storage for cloud hosting.

3. **Editing**: Users can apply various edits:
   - **AI Editing**: Transform images using natural language prompts or preset actions (remove background, add objects, change background)
   - **Cropping**: Precise image cropping with aspect ratio presets for different platforms
   - **Blur Effects**: Apply blur effects for privacy or artistic purposes
   - **Metadata Management**: Add, edit, or auto-generate metadata (title, description, tags) using AI analysis

4. **Export**: Download edited images in PNG or JPG format with optional transparent backgrounds and embedded metadata. Images can also be uploaded directly to ABB's Media Bank (if they meet size requirements).

5. **History Management**: Full undo/redo functionality maintains a complete edit history, allowing users to revert to any previous state.

## Features

- 🎨 **AI-Powered Editing** - Leverage Flux Kontext Pro API for intelligent image transformations
  - Natural language prompts for custom edits
  - Preset actions: remove background, add objects, change background
  - Automatic aspect ratio preservation
  - Async processing with progress tracking
  
- ✂️ **Advanced Crop Tool** - Precise image cropping with real-time preview
  - Interactive crop selection with drag handles
  - Aspect ratio presets for social media platforms (Instagram, Facebook, LinkedIn, etc.)
  - Custom aspect ratios
  - Real-time dimension display
  
- 🌫️ **Blur Effects** - Apply blur effects to images
  - Configurable blur radius
  - Toggle on/off functionality
  - Automatic notification when applied
  
- 📝 **Metadata Management** - Comprehensive metadata handling
  - AI-powered metadata generation using image analysis
  - Manual metadata entry (title, description, tags)
  - EXIF data embedding for JPEG files
  - PNG tEXt chunk embedding for PNG files
  - XMP metadata support
  
- 💾 **Export Options** - Flexible export capabilities
  - PNG and JPG format support
  - Transparent background option (PNG only)
  - High-quality image export
  - Direct upload to ABB Media Bank
  - Custom filename generation based on metadata
  
- ↩️ **Undo/Redo** - Full edit history with undo/redo functionality
  - Complete state management
  - Timestamped history items
  - Navigate through edit history seamlessly
  
- ☁️ **Cloud Storage** - Azure Blob Storage integration
  - Automatic image upload to Azure
  - Secure cloud hosting
  - CORS-friendly image serving
  - Unique file naming with timestamps
  
- 🎯 **Preset Actions** - Quick presets for common edits
  - Remove background (transparent)
  - Add complementary objects
  - Change to professional studio background
  
- 🎨 **Brand Color Correction** - Automatic color correction on upload
  - ABB brand-compliant color adjustments
  - Automatic processing during upload
  - Visual feedback during processing
  
- 📐 **Media Bank Integration** - Direct upload to ABB Media Bank
  - Minimum width validation (1440px)
  - Warning system for non-compliant images
  - One-click upload to Media Bank

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
FLUX_KONTEXT_API_KEY=your_flux_api_key
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

## Architecture

### Frontend Architecture

The application uses Next.js 16 with the App Router pattern:
- **Server Components**: For initial page loads and SEO
- **Client Components**: For interactive features (marked with `"use client"`)
- **API Routes**: Server-side endpoints for image processing

### Key Components

- **Home Page** (`app/page.tsx`): Landing page with animated upload interface
- **Editor Page** (`app/editor/page.tsx`): Main editing interface with state management
- **Editor Canvas** (`components/editor/editor-canvas.tsx`): Image display and crop overlay
- **Controls Row** (`components/editor/controls-row.tsx`): Toolbar with edit options
- **Download Modal** (`components/editor/download-modal.tsx`): Export workflow with metadata steps

### Backend Architecture

All image processing happens server-side via Next.js API routes:
- **Image Processing**: Uses Sharp library for cropping, blur, and format conversion
- **AI Integration**: Flux Kontext Pro API for AI-powered edits
- **Storage**: Azure Blob Storage for cloud hosting
- **Metadata**: Custom implementation for EXIF/XMP/PNG tEXt embedding

### State Management

- **Image State**: Tracks current image URL, dimensions, and edit flags
- **Edit History**: Array of image states with timestamps for undo/redo
- **Editor Mode**: Manages current editing mode (view, crop, ai-edit, ai-result)
- **Local Storage**: Persists last uploaded image URL and filename

## Project Structure

```
abb-ai-image-editor/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── blur/          # Blur image endpoint (Sharp processing)
│   │   ├── crop/           # Crop image endpoint (Sharp processing)
│   │   ├── edit/           # AI edit endpoint (Flux API integration)
│   │   ├── embed-metadata/ # Metadata embedding (EXIF/XMP/PNG)
│   │   ├── export/         # Export image endpoint (format conversion)
│   │   ├── metadata/       # Metadata retrieval (AI analysis)
│   │   └── upload/         # Image upload endpoint (Azure upload)
│   ├── editor/             # Editor page route
│   │   └── page.tsx        # Editor page component
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page with upload interface
├── components/             # React components
│   ├── editor/             # Editor-specific components
│   │   ├── editor-canvas.tsx      # Image canvas with crop overlay
│   │   ├── controls-row.tsx       # Toolbar with edit controls
│   │   ├── download-modal.tsx      # Export workflow modal
│   │   ├── ai-loading-popup.tsx    # AI processing indicator
│   │   ├── crop-preset-tray.tsx    # Aspect ratio presets
│   │   ├── metadata-prompt-modal.tsx # AI metadata generation
│   │   └── metadata/               # Metadata management components
│   ├── upload/             # Upload components
│   │   └── upload-modal.tsx        # Upload interface
│   ├── ui/                 # Reusable UI components (Radix UI)
│   ├── header.tsx          # Application header
│   └── theme-provider.tsx  # Theme management
├── lib/                    # Utility libraries
│   ├── azure-blob.ts       # Azure Blob Storage client
│   ├── crop-presets.ts     # Aspect ratio preset definitions
│   └── utils.ts            # General utilities (cn, etc.)
├── hooks/                   # Custom React hooks
│   ├── use-mobile.ts       # Mobile detection
│   ├── use-toast.ts        # Toast notifications
│   └── use-viewport-size.ts # Viewport size tracking
├── types/                  # TypeScript type definitions
│   └── editor.ts           # Editor state types
└── public/                 # Static assets
    └── images/             # Static images and icons
```

## API Endpoints

### POST `/api/upload`
Upload an image to Azure Blob Storage.

**Request:** `FormData` with `file` field
- Supported formats: JPG, PNG, EPS
- Max file size: 20 MB

**Response:**
```json
{
  "imageUrl": "https://...azure.../image.png",
  "fileName": "original-filename.png"
}
```

### POST `/api/edit`
Apply AI-powered edits to an image using Flux Kontext Pro API.

**Request Body:**
```json
{
  "imageUrl": "string",
  "prompt": "string (optional)",
  "presets": ["remove-bg" | "add-object" | "change-bg"],
  "width": number,
  "height": number
}
```

**Response:**
```json
{
  "editedImageUrl": "https://...azure.../edited-image.png",
  "timestamp": 1234567890
}
```

**Features:**
- Automatically calculates closest supported aspect ratio
- Polls for async results (up to 2 minutes)
- Uploads result to Azure to avoid CORS issues
- Handles API errors and credit limits

### POST `/api/crop`
Crop an image with specified coordinates using Sharp.

**Request Body:**
```json
{
  "imageUrl": "string",
  "x": number,
  "y": number,
  "width": number,
  "height": number
}
```

**Response:**
```json
{
  "croppedImageUrl": "https://...azure.../cropped-image.png",
  "dimensions": { "width": number, "height": number }
}
```

### POST `/api/blur`
Apply blur effect to an image using Sharp.

**Request Body:**
```json
{
  "imageUrl": "string",
  "radius": number (default: 10)
}
```

**Response:**
```json
{
  "blurredImageUrl": "https://...azure.../blurred-image.png"
}
```

### POST `/api/export`
Export edited image in specified format with optional metadata.

**Request Body:**
```json
{
  "imageUrl": "string",
  "format": "PNG" | "JPG",
  "transparentBg": boolean,
  "metadata": {
    "title": "string",
    "description": "string",
    "tags": "string"
  }
}
```

**Response:** Binary image file with appropriate headers

### POST `/api/embed-metadata`
Embed metadata into an image file.

**Request:** `FormData` with:
- `image`: File
- `title`: string
- `description`: string
- `tags`: string
- `format`: "PNG" | "JPG"

**Response:** Binary image file with embedded metadata
- JPEG: XMP metadata embedding
- PNG: tEXt chunk embedding

### POST `/api/metadata`
Retrieve or generate metadata from an image using AI analysis.

**Request Body:**
```json
{
  "imageUrl": "string",
  "sourceInfo": {
    "source": "string",
    "photographer": "string",
    "date": "string"
  }
}
```

**Response:**
```json
{
  "title": "string",
  "description": "string",
  "tags": ["string"]
}
```

## Usage

### Getting Started

1. **Upload an Image**: 
   - Click "Start editing" on the home page
   - Drag and drop an image or click to browse
   - Supported formats: JPG, PNG, EPS (max 20 MB)
   - Images narrower than 1440px will show a warning for Media Bank compatibility

2. **Automatic Processing**:
   - Your image is automatically color-corrected to match ABB brand standards
   - The image is uploaded to Azure Blob Storage
   - A "Refining" screen shows processing progress

3. **Edit Your Image**:
   - **AI Editing**: Click the AI icon to open the edit panel
     - Enter a custom prompt (e.g., "Make the background white")
     - Or select a preset: Remove Background, Add Objects, Change Background
     - Preview the result before applying
   - **Crop**: Click the crop icon
     - Select an aspect ratio preset or use freeform
     - Drag to adjust the crop area
     - Click "Apply" to confirm
   - **Blur**: Click the blur icon to toggle blur effect
   - **Metadata**: Click the metadata icon to add/edit image metadata
     - Option 1: Let AI generate metadata automatically
     - Option 2: Enter metadata manually (title, description, tags)

4. **Export Your Image**:
   - Click the download icon
   - Choose format: PNG or JPG
   - Enable transparent background (PNG only, disabled if image is blurred)
   - Review image size, metadata status, and filename
   - Click "Download" to save locally
   - Click "Upload to Media Bank" to upload directly (requires 1440px+ width)

5. **History Management**:
   - Use undo/redo buttons to navigate through edit history
   - Each edit creates a new history state
   - Original image is always accessible

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage connection string for blob storage | Yes | `DefaultEndpointsProtocol=https;AccountName=...` |
| `AZURE_BLOB_CONTAINER` | Azure Blob container name for storing images | No | `images` (default) |
| `FLUX_KONTEXT_API_KEY` | Flux Kontext Pro API key for AI editing | Yes | `your-flux-api-key` |

### Setting Up Azure Blob Storage

1. Create an Azure Storage Account
2. Create a container (or use the default `images`)
3. Get your connection string from Azure Portal
4. Add it to `.env.local`

### Setting Up Flux API

1. Sign up for Flux Kontext Pro API at [BFL.ml](https://bfl.ml)
2. Get your API key from the dashboard
3. Ensure you have sufficient credits
4. Add the key to `.env.local`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Technical Details

### Image Processing

- **Sharp Library**: Used for server-side image manipulation (crop, blur, format conversion)
- **Aspect Ratio Handling**: Automatically calculates closest supported Flux API aspect ratio
- **Format Support**: JPEG, PNG, and EPS (EPS converted during processing)

### AI Integration

- **Flux Kontext Pro API**: Advanced image-to-image editing
- **Async Processing**: Polls for results with 2-second intervals (max 2 minutes)
- **Error Handling**: Comprehensive error messages for API failures, credit limits, and timeouts
- **CORS Management**: Results uploaded to Azure to avoid cross-origin issues

### Metadata Handling

- **JPEG**: XMP metadata embedded in APP1 segment
- **PNG**: tEXt chunks with CRC32 validation
- **AI Generation**: Uses image analysis to auto-generate titles, descriptions, and tags
- **EXIF Support**: Basic EXIF data embedding for JPEG files

### Performance Optimizations

- **Image Caching**: Azure Blob Storage provides CDN-like performance
- **Lazy Loading**: Components load on demand
- **State Management**: Efficient history management with slice operations
- **Error Recovery**: Graceful fallbacks for failed operations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Known Limitations

- EPS files are converted to PNG during upload
- Transparent backgrounds only available for PNG format
- Media Bank upload requires minimum 1440px width
- AI editing may take 10-60 seconds depending on complexity
- Maximum file size: 20 MB

## Support

For issues and questions, please contact the development team.











