"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, Loader2 } from "lucide-react"

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

export default function UploadModal({ isOpen, onClose, onImageUploaded }: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)
      setError(null)

      try {
        // Convert to base64 for local storage
        const reader = new FileReader()
        reader.onload = () => {
          const imageDataUrl = reader.result as string

          // Persist last uploaded image if possible, but don't break on quota issues
          try {
            localStorage.setItem("lastUploadedImage", imageDataUrl)
          } catch (storageError) {
            console.warn("Failed to store lastUploadedImage in localStorage", storageError)
          }

          onImageUploaded(imageDataUrl)
          setIsUploading(false)
        }
        reader.onerror = () => {
          setError("Failed to read file. Please try again.")
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      } catch (err) {
        setError("Upload failed. Please try again.")
        setIsUploading(false)
      }
    },
    [onImageUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: isUploading,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">UPLOAD YOUR IMAGE</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div className="px-6 pb-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-[#E30613] bg-red-50" : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-[#E30613] animate-spin" />
                <p className="text-sm text-gray-600">Processing image...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Drag & drop your file here, or upload it using the button below.
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Supported formats: JPG, PNG, EPS
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-[#E30613] hover:bg-[#c70510] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  Upload image
                  <Upload className="w-4 h-4" />
                </button>
              </>
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
