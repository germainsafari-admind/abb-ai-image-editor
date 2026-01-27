'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 48x24 ABB-style toggle track
        'peer inline-flex h-6 w-12 shrink-0 items-center rounded-[40px] border border-black px-1 transition-all outline-none shadow-xs focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#6764F6] data-[state=unchecked]:bg-white',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // 16x16 circular thumb: black when off, white when on
          'pointer-events-none block h-4 w-4 rounded-full ring-0 transition-transform flex-shrink-0 data-[state=unchecked]:bg-black data-[state=checked]:bg-white data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
