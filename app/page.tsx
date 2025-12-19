"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { ArrowRight } from "lucide-react"

type ViewState = 'landing' | 'expanding' | 'upload' | 'refining'

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('landing')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const router = useRouter()
  
  // Animation stages for landing
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    if (viewState !== 'landing') return
    
    const timer1 = setTimeout(() => setAnimationStage(1), 150)
    const timer2 = setTimeout(() => setAnimationStage(2), 600)
    const timer3 = setTimeout(() => setAnimationStage(3), 900)
    const timer4 = setTimeout(() => setAnimationStage(4), 1200)
    const timer5 = setTimeout(() => setAnimationStage(5), 1600)
    const timer6 = setTimeout(() => setAnimationStage(6), 1850)
    const timer7 = setTimeout(() => setAnimationStage(7), 2100)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
      clearTimeout(timer7)
    }
  }, [viewState])

  const handleStartEditing = () => {
    setViewState('expanding')
    setTimeout(() => {
      setViewState('upload')
    }, 700)
  }

  const handleCloseUpload = () => {
    setViewState('expanding')
    setTimeout(() => {
      setViewState('landing')
    }, 700)
  }

  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl)
    setViewState('refining')
    
    // Store flag to show info banner on editor
    localStorage.setItem("showColorCorrectionBanner", "true")
    
    setTimeout(() => {
      router.push("/editor")
    }, 4000)
  }

  const getPanelWidth = () => {
    if (viewState === 'expanding' || viewState === 'upload' || viewState === 'refining') {
      return '100%'
    }
    return '420px'
  }

  const shouldHideContent = viewState === 'expanding' || viewState === 'upload' || viewState === 'refining'
  const isExpanded = viewState === 'upload' || viewState === 'refining'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div
        className="transition-all duration-500 ease-out relative z-50"
        style={{
          opacity: animationStage >= 3 ? 1 : 0,
          transform: animationStage >= 3 ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <Header />
      </div>

      <main className="flex-1 relative overflow-hidden">
        {/* Background image - always visible */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out"
          style={{
            backgroundImage: `url('/images/c125-20-e2-80-a2-20promo-20banner.png')`,
            opacity: animationStage >= 1 ? 1 : 0,
            filter: animationStage >= 2 
              ? 'brightness(1) contrast(1) saturate(1)' 
              : 'brightness(1.4) contrast(0.7) saturate(0.5)',
          }}
        />

        {/* Glassy teal-tinted panel - expands but keeps glass effect */}
        <div
          className="absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out"
          style={{
            width: getPanelWidth(),
            opacity: animationStage >= 4 ? 1 : 0,
            transform: animationStage >= 4 ? 'translateX(0)' : 'translateX(-100%)',
            background: 'linear-gradient(135deg, rgba(25, 45, 50, 0.55) 0%, rgba(30, 50, 55, 0.5) 50%, rgba(20, 40, 45, 0.45) 100%)',
            backdropFilter: 'blur(40px) saturate(1.4) brightness(0.85)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4) brightness(0.85)',
            boxShadow: viewState === 'landing'
              ? '4px 0 60px rgba(0, 0, 0, 0.25), inset 0 0 80px rgba(20, 60, 70, 0.15)'
              : 'none',
          }}
        >
          {/* Panel edge highlight - only on landing */}
          {viewState === 'landing' && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-[1px]"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.08) 100%)',
              }}
            />
          )}
          
          {/* Landing content */}
          <div 
            className="absolute left-[48px] bottom-[72px] max-w-[320px] transition-opacity duration-300"
            style={{
              opacity: shouldHideContent ? 0 : 1,
              pointerEvents: shouldHideContent ? 'none' : 'auto',
            }}
          >
            <h1 
              className="text-[32px] font-bold text-white leading-[1.15] tracking-tight transition-all duration-500 ease-out"
              style={{
                opacity: animationStage >= 5 ? 1 : 0,
                transform: animationStage >= 5 ? 'translateY(0)' : 'translateY(20px)',
                fontFamily: 'var(--font-abb-voice-display)',
              }}
            >
              ABB AI IMAGE
              <br />
              EDITOR <span className="text-[#7C3AED] font-bold">BETA</span>
            </h1>

            <p 
              className="mt-5 text-[15px] text-white/85 leading-[1.6] font-normal transition-all duration-500 ease-out"
              style={{
                opacity: animationStage >= 6 ? 1 : 0,
                transform: animationStage >= 6 ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              Elevate your visuals with fast, on-brand
              <br />
              AI adjustments that match ABB's style.
              <br />
              Quickly enhance, adapt and prepare assets
              <br />
              for any platform.
            </p>

            <button
              onClick={handleStartEditing}
              className="mt-7 inline-flex items-center gap-2.5 bg-[#E30613] hover:bg-[#c70510] text-white pl-5 pr-4 py-2.5 rounded-full font-medium text-[15px] transition-all duration-500 ease-out hover:scale-[1.02] active:scale-[0.98]"
              style={{
                opacity: animationStage >= 7 ? 1 : 0,
                transform: animationStage >= 7 ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
                boxShadow: animationStage >= 7 
                  ? '0 4px 20px rgba(227, 6, 19, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)'
                  : 'none',
              }}
            >
              Start editing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Modal Content - floating on glassy background */}
          {viewState === 'upload' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <UploadModalContent 
                onClose={handleCloseUpload}
                onImageUploaded={handleImageUploaded}
              />
            </div>
          )}

          {/* Refining State - floating on glassy background */}
          {viewState === 'refining' && uploadedImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefiningView imageUrl={uploadedImageUrl} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Inline upload modal content
function UploadModalContent({ 
  onClose, 
  onImageUploaded 
}: { 
  onClose: () => void
  onImageUploaded: (url: string) => void 
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [formatError, setFormatError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) await uploadFile(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/postscript']
    if (!validTypes.includes(file.type)) {
      setFormatError(true)
      return
    }

    setFormatError(false)
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.imageUrl

      if (!imageUrl) {
        throw new Error('No image URL returned from server')
      }

      try {
        localStorage.setItem("lastUploadedImage", imageUrl)
        localStorage.setItem("lastUploadedFileName", data.fileName || file.name)
      } catch (storageError) {
        console.warn("Failed to store lastUploadedImage in localStorage", storageError)
      }

      onImageUploaded(imageUrl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again."
      setError(errorMessage)
      setIsUploading(false)
    }
  }

  return (
    <div 
      className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-fade-in mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-center p-6 pb-4 relative">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">Upload Your Image</h2>
        <button
          onClick={onClose}
          className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isUploading}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div className="px-6 pb-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 
            ${formatError ? "border-[#FFB8A8] bg-[#FFEBE6]" : "border-gray-300 hover:border-gray-400 bg-gray-50/50"} 
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png,.eps"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <svg className="w-10 h-10 text-[#E30613] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <p className="text-sm text-gray-600">Processing image...</p>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" viewBox="0 0 48 48" fill="none">
                  <path d="M24 32V18M24 18L18 24M24 18L30 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 32C8.68629 32 6 29.3137 6 26C6 23.0919 8.07752 20.6713 10.8344 20.1136C10.2901 18.8655 10 17.4893 10 16.05C10 10.502 14.5 6 20 6C24.0779 6 27.6112 8.46613 29.1697 12.0081C29.7724 11.6847 30.4624 11.5 31.2 11.5C33.8509 11.5 36 13.6491 36 16.3C36 16.7586 35.9442 17.2041 35.8387 17.6299C39.3615 18.5698 42 21.7728 42 25.5714C42 30.1199 38.3137 33.8062 33.7652 33.8062" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Drag & drop your file here, or upload it using the button below.
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: <span className="font-semibold">JPG, PNG, EPS</span>
              </p>
              <p className="text-xs text-gray-500">
                Max file size: <span className="font-semibold">20 MB</span>
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Minimum image width for Media Bank: <span className="font-semibold">1440px</span>
              </p>
              <span className="inline-flex items-center gap-2 bg-[#E30613] hover:bg-[#c70510] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                Upload image
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </span>
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  )
}

// Refining view component
function RefiningView({ imageUrl }: { imageUrl: string }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 animate-fade-in">
      {/* Card container with shimmer */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Shimmer overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(135, 206, 250, 0.35) 50%, transparent 60%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear',
          }}
        />
        
        {/* Image container */}
        <div className="p-8 flex flex-col items-center">
          <div className="w-full max-h-[400px] flex items-center justify-center mb-6">
            <img 
              src={imageUrl} 
              alt="Uploaded image"
              className="max-w-full max-h-[320px] object-contain rounded-lg"
            />
          </div>
          
          {/* Refining text */}
          <h2 className="text-2xl font-bold tracking-wide text-gray-900 mb-2">
            REFINING<span className="inline-block w-8 text-left">{dots}</span>
          </h2>
          <p className="text-gray-600 text-sm">
            Brand color correction is processing.
          </p>
        </div>
      </div>
    </div>
  )
}
