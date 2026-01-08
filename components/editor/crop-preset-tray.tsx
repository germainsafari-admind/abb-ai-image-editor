"use client"

import type React from "react"
import { useState } from "react"
import type { CategoryPreset, CropCategory } from "@/lib/crop-presets"

interface CropPresetTrayProps {
  categories: CropCategory[]
  selectedCategory: string | null
  selectedPreset: CategoryPreset | null
  customRatioWidth: string
  customRatioHeight: string
  currentCategoryLabel: string
  onSelectCategory: (categoryName: string) => void
  onSelectPreset: (preset: CategoryPreset) => void
  onChangeCustomWidth: (value: string) => void
  onChangeCustomHeight: (value: string) => void
}

// Fixed slot dimensions - all presets sit in identically-sized slots
const SLOT_SIZE = 72

/**
 * Compute inner box dimensions that visually represent the aspect ratio.
 * Portrait ratios → tall narrow box
 * Square → square box
 * Landscape ratios → short wide box
 */
const getBoxDimensions = (ratio: number) => {
  const maxDim = SLOT_SIZE - 8 // leave 4px padding each side

  if (ratio >= 1) {
    // Landscape or square: width = max, height = max/ratio
    const w = maxDim
    const h = Math.max(20, Math.round(maxDim / ratio))
    return { w, h }
  } else {
    // Portrait: height = max, width = max * ratio
    const h = maxDim
    const w = Math.max(20, Math.round(maxDim * ratio))
    return { w, h }
  }
}

const CropPresetTray: React.FC<CropPresetTrayProps> = ({
  categories,
  selectedCategory,
  selectedPreset,
  customRatioWidth,
  customRatioHeight,
  currentCategoryLabel,
  onSelectCategory,
  onSelectPreset,
  onChangeCustomWidth,
  onChangeCustomHeight,
}) => {
  const [hoveredPreset, setHoveredPreset] = useState<CategoryPreset | null>(null)

  // Initial info state – no category selected yet
  if (!selectedCategory) {
    return (
      <div className="mx-auto rounded-2xl border border-border bg-white shadow-xl px-4 py-6 sm:px-8 pointer-events-auto">
        <div className="text-base font-semibold mb-4">Select media type:</div>
        <div className="mb-6 rounded-xl bg-[#E4E7FF] px-6 py-7 text-center text-[14px] leading-[1.5] text-[#3B3F5C] font-normal">
          Choose a category to display the cropping presets aligned
          <br />
          with its standard formats for each type of media.
        </div>
        <div className="flex flex-wrap gap-2 mt-1 text-xs sm:text-sm justify-center sm:justify-start">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className="px-3 py-1.5 rounded-full font-medium transition-all bg-[#F0F0F0] text-gray-700 hover:bg-[#E4E7FF]"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const currentCategory = categories.find((cat) => cat.name === selectedCategory) || categories[0]

  // Determine what to show in title - hovered preset takes priority
  const displayPreset = hoveredPreset || selectedPreset

  return (
    <div className="mx-auto rounded-2xl border border-border bg-white/95 backdrop-blur shadow-xl px-4 py-4 sm:px-6 pointer-events-auto">
      {/* Title row */}
      {selectedCategory === "custom" ? (
        <div className="text-sm font-medium mb-4">Custom resolution:</div>
      ) : (
        <div className="text-sm font-medium mb-4">
          {currentCategoryLabel} format:
          {displayPreset && (
            <span className="text-[#6764F6] font-medium ml-1">
              {displayPreset.label} ({displayPreset.displayRatio})
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
              className="w-28 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#6764F6]"
            />
            <span className="text-muted-foreground text-sm">x</span>
            <input
              type="number"
              min={1}
              placeholder="Image height"
              value={customRatioHeight}
              onChange={(e) => onChangeCustomHeight(e.target.value)}
              className="w-28 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#6764F6]"
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
          <div className="flex items-start gap-3 mb-4 overflow-x-auto pb-2">
            {currentCategory.presets.map((preset) => {
              const isSelected = selectedPreset?.name === preset.name
              const { w, h } = getBoxDimensions(preset.ratio)

              return (
                <div
                  key={preset.name}
                  className="flex-shrink-0 flex items-start justify-center"
                  style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectPreset(preset)}
                    onMouseEnter={() => setHoveredPreset(preset)}
                    onMouseLeave={() => setHoveredPreset(null)}
                    className={`flex items-center justify-center rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-[#6764F6] text-[#6764F6] bg-[#F3E8FF]"
                        : "border-[#A9A9A9] text-[#A9A9A9] bg-white hover:border-[#6764F6] hover:text-[#6764F6] active:border-[#6764F6] active:text-[#6764F6]"
                    }`}
                    style={{ width: w, height: h }}
                  >
                    <span className="text-sm font-medium">{preset.displayRatio}</span>
                  </button>
                </div>
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
                isSelected ? "bg-[#6764F6] text-white shadow-sm" : "bg-[#F0F0F0] text-gray-700 hover:bg-[#E4E7FF]"
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
