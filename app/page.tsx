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
    
    // Extended duration to cover both processing and refining
    setTimeout(() => {
      router.push("/editor")
    }, 8000)
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

// Cloud upload icon matching the design - simple outline cloud with upward arrow
function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cloud outline */}
      <path 
        d="M12 32C8.68629 32 6 29.3137 6 26C6 23.0919 8.07752 20.6713 10.8344 20.1136C10.2901 18.8655 10 17.4893 10 16.05C10 10.502 14.5 6 20 6C24.0779 6 27.6112 8.46613 29.1697 12.0081C29.7724 11.6847 30.4624 11.5 31.2 11.5C33.8509 11.5 36 13.6491 36 16.3C36 16.7586 35.9442 17.2041 35.8387 17.6299C39.3615 18.5698 42 21.7728 42 25.5714C42 30.1199 38.3137 33.8062 33.7652 33.8062" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Upward arrow in center */}
      <path 
        d="M24 32V18M24 18L18 24M24 18L30 24" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Upload arrow icon for button - simple upward arrow
function UploadArrowIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 19V5M12 5L5 12M12 5L19 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
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
  const [isHovered, setIsHovered] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [showWidthWarning, setShowWidthWarning] = useState(false)
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) await uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
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
      // Check image dimensions before uploading
      const imageWidth = await getImageWidth(file)
      const isNarrowerThanRequired = imageWidth < 1440

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

      // If image is narrower than 1440px, show warning popup
      if (isNarrowerThanRequired) {
        setIsUploading(false)
        setShowWidthWarning(true)
        setPendingImageUrl(imageUrl)
        return
      }

      onImageUploaded(imageUrl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again."
      setError(errorMessage)
      setIsUploading(false)
    }
  }

  const getImageWidth = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img.width)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }
      
      img.src = url
    })
  }

  const isActiveState = isDragActive || isHovered

  // Determine the zone styling based on state
  const getZoneStyles = () => {
    if (formatError) {
      return "border-[#FFB8A8] bg-[#FFEBE6]"
    }
    if (isDragActive || isHovered) {
      return "border-[#6764F6] bg-[#F5F4FF]"
    }
    return "border-gray-300 bg-white"
  }

  return (
    <div 
      className="bg-white rounded-lg w-[890px] shadow-2xl animate-fade-in mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-center pt-[56px] pr-[40px] pb-0 pl-[40px] relative">
        <h2 
          className="text-[32px] font-bold tracking-tight uppercase"
          style={{ fontFamily: 'var(--font-abb-voice-display)' }}
        >
          Upload Your Image
        </h2>
        <button
          onClick={onClose}
          className="absolute right-[40px] top-[56px] text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isUploading}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Drop zone */}
      <div className="pt-[40px] pr-[40px] pb-[56px] pl-[40px]">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onMouseEnter={() => !isUploading && setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            setIsDragActive(false)
          }}
          className={`border-[1.5px] border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${getZoneStyles()} ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ lineHeight: isActiveState ? '1.6' : '1.5' }}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".jpg,.jpeg,.png,.eps"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {formatError ? (
            <>
              <div className="flex justify-center mb-4">
                <CloudUploadIcon className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                The uploaded asset is in a format other than one of our supported formats.
              </p>
              <p className="text-sm text-gray-600 mb-5">
                Supported formats: <span className="font-semibold">JPG, PNG, EPS.</span>
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFormatError(false)
                  document.getElementById('file-upload')?.click()
                }}
                className="inline-flex items-center gap-2 bg-[#E30613] hover:bg-[#c70510] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                Upload image
                <UploadArrowIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex justify-center mb-4">
                <CloudUploadIcon className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1 transition-all duration-200">
                Drag & drop your file here, or upload it using the button below.
              </p>
              <p className="text-xs text-gray-500 transition-all duration-200">
                Supported formats: <span className="font-semibold">JPG, PNG, EPS</span>
              </p>
              <p className="text-xs text-gray-500 transition-all duration-200">
                Max file size: <span className="font-semibold">20 MB</span>
              </p>
              <p className="text-xs text-gray-500 mb-5 transition-all duration-200">
                Minimum image width for Media Bank: <span className="font-semibold">1440px</span>
              </p>
              <span className="inline-flex items-center gap-2 bg-[#E30613] hover:bg-[#c70510] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                Upload image
                <UploadArrowIcon className="w-4 h-4" />
              </span>
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}
      </div>

      {/* Media Bank Width Warning Popup */}
      {showWidthWarning && (
        <MediaBankWidthWarning
          onUploadNew={() => {
            setShowWidthWarning(false)
            setPendingImageUrl(null)
            document.getElementById('file-upload')?.click()
          }}
          onProceed={() => {
            if (pendingImageUrl) {
              setShowWidthWarning(false)
              onImageUploaded(pendingImageUrl)
            }
          }}
        />
      )}
    </div>
  )
}

// Media Bank Width Warning Popup Component
function MediaBankWidthWarning({
  onUploadNew,
  onProceed
}: {
  onUploadNew: () => void
  onProceed: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg w-[800px] shadow-2xl animate-fade-in"
        style={{
          boxShadow: '0 0 58.2px 0 rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="pt-[48px] pr-[40px] pb-[48px] pl-[40px]">
          {/* Title */}
          <h2 
            className="text-[32px] font-bold tracking-tight uppercase mb-[48px]"
            style={{ fontFamily: 'var(--font-abb-voice-display)' }}
          >
            MEDIA BANK (MIN 1440PX)
          </h2>

          {/* Body Text */}
          <p className="text-base text-black mb-[48px] leading-relaxed">
            The file you uploaded is narrower than the minimum width required for ABB Media Bank. Upload an image at least <span className="font-bold">1440px</span> wide or continue without exporting to Media Bank.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={onUploadNew}
              className="px-6 py-3 border border-black bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Upload new image
            </button>
            <button
              onClick={onProceed}
              className="px-6 py-3 bg-[#E30613] hover:bg-[#c70510] text-white rounded-lg font-medium text-sm transition-colors"
            >
              Proceed with that image
            </button>
          </div>
        </div>
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
      {/* Card container */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Image container with fixed size and shimmer overlay */}
        <div className="p-8 flex flex-col items-center">
          <div className="relative w-full h-[400px] flex items-center justify-center mb-6 overflow-hidden rounded-lg">
            {/* Image with fixed container */}
            <img 
              src={imageUrl} 
              alt="Uploaded image"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Shimmer overlay - only on image area */}
            <div 
              className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(103, 100, 246, 0.00) 25%, rgba(103, 100, 246, 0.60) 50%, rgba(103, 100, 246, 0.00) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite linear',
              }}
            />
          </div>
          
          {/* Refining text */}
          <h2 
            className="text-2xl font-bold tracking-wide text-gray-900 mb-2 uppercase"
            style={{ fontFamily: 'var(--font-abb-voice-display)' }}
          >
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
