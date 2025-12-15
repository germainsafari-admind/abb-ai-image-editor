export interface CategoryPreset {
  name: string
  label: string
  ratio: number
  displayRatio: string
  description?: string
}

export interface CropCategory {
  name: string
  label: string
  presets: CategoryPreset[]
}

export const CROP_CATEGORIES: CropCategory[] = [
  {
    name: "media-bank",
    label: "Media Bank",
    presets: [
      { name: "1:1", label: "Rectangle", ratio: 1, displayRatio: "1:1" },
      { name: "5:2", label: "Landscape", ratio: 5 / 2, displayRatio: "5:2" },
      { name: "16:9", label: "Landscape", ratio: 16 / 9, displayRatio: "16:9" },
      { name: "4:3", label: "Landscape", ratio: 4 / 3, displayRatio: "4:3" },
      { name: "3:1", label: "Landscape", ratio: 3 / 1, displayRatio: "3:1" },
      { name: "16:10", label: "Landscape", ratio: 16 / 10, displayRatio: "16:10" },
      { name: "2:1", label: "Landscape", ratio: 2 / 1, displayRatio: "2:1" },
      { name: "8:9", label: "Portrait", ratio: 8 / 9, displayRatio: "8:9" },
      { name: "2:3", label: "Portrait", ratio: 2 / 3, displayRatio: "2:3" },
    ],
  },
  {
    name: "instagram",
    label: "Instagram",
    presets: [
      { name: "1:1", label: "Feed Post - Square", ratio: 1, displayRatio: "1:1" },
      { name: "1.91:1", label: "Landscape", ratio: 1.91 / 1, displayRatio: "1.91:1" },
      { name: "4:5", label: "Portrait", ratio: 4 / 5, displayRatio: "4:5" },
      { name: "9:16", label: "Instagram Stories", ratio: 9 / 16, displayRatio: "9:16" },
    ],
  },
  {
    name: "facebook",
    label: "Facebook",
    presets: [
      { name: "1.91:1", label: "Landscape Feed Post", ratio: 1.91 / 1, displayRatio: "1.91:1" },
      { name: "1:1", label: "Square Feed Post / Profile Picture", ratio: 1, displayRatio: "1:1" },
      { name: "4:5", label: "Vertical News Feed", ratio: 4 / 5, displayRatio: "4:5" },
      { name: "2:3", label: "Portrait Ad", ratio: 2 / 3, displayRatio: "2:3" },
      { name: "9:16", label: "Facebook Stories", ratio: 9 / 16, displayRatio: "9:16" },
      { name: "16:9", label: "Horizontal post / Event Cover Photo", ratio: 16 / 9, displayRatio: "16:9" },
      { name: "3:2", label: "Landscape Ad", ratio: 3 / 2, displayRatio: "3:2" },
      { name: "2.35:1", label: "Cinematic Wide Video", ratio: 2.35 / 1, displayRatio: "2.35:1" },
    ],
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    presets: [
      { name: "1.91:1", label: "Landscape Feed Post", ratio: 1.91 / 1, displayRatio: "1.91:1" },
      { name: "1:1", label: "Square Feed Post / Personal Profile Image", ratio: 1, displayRatio: "1:1" },
      { name: "1.91:1-cover", label: "Company Page Cover Image", ratio: 1.91 / 1, displayRatio: "1.91:1" },
    ],
  },
  {
    name: "twitter",
    label: "Twitter",
    presets: [
      { name: "1.91:1", label: "Landscape Feed Post", ratio: 1.91 / 1, displayRatio: "1.91:1" },
      { name: "1:1", label: "Profile Picture", ratio: 1, displayRatio: "1:1" },
      { name: "3:1", label: "Header Image", ratio: 3 / 1, displayRatio: "3:1" },
    ],
  },
  {
    name: "viva-engage",
    label: "Viva Engage",
    presets: [
      { name: "16:9", label: "Landscape Post Image", ratio: 16 / 9, displayRatio: "16:9" },
      { name: "1:1", label: "Profile Picture", ratio: 1, displayRatio: "1:1" },
      { name: "1.91:1", label: "Cover Image", ratio: 1.91 / 1, displayRatio: "1.91:1" },
    ],
  },
  {
    name: "custom",
    label: "Custom",
    presets: [],
  },
]


