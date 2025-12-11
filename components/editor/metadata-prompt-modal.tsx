"use client"

import { X } from "lucide-react"

interface MetadataPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onNoThanks: () => void
  onAddMetadata: () => void
}

export default function MetadataPromptModal({ isOpen, onClose, onNoThanks, onAddMetadata }: MetadataPromptModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-8 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-4">METADATA</h2>
          <p className="text-gray-600 mb-8">Do you want to add the metadata to your image?</p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onNoThanks}
              className="px-6 py-2.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              No, thanks
            </button>
            <button
              onClick={onAddMetadata}
              className="px-6 py-2.5 bg-[#E30613] hover:bg-[#c70510] text-white rounded-full text-sm font-medium transition-colors"
            >
              Add Metadata
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
