"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, defaultValue, value, min = 0, max = 100, step = 1, ...props }, ref) => {
  const _value = value || defaultValue || [min]
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={_value}
      max={max}
      min={min}
      step={step}
      {...props}
    >
      <SliderPrimitive.Track 
        data-slot="slider-track"
        className="bg-secondary relative h-1.5 w-full grow overflow-hidden rounded-full"
      >
        <SliderPrimitive.Range 
          data-slot="slider-range"
          className="bg-primary absolute h-full" 
        />
      </SliderPrimitive.Track>
      {_value.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className="border-primary bg-background ring-offset-background focus-visible:ring-ring block h-4 w-4 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
