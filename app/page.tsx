"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { UploadContent } from "@/components/upload/upload-modal"
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
              <UploadContent 
                onImageUploaded={handleImageUploaded}
                containerWidth="890px"
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
