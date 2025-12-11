export interface ImageState {
  originalUrl: string
  currentUrl: string
  width: number
  height: number
  isBlurred: boolean
  isAIGenerated: boolean
}

export interface EditHistoryItem extends ImageState {
  timestamp: number
}

export interface CropState {
  x: number
  y: number
  width: number
  height: number
  ratio: number
}

export interface AspectRatioPreset {
  name: string
  label: string
  ratio: number
  displayRatio?: string
  platform?: string
  description?: string
  boxHeight?: number
}

export type EditorMode = "view" | "crop" | "ai-edit" | "ai-result"

export interface CropDimensions {
  x: number
  y: number
  width: number
  height: number
}
