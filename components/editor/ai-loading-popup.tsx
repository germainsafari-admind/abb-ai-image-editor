"use client"

import { ABBLoader } from "@/components/icons/abb-loader"

interface AILoadingPopupProps {
  onCancel: () => void
}

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AILoadingPopup({ onCancel }: AILoadingPopupProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200 flex justify-center">
      <div
        className="bg-white flex items-center justify-between gap-4"
        style={{
          width: '671px',
          height: '88px',
          borderRadius: '16px',
          padding: '20px 24px',
          fontFamily: 'var(--font-abb-voice)',
          boxShadow: '0 0 58.2px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
          {/* ABB Loader and Status Message */}
          <div className="flex items-center gap-3 flex-1">
            {/* ABB Loader */}
            <div className="flex-shrink-0">
              <ABBLoader size={16} strokeWidth={2} speedMs={900} />
            </div>

            {/* Status Message */}
            <span 
              className="text-sm text-gray-900"
              style={{ fontWeight: 400 }}
            >
              Editing image in progress...
            </span>
          </div>

          {/* Cancel X Button - Pill shaped with gradient border on hover */}
          <button
            onClick={onCancel}
            className="abb-cancel-pill-button group flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              fontFamily: 'var(--font-abb-voice)',
              fontWeight: 400,
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">Cancel</span>
              <CloseIcon className="w-4 h-4" />
            </span>
          </button>
      </div>
    </div>
  )
}

