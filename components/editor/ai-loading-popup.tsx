"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AILoadingPopupProps {
  onCancel: () => void
}

export default function AILoadingPopup({ onCancel }: AILoadingPopupProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-4 py-3 flex items-center gap-3 max-w-xl mx-auto">
          {/* Animated Loader */}
          <div className="relative w-6 h-6 flex-shrink-0">
            <svg
              className="w-6 h-6 ai-loader-rotate"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Red arc - rotating and pulsating */}
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#E30613"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                className="ai-arc-red"
              />
              {/* Violet-blue arc - offset and rotating */}
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#7C3AED"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                className="ai-arc-violet"
              />
            </svg>
          </div>

          {/* Status Message */}
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">Editing image in progress...</span>
          </div>

          {/* Cancel Button */}
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
      </div>
    </div>
  )
}

