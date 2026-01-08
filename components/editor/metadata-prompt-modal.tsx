"use client"

interface MetadataPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onNoThanks: () => void
  onAddMetadata: () => void
  isBlurred?: boolean
}

export default function MetadataPromptModal({ isOpen, onClose, onNoThanks, onAddMetadata, isBlurred = false }: MetadataPromptModalProps) {
  if (!isOpen || isBlurred) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-[800px] shadow-2xl"
        style={{
          borderRadius: '8px',
          padding: '48px 40px',
          boxShadow: '0 0 58.2px 0 rgba(0, 0, 0, 0.25)'
        }}
      >
          <div className="flex flex-col gap-12 text-left">
          <h2 
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-abb-voice-display)' }}
          >
            METADATA
          </h2>
          
          <p
            className="max-w-[720px]"
            style={{
              fontFamily: "var(--font-abb-voice)",
              fontSize: "16px",
              lineHeight: "150%",
              fontWeight: 400,
              color: "#1F1F1F",
            }}
          >
            Make your asset easier to find and prepared for seamless upload to Media Bank or Brand Portal. The AI metadata feature automatically suggests a clear title, smart tags, and a concise description—making your asset platform-ready.
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={onNoThanks}
              className="transition-colors hover:opacity-90"
              style={{
                height: '48px',
                borderRadius: '28px',
                borderWidth: '2px',
                borderColor: '#000000',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontSize: '16px',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: '#000000'
              }}
            >
              No, thanks
            </button>
            <button
              onClick={onAddMetadata}
              className="text-white transition-colors hover:opacity-90"
              style={{
                backgroundColor: '#FF000F',
                height: '48px',
                borderRadius: '28px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontSize: '16px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Add Metadata
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
