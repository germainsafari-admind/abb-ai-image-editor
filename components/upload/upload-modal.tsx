"use client"

import { useState, useCallback } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { X, Loader2 } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImageUploaded: (imageUrl: string) => void
}

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/postscript": [".eps"],
}

// 100 MB maximum upload size
const MAX_FILE_SIZE = 100 * 1024 * 1024

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

export default function UploadModal({ isOpen, onClose, onImageUploaded }: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [formatError, setFormatError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Clear format error when a valid file is dropped
      setFormatError(false)
      setIsUploading(true)
      setError(null)

      try {
        // Upload to Azure blob storage via API
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

        // Store the Azure blob URL and filename for reference
        try {
          localStorage.setItem("lastUploadedImage", imageUrl)
          localStorage.setItem("lastUploadedFileName", data.fileName || file.name)
        } catch (storageError) {
          console.warn("Failed to store lastUploadedImage in localStorage", storageError)
        }

        onImageUploaded(imageUrl)
        setIsUploading(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed. Please try again."
        setError(errorMessage)
        setIsUploading(false)
        console.error('Upload error:', err)
      }
    },
    [onImageUploaded],
  )

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    // Check if rejection was due to file type
    const hasTypeError = fileRejections.some(rejection => 
      rejection.errors.some(error => error.code === 'file-invalid-type')
    )
    if (hasTypeError) {
      setFormatError(true)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  })

  if (!isOpen) return null

  // Determine the zone styling based on state
  const getZoneStyles = () => {
    if (formatError) {
      // Error state - salmon/peach background
      return "border-[#FFB8A8] bg-[#FFEBE6]"
    }
    if (isDragActive || isHovered) {
      // Drag active or hover state - ABB Lilac border with light purple background
      return "border-[#6764F6] bg-[#F5F4FF]"
    }
    // Default state
    return "border-gray-300 bg-white"
  }

  const isActiveState = isDragActive || isHovered

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
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
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div className="pt-[48px] pr-[40px] pb-[56px] pl-[40px]">
          <div
            {...getRootProps()}
            className={`group border-[1.5px] border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${getZoneStyles()} ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            onMouseEnter={() => !isUploading && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <input {...getInputProps()} />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-[#E30613] animate-spin" />
                <p className="text-sm text-gray-600">Processing image...</p>
              </div>
            ) : formatError ? (
              // Error state content
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
                  className="inline-flex items-center gap-2 bg-[#E30613] hover:bg-[#c70510] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFormatError(false)
                  }}
                >
                  Upload image
                  <UploadArrowIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              // Default state content
              <div className="space-y-0.5" style={{ lineHeight: isActiveState ? '1.6' : '1.5' }}>
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
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-[#E30613] hover:bg-[#c70510] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Upload image
                  <UploadArrowIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
