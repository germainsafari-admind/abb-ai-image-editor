# Next.js Tutorial - Based on ABB AI Image Editor Codebase

This tutorial teaches Next.js using real examples from this codebase. We'll explore the App Router (Next.js 13+), which is the modern way to build Next.js applications.

---

## Table of Contents

1. [What is Next.js?](#what-is-nextjs)
2. [Project Structure](#project-structure)
3. [App Router Fundamentals](#app-router-fundamentals)
4. [Pages and Layouts](#pages-and-layouts)
5. [Client vs Server Components](#client-vs-server-components)
6. [API Routes](#api-routes)
7. [Navigation and Routing](#navigation-and-routing)
8. [Data Fetching](#data-fetching)
9. [Styling and Assets](#styling-and-assets)
10. [Configuration](#configuration)

---

## What is Next.js?

Next.js is a React framework that provides:
- **Server-Side Rendering (SSR)**: Pages are rendered on the server
- **Static Site Generation (SSG)**: Pre-render pages at build time
- **API Routes**: Build backend endpoints alongside your frontend
- **File-based Routing**: Create routes by organizing files
- **Built-in Optimizations**: Image optimization, code splitting, etc.

**Version in this project**: Next.js 16.0.10 (App Router)

---

## Project Structure

```
abb-ai-image-editor/
├── app/                    # App Router directory (Next.js 13+)
│   ├── layout.tsx         # Root layout (wraps all pages)
│   ├── page.tsx           # Home page (/)
│   ├── globals.css        # Global styles
│   ├── editor/
│   │   ├── page.tsx       # Editor page (/editor)
│   │   └── loading.tsx    # Loading UI for /editor
│   └── api/               # API routes
│       ├── upload/
│       │   └── route.ts   # POST /api/upload
│       └── blur/
│           └── route.ts   # POST /api/blur
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── public/               # Static assets (images, fonts, etc.)
├── next.config.mjs       # Next.js configuration
└── package.json          # Dependencies and scripts
```

**Key Point**: In the App Router, the `app/` directory defines your routes. Each folder becomes a route segment.

---

## App Router Fundamentals

### Route Segments

In the App Router, folders in `app/` create routes:

- `app/page.tsx` → `/` (home page)
- `app/editor/page.tsx` → `/editor`
- `app/api/upload/route.ts` → `/api/upload`

### Special Files

- `layout.tsx` - Shared layout for a route segment
- `page.tsx` - The page component for a route
- `loading.tsx` - Loading UI (shown while page loads)
- `route.ts` - API route handler

---

## Pages and Layouts

### Root Layout (`app/layout.tsx`)

The root layout wraps **all pages** in your app. It's where you:
- Set up HTML structure
- Add global styles
- Configure fonts
- Add analytics

**Example from your codebase:**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Configure custom fonts
const abbVoice = localFont({
  src: [
    {
      path: '../public/WOFF/ABBvoice_W_Lt.woff',
      weight: '300',
      style: 'normal',
    },
    // ... more font weights
  ],
  variable: '--font-abb-voice',
  display: 'swap',
})

// Metadata for SEO
export const metadata: Metadata = {
  title: 'ABB AI Image Editor',
  description: 'Professional AI-powered image editing for ABB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${abbVoice.variable}`}>
      <body className="font-sans antialiased">
        {children}  {/* All pages render here */}
        <Analytics />
      </body>
    </html>
  )
}
```

**Key Concepts:**
- `metadata` export: Sets page title, description, etc. (for SEO)
- `localFont`: Optimizes custom fonts (self-hosts them)
- `children`: All page content is injected here

### Page Component (`app/page.tsx`)

This is your home page component. Notice the `"use client"` directive:

```typescript
// app/page.tsx
"use client"  // ← Makes this a Client Component

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [viewState, setViewState] = useState('landing')
  const router = useRouter()
  
  // ... component logic
  
  return (
    <div className="min-h-screen bg-white">
      {/* Your page content */}
    </div>
  )
}
```

**Key Point**: The `"use client"` directive is needed when you use:
- React hooks (`useState`, `useEffect`)
- Browser APIs (`localStorage`, `window`)
- Event handlers (`onClick`, `onChange`)
- `next/navigation` hooks (`useRouter`, `useSearchParams`)

---

## Client vs Server Components

### Server Components (Default)

By default, all components in the App Router are **Server Components**. They:
- Run on the server
- Can directly access databases, file systems, etc.
- Cannot use React hooks or browser APIs
- Are smaller bundle size (code doesn't ship to client)

**Example - API Route (Server Component):**

```typescript
// app/api/blur/route.ts
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

// This runs on the SERVER
export async function POST(request: NextRequest) {
  const { imageUrl, radius = 10 } = await request.json()
  
  // Can use Node.js libraries like 'sharp'
  const blurredBuffer = await sharp(imageBuffer)
    .blur(radius)
    .toBuffer()
  
  return NextResponse.json({ blurredImageUrl })
}
```

### Client Components

Add `"use client"` at the top to make it a Client Component:

```typescript
// app/editor/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function EditorPage() {
  const searchParams = useSearchParams()  // ← Browser API
  const [imageState, setImageState] = useState(null)  // ← React hook
  
  // ... component logic
}
```

**When to use Client Components:**
- Interactive UI (buttons, forms, animations)
- Browser APIs (localStorage, window, document)
- React hooks (useState, useEffect, useContext)
- Event handlers

**When to use Server Components:**
- Fetching data from databases
- Accessing backend resources
- Keeping sensitive information on server
- Reducing client-side JavaScript

---

## API Routes

API routes let you create backend endpoints. They're defined in `app/api/[route]/route.ts`.

### Basic API Route Structure

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Handle POST requests
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    // Process the file...
    
    return NextResponse.json({
      imageUrl,
      fileName,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// You can also export GET, PUT, DELETE, etc.
export async function GET(request: NextRequest) {
  // Handle GET requests
}
```

### Example: Blur API Route

```typescript
// app/api/blur/route.ts
export async function POST(request: NextRequest) {
  const { imageUrl, radius = 10 } = await request.json()
  
  // Fetch image
  const response = await fetch(imageUrl)
  const imageBuffer = await response.buffer()
  
  // Process with sharp (Node.js library)
  const blurredBuffer = await sharp(imageBuffer)
    .blur(radius)
    .toBuffer()
  
  // Upload to Azure Blob Storage
  const blurredImageUrl = await uploadToBlob(blurredBuffer, fileName)
  
  return NextResponse.json({ blurredImageUrl })
}
```

**Key Concepts:**
- `NextRequest`: Typed request object
- `NextResponse`: Typed response object
- Export named functions: `POST`, `GET`, `PUT`, `DELETE`, etc.
- Route file location determines URL: `app/api/blur/route.ts` → `/api/blur`

### Calling API Routes from Client

```typescript
// In a Client Component
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
console.log(data.imageUrl)
```

---

## Navigation and Routing

### Using `next/navigation`

In the App Router, use `next/navigation` (not `next/router`):

```typescript
"use client"

import { useRouter, useSearchParams } from 'next/navigation'

export default function MyComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Navigate programmatically
  const handleClick = () => {
    router.push('/editor')
  }
  
  // Get query parameters
  const imageParam = searchParams.get('image')
  
  return <button onClick={handleClick}>Go to Editor</button>
}
```

### Example from Your Codebase

```typescript
// app/page.tsx
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  
  const handleImageUploaded = (imageUrl: string) => {
    // Navigate to editor after upload
    router.push("/editor")
  }
}
```

### Link Component

For client-side navigation with `<a>` tags:

```typescript
import Link from 'next/link'

<Link href="/editor">Go to Editor</Link>
```

---

## Data Fetching

### Server-Side Data Fetching

In Server Components, fetch data directly:

```typescript
// app/products/page.tsx (Server Component - no "use client")
async function getProducts() {
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()  // ← Fetches on server
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### Client-Side Data Fetching

In Client Components, use `useEffect`:

```typescript
"use client"

import { useState, useEffect } from 'react'

export default function MyComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])
  
  return <div>{data?.message}</div>
}
```

### Example from Your Codebase

```typescript
// app/page.tsx
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })
  
  const data = await response.json()
  onImageUploaded(data.imageUrl)
}
```

---

## Styling and Assets

### Global Styles

Add global CSS in `app/globals.css` and import it in `layout.tsx`:

```typescript
// app/layout.tsx
import './globals.css'
```

### Tailwind CSS

This project uses Tailwind CSS. Configure in `tailwind.config.js` and use classes:

```typescript
<div className="min-h-screen bg-white flex flex-col">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### Static Assets

Place files in `public/` directory:

```
public/
  ├── icon.svg
  ├── images/
  │   └── banner.png
  └── WOFF/
      └── font.woff
```

Reference them with absolute paths:

```typescript
<img src="/images/banner.png" alt="Banner" />
```

### Custom Fonts

Use `next/font/local` to optimize fonts:

```typescript
import localFont from 'next/font/local'

const abbVoice = localFont({
  src: '../public/WOFF/ABBvoice_W_Rg.woff',
  variable: '--font-abb-voice',
})

// Use in className
<html className={abbVoice.variable}>
```

---

## Configuration

### `next.config.mjs`

Configure Next.js behavior:

```javascript
// next.config.mjs
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // Skip TypeScript errors in build
  },
  images: {
    unoptimized: true,  // Disable image optimization
  },
}

export default nextConfig
```

### TypeScript Configuration

`tsconfig.json` sets up TypeScript:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // Allows @/components/header imports
    }
  }
}
```

This enables path aliases:

```typescript
import Header from "@/components/header"  // Instead of "../../components/header"
```

### Environment Variables

Create `.env.local` for environment variables:

```
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_BLOB_CONTAINER=images
```

Access in code:

```typescript
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
```

**Note**: Variables must be prefixed with `NEXT_PUBLIC_` to be available in Client Components.

---

## Key Patterns in This Codebase

### 1. Client Component with State

```typescript
"use client"

import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 2. Server API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.json()
  return NextResponse.json({ success: true })
}
```

### 3. Loading States

```typescript
// app/editor/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}
```

Next.js automatically shows this while the page loads.

### 4. Search Params

```typescript
"use client"

import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const image = searchParams.get('image')  // ?image=url
}
```

---

## Common Next.js Scripts

From `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",        // Start development server (localhost:3000)
    "build": "next build",    // Build for production
    "start": "next start",    // Start production server
    "lint": "eslint ."        // Run linter
  }
}
```

---

## Summary

**Key Takeaways:**

1. **App Router**: Modern Next.js routing system (Next.js 13+)
2. **Server Components**: Default, run on server, no client JS
3. **Client Components**: Add `"use client"` for interactivity
4. **API Routes**: Create backend endpoints in `app/api/`
5. **File-based Routing**: Folders in `app/` create routes
6. **Layouts**: Shared UI that wraps pages
7. **Metadata**: SEO configuration via `metadata` export

**Next Steps:**
- Read the [Next.js Documentation](https://nextjs.org/docs)
- Experiment with creating new routes
- Try building a simple API route
- Practice with Server vs Client Components

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

