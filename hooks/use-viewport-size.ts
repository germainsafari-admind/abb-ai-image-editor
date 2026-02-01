import { useState, useEffect } from 'react'

interface ViewportSize {
  width: number
  height: number
  isShortScreen: boolean // < 800px height
  isVeryShortScreen: boolean // < 700px height
  isMobile: boolean // < 768px width
  isTablet: boolean // >= 768px && < 1024px width
  isDesktop: boolean // >= 1024px width
}

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const SHORT_SCREEN_HEIGHT = 800
const VERY_SHORT_SCREEN_HEIGHT = 700

export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isShortScreen: false,
    isVeryShortScreen: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setSize({
        width,
        height,
        isShortScreen: height < SHORT_SCREEN_HEIGHT,
        isVeryShortScreen: height < VERY_SHORT_SCREEN_HEIGHT,
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
      })
    }

    // Initial update
    updateSize()

    // Debounced resize handler for performance
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateSize, 100)
    }

    window.addEventListener('resize', handleResize)
    
    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', updateSize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', updateSize)
      clearTimeout(timeoutId)
    }
  }, [])

  return size
}

/**
 * Calculate the optimal max height for the editor canvas
 * based on current viewport dimensions.
 *
 * Layout breakdown:
 * - Header: 72px (design spec)
 * - Banner region: 80px (base) / 96px (sm) reserved
 * - Controls bar: 64px
 * - Controls margin bottom: 48px (monitor) / 24px (laptop)
 * - Image dimension text: ~24px
 * - Padding/margins: ~32px
 */
export function calculateEditorMaxHeight(
  viewportHeight: number,
  isShortScreen: boolean,
  isVeryShortScreen: boolean
): string {
  // Fixed layout elements
  const headerHeight = 72
  const controlsBar = 64
  const controlsMargin = isShortScreen ? 24 : 48
  const dimensionText = 24
  const verticalPadding = 32
  
  // Total space taken by UI elements
  const uiSpace = headerHeight + controlsBar + controlsMargin + dimensionText + verticalPadding
  
  // Available height for the image
  const availableHeight = viewportHeight - uiSpace
  
  // Ensure minimum usable height
  return `${Math.max(200, availableHeight)}px`
}

