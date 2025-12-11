"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import UploadModal from "@/components/upload/upload-modal"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const router = useRouter()

  const handleImageUploaded = (imageUrl: string) => {
    // We already store the full data URL in localStorage inside the upload modal.
    // To avoid extremely long URLs like `?image=data:image/jpeg;base64,...` (which can be blocked by the browser),
    // we simply navigate to the editor without embedding the image data in the query string.
    setShowUploadModal(false)
    router.push("/editor")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 relative">
        {/* Background image - ship on ocean */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/c125-20-e2-80-a2-20promo-20banner.png')`,
          }}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center px-6 sm:px-10 lg:px-16">
          <div className="max-w-lg py-20 sm:py-32">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              ABB AI IMAGE
              <br />
              EDITOR <span className="text-[#7C3AED]">BETA</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/90 leading-relaxed max-w-md">
              Elevate your visuals with fast, on-brand AI adjustments that match ABB's style. Quickly enhance, adapt and
              prepare assets for any platform.
            </p>

            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-8 inline-flex items-center gap-3 bg-[#E30613] hover:bg-[#c70510] text-white px-6 py-3 rounded-full font-medium text-base transition-colors"
            >
              Start editing
              <ArrowRight className="w-5 h-5" />
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
