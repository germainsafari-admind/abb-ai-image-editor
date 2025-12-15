"use client"

import type React from "react"
import type { CategoryPreset, CropCategory } from "@/lib/crop-presets"

interface CropPresetTrayProps {
  categories: CropCategory[]
  selectedCategory: string
  selectedPreset: CategoryPreset | null
  customRatioWidth: string
  customRatioHeight: string
  onSelectCategory: (categoryName: string) => void
  onSelectPreset: (preset: CategoryPreset) => void
  onChangeCustomWidth: (value: string) => void
  onChangeCustomHeight: (value: string) => void
}

const CropPresetTray: React.FC<CropPresetTrayProps> = ({
  categories,
  selectedCategory,
  selectedPreset,
  customRatioWidth,
  customRatioHeight,
  onSelectCategory,
  onSelectPreset,
  onChangeCustomWidth,
  onChangeCustomHeight,
}) => {
  const currentCategory = categories.find((cat) => cat.name === selectedCategory) || categories[0]

  return (
    <div className="mx-auto rounded-2xl border border-border bg-white/95 backdrop-blur shadow-xl px-4 py-4 sm:px-6 pointer-events-auto">
      {/* Title row */}
      {selectedCategory === "custom" ? (
        <div className="text-sm font-medium mb-4">Custom resolution:</div>
      ) : (
        <div className="text-sm font-medium mb-4">
          {currentCategory.label} format:
          {selectedPreset && (
            <span className="text-[#7C3AED] font-medium ml-1">
              {selectedPreset.label} ({selectedPreset.displayRatio})
            </span>
          )}
        </div>
      )}

      {/* Preset buttons or custom inputs */}
      {selectedCategory === "custom" ? (
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2">Type required image ratio:</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              placeholder="Image width"
              value={customRatioWidth}
              onChange={(e) => onChangeCustomWidth(e.target.value)}
              className="w-24 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <span className="text-muted-foreground text-sm">x</span>
            <input
              type="number"
              min={1}
              placeholder="Image height"
              value={customRatioHeight}
              onChange={(e) => onChangeCustomHeight(e.target.value)}
              className="w-24 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {customRatioWidth && customRatioHeight
              ? "Aspect ratio is locked to your custom values."
              : "Leave inputs empty to adjust the crop freely."}
          </div>
        </div>
      ) : (
        currentCategory.presets.length > 0 && (
          <div className="flex items-end gap-2 mb-4 overflow-x-auto pb-2">
            {currentCategory.presets.map((preset) => {
              const isSelected = selectedPreset?.name === preset.name
              const boxHeight = 48
              const boxWidth = Math.round(boxHeight * preset.ratio)

              return (
                <button
                  key={preset.name}
                  onClick={() => onSelectPreset(preset)}
                  className={`flex-shrink-0 flex items-center justify-center border-2 rounded-lg transition-all ${
                    isSelected
                      ? "border-[#7C3AED] text-[#7C3AED] bg-[#F3E8FF]"
                      : "border-gray-300 text-gray-500 hover:border-gray-400 bg-white"
                  }`}
                  style={{
                    width: `${Math.max(36, boxWidth)}px`,
                    height: `${boxHeight}px`,
                    minWidth: "36px",
                  }}
                >
                  <span className="text-xs font-medium">{preset.displayRatio}</span>
                </button>
              )
            })}
          </div>
        )
      )}

      {/* Category chips row */}
      <div className="flex flex-wrap gap-2 mt-1 text-xs sm:text-sm">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name
          return (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                isSelected ? "bg-[#7C3AED] text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CropPresetTray


