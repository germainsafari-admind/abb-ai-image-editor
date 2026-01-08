"use client"

import React from "react"

type LoaderProps = {
  size?: number
  strokeWidth?: number
  speedMs?: number
  className?: string
}

/**
 * ABB Gradient Arc Loader Component
 * Animated loader with gradient stroke (blue → purple → red)
 * Arc expands and contracts while spinning
 */
export function ABBLoader({
  size = 48,
  strokeWidth = 6,
  speedMs = 900,
  className,
}: LoaderProps) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r

  // Arc length range
  const minDash = c * 0.08 // small segment
  const maxDash = c * 0.78 // near full

  const styleVars = {
    ["--c" as string]: `${c}`,
    ["--minDash" as string]: `${minDash}`,
    ["--maxDash" as string]: `${maxDash}`,
    ["--spin" as string]: `${speedMs}ms`,
  } as React.CSSProperties

  // Generate unique ID to avoid conflicts with multiple loaders
  const gradientId = React.useId()

  return (
    <span className={className} style={styleVars} aria-label="Loading" role="status">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ga-loader">
        <defs>
          {/* Gradient along the stroke: blue → purple → red */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f6df6" />
            <stop offset="55%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#e30613" />
          </linearGradient>
        </defs>
        <g className="ga-loader__spin" style={{ transformOrigin: "50% 50%" }}>
          <circle
            className="ga-loader__arc"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <style>{`
        .ga-loader {
          display: block;
        }
        .ga-loader__spin {
          animation: ga-spin var(--spin) linear infinite;
        }
        .ga-loader__arc {
          stroke-dasharray: var(--minDash) var(--c);
          stroke-dashoffset: 0;
          animation: ga-dash calc(var(--spin) * 1.1) ease-in-out infinite;
        }
        @keyframes ga-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes ga-dash {
          0% {
            stroke-dasharray: var(--minDash) var(--c);
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: var(--maxDash) var(--c);
            stroke-dashoffset: calc(-0.25 * var(--c));
          }
          100% {
            stroke-dasharray: var(--minDash) var(--c);
            stroke-dashoffset: calc(-1 * var(--c));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ga-loader__spin,
          .ga-loader__arc {
            animation: none;
          }
        }
      `}</style>
    </span>
  )
}

