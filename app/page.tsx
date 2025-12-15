"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import UploadModal from "@/components/upload/upload-modal"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const router = useRouter()
  
  // Animation stages
  const [animationStage, setAnimationStage] = useState(0)
  // 0 = initial white screen
  // 1 = background fading in (washed out)
  // 2 = background at full contrast
  // 3 = header visible
  // 4 = panel sliding in
  // 5 = panel content (title) visible
  // 6 = body text visible
  // 7 = button visible

  useEffect(() => {
    // Stage 0 -> 1: Start background fade after brief white beat
    const timer1 = setTimeout(() => setAnimationStage(1), 150)
    // Stage 1 -> 2: Full contrast after washed-out effect
    const timer2 = setTimeout(() => setAnimationStage(2), 600)
    // Stage 2 -> 3: Header fades in
    const timer3 = setTimeout(() => setAnimationStage(3), 900)
    // Stage 3 -> 4: Panel slides in
    const timer4 = setTimeout(() => setAnimationStage(4), 1200)
    // Stage 4 -> 5: Title appears
    const timer5 = setTimeout(() => setAnimationStage(5), 1600)
    // Stage 5 -> 6: Body text appears
    const timer6 = setTimeout(() => setAnimationStage(6), 1850)
    // Stage 6 -> 7: Button appears
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
  }, [])

  const handleImageUploaded = (imageUrl: string) => {
    setShowUploadModal(false)
    router.push("/editor")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with fade-in animation */}
      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: animationStage >= 3 ? 1 : 0,
          transform: animationStage >= 3 ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <Header />
      </div>

      <main className="flex-1 relative overflow-hidden">
        {/* Background image with crossfade and exposure effect */}
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

        {/* Glassy teal-tinted left panel - matches ocean background */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[420px] transition-all duration-700 ease-out"
          style={{
            opacity: animationStage >= 4 ? 1 : 0,
            transform: animationStage >= 4 ? 'translateX(0)' : 'translateX(-100%)',
            background: 'linear-gradient(135deg, rgba(25, 45, 50, 0.55) 0%, rgba(30, 50, 55, 0.5) 50%, rgba(20, 40, 45, 0.45) 100%)',
            backdropFilter: 'blur(40px) saturate(1.4) brightness(0.85)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4) brightness(0.85)',
            boxShadow: animationStage >= 4 
              ? '4px 0 60px rgba(0, 0, 0, 0.25), inset 0 0 80px rgba(20, 60, 70, 0.15)'
              : 'none',
          }}
        >
          {/* Panel edge highlight */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[1px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.08) 100%)',
            }}
          />
          
          {/* Content positioned with specific offsets */}
          <div 
            className="absolute left-[48px] bottom-[72px] max-w-[320px]"
          >
            {/* Title with rise and fade */}
            <h1 
              className="text-[32px] font-bold text-white leading-[1.15] tracking-tight transition-all duration-500 ease-out"
              style={{
                opacity: animationStage >= 5 ? 1 : 0,
                transform: animationStage >= 5 ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              ABB AI IMAGE
              <br />
              EDITOR <span className="text-[#7C3AED] font-bold">BETA</span>
            </h1>

            {/* Body text with rise and fade */}
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

            {/* Button with final reveal */}
            <button
              onClick={() => setShowUploadModal(true)}
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
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={handleImageUploaded}
      />
    </div>
  )
}
